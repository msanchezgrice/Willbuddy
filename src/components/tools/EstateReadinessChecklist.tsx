"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import { useToolAnalytics } from "@/lib/analytics/use-tool-analytics";
import { QuizNavigation, QuizProgress } from "@/components/tools/QuizProgress";
import { useQuizStepFocus } from "@/components/tools/useQuizStepFocus";
import {
  buildReadinessResult,
  getApplicableReadinessItems,
  type ReadinessItem,
  type ReadinessProfile,
} from "@/lib/tools/estate-readiness";

const PROFILE_QUESTIONS = [
  {
    id: "planningFor",
    legend: "Who are you planning for?",
    options: [
      { value: "individual", label: "Just me" },
      { value: "couple", label: "Me and my partner" },
    ],
  },
  {
    id: "children",
    legend: "Which describes your family?",
    options: [
      { value: "minor_children", label: "Minor children" },
      { value: "adult_children", label: "Adult children only" },
      { value: "no_children", label: "No children" },
    ],
  },
  {
    id: "texas",
    legend: "Do you live in Texas?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "priority",
    legend: "What is most on your mind?",
    options: [
      { value: "guardianship", label: "Guardianship" },
      { value: "assets", label: "Who gets what" },
      { value: "healthcare", label: "Healthcare wishes" },
      { value: "getting_started", label: "Getting started" },
    ],
  },
] as const;

const BAND_COPY = {
  getting_started: {
    eyebrow: "Getting started",
    title: "Build the foundation one decision at a time",
    body: "You have clear next steps. Start with the highest-impact missing decision rather than trying to finish everything in one sitting.",
  },
  building_foundation: {
    eyebrow: "Foundation in progress",
    title: "You have momentum—now close the important gaps",
    body: "Several essentials are covered. Focus next on the missing decision-making documents and keep beneficiary records coordinated.",
  },
  ready_to_review: {
    eyebrow: "Ready to review",
    title: "Your core planning checklist is in strong shape",
    body: "Readiness is not a one-time finish line. Confirm the documents are valid, coordinated, findable, and reviewed after life changes.",
  },
} as const;

