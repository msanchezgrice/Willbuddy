"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
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

  const applicable = useMemo(
    () => getApplicableReadinessItems(profile),
    [profile]
  );
  const result = useMemo(
    () => buildReadinessResult(profile, completed),
    [profile, completed]
  );
  const bandCopy = BAND_COPY[result.band];

  function updateProfile<K extends keyof ReadinessProfile>(
    key: K,
    value: ReadinessProfile[K]
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
    setShowResult(false);
  }

  function toggle(id: ReadinessItem["id"]) {
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
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[#D8CDBF] bg-white shadow-sm">
      <div className="border-b border-[#E8E0D6] bg-[#F0EBE4]/60 px-6 py-7 md:px-9">
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

      <div className="space-y-10 px-6 py-8 md:px-9">
        <div className="grid gap-6 md:grid-cols-2">
          {PROFILE_QUESTIONS.map((question) => (
            <fieldset key={question.id}>
              <legend className="text-sm font-semibold text-[#2D2A26]">
                {question.legend}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const selected = profile[question.id] === option.value;
                  const id = `readiness-${question.id}-${option.value}`;
                  return (
                    <label
                      key={option.value}
                      htmlFor={id}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
                        selected
                          ? "border-[#5B7A5E] bg-[#5B7A5E] text-white"
                          : "border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#9CAF9E]"
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={selected}
                        onChange={() =>
                          updateProfile(
                            question.id,
                            option.value as ReadinessProfile[typeof question.id]
                          )
                        }
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {profile.texas === "no" && (
          <p className="rounded-xl border border-[#D8CDBF] bg-[#FFF9EE] px-4 py-3 text-sm leading-relaxed text-[#5B4F3E]">
            This checklist is generally useful, but WillBuddy&apos;s documents
            and legal sources are Texas-specific. Use a lawyer or official
            resources in your state before acting on it.
          </p>
        )}

        <fieldset>
          <legend className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
            What do you already have in place?
          </legend>
          <p className="mt-2 text-sm text-[#6F655A]">
            Check an item only if it is current and the right people can find it.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {applicable.map((item) => {
              const checked = Boolean(completed[item.id]);
              return (
                <label
                  key={item.id}
                  htmlFor={`readiness-item-${item.id}`}
                  className={`cursor-pointer rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
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
                      <span className="mt-1 block text-xs leading-relaxed text-[#6F655A]">
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

        <button
          type="button"
          onClick={calculate}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2D2A26] px-7 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 sm:w-auto"
        >
          Calculate my readiness score
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </button>

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

        <p className="border-t border-[#E8E0D6] pt-5 text-xs leading-relaxed text-[#6F655A]">
          Privacy note: your checklist answers stay in this browser session. Our
          analytics receive only the score band and item counts—not your
          individual selections. Educational only; this is not legal advice or
          a review of any document&apos;s validity.
        </p>
      </div>
    </div>
  );
}
