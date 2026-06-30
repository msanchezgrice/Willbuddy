import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baseUrl = normalizeBaseUrl(
  process.env.SMOKE_BASE_URL ?? process.argv[2] ?? "http://127.0.0.1:3000"
);
const expectedSiteUrl = normalizeBaseUrl(
  process.env.EXPECTED_SITE_URL ?? baseUrl
);

const checks = [
  {
    name: "homepage",
    path: "/",
    expectStatus: [200],
    includes: [
      "WillBuddy",
      "Start Your Estate Plan",
      "/contact",
      "/privacy",
      "/refunds",
      "/terms",
    ],
  },
  {
    name: "contact page",
    path: "/contact",
    expectStatus: [200],
    includes: ["Tell us what you need help with", "Send message"],
  },
  {
    name: "privacy page",
    path: "/privacy",
    expectStatus: [200],
    includes: ["Privacy Policy", "PostHog", "Supabase"],
  },
  {
    name: "refunds page",
    path: "/refunds",
    expectStatus: [200],
    includes: ["Refund Policy", "support@mywillbuddy.com", "Stripe"],
  },
  {
    name: "terms page",
    path: "/terms",
    expectStatus: [200],
    includes: ["Terms of Service", "Not Legal Advice"],
  },
  {
    name: "robots",
    path: "/robots.txt",
    expectStatus: [200],
    includes: ["User-Agent: *", "Sitemap:", "Disallow: /api/"],
  },
  {
    name: "sitemap",
    path: "/sitemap.xml",
    expectStatus: [200],
    includes: [
      "<urlset",
      `${expectedSiteUrl}/`,
      `${expectedSiteUrl}/contact`,
      `${expectedSiteUrl}/privacy`,
      `${expectedSiteUrl}/refunds`,
      `${expectedSiteUrl}/terms`,
    ],
  },
  {
    name: "auth sign-in",
    path: "/sign-in",
    expectStatus: [200, 307, 308],
    includes: [],
  },
  {
    name: "auth sign-up",
    path: "/sign-up",
    expectStatus: [200, 307, 308],
    includes: [],
  },
];

const failures = [];
const requestTimeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 8000);

await runStaticAnalyticsImportCheck();

for (const check of checks) {
  await runTextCheck(check);
}

await runThirdPartyScriptHtmlBudgetCheck();
await runContactValidationCheck();
await runOgImageCheck();

if (failures.length > 0) {
  console.error(`\nLaunch smoke failed against ${baseUrl}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Launch smoke passed against ${baseUrl}`);

async function runTextCheck({ name, path, expectStatus, includes }) {
  const url = `${baseUrl}${path}`;
  const response = await fetchCheck(name, url, { redirect: "manual" });
  if (!response) return;

  if (!expectStatus.includes(response.status)) {
    failures.push(`${name}: expected ${expectStatus.join("/")} got ${response.status}`);
    return;
  }

  const text = await response.text();
  for (const expected of includes) {
    if (!text.includes(expected)) {
      failures.push(`${name}: missing ${JSON.stringify(expected)}`);
    }
  }
}

async function runContactValidationCheck() {
  const response = await fetchCheck("contact API validation", `${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", message: "" }),
  });
  if (!response) return;

  if (response.status !== 400) {
    failures.push(`contact API validation: expected 400 got ${response.status}`);
  }
}

async function runOgImageCheck() {
  const response = await fetchCheck("OG image", `${baseUrl}/opengraph-image`);
  if (!response) return;
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status !== 200) {
    failures.push(`OG image: expected 200 got ${response.status}`);
  }

  if (!contentType.includes("image/png")) {
    failures.push(`OG image: expected image/png got ${contentType || "missing"}`);
  }
}

async function runStaticAnalyticsImportCheck() {
  const files = await collectSourceFiles(join(repoRoot, "src"));
  const staticPostHogImportPattern =
    /^\s*import\s+(?!type\b).*\s+from\s+["']posthog-js(?:\/react)?["'];?\s*$/m;
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (staticPostHogImportPattern.test(source)) {
      offenders.push(relative(repoRoot, file));
    }
  }

  if (offenders.length > 0) {
    failures.push(
      `script budget: PostHog must stay dynamically loaded, found static imports in ${offenders.join(", ")}`
    );
  }
}

async function runThirdPartyScriptHtmlBudgetCheck() {
  for (const path of ["/", "/contact"]) {
    const response = await fetchCheck(
      `script budget ${path}`,
      `${baseUrl}${path}`
    );
    if (!response) continue;

    if (response.status !== 200) {
      failures.push(`script budget ${path}: expected 200 got ${response.status}`);
      continue;
    }

    const text = await response.text();
    const thirdPartyScripts = extractScriptSources(text).filter(
      isThirdPartyScriptSource
    );

    if (thirdPartyScripts.length > 0) {
      failures.push(
        `script budget ${path}: third-party script tags in initial HTML: ${thirdPartyScripts.join(", ")}`
      );
    }
  }
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractScriptSources(html) {
  const sources = [];
  const pattern = /<script\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    sources.push(match[2]);
  }

  return sources;
}

function isThirdPartyScriptSource(src) {
  if (src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) {
    return false;
  }

  try {
    const scriptUrl = new URL(src, baseUrl);
    return scriptUrl.origin !== new URL(baseUrl).origin;
  } catch {
    return true;
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

async function fetchCheck(name, url, options = {}) {
  try {
    return await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    failures.push(`${name}: request failed for ${url}: ${error.message}`);
    return null;
  }
}
