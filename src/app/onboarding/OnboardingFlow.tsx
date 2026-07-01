"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, Check } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import {
  CANONICAL_ORDER,
  PLAN_PRESETS,
  buildSectionPlan,
  defaultModules,
} from "@/lib/sections/plan";
import { SECTION_LABELS, type OnboardingQuizAnswers, type Section } from "@/types";

type Question = {
  id: string;
  title: string;
  subtitle?: string;
  options: { value: string; label: string; description?: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "planning_for",
    title: "Who are you planning for?",
    subtitle: "WillBuddy adapts the conversation to your situation.",
    options: [
      {
        value: "couple",
        label: "Me and my partner",
        description: "Plan together, or separately and compare answers after.",
      },
      {
        value: "individual",
        label: "Just me",
        description: "An individual plan, on your own timeline.",
      },
    ],
  },
  {
    id: "children",
    title: "Do you have children?",
    subtitle: "Guardianship is the decision most parents lose sleep over.",
    options: [
      { value: "have_kids", label: "Yes, kids at home" },
      { value: "expecting", label: "We're expecting" },
      { value: "no_kids", label: "Not yet" },
    ],
  },
  {
    id: "texas",
    title: "Do you live in Texas?",
    subtitle:
      "WillBuddy generates Texas-compliant documents. We're Texas-only for now.",
    options: [
      { value: "yes", label: "Yes, I'm in Texas" },
      { value: "no", label: "Not in Texas" },
    ],
  },
  {
    id: "priority",
    title: "What's most on your mind?",
    subtitle: "We'll start the conversation where it matters most to you.",
    options: [
      { value: "guardianship", label: "Naming guardians for my kids" },
      { value: "assets", label: "Deciding who gets what" },
      { value: "healthcare", label: "Healthcare & end-of-life wishes" },
      { value: "getting_started", label: "Honestly, just getting started" },
    ],
  },
];

const STORAGE_KEY = "willbuddy_onboarding";
const GOALS_STORAGE_KEY = "willbuddy_goals";

const OPTION_LABELS: Record<string, string> = Object.fromEntries(
  QUESTIONS.flatMap((q) => q.options.map((o) => [`${q.id}:${o.value}`, o.label]))
);

// Short, friendly one-liners for the "what do you want to cover" checklist.
const MODULE_BLURBS: Record<Section, string> = {
  family: "The basics — names, kids, and where you live",
  guardianship: "Who would raise your children",
  assets: "What you own and who gets what",
  healthcare: "Medical decisions & end-of-life wishes",
  executor: "Who settles your affairs + financial power of attorney",
};

