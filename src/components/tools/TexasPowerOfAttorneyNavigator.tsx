"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import { useToolAnalytics } from "@/lib/analytics/use-tool-analytics";
import { QuizNavigation, QuizProgress } from "@/components/tools/QuizProgress";

type Response = boolean | null;

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

const initialResponses = Object.fromEntries(
  questions.map((question) => [question.id, null])
) as Record<QuestionId, Response>;

export function TexasPowerOfAttorneyNavigator() {
  const { recordStart, recordComplete } = useToolAnalytics(
    "texas_power_of_attorney_navigator"
  );
  const [responses, setResponses] = useState(initialResponses);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const currentQuestion = questions[currentStep];

  const completed = Object.values(responses).every(
    (response): response is boolean => response !== null
  );
  const recommendations = useMemo(
    () => questions.filter((question) => responses[question.id] === true),
    [responses]
  );

  function choose(id: QuestionId, response: boolean) {
    recordStart();
    setResponses((current) => ({ ...current, [id]: response }));
    setShowResult(false);
  }

  function reset() {
    setResponses(initialResponses);
    setShowResult(false);
    setCurrentStep(0);
  }

  function finishQuiz() {
    if (!completed) return;
    setShowResult(true);
    captureAnalyticsEvent("texas_directive_navigator_completed", {
      recommended_count: recommendations.length,
      tool_version: "2026-07-13",
    });
    recordComplete({ recommended_count: recommendations.length });
  }

  function continueQuiz() {
    if (responses[currentQuestion.id] === null) return;
    if (currentStep === questions.length - 1) {
      finishQuiz();
      return;
    }
    setCurrentStep((step) => step + 1);
  }

  return (
    <div className="rounded-3xl border border-[#D8CDBF] bg-white p-5 shadow-sm sm:p-7">
      {!showResult && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 border-b border-[#E8E0D6] pb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              Five jobs, five different documents
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B5E50]">
              Answer at a high level. Do not enter names, diagnoses, account
              details, or other private information.
            </p>
          </div>

          <QuizProgress current={currentStep + 1} total={questions.length} />
          <fieldset className="mt-7 min-h-[190px]">
            <legend className="font-[family-name:var(--font-heading)] text-xl font-bold leading-snug text-[#2D2A26] sm:text-2xl">
              {currentQuestion.prompt}
            </legend>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[true, false].map((value) => {
                const selected = responses[currentQuestion.id] === value;
                return (
                  <label
                    key={String(value)}
                    className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
                      selected
                        ? "border-[#5B7A5E] bg-[#EAF0E8] text-[#365239] shadow-sm"
                        : "border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#8CA18D]"
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name={currentQuestion.id}
                      value={value ? "yes" : "no"}
                      checked={selected}
                      onChange={() => choose(currentQuestion.id, value)}
                    />
                    {value ? "Yes" : "Not right now"}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <QuizNavigation
            canContinue={responses[currentQuestion.id] !== null}
            isFirst={currentStep === 0}
            onBack={() => setCurrentStep((step) => Math.max(0, step - 1))}
            onContinue={continueQuiz}
            continueLabel={
              currentStep === questions.length - 1
                ? "Build my document map"
                : "Continue"
            }
          />
        </div>
      )}

      <div aria-live="polite">
        {showResult && (
          <section>
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
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#5B4F3E] hover:bg-[#F0EBE4]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
