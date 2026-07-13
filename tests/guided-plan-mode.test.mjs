import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("session offers equivalent voice and step-by-step input modes", async () => {
  const [page, provider, guided] = await Promise.all([
    read("src/app/session/[id]/page.tsx"),
    read("src/components/voice/VoiceProvider.tsx"),
    read("src/components/session/GuidedPlanFlow.tsx"),
  ]);

  assert.match(page, /Talk it through/);
  assert.match(page, /Answer step by step/);
  assert.match(page, /same decisions/);
  assert.match(provider, /saveGuidedDecision/);
  assert.match(provider, /guided_plan_answer_saved/);
  assert.match(guided, /QuizProgress/);
  assert.match(guided, /Switch to voice/);
  assert.match(guided, /same private plan as the voice conversation/i);
});

test("guided mode covers every document decision key", async () => {
  const [questions, types] = await Promise.all([
    read("src/lib/guided-plan/questions.ts"),
    read("src/types/index.ts"),
  ]);

  const keys = [
    "full_name",
    "partner_name",
    "children",
    "state",
    "marital_status",
    "primary_guardian",
    "backup_guardian",
    "guardian_named_individually",
    "special_wishes",
    "talked_to_guardian",
    "real_estate",
    "accounts",
    "business",
    "digital_assets",
    "distribution",
    "inheritance_age",
    "medical_poa",
    "partner_medical_poa",
    "life_support",
    "organ_donation",
    "executor",
    "backup_executor",
    "financial_poa",
    "poa_activation",
  ];

  for (const key of keys) {
    assert.match(types, new RegExp(`"${key}"`));
    assert.match(questions, new RegExp(`key: "${key}"`));
  }
});

test("completion and summary copy work for either input method", async () => {
  const [provider, summary] = await Promise.all([
    read("src/components/voice/VoiceProvider.tsx"),
    read("src/app/summary/[id]/page.tsx"),
  ]);

  assert.match(provider, /status: 'completed'/);
  assert.match(provider, /router\.push\(`\/summary\/\$\{sid\}`\)/);
  assert.doesNotMatch(summary, /You sat down, talked it through/);
  assert.match(summary, /worked through the questions/i);
});

test("voice teardown happens before the guided interface is shown", async () => {
  const provider = await read("src/components/voice/VoiceProvider.tsx");

  assert.match(provider, /const stopVoiceTransport = useCallback/);
  assert.match(
    provider,
    /if \(method === 'guided'\)[\s\S]*stopVoiceTransport\(\)[\s\S]*setInputMethod\(method\)/,
  );
});

test("guided saves only advance after persistence and surface failures", async () => {
  const [provider, guided] = await Promise.all([
    read("src/components/voice/VoiceProvider.tsx"),
    read("src/components/session/GuidedPlanFlow.tsx"),
  ]);

  assert.match(provider, /const \{ error \} = await supabase\.current[\s\S]*if \(error\) throw error/);
  assert.match(provider, /if \(!response\.ok\)[\s\S]*throw new Error/);
  assert.match(guided, /role="alert"/);
  assert.match(guided, /catch \(error\)/);
  assert.match(
    guided,
    /await saveGuidedDecision\([\s\S]*setStep\(\(current\) => current \+ 1\)/,
  );
});

test("save and exit persists the visible guided draft before redirecting", async () => {
  const [provider, guided] = await Promise.all([
    read("src/components/voice/VoiceProvider.tsx"),
    read("src/components/session/GuidedPlanFlow.tsx"),
  ]);

  assert.match(guided, /async function saveDraftAndExit/);
  assert.match(
    guided,
    /await saveGuidedDecision\([\s\S]*await saveAndExit\(\)/,
  );
  assert.match(provider, /saveAndExit: \(\) => Promise<void>/);
});

test("guided mode resumes at the first unanswered saved decision", async () => {
  const guided = await read("src/components/session/GuidedPlanFlow.tsx");

  assert.match(guided, /firstUnansweredQuestionIndex/);
  assert.match(guided, /didApplyResumePositionRef/);
  assert.match(
    guided,
    /if \(!isSessionReady \|\| didApplyResumePositionRef\.current\) return;[\s\S]*setStep\(firstUnansweredQuestionIndex\(questions, decisions\)\)[\s\S]*didApplyResumePositionRef\.current = true/,
  );
});

test("guided fields have programmatic labels and grouped radio choices", async () => {
  const guided = await read("src/components/session/GuidedPlanFlow.tsx");

  assert.match(guided, /<fieldset/);
  assert.match(guided, /<legend/);
  assert.match(guided, /htmlFor=\{fieldId\}/);
  assert.match(guided, /id=\{fieldId\}/);
});

test("homepage presents voice and step-by-step planning as equal input options", async () => {
  const homepage = await read("src/app/(marketing)/page.tsx");

  assert.match(homepage, /Talk it through or answer step by step/);
  assert.match(homepage, /conversation or step-by-step answers/);
  assert.doesNotMatch(homepage, /using your voice, not forms/);
});