export function OnboardingFlow({
  initialPlanningFor,
}: {
  initialPlanningFor?: string;
}) {
  // If the visitor picked "who are you planning for?" on the landing hero,
  // seed that answer and skip straight to the next question (commitment effect).
  const seededPlanningFor =
    initialPlanningFor === "couple" || initialPlanningFor === "individual"
      ? initialPlanningFor
      : undefined;

  const [step, setStep] = useState(seededPlanningFor ? 1 : 0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    seededPlanningFor ? { planning_for: seededPlanningFor } : {}
  );

  // "What do you want to cover" selection (Phase 2). Null preset means custom.
  const [planModules, setPlanModules] = useState<Section[] | null>(null);
  const [planPreset, setPlanPreset] = useState<string | null>(null);

  // Steps: [questions...] -> plan picker -> account.
  const PLAN_STEP = QUESTIONS.length;
  const ACCOUNT_STEP = QUESTIONS.length + 1;
  const totalSteps = QUESTIONS.length + 2;
  const isPlanStep = step === PLAN_STEP;
  const isAccountStep = step === ACCOUNT_STEP;
  const progress = Math.round((step / totalSteps) * 100);

  const notInTexas = answers.texas === "no";

  // Default coverage inferred from the quiz answers (e.g. no kids → no guardianship).
  const inferredModules = useMemo(
    () => defaultModules(answers as OnboardingQuizAnswers),
    [answers]
  );
  const selectedModules = planModules ?? inferredModules;

  const persistAnswers = useMemo(
    () => (final: Record<string, string>) => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...final, completedAt: new Date().toISOString() })
        );
      } catch {
        // localStorage may be unavailable (private mode); non-fatal.
      }
    },
    []
  );

  function persistGoals(preset: string | null, modules: Section[]) {
    try {
      window.localStorage.setItem(
        GOALS_STORAGE_KEY,
        JSON.stringify({ preset, modules })
      );
    } catch {
      // non-fatal
    }
  }

  function selectOption(question: Question, value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    captureAnalyticsEvent("onboarding_step_completed", {
      step: step + 1,
      question: question.id,
      answer: value,
    });

    const nextStep = step + 1;
    if (nextStep === PLAN_STEP) {
      persistAnswers(next);
      captureAnalyticsEvent("onboarding_completed", next);
    }
    setStep(nextStep);
  }

  function selectPreset(presetId: string, modules: Section[]) {
    setPlanPreset(presetId);
    setPlanModules(modules);
  }

  function toggleModule(section: Section) {
    if (section === "family") return; // required
    setPlanPreset(null); // customizing → no longer a named preset
    const set = new Set(selectedModules);
    if (set.has(section)) set.delete(section);
    else set.add(section);
    set.add("family");
    setPlanModules(CANONICAL_ORDER.filter((s) => set.has(s)));
  }

  function confirmPlan() {
    const modules = CANONICAL_ORDER.filter((s) =>
      new Set(selectedModules).add("family").has(s)
    );
    persistGoals(planPreset, modules);
    captureAnalyticsEvent("onboarding_plan_selected", {
      preset: planPreset,
      modules,
    });
    setStep(ACCOUNT_STEP);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#FAF8F5]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]"
        >
          WillBuddy
        </Link>
        {!isAccountStep && (
          <span className="text-xs font-medium text-[#9B8E7E]">
            Step {step + 1} of {totalSteps}
          </span>
        )}
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="mx-auto h-1 w-full max-w-xl overflow-hidden rounded-full bg-[#E8E0D6]">
          <div
            className="h-full rounded-full bg-[#5B7A5E] transition-all duration-300"
            style={{ width: `${Math.max(progress, 6)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 pb-10 pt-10 md:pt-16">
        <div className="w-full max-w-xl">
          {isAccountStep ? (
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26] md:text-3xl">
                Create your free account
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[#5B4F3E]">
                Your answers are saved. Create an account to start your
                conversation — it&apos;s free to begin, and you only pay when
                you&apos;re ready for documents.
              </p>
              <p className="mx-auto mt-2 mb-6 text-sm font-medium text-[#5B7A5E]">
                About 2 minutes to your first draft.
              </p>

              {/* Recap of saved answers — reassures the visitor nothing is lost. */}
              {Object.keys(answers).length > 0 && (
                <div className="mx-auto mb-8 flex max-w-md flex-wrap justify-center gap-2">
                  {QUESTIONS.map((q) => {
                    const val = answers[q.id];
                    if (!val) return null;
                    const label = OPTION_LABELS[`${q.id}:${val}`] ?? val;
                    return (
                      <span
                        key={q.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D6] bg-white px-3 py-1.5 text-xs font-medium text-[#5B4F3E]"
                      >
                        <Check className="h-3 w-3 text-[#5B7A5E]" strokeWidth={3} />
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
              {/* Coverage recap — reflects the tailored plan they'll go through. */}
              <p className="mx-auto mb-6 max-w-md text-xs text-[#9B8E7E]">
                Your session will cover:{" "}
                <span className="font-medium text-[#5B4F3E]">
                  {buildSectionPlan(answers as OnboardingQuizAnswers, selectedModules)
                    .map((s) => SECTION_LABELS[s])
                    .join(" → ")}
                </span>
              </p>
              {notInTexas && (
                <p className="mx-auto mb-6 max-w-md rounded-xl border border-[#E8E0D6] bg-[#F0EBE4]/60 px-4 py-3 text-sm text-[#5B4F3E]">
                  Heads up: WillBuddy currently generates{" "}
                  <strong>Texas-compliant</strong> documents only. You&apos;re
                  welcome to explore, and we&apos;ll let you know when we expand
                  to other states.
                </p>
              )}
              <div className="flex justify-center">
                <SignUp
                  forceRedirectUrl="/session"
                  signInUrl="/sign-in"
                  appearance={{
                    elements: { rootBox: "mx-auto", card: "shadow-lg" },
                  }}
                />
              </div>
              <button
                type="button"
                onClick={goBack}
                className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-medium text-[#9B8E7E] hover:text-[#2D2A26]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          ) : isPlanStep ? (
            <PlanStep
              selected={selectedModules}
              activePreset={planPreset}
              onSelectPreset={selectPreset}
              onToggleModule={toggleModule}
              onContinue={confirmPlan}
              onBack={goBack}
            />
          ) : (
            <QuestionStep
              question={QUESTIONS[step]}
              selected={answers[QUESTIONS[step].id]}
              onSelect={(value) => selectOption(QUESTIONS[step], value)}
              onBack={step > 0 ? goBack : undefined}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function QuestionStep({
  question,
  selected,
  onSelect,
  onBack,
}: {
  question: Question;
  selected?: string;
  onSelect: (value: string) => void;
  onBack?: () => void;
}) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26] md:text-3xl">
        {question.title}
      </h1>
      {question.subtitle && (
        <p className="mt-3 text-[#5B4F3E]">{question.subtitle}</p>
      )}

      <div className="mt-8 space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? "border-[#5B7A5E] ring-2 ring-[#5B7A5E]/20"
                  : "border-[#E8E0D6]"
              }`}
            >
              <span>
                <span className="block font-semibold text-[#2D2A26]">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="mt-0.5 block text-sm text-[#9B8E7E]">
                    {opt.description}
                  </span>
                )}
              </span>
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-[#5B7A5E] bg-[#5B7A5E] text-white"
                    : "border-[#E8E0D6] text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 flex items-center gap-1.5 text-sm font-medium text-[#9B8E7E] hover:text-[#2D2A26]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
    </div>
  );
}

