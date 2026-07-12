import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const reviewedOn = "2026-07-12";

const targets = [
  ["dying-without-a-will-in-texas", "dyingWithoutWill"],
  ["naming-an-executor", "namingExecutor"],
  ["choosing-a-guardian", "choosingGuardian"],
  ["wills-vs-trusts-texas", "willsVsTrusts"],
  ["durable-power-of-attorney", "durablePoa"],
  ["medical-power-of-attorney-living-will", "medicalPoa"],
];

const officialSourcePattern =
  /https:\/\/(?:tcss\.legis\.texas\.gov|statutes\.capitol\.texas\.gov|(?:www\.)?sll\.texas\.gov|(?:www\.)?hhs\.texas\.gov|txcourts\.gov)\/[^\s)]+/g;

for (const [slug, exportName] of targets) {
  test(`${slug} is substantial, source-backed, and internally connected`, async () => {
    const moduleUrl = pathToFileURL(
      path.join(repoRoot, "src/lib/blog/posts", `${slug}.ts`)
    );
    const postModule = await import(moduleUrl.href);
    const post = postModule[exportName];

    assert.ok(post, `expected ${exportName} export`);
    assert.equal(post.author, "WillBuddy Editorial Team");
    assert.equal(post.dateModified, reviewedOn);
    assert.match(
      post.editorialNote,
      /source-checked[\s\S]*not attorney-reviewed/i
    );
    assert.ok(post.faqs?.length >= 3, "expected at least three FAQs");

    const wordCount = post.content.trim().split(/\s+/).length;
    assert.ok(wordCount >= 900, `expected 900+ words, found ${wordCount}`);
    assert.match(post.content, /WillBuddy is not a law firm/i);
    assert.match(post.content, /does not provide legal advice/i);
    assert.match(post.content, /\/texas-estate-planning/);

    const internalLinks = new Set(
      [...post.content.matchAll(/\]\((\/blog\/[^)]+)\)/g)].map(
        (match) => match[1]
      )
    );
    assert.ok(
      internalLinks.size >= 2,
      `expected at least two related guide links, found ${internalLinks.size}`
    );

    const sources = new Set(post.content.match(officialSourcePattern) ?? []);
    assert.ok(
      sources.size >= 2,
      `expected at least two official Texas sources, found ${sources.size}`
    );

    assert.doesNotMatch(
      `${post.content}\n${post.editorialNote}`,
      /reviewed by (?:a|an) (?:licensed )?(?:Texas )?attorney/i
    );
  });
}

test("Texas estate-planning hub has canonical metadata and connected schema", async () => {
  const source = await readFile(
    path.join(
      repoRoot,
      "src/app/(marketing)/texas-estate-planning/page.tsx"
    ),
    "utf8"
  );

  assert.match(source, /canonical:\s*["']\/texas-estate-planning["']/);
  assert.match(source, /["']Article["']/);
  assert.match(source, /["']FAQPage["']/);
  assert.match(source, /["']BreadcrumbList["']/);
  assert.match(source, /replace\(\/<\/g/);
  assert.match(source, /not attorney-reviewed/i);
  assert.match(source, /not a law firm/i);

  for (const [slug] of targets) {
    assert.match(source, new RegExp(`/blog/${slug}`));
  }
});

test("blog templates expose review context, FAQ schema, and breadcrumbs", async () => {
  const source = await readFile(
    path.join(repoRoot, "src/app/(marketing)/blog/[slug]/page.tsx"),
    "utf8"
  );

  assert.match(source, /dateModified/);
  assert.match(source, /editorialNote/);
  assert.match(source, /["']FAQPage["']/);
  assert.match(source, /["']BreadcrumbList["']/);
  assert.match(source, /replace\(\/<\/g/);
  assert.match(source, /href=["']\/texas-estate-planning["']/);
});

test("hub is linked from discovery surfaces and included in the sitemap", async () => {
  const [sitemap, blogIndex, footer] = await Promise.all([
    readFile(path.join(repoRoot, "src/app/sitemap.ts"), "utf8"),
    readFile(path.join(repoRoot, "src/app/(marketing)/blog/page.tsx"), "utf8"),
    readFile(path.join(repoRoot, "src/components/layout/Footer.tsx"), "utf8"),
  ]);

  assert.match(sitemap, /absoluteUrl\(["']\/texas-estate-planning["']\)/);
  assert.match(blogIndex, /href=["']\/texas-estate-planning["']/);
  assert.match(footer, /href=["']\/texas-estate-planning["']/);
});