export function EstateReadinessChecklist() {
  const { recordStart, recordComplete } = useToolAnalytics(
    "estate_planning_readiness"
  );
  const [profile, setProfile] = useState<ReadinessProfile>({
    planningFor: "individual",
    children: "no_children",
    texas: "yes",
    priority: "getting_started",
  });
  const [completed, setCompleted] = useState<
    Partial<Record<ReadinessItem["id"], boolean>>
  >({});
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const activeLegendRef = useQuizStepFocus(currentStep, !showResult);

  const applicable = useMemo(
    () => getApplicableReadinessItems(profile),
    [profile]
  );
  const result = useMemo(
    () => buildReadinessResult(profile, completed),
    [profile, completed]
  );
  const bandCopy = BAND_COPY[result.band];
  const checklistGroups = [applicable.slice(0, 4), applicable.slice(4)];
  const totalSteps = PROFILE_QUESTIONS.length + checklistGroups.length;
  const profileQuestion = PROFILE_QUESTIONS[currentStep];
  const checklistGroup = checklistGroups[currentStep - PROFILE_QUESTIONS.length];

  function updateProfile<K extends keyof ReadinessProfile>(
    key: K,
    value: ReadinessProfile[K]
  ) {
    recordStart();
    setProfile((current) => ({ ...current, [key]: value }));
    if (key === "children" && value !== "minor_children") {
      setCompleted((current) => ({ ...current, guardian: false }));
    }
    setShowResult(false);
  }

  function toggle(id: ReadinessItem["id"]) {
    recordStart();
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
    setShowResult(false);
  }

  function calculate() {
    setShowResult(true);
    captureAnalyticsEvent("estate_readiness_completed", {
      score_band: result.band,
      score_bucket:
        result.score >= 75 ? "75_100" : result.score >= 40 ? "40_74" : "0_39",
      applicable_item_count: result.totalCount,
      completed_item_count: result.completedCount,
    });
    recordComplete({
      score_band: result.band,
      score_bucket:
        result.score >= 75 ? "75_100" : result.score >= 40 ? "40_74" : "0_39",
      applicable_item_count: result.totalCount,
      completed_item_count: result.completedCount,
    });
  }

  function reset() {
    setProfile({
      planningFor: "individual",
      children: "no_children",
      texas: "yes",
      priority: "getting_started",
    });
    setCompleted({});
    setShowResult(false);
    setCurrentStep(0);
  }

  function continueQuiz() {
    recordStart();
    if (currentStep === totalSteps - 1) {
      calculate();
      return;
    }
    setCurrentStep((step) => step + 1);
  }

  return (
    <div
      data-quiz-shell
      className="scroll-mt-2 overflow-hidden rounded-2xl border border-[#D8CDBF] bg-white shadow-sm sm:rounded-3xl"
    >
      <div className="hidden border-b border-[#E8E0D6] bg-[#F0EBE4]/60 px-5 py-6 sm:block sm:px-7">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#5B7A5E]" aria-hidden="true" />
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              Personalize the checklist
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5B4F3E]">
              Choose your situation, then check what is already in place. Your
              result appears before any account prompt.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-7 sm:py-6">
        {!showResult && (
          <div className="mx-auto max-w-2xl">
            <QuizProgress
              current={currentStep + 1}
              total={totalSteps}
              label="Step"
            />

            {profileQuestion ? (
              <fieldset className="mt-4 min-h-0 sm:mt-7 sm:min-h-[220px]">
                <legend
                  ref={activeLegendRef}
                  tabIndex={-1}
                  className="font-[family-name:var(--font-heading)] text-lg font-bold leading-snug text-[#2D2A26] outline-none sm:text-2xl"
                >
                  {profileQuestion.legend}
                </legend>
                <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  {profileQuestion.options.map((option) => {
                    const selected = profile[profileQuestion.id] === option.value;
                    const id = `readiness-${profileQuestion.id}-${option.value}`;
                    return (
                      <label
                        key={option.value}
                        htmlFor={id}
                        className={`flex min-h-11 cursor-pointer items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 sm:min-h-14 sm:rounded-2xl sm:px-4 sm:py-3 ${
                          selected
                            ? "border-[#5B7A5E] bg-[#F3F7F3] text-[#2D2A26] shadow-sm"
                            : "border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#9CAF9E]"
                        }`}
                      >
                        <input
                          id={id}
                          type="radio"
                          name={profileQuestion.id}
                          value={option.value}
                          checked={selected}
                          onChange={() =>
                            updateProfile(
                              profileQuestion.id,
                              option.value as ReadinessProfile[typeof profileQuestion.id]
                            )
                          }
                          className="mr-3 h-4 w-4 accent-[#5B7A5E]"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <fieldset className="mt-4 min-h-0 sm:mt-7 sm:min-h-[320px]">
                <legend
                  ref={activeLegendRef}
                  tabIndex={-1}
                  className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26] outline-none sm:text-2xl"
                >
                  What do you already have in place?
                </legend>
                <p className="mt-1 text-xs text-[#6F655A] sm:mt-2 sm:text-sm">
                  Check every item that is current and that the right people can find.
                </p>
                <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  {(checklistGroup ?? []).map((item) => {
                    const checked = Boolean(completed[item.id]);
                    return (
                      <label
                        key={item.id}
                        htmlFor={`readiness-item-${item.id}`}
                        className={`cursor-pointer rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 sm:rounded-2xl sm:p-4 ${
                          checked
                            ? "border-[#9CAF9E] bg-[#F4F7F3]"
                            : "border-[#E8E0D6] bg-white hover:border-[#D8CDBF]"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              checked
                                ? "border-[#5B7A5E] bg-[#5B7A5E] text-white"
                                : "border-[#C8BDAF] bg-white"
                            }`}
                          >
                            {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-[#2D2A26]">
                              {item.title}
                            </span>
                            <span className="sr-only text-xs leading-relaxed text-[#6F655A] sm:not-sr-only sm:mt-1 sm:block">
                              {item.description}
                            </span>
                          </span>
                        </span>
                        <input
                          id={`readiness-item-${item.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {profile.texas === "no" && currentStep >= PROFILE_QUESTIONS.length && (
              <p className="mt-5 rounded-xl border border-[#D8CDBF] bg-[#FFF9EE] px-4 py-3 text-sm leading-relaxed text-[#5B4F3E]">
                This checklist is generally useful, but WillBuddy&apos;s documents
                and legal sources are Texas-specific. Use official resources in
                your state before acting on it.
              </p>
            )}

            <QuizNavigation
              canContinue={true}
              isFirst={currentStep === 0}
              onBack={() => setCurrentStep((step) => Math.max(0, step - 1))}
              onContinue={continueQuiz}
              continueLabel={
                currentStep === totalSteps - 1
                  ? "Calculate my score"
                  : "Continue"
              }
            />
          </div>
        )}

        {showResult && (
          <section
            aria-live="polite"
            aria-labelledby="readiness-result-heading"
            className="rounded-3xl bg-[#2D2A26] p-6 text-white md:p-8"
          >
            <div className="grid gap-7 md:grid-cols-[160px_1fr] md:items-center">
              <div
                className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-[#9CAF9E] bg-white text-[#2D2A26] md:mx-0"
                aria-label={`${result.score} percent ready`}
              >
                <span className="font-[family-name:var(--font-heading)] text-4xl font-bold">
                  {result.score}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6F655A]">
                  percent
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#BFD0C0]">
                  {bandCopy.eyebrow}
                </p>
                <h2
                  id="readiness-result-heading"
                  className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold"
                >
                  {bandCopy.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {bandCopy.body}
                </p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {result.completedCount} of {result.totalCount} applicable
                  actions marked complete
                </p>
              </div>
            </div>

            {result.nextSteps.length > 0 && (
              <div className="mt-7 border-t border-white/15 pt-6">
                <h3 className="font-semibold">Your next three actions</h3>
                <ol className="mt-4 grid gap-3 md:grid-cols-3">
                  {result.nextSteps.map((item, index) => (
                    <li key={item.id} className="rounded-xl bg-white/8 p-4 text-sm">
                      <span className="font-semibold text-[#BFD0C0]">{index + 1}.</span>{" "}
                      {item.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
              <Link
                href="/onboarding"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#2D2A26] hover:bg-[#F0EBE4]"
              >
                Turn decisions into a plan
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Start over
              </button>
            </div>
          </section>
        )}

        <p className="mt-6 border-t border-[#E8E0D6] pt-5 text-xs leading-relaxed text-[#6F655A]">
          Privacy note: your checklist answers stay in this browser session. Our
          analytics receive only the score band and item counts—not your
          individual selections. Educational only; this is not legal advice or
          a review of any document&apos;s validity.
        </p>
      </div>
    </div>
  );
}
