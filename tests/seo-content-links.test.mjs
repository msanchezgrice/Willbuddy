import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

async function importPost(filename, exportName) {
  const moduleUrl = pathToFileURL(
    path.join(repoRoot, "src/lib/blog/posts", filename)
  );
  const postModule = await import(moduleUrl.href);
  return postModule[exportName];
}

test("priority articles link readers to the matching free tools", async () => {
  const [intestacy, durablePoa, medicalPoa, guardian, executor, parents, costs] =
    await Promise.all([
      read("src/lib/blog/posts/dying-without-a-will-in-texas.ts"),
      read("src/lib/blog/posts/durable-power-of-attorney.ts"),
      read("src/lib/blog/posts/medical-power-of-attorney-living-will.ts"),
      read("src/lib/blog/posts/choosing-a-guardian.ts"),
      read("src/lib/blog/posts/naming-an-executor.ts"),
      read("src/lib/blog/posts/big-decisions-new-parents.ts"),
      read("src/app/(marketing)/guides/living-trust-cost-texas/page.tsx"),
    ]);

  assert.match(intestacy, /\/tools\/texas-intestacy-calculator/);
  assert.match(durablePoa, /\/tools\/texas-power-of-attorney-navigator/);
  assert.match(medicalPoa, /\/tools\/texas-power-of-attorney-navigator/);
  for (const source of [guardian, executor, parents]) {
    assert.match(source, /\/tools\/estate-planning-readiness/);
  }
  assert.match(costs, /\/tools\/texas-estate-planning-cost-calculator/);
});

test("Texas estate-planning checklist is substantive, sourced, and tool-connected", async () => {
  const post = await importPost(
    "texas-estate-planning-checklist.ts",
    "texasEstatePlanningChecklist"
  );

  assert.equal(post.slug, "texas-estate-planning-checklist");
  assert.equal(post.date, "2026-07-13");
  assert.match(post.editorialNote, /source-checked[\s\S]*not attorney-reviewed/i);
  assert.ok(post.faqs?.length >= 3);
  assert.ok(post.content.trim().split(/\s+/).length >= 1_500);
  assert.match(post.content, /\/tools\/estate-planning-readiness/);
  assert.match(post.content, /\/tools\/texas-intestacy-calculator/);
  assert.match(post.content, /\/tools\/texas-power-of-attorney-navigator/);
  assert.match(post.content, /\/tools\/texas-estate-planning-cost-calculator/);
  assert.match(post.content, /Texas Estates Code Chapter 201/i);
  assert.match(post.content, /WillBuddy is not a law firm/i);
  assert.match(post.content, /licensed Texas attorney/i);
});

test("research announcement discloses instrument, privacy limits, and nonprobability design", async () => {
  const post = await importPost(
    "texas-estate-planning-readiness-study.ts",
    "texasEstatePlanningReadinessStudy"
  );

  assert.equal(post.slug, "texas-estate-planning-readiness-study");
  assert.equal(post.date, "2026-07-13");
  assert.ok(post.content.trim().split(/\s+/).length >= 1_000);
  assert.match(post.content, /voluntary nonprobability convenience sample/i);
  assert.match(post.content, /not a representative poll/i);
  assert.match(post.content, /at least \*\*200 complete responses\*\*/i);
  assert.match(post.content, /fewer than \*\*25 responses\*\*/i);
  assert.match(post.content, /results were not weighted/i);
  assert.match(post.content, /no margin of sampling error is claimed/i);
  assert.match(post.content, /does not require a WillBuddy account/i);
  assert.match(post.content, /\/research\/texas-estate-planning-readiness#readiness-survey/);
  assert.match(post.content, /\/tools\/estate-planning-readiness/);
  assert.match(post.content, /\/privacy/);
  assert.match(post.content, /aapor\.org\/standards-and-ethics\/disclosure-standards/);
  assert.match(post.content, /not claiming AAPOR membership, certification, or endorsement/i);
});

test("new posts are registered and therefore generated into blog routes and sitemap", async () => {
  const [registry, blogPage, sitemap] = await Promise.all([
    read("src/lib/blog/index.ts"),
    read("src/app/(marketing)/blog/[slug]/page.tsx"),
    read("src/app/sitemap.ts"),
  ]);

  assert.match(registry, /texasEstatePlanningChecklist/);
  assert.match(registry, /texasEstatePlanningReadinessStudy/);
  assert.match(blogPage, /getAllSlugs\(\)\.map/);
  assert.match(sitemap, /getAllPosts\(\)\.map/);
  assert.match(sitemap, /post\.dateModified\s*\?\?\s*post\.date/);
});
