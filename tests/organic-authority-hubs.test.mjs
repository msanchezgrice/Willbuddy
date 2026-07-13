import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

async function source(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

test("tools and research hubs are indexable discovery surfaces", async () => {
  const [tools, research] = await Promise.all([
    source("src/app/(marketing)/tools/page.tsx"),
    source("src/app/(marketing)/research/page.tsx"),
  ]);

  for (const [page, canonical] of [
    [tools, "/tools"],
    [research, "/research"],
  ]) {
    assert.match(page, new RegExp(`canonical:\\s*["']${canonical}["']`));
    assert.match(page, /BreadcrumbList/);
    assert.match(page, /JSON\.stringify\([\s\S]*replace\(\/<\/g/);
  }

  for (const route of [
    "/tools/texas-intestacy-calculator",
    "/tools/texas-estate-planning-cost-calculator",
    "/tools/texas-power-of-attorney-navigator",
    "/tools/estate-planning-readiness",
  ]) {
    assert.match(tools, new RegExp(route));
  }
  assert.match(research, /\/research\/texas-estate-planning-readiness/);
});

test("readiness report separates sourced baselines from collecting Texas data", async () => {
  const [page, survey] = await Promise.all([
    source(
      "src/app/(marketing)/research/texas-estate-planning-readiness/page.tsx"
    ),
    source("src/components/research/TexasReadinessSurvey.tsx"),
  ]);

  assert.match(page, /canonical:\s*["']\/research\/texas-estate-planning-readiness["']/);
  assert.match(page, /Data collection in progress/i);
  assert.match(page, /Pew Research Center/i);
  assert.match(page, /Trust\s*&\s*Will/i);
  assert.match(page, /sample size/i);
  assert.match(page, /minimum of 200/i);
  assert.match(page, /not attorney-reviewed/i);
  assert.match(page, /Dataset|DataCatalog/);
  assert.match(survey, /texas_readiness_survey_completed/);
  assert.doesNotMatch(survey, /type=["']email["']|type=["']text["']/);
});

test("all authority routes are in the sitemap and global discovery links", async () => {
  const [sitemap, footer, blog] = await Promise.all([
    source("src/app/sitemap.ts"),
    source("src/components/layout/Footer.tsx"),
    source("src/app/(marketing)/blog/page.tsx"),
  ]);

  const routes = [
    "/tools",
    "/research",
    "/research/texas-estate-planning-readiness",
    "/tools/texas-intestacy-calculator",
    "/tools/texas-estate-planning-cost-calculator",
    "/tools/texas-power-of-attorney-navigator",
    "/tools/estate-planning-readiness",
    "/guides/living-trust-texas",
    "/guides/living-trust-cost-texas",
  ];

  for (const route of routes) {
    assert.match(sitemap, new RegExp(`absoluteUrl\\(["']${route}["']\\)`));
  }
  assert.match(footer, /href=["']\/tools["']/);
  assert.match(footer, /href=["']\/research["']/);
  assert.match(blog, /href=["']\/tools["']/);
});

test("privacy policy discloses the anonymous readiness research event", async () => {
  const privacy = await source("src/app/(marketing)/privacy/page.tsx");
  assert.match(privacy, /anonymous multiple-choice\s+readiness survey/i);
  assert.match(privacy, /does not request names,\s+email addresses, asset values/i);
});
