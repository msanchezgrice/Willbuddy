import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("onboarding explicitly distinguishes adult, minor, mixed-age, and no-child families", async () => {
  const [onboarding, childRules] = await Promise.all([
    read("src/app/onboarding/OnboardingFlow.tsx"),
    read("src/lib/family/children.ts"),
  ]);

  for (const status of [
    "minor_children",
    "adult_children",
    "minor_and_adult_children",
    "expecting",
    "no_children",
  ]) {
    assert.match(onboarding + childRules, new RegExp(`\\b${status}\\b`));
  }
  assert.match(onboarding, /Adult children only \(18\+\)/);
  assert.match(onboarding, /skip questions about who would raise a minor child/i);
});

test("adult-only status removes minor-child guardianship from selected and stored plans", async () => {
  const [plan, provider] = await Promise.all([
    read("src/lib/sections/plan.ts"),
    read("src/components/voice/VoiceProvider.tsx"),
  ]);

  assert.match(plan, /base\.filter\(\(section\) => sectionIsAvailable\(section, onboarding\)\)/);
  assert.match(plan, /minorChildGuardianshipIsAvailable\(onboarding\?\.children\)/);
  assert.match(
    provider,
    /const resolvedPlan = buildSectionPlan\([\s\S]*setSectionPlan\(resolvedPlan\)/,
  );
  assert.match(
    provider,
    /const safePlan = buildSectionPlan\([\s\S]*sectionPlan: safePlan/,
  );
});

test("voice has a hard adult-child guard and generated wills use the stored plan", async () => {
  const [prompt, generator, will, pdfRoute, shareAccess] = await Promise.all([
    read("src/lib/gemini/system-prompt.ts"),
    read("src/lib/documents/generator.ts"),
    read("src/lib/documents/templates/will.ts"),
    read("src/app/api/documents/pdf/route.ts"),
    read("src/lib/documents/share-access.ts"),
  ]);

  assert.match(prompt, /If the user has adult children only, do NOT ask who would raise them/);
  assert.match(prompt, /Adult guardianship for an incapacitated adult is a separate legal process/);
  assert.match(generator, /options\.sectionPlan\?\.includes\("guardianship"\)/);
  assert.match(will, /ARTICLE 5 — BENEFICIARY TRUSTS/);
  assert.doesNotMatch(will, /ARTICLE 5 — MINOR CHILDREN/);
  assert.match(pdfRoute, /generateAllDocuments\(decisions \?\? \[\], \{ sectionPlan: plan \}\)/);
  assert.match(shareAccess, /generateAllDocuments\(allDecisions, \{ sectionPlan \}\)/);
});
