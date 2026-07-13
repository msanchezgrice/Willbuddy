import assert from "node:assert/strict";
import test from "node:test";

import {
  getWillTrustRecommendation,
} from "../src/lib/tools/will-trust-decision.ts";
import {
  buildReadinessResult,
  getApplicableReadinessItems,
} from "../src/lib/tools/estate-readiness.ts";

test("a straightforward Texas household gets a will-first result", () => {
  const result = getWillTrustRecommendation({
    ownsRealEstate: false,
    ownsPropertyOutsideTexas: false,
    hasComplexPlanningNeeds: false,
    probatePrivacyPriority: "low",
    preparedToFundTrust: false,
  });

  assert.equal(result.id, "will_first");
  assert.match(result.title, /will-first/i);
  assert.match(result.summary, /trust can be added later/i);
});

test("multiple trust signals produce an attorney-conversation result, not a product claim", () => {
  const result = getWillTrustRecommendation({
    ownsRealEstate: true,
    ownsPropertyOutsideTexas: true,
    hasComplexPlanningNeeds: true,
    probatePrivacyPriority: "high",
    preparedToFundTrust: true,
  });

  assert.equal(result.id, "will_plus_trust_conversation");
  assert.match(result.title, /trust conversation/i);
  assert.match(result.summary, /estate-planning attorney/i);
  assert.doesNotMatch(result.summary, /WillBuddy (creates|provides|prepares).*trust/i);
  assert.ok(result.reasons.length >= 3);
});

test("a trust signal without willingness to fund it produces a compare-both result", () => {
  const result = getWillTrustRecommendation({
    ownsRealEstate: true,
    ownsPropertyOutsideTexas: false,
    hasComplexPlanningNeeds: false,
    probatePrivacyPriority: "high",
    preparedToFundTrust: false,
  });

  assert.equal(result.id, "compare_both");
  assert.match(result.nextSteps.join(" "), /retitl|fund/i);
});

test("guardian nomination is applicable only when minor children are present", () => {
  const withMinors = getApplicableReadinessItems({
    planningFor: "couple",
    children: "minor_children",
    texas: "yes",
    priority: "guardianship",
  });
  const withoutMinors = getApplicableReadinessItems({
    planningFor: "individual",
    children: "no_children",
    texas: "yes",
    priority: "getting_started",
  });

  assert.ok(withMinors.some((item) => item.id === "guardian"));
  assert.ok(!withoutMinors.some((item) => item.id === "guardian"));
});

test("readiness score uses only applicable items and prioritizes missing essentials", () => {
  const profile = {
    planningFor: "individual",
    children: "no_children",
    texas: "yes",
    priority: "healthcare",
  };
  const applicable = getApplicableReadinessItems(profile);
  const completed = Object.fromEntries(
    applicable.map((item) => [item.id, item.id === "beneficiaries"])
  );
  const result = buildReadinessResult(profile, completed);

  assert.equal(result.completedCount, 1);
  assert.equal(result.totalCount, applicable.length);
  assert.equal(result.score, Math.round(100 / applicable.length));
  assert.equal(result.band, "getting_started");
  assert.ok(result.nextSteps.length <= 3);
  assert.ok(result.nextSteps.some((item) => item.id === "medical_decisions"));
});

test("all applicable actions complete yields a ready-to-review result", () => {
  const profile = {
    planningFor: "couple",
    children: "minor_children",
    texas: "yes",
    priority: "assets",
  };
  const applicable = getApplicableReadinessItems(profile);
  const completed = Object.fromEntries(applicable.map((item) => [item.id, true]));
  const result = buildReadinessResult(profile, completed);

  assert.equal(result.score, 100);
  assert.equal(result.band, "ready_to_review");
  assert.equal(result.nextSteps.length, 0);
});
