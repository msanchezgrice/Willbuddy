"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

type Answer = boolean | null;

const questions = [
  {
    id: "financial",
    prompt:
      "Do you want someone you choose to handle financial or property matters if you cannot?",
    document: "Statutory durable power of attorney",
    explanation:
      "Names an agent for the financial powers you grant. It does not authorize healthcare decisions.",
  },
  {
    id: "medical",
    prompt:
      "Do you want to name someone to make healthcare decisions if you lose decision-making capacity?",
    document: "Medical power of attorney",
    explanation:
      "Names a healthcare agent whose authority begins under the conditions Texas law describes.",
  },
  {
    id: "treatment",
    prompt:
      "Do you want to record treatment wishes for a terminal or irreversible condition?",
    document: "Directive to physicians",
    explanation:
      "Records treatment preferences for the circumstances covered by the Texas directive form.",
  },
  {
    id: "records",
    prompt:
      "Should chosen people be able to request or discuss protected health information?",
    document: "HIPAA authorization",
    explanation:
      "Can authorize disclosure of health information; it does not itself grant medical decision-making power.",
  },
  {
    id: "guardian",
    prompt:
      "Do you want to state whom a court should consider—or avoid—if an adult guardianship is ever requested?",
    document: "Declaration of guardian",
    explanation:
      "Records a preference for a future guardian, subject to statutory qualifications and court review.",
  },
] as const;

type QuestionId = (typeof questions)[number]["id"];

const initialAnswers = Object.fromEntries(
  questions.map((question) => [question.id, null])
) as Record<QuestionId, Answer>;

export function TexasPowerOfAttorneyNavigator() {
  const [answers, setAnswers] = useState(initialAnswers);
  const [showResult, setShowResult] = useState(false);

  const completed = Object.values(answers).every(
    (answer): answer is boolean => answer !== null
  );
  const recommendations = useMemo(
    () => questions.filter((question) => answers[question.id] === true),
    [answers]
  );

  function choose(id: QuestionId, answer: boolean) {
    setAnswers((current) => ({ ...current, [id]: answer }));
    setShowResult(false);
  }

  function reset() {
    setAnswers(initialAnswers);
    setShowResult(false);
  }

  return (
    <div className="rounded-3xl border border-[#D8CDBF] bg-white p-5 shadow-sm sm:p-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!completed) return;
          setShowResult(true);
          captureAnalyticsEvent("texas_directive_navigator_completed", {
            recommended_count: recommendations.length,
            tool_version: "2026-07-13",
          });
        }}
      >
        <fieldset>
          <legend className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            Five jobs, five different documents
          </legend>
          <p className="mt-2 text-sm leading-relaxed text-[#6B5E50]">
            Answer at a high level. Do not enter names, diagnoses, account
            details, or other private information.
          </p>

          <div className="mt-7 space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-[#E8E0D6] bg-[#FAF8F5] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5B7A5E]">
                  Question {index + 1} of {questions.length}
                </p>
                <p className="mt-2 font-semibold leading-relaxed text-[#2D2A26]">
                  {question.prompt}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[true, false].map((value) => {
                    const selected = answers[question.id] === value;
                    return (
                      <label
                        key={String(value)}
                        className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
                          selected
                            ? "border-[#5B7A5E] bg-[#EAF0E8] text-[#365239]"
                            : "border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#8CA18D]"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name={question.id}
                          value={value ? "yes" : "no"}
                          checked={selected}
                          onChange={() => choose(question.id, value)}
                        />
                        {value ? "Yes" : "Not right now"}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={!completed}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#5B7A5E] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#4A6A4D] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Build my document map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D8CDBF] px-6 py-3 font-semibold text-[#5B4F3E] hover:bg-[#F0EBE4]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {showResult && (
          <section className="mt-8 border-t border-[#E8E0D6] pt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
              Your document map
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              {recommendations.length > 0
                ? `Review ${recommendations.length} document${recommendations.length === 1 ? "" : "s"}`
                : "No document was triggered by these answers"}
            </h2>

            {recommendations.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {recommendations.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-2xl bg-[#F0EBE4]/70 p-5"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#5B7A5E]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-semibold text-[#2D2A26]">
                        {item.document}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#5B4F3E]">
                        {item.explanation}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-[#5B4F3E]">
                That is a useful result, not a legal conclusion. Revisit the
                map after a move, marriage, diagnosis, new dependent, or other
                major change, and ask a Texas lawyer whether another document
                fits your circumstances.
              </p>
            )}

            <div className="mt-7 rounded-2xl bg-[#365239] p-6 text-white">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
                Organize the next conversation
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
                Your result is already above—no email required. If you want to
                continue, WillBuddy can help organize your choices and draft
                Texas planning documents for attorney review.
              </p>
              <Link
                href="/onboarding"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-2.5 font-semibold text-[#2D2A26]"
                onClick={() =>
                  captureAnalyticsEvent("tool_cta_clicked", {
                    tool: "texas_directive_navigator",
                  })
                }
              >
                Start organizing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
