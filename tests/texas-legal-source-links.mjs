import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const targetPosts = [
  ["dying-without-a-will-in-texas", "dyingWithoutWill"],
  ["naming-an-executor", "namingExecutor"],
  ["choosing-a-guardian", "choosingGuardian"],
  ["wills-vs-trusts-texas", "willsVsTrusts"],
  ["durable-power-of-attorney", "durablePoa"],
  ["medical-power-of-attorney-living-will", "medicalPoa"],
];

const allowedHosts = new Set([
  "tcss.legis.texas.gov",
  "statutes.capitol.texas.gov",
  "www.sll.texas.gov",
  "sll.texas.gov",
  "www.hhs.texas.gov",
  "hhs.texas.gov",
  "txcourts.gov",
]);

test("every external source cited by the Texas cluster resolves", async () => {
  let sourceCorpus = await readFile(
    path.join(
      repoRoot,
      "src/app/(marketing)/texas-estate-planning/page.tsx"
    ),
    "utf8"
  );

  for (const [slug, exportName] of targetPosts) {
    const moduleUrl = pathToFileURL(
      path.join(repoRoot, "src/lib/blog/posts", `${slug}.ts`)
    );
    const postModule = await import(moduleUrl.href);
    const post = postModule[exportName];
    sourceCorpus += `\n${post.content}\n${JSON.stringify(post.faqs ?? [])}`;
  }

  const urls = [
    ...new Set(sourceCorpus.match(/https:\/\/[^\s)"<>]+/g) ?? []),
  ].filter((url) => allowedHosts.has(new URL(url).hostname));

  assert.ok(urls.length >= 12, `expected a complete source set, found ${urls.length}`);
  assert.doesNotMatch(
    urls.join("\n"),
    /sites\/default\/files\/documents\/(?:Medical%20Power|Directive%20to%20Physicians)/,
    "legacy Texas HHS PDF filenames must not return to the cluster"
  );

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, {
          redirect: "follow",
          headers: { "user-agent": "WillBuddy legal source link check" },
          signal: AbortSignal.timeout(20_000),
        });
        return { url, status: response.status };
      } catch (error) {
        return {
          url,
          status: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );

  const failures = results.filter(
    ({ status }) => status < 200 || status >= 400
  );
  assert.deepEqual(failures, []);
});