function PlanStep({
  selected,
  activePreset,
  onSelectPreset,
  onToggleModule,
  onContinue,
  onBack,
}: {
  selected: Section[];
  activePreset: string | null;
  onSelectPreset: (presetId: string, modules: Section[]) => void;
  onToggleModule: (section: Section) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const selectedSet = new Set(selected);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26] md:text-3xl">
        What do you want to cover?
      </h1>
      <p className="mt-3 text-[#5B4F3E]">
        We&apos;ve pre-selected what most people in your situation need. Pick a
        starting point or fine-tune it — you can always add more later.
      </p>

      {/* Presets */}
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PLAN_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id, preset.modules)}
              className={`rounded-2xl border bg-white px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive
                  ? "border-[#5B7A5E] ring-2 ring-[#5B7A5E]/20"
                  : "border-[#E8E0D6]"
              }`}
            >
              <span className="block text-sm font-semibold text-[#2D2A26]">
                {preset.label}
              </span>
              <span className="mt-0.5 block text-xs text-[#9B8E7E]">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fine-tune checklist */}
      <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-[#9B8E7E]">
        Fine-tune your plan
      </p>
      <div className="mt-3 space-y-2">
        {CANONICAL_ORDER.map((section) => {
          const isSelected = selectedSet.has(section);
          const isRequired = section === "family";
          return (
            <button
              key={section}
              type="button"
              onClick={() => onToggleModule(section)}
              disabled={isRequired}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all ${
                isSelected ? "border-[#5B7A5E]" : "border-[#E8E0D6]"
              } ${isRequired ? "opacity-90" : "hover:border-[#5B7A5E]/50"}`}
            >
              <span>
                <span className="block text-sm font-semibold text-[#2D2A26]">
                  {SECTION_LABELS[section]}
                  {isRequired && (
                    <span className="ml-2 text-xs font-normal text-[#9B8E7E]">
                      (always included)
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-[#9B8E7E]">
                  {MODULE_BLURBS[section]}
                </span>
              </span>
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-[#5B7A5E] bg-[#5B7A5E] text-white"
                    : "border-[#E8E0D6] text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 w-full rounded-full bg-[#5B7A5E] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A6A4D]"
      >
        Continue
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-medium text-[#9B8E7E] hover:text-[#2D2A26]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    </div>
  );
}
