"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, Check } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

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

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const totalSteps = QUESTIONS.length + 1; // questions + account step
  const isAccountStep = step === QUESTIONS.length;
  const progress = Math.round((step / totalSteps) * 100);

  const notInTexas = answers.texas === "no";

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

  function selectOption(question: Question, value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    captureAnalyticsEvent("onboarding_step_completed", {
      step: step + 1,
      question: question.id,
      answer: value,
    });

    const nextStep = step + 1;
    if (nextStep === QUESTIONS.length) {
      persistAnswers(next);
      captureAnalyticsEvent("onboarding_completed", next);
    }
    setStep(nextStep);
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

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          {isAccountStep ? (
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26] md:text-3xl">
                Create your free account
              </h1>
              <p className="mx-auto mt-3 mb-8 max-w-md text-[#5B4F3E]">
                Your answers are saved. Create an account to start your
                conversation — it&apos;s free to begin, and you only pay when
                you&apos;re ready for documents.
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
