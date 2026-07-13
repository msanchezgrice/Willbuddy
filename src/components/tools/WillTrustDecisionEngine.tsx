"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import {
  getWillTrustRecommendation,
  type WillTrustAnswers,
  type WillTrustRecommendation,
} from "@/lib/tools/will-trust-decision";

type BinaryQuestion = {
  id: keyof WillTrustAnswers;
  legend: string;
  options: { label: string; value: boolean | "low" | "high" }[];
};

const QUESTIONS: BinaryQuestion[] = [
  {
    id: "ownsRealEstate",
    legend: "Do you own a home or other real estate?",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  {
    id: "ownsPropertyOutsideTexas",
    legend: "Do you own real estate outside Texas?",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  {
    id: "hasComplexPlanningNeeds",
    legend:
      "Do you have a blended family, business interest, beneficiary with special needs, or detailed distribution goals?",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  {
    id: "probatePrivacyPriority",
    legend: "How important are probate avoidance and additional privacy?",
    options: [
      { label: "A high priority", value: "high" },
      { label: "Not a high priority", value: "low" },
    ],
  },
  {
    id: "preparedToFundTrust",
    legend:
      "Would you be prepared to retitle and maintain assets as part of funding a trust?",
    options: [
      { label: "Yes", value: true },
      { label: "Not right now", value: false },
    ],
  },
];

export function WillTrustDecisionEngine() {
  const [answers, setAnswers] = useState<Partial<WillTrustAnswers>>({});
  const [result, setResult] = useState<WillTrustRecommendation | null>(null);
  const isComplete = QUESTIONS.every((question) => question.id in answers);

  function setAnswer(
    id: keyof WillTrustAnswers,
    value: boolean | "low" | "high"
  ) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setResult(null);
  }

  function showResult() {
    if (!isComplete) return;
    const recommendation = getWillTrustRecommendation(
      answers as WillTrustAnswers
    );
    setResult(recommendation);
    captureAnalyticsEvent("will_trust_decision_completed", {
      result_id: recommendation.id,
    });
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  return (
    <section
      aria-labelledby="will-trust-tool-heading"
      className="my-10 overflow-hidden rounded-3xl border border-[#D8CDBF] bg-[#F0EBE4]/70 shadow-sm"
    >
      <div className="border-b border-[#D8CDBF] bg-[#5B7A5E] px-6 py-7 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
          Free Texas decision tool
        </p>
        <h2
          id="will-trust-tool-heading"
          className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl"
        >
          Should you start with a will or discuss a trust?
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">
          Answer five practical questions. You&apos;ll see your result here—no
          email or account required.
        </p>
      </div>

      <div className="space-y-7 px-6 py-7 md:px-8">
        {QUESTIONS.map((question, index) => (
          <fieldset key={question.id}>
            <legend className="font-semibold leading-snug text-[#2D2A26]">
              <span className="mr-2 text-[#5B7A5E]">{index + 1}.</span>
              {question.legend}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const optionId = `${question.id}-${String(option.value)}`;
                const checked = answers[question.id] === option.value;
                return (
                  <label
                    key={optionId}
                    htmlFor={optionId}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
                      checked
                        ? "border-[#5B7A5E] bg-white text-[#2D2A26]"
                        : "border-[#D8CDBF] bg-white/60 text-[#5B4F3E] hover:border-[#9CAF9E]"
                    }`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={question.id}
                      checked={checked}
                      onChange={() => setAnswer(question.id, option.value)}
                      className="mr-2 accent-[#5B7A5E]"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={showResult}
          disabled={!isComplete}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2D2A26] px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:w-auto"
        >
          See my result
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </button>

        {result && (
          <div
            aria-live="polite"
            className="rounded-2xl border border-[#9CAF9E] bg-white p-6 md:p-7"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 h-6 w-6 shrink-0 text-[#5B7A5E]"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
                  Your planning direction
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
                  {result.title}
                </h3>
                <p className="mt-3 leading-relaxed text-[#5B4F3E]">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-[#2D2A26]">Why this result</h4>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#5B4F3E]">
                  {result.reasons.map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span aria-hidden="true" className="text-[#5B7A5E]">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#2D2A26]">Your next steps</h4>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#5B4F3E]">
                  {result.nextSteps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-semibold text-[#5B7A5E]">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-[#E8E0D6] pt-6 sm:flex-row sm:items-center">
              <Link
                href="/onboarding"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#5B7A5E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4A6A4D]"
              >
                Build my will-first plan
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold text-[#5B4F3E] hover:text-[#2D2A26]"
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Start over
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-[#D8CDBF] pt-5 text-xs leading-relaxed text-[#6F655A]">
          <p>
            Educational only, not legal advice. This tool cannot determine
            whether a trust is appropriate for your facts. WillBuddy prepares
            Texas will and incapacity-document drafts; it does not create
            trusts.
          </p>
          <p className="mt-2">
            Primary law: {" "}
            <a
              href="https://tcss.legis.texas.gov/resources/ES/htm/ES.251.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#4A6A4D] underline underline-offset-2"
            >
              Texas Estates Code Chapter 251
            </a>{" "}
            (wills) and {" "}
            <a
              href="https://tcss.legis.texas.gov/resources/PR/htm/PR.112.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#4A6A4D] underline underline-offset-2"
            >
              Texas Property Code Chapter 112
            </a>{" "}
            (creation, validity, and funding of trusts).
          </p>
        </div>
      </div>
    </section>
  );
}
