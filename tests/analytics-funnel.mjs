import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("all five free tools emit the shared start and completion funnel", async () => {
  const [helper, ...tools] = await Promise.all([
    read("src/lib/analytics/use-tool-analytics.ts"),
    read("src/components/tools/WillTrustDecisionEngine.tsx"),
    read("src/components/tools/EstateReadinessChecklist.tsx"),
    read("src/components/tools/TexasPowerOfAttorneyNavigator.tsx"),
    read("src/components/tools/TexasIntestacyCalculator.tsx"),
    read("src/components/tools/TexasEstateCostCalculator.tsx"),
  ]);

  assert.match(helper, /captureAnalyticsEvent\("tool_started"/);
  assert.match(helper, /captureAnalyticsEvent\("tool_completed"/);
  assert.match(helper, /startedRef\.current/);

  for (const source of tools) {
    assert.match(source, /useToolAnalytics/);
    assert.match(source, /recordStart/);
    assert.match(source, /recordComplete/);
  }
});

test("onboarding, plan creation, and guided mode expose conversion events", async () => {
  const [onboarding, sessionRoute, serverAnalytics, voiceProvider, providers] = await Promise.all([
    read("src/app/onboarding/OnboardingFlow.tsx"),
    read("src/app/api/session/route.ts"),
    read("src/lib/analytics/server.ts"),
    read("src/components/voice/VoiceProvider.tsx"),
    read("src/app/providers.tsx"),
  ]);

  assert.match(onboarding, /onboarding_started/);
  assert.match(onboarding, /onboarding_completed/);
  assert.match(sessionRoute, /captureServerEvent\("plan_started"/);
  assert.match(sessionRoute, /captureServerEvent\("plan_completed"/);
  assert.match(
    serverAnalytics,
    /properties:\s*{\s*\.\.\.stripSensitiveProperties\(properties\),\s*distinct_id: distinctId/
  );
  assert.match(voiceProvider, /guided_plan_started/);
  assert.match(voiceProvider, /guided_plan_answer_saved/);
  assert.match(voiceProvider, /guided_plan_completed/);
  assert.match(providers, /posthog\.identify\(user\.id/);
});

test("homepage resource links retain explicit click tracking", async () => {
  const homepage = await read("src/app/(marketing)/page.tsx");
  assert.match(homepage, /event="homepage_resource_clicked"/);
  assert.match(homepage, /resource_type: "tool"/);
  assert.match(homepage, /resource_type: "content"/);
});

test("research survey responses are detached from signed-in identity", async () => {
  const [providers, survey] = await Promise.all([
    read("src/app/providers.tsx"),
    read("src/components/research/TexasReadinessSurvey.tsx"),
  ]);

  assert.match(
    providers,
    /pathname === "\/research\/texas-estate-planning-readiness"/
  );
  assert.match(providers, /posthog\.reset\(\)/);
  assert.match(providers, /privacyModeRef\.current = true/);
  assert.match(survey, /do not attach your WillBuddy account ID/i);
  assert.doesNotMatch(survey, /anonymous/i);
});
