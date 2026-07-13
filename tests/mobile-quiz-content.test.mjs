import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("questionnaires use a shared step flow with progress and back navigation", async () => {
  const [progress, ...questionnaires] = await Promise.all([
    read("src/components/tools/QuizProgress.tsx"),
    read("src/components/tools/WillTrustDecisionEngine.tsx"),
    read("src/components/tools/EstateReadinessChecklist.tsx"),
    read("src/components/tools/TexasPowerOfAttorneyNavigator.tsx"),
    read("src/components/tools/TexasIntestacyCalculator.tsx"),
    read("src/components/research/TexasReadinessSurvey.tsx"),
  ]);

  assert.match(progress, /role="progressbar"/);
  assert.match(progress, /aria-valuenow/);
  assert.match(progress, />\s*Back\s*</);

  for (const questionnaire of questionnaires) {
    assert.match(questionnaire, /QuizProgress/);
    assert.match(questionnaire, /QuizNavigation/);
    assert.match(questionnaire, /currentStep/);
  }
});

test("research survey clearly distinguishes contribution from a personal score", async () => {
  const [page, survey] = await Promise.all([
    read("src/app/(marketing)/research/texas-estate-planning-readiness/page.tsx"),
    read("src/components/research/TexasReadinessSurvey.tsx"),
  ]);

  assert.match(page, /Answer five questions to help build the report/i);
  assert.match(page, /not the personalized readiness\s+quiz/i);
  assert.match(page, /\/tools\/estate-planning-readiness/);
  assert.match(survey, /contribute to the aggregate\s+Texas research/i);
  assert.match(survey, /do not generate a personal score/i);
  assert.match(survey, /questionLegendRef\.current\?\.focus\(\)/);
});

test("stepped tool flows manage focus and do not double-count results", async () => {
  const [readiness, intestacy] = await Promise.all([
    read("src/components/tools/EstateReadinessChecklist.tsx"),
    read("src/components/tools/TexasIntestacyCalculator.tsx"),
  ]);

  assert.match(readiness, /activeLegendRef\.current\?\.focus\(\)/);
  assert.match(readiness, /tabIndex=\{-1\}/);
  assert.match(intestacy, /if \(!complete \|\| submitted\) return/);
});

test("homepage and roundup post expose every free planning tool", async () => {
  const [homepage, registry, post] = await Promise.all([
    read("src/app/(marketing)/page.tsx"),
    read("src/lib/blog/index.ts"),
    read("src/lib/blog/posts/free-texas-estate-planning-tools.ts"),
  ]);

  const routes = [
    "/tools/estate-planning-readiness",
    "/blog/wills-vs-trusts-texas",
    "/tools/texas-intestacy-calculator",
    "/tools/texas-estate-planning-cost-calculator",
    "/tools/texas-power-of-attorney-navigator",
  ];

  for (const route of routes) {
    assert.match(homepage, new RegExp(route));
    assert.match(post, new RegExp(route));
  }

  assert.match(homepage, /["']\/blog["']/);
  assert.match(registry, /freeTexasEstatePlanningTools/);
  assert.match(post, /slug: "free-texas-estate-planning-tools"/);
});
