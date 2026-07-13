"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import { QuizNavigation, QuizProgress } from "@/components/tools/QuizProgress";

const questions = [
  {
    id: "will_status",
    legend: "Do you currently have a signed will?",
    options: [
      ["current", "Yes, signed and still current"],
      ["outdated", "Yes, but it may need an update"],
      ["none", "No"],
      ["unsure", "Not sure"],
    ],
  },
  {
    id: "financial_agent_status",
    legend: "Have you named someone to handle finances if you cannot?",
    options: [
      ["current", "Yes, in a current signed document"],
      ["outdated", "Yes, but it may need an update"],
      ["none", "No"],
      ["unsure", "Not sure"],
    ],
  },
  {
    id: "healthcare_status",
    legend: "Have you documented a healthcare decision-maker or care wishes?",
    options: [
      ["current", "Yes, current documents"],
      ["partial", "Some, but not all"],
      ["none", "No"],
      ["unsure", "Not sure"],
    ],
  },
  {
    id: "guardian_status",
    legend: "If you care for minor children, have you named primary and backup guardians?",
    options: [
      ["current", "Yes, both"],
      ["partial", "Only one choice or an informal choice"],
      ["none", "No"],
      ["not_applicable", "Not applicable"],
    ],
  },
  {
    id: "conversation_status",
    legend: "Do the people you chose know where to find your plan?",
    options: [
      ["complete", "Yes"],
      ["partial", "Some do"],
      ["none", "No"],
      ["unsure", "Not sure"],
    ],
  },
] as const;

type Answers = Record<string, string>;

export function TexasReadinessSurvey() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const currentQuestion = questions[currentStep];

  function submit() {
    if (questions.some((question) => !answers[question.id])) return;

    captureAnalyticsEvent("texas_readiness_survey_completed", {
      survey_version: "2026-07-13",
      will_status: answers.will_status,
      financial_agent_status: answers.financial_agent_status,
      healthcare_status: answers.healthcare_status,
      guardian_status: answers.guardian_status,
      conversation_status: answers.conversation_status,
    });
    setSubmitted(true);
  }

  function continueSurvey() {
    if (!answers[currentQuestion.id]) return;
    if (currentStep === questions.length - 1) {
      submit();
      return;
    }
    setCurrentStep((step) => step + 1);
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-3xl border border-[#BFD0C0] bg-[#F3F7F3] p-7">
        <CheckCircle2 className="h-7 w-7 text-[#5B7A5E]" aria-hidden="true" />
        <h3 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
          Your response was counted.
        </h3>
        <p className="mt-2 leading-relaxed text-[#5B4F3E]">
          Thank you. We do not ask for names, contact details, asset values, or document contents in this survey.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#D8CDBF] bg-white p-5 shadow-sm sm:p-7">
      <div className="border-b border-[#E8E0D6] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
          Help improve the report
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          Share five account-unlinked answers
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5B4F3E]">
          This takes under a minute. Your answers contribute to the aggregate
          Texas research—they do not generate a personal score.
        </p>
      </div>

      <div className="mt-6">
        <QuizProgress current={currentStep + 1} total={questions.length} />
        <fieldset className="mt-7 min-h-[290px]">
          <legend className="font-[family-name:var(--font-heading)] text-xl font-bold leading-snug text-[#2D2A26] sm:text-2xl">
            {currentQuestion.legend}
          </legend>
          <div className="mt-5 grid gap-2.5">
            {currentQuestion.options.map(([value, label]) => {
              const selected = answers[currentQuestion.id] === value;
              return (
                <label
                  key={value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#5B7A5E] focus-within:ring-offset-2 ${
                    selected
                      ? "border-[#5B7A5E] bg-[#F3F7F3] font-semibold text-[#2D2A26]"
                      : "border-[#E8E0D6] text-[#5B4F3E] hover:bg-[#F7F4F0]"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={value}
                    checked={selected}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]: value,
                      }))
                    }
                    className="h-4 w-4 shrink-0 accent-[#5B7A5E]"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <QuizNavigation
          canContinue={Boolean(answers[currentQuestion.id])}
          isFirst={currentStep === 0}
          onBack={() => setCurrentStep((step) => Math.max(0, step - 1))}
          onContinue={continueSurvey}
          continueLabel={
            currentStep === questions.length - 1
              ? "Count my answers"
              : "Continue"
          }
        />
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-[#7F7467]">
        We do not attach your WillBuddy account ID, name, or email to these
        answers. No precise location, asset value, or document content is
        requested.
      </p>
    </div>
  );
}
