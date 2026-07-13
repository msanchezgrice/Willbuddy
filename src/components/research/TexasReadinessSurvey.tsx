"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  if (submitted) {
    return (
      <div role="status" className="rounded-2xl border border-[#BFD0C0] bg-[#F3F7F3] p-7">
        <CheckCircle2 className="h-7 w-7 text-[#5B7A5E]" aria-hidden="true" />
        <h3 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
          Your anonymous response was counted.
        </h3>
        <p className="mt-2 leading-relaxed text-[#5B4F3E]">
          Thank you. We do not ask for names, contact details, asset values, or document contents in this survey.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {questions.map((question, questionIndex) => (
        <fieldset key={question.id} className="rounded-2xl border border-[#E8E0D6] bg-white p-5">
          <legend className="px-1 font-semibold text-[#2D2A26]">
            {questionIndex + 1}. {question.legend}
          </legend>
          <div className="mt-4 grid gap-2">
            {question.options.map(([value, label]) => (
              <label key={value} className="flex cursor-pointer gap-3 rounded-xl border border-[#E8E0D6] px-4 py-3 text-sm text-[#5B4F3E] hover:bg-[#F7F4F0]">
                <input
                  required
                  type="radio"
                  name={question.id}
                  value={value}
                  checked={answers[question.id] === value}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))}
                  className="mt-0.5 accent-[#5B7A5E]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="submit" className="w-full rounded-full bg-[#5B7A5E] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[#4A6A4D]">
        Contribute an anonymous response
      </button>
      <p className="text-center text-xs leading-relaxed text-[#7F7467]">
        Five multiple-choice answers only. No name, email, precise location, asset value, or document content is requested.
      </p>
    </form>
  );
}
