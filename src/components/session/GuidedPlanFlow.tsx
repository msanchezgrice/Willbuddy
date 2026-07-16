'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useVoice } from '@/components/voice/VoiceProvider';
import { QuizNavigation, QuizProgress } from '@/components/tools/QuizProgress';
import {
  questionsForPlan,
  sectionLabel,
  type GuidedQuestion,
} from '@/lib/guided-plan/questions';
import {
  MAX_SECTION_ESTIMATED_MINUTES,
  TOTAL_PLAN_ESTIMATED_MINUTES,
} from '@/lib/gemini/sections';
import type { Decision, Section } from '@/types';

function firstUnansweredQuestionIndex(
  questions: GuidedQuestion[],
  decisions: Decision[],
): number {
  const answered = new Set(
    decisions.map((decision) => `${decision.section}:${decision.key}`),
  );
  const firstUnanswered = questions.findIndex(
    (question) => !answered.has(`${question.section}:${question.key}`),
  );
  return firstUnanswered >= 0 ? firstUnanswered : Math.max(questions.length - 1, 0);
}

function firstQuestionIndexForSection(
  questions: GuidedQuestion[],
  decisions: Decision[],
  section: Section,
): number {
  const answered = new Set(
    decisions.map((decision) => `${decision.section}:${decision.key}`),
  );
  const firstUnanswered = questions.findIndex(
    (question) =>
      question.section === section &&
      !answered.has(`${question.section}:${question.key}`),
  );
  if (firstUnanswered >= 0) return firstUnanswered;
  return questions.findIndex((question) => question.section === section);
}

function AnswerField({
  question,
  value,
  onChange,
}: {
  question: GuidedQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  const fieldId = `guided-${question.section}-${question.key}`;

  if (question.input === 'radio') {
    return (
      <fieldset className="mt-6">
        <legend className="sr-only">{question.prompt}</legend>
        <div className="grid gap-3">
          {question.options?.map((option) => {
            const checked = value === option.value;
            return (
              <label
                key={option.value}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  checked
                    ? 'border-[#5B7A5E] bg-[#F4F7F3] text-[#2D2A26]'
                    : 'border-[#D8CDBF] bg-white text-[#5B4F3E] hover:border-[#5B7A5E]/60'
                }`}
              >
                <input
                  type="radio"
                  name={`${question.section}-${question.key}`}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange(option.value)}
                  className="h-5 w-5 accent-[#5B7A5E]"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const sharedClass =
    'mt-6 w-full rounded-2xl border border-[#D8CDBF] bg-white px-4 py-3.5 text-base text-[#2D2A26] outline-none transition focus:border-[#5B7A5E] focus:ring-2 focus:ring-[#5B7A5E]/15';

  if (question.input === 'textarea') {
    return (
      <>
        <label htmlFor={fieldId} className="sr-only">
          {question.prompt}
        </label>
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder}
          rows={5}
          className={`${sharedClass} resize-y`}
        />
      </>
    );
  }

  return (
    <>
      <label htmlFor={fieldId} className="sr-only">
        {question.prompt}
      </label>
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        className={sharedClass}
      />
    </>
  );
}

export default function GuidedPlanFlow() {
  const {
    currentSection,
    sectionPlan,
    decisions,
    saveGuidedDecision,
    completeGuidedSession,
    saveAndExit,
    selectInputMethod,
    jumpToSection,
    operationError,
    isSessionReady,
  } = useVoice();
  const questions = useMemo(() => questionsForPlan(sectionPlan), [sectionPlan]);
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const didApplyResumePositionRef = useRef(false);
  const question = questions[step];
  const saved = question
    ? decisions.find(
        (decision) =>
          decision.section === question.section && decision.key === question.key,
      )
    : undefined;
  const currentSectionIndex = question
    ? sectionPlan.indexOf(question.section)
    : -1;
  const nextSection =
    currentSectionIndex >= 0 ? sectionPlan[currentSectionIndex + 1] : undefined;

  useEffect(() => {
    if (!isSessionReady || didApplyResumePositionRef.current) return;
    setStep(firstUnansweredQuestionIndex(questions, decisions));
    didApplyResumePositionRef.current = true;
  }, [decisions, isSessionReady, questions]);

  useEffect(() => {
    setValue(saved?.value ?? '');
    setReasoning(saved?.reasoning ?? '');
    headingRef.current?.focus();
  }, [question?.key, question?.section, saved?.reasoning, saved?.value]);

  useEffect(() => {
    if (
      !isSessionReady ||
      !question ||
      currentSection === question.section
    ) {
      return;
    }
    void jumpToSection(question.section).catch(() => {
      // VoiceProvider exposes the persistence failure through operationError.
    });
  }, [currentSection, isSessionReady, jumpToSection, question]);

  if (!question) return null;

  async function saveCurrentDraft() {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    if (
      trimmedValue === saved?.value &&
      reasoning === (saved?.reasoning ?? '')
    ) {
      return;
    }
    await saveGuidedDecision({
      section: question.section,
      key: question.key,
      value: trimmedValue,
      reasoning,
    });
  }

  async function moveToQuestion(targetStep: number, message?: string) {
    if (saving || targetStep < 0 || targetStep >= questions.length) return;
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await saveCurrentDraft();
      const targetQuestion = questions[targetStep];
      if (targetQuestion.section !== question.section) {
        await jumpToSection(targetQuestion.section);
      }
      setStep(targetStep);
      setStatusMessage(message ?? null);
    } catch (error) {
      console.error('Could not move within guided plan:', error);
      setErrorMessage(
        'We could not save your answer or move sections. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  function moveToSection(section: Section) {
    const targetStep = firstQuestionIndexForSection(
      questions,
      decisions,
      section,
    );
    void moveToQuestion(targetStep);
  }

  function skipSectionForNow() {
    if (!nextSection) return;
    const targetStep = firstQuestionIndexForSection(
      questions,
      decisions,
      nextSection,
    );
    void moveToQuestion(
      targetStep,
      `${sectionLabel(question.section)} is still available above whenever you want to return.`,
    );
  }

  async function continueFlow() {
    if (!value.trim() || saving) return;
    setSaving(true);
    setErrorMessage(null);
    let answerSaved = false;
    try {
      await saveGuidedDecision({
        section: question.section,
        key: question.key,
        value: value.trim(),
        reasoning,
      });
      answerSaved = true;
      if (step === questions.length - 1) {
        const answered = new Set(
          decisions.map(
            (decision) => `${decision.section}:${decision.key}`,
          ),
        );
        answered.add(`${question.section}:${question.key}`);
        const skippedStep = questions.findIndex(
          (candidate) =>
            !answered.has(`${candidate.section}:${candidate.key}`),
        );
        if (skippedStep >= 0) {
          const skippedQuestion = questions[skippedStep];
          await jumpToSection(skippedQuestion.section);
          setStep(skippedStep);
          setStatusMessage(
            'You reached the end. Here is the first question you skipped for now.',
          );
          return;
        }
        await completeGuidedSession();
        return;
      }
      const nextQuestion = questions[step + 1];
      if (nextQuestion.section !== question.section) {
        await jumpToSection(nextQuestion.section);
      }
      setStep((current) => current + 1);
    } catch (error) {
      console.error('Could not continue guided plan:', error);
      setErrorMessage(
        answerSaved
          ? 'Your answer was saved, but we could not finish the plan. Please try again.'
          : 'We could not save that answer. Check your connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftAndExit() {
    if (saving) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      if (value.trim()) {
        await saveGuidedDecision({
          section: question.section,
          key: question.key,
          value: value.trim(),
          reasoning,
        });
      }
      await saveAndExit();
    } catch (error) {
      console.error('Could not save and exit guided plan:', error);
      setErrorMessage(
        'We could not save your current answer, so you have not been redirected. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function switchToVoice() {
    if (saving) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      if (value.trim()) {
        await saveGuidedDecision({
          section: question.section,
          key: question.key,
          value: value.trim(),
          reasoning,
        });
      }
      await selectInputMethod('voice');
    } catch (error) {
      console.error('Could not switch to voice:', error);
      setErrorMessage(
        'We could not save this answer or switch methods. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAF8F5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void switchToVoice()}
            disabled={saving}
            className="min-h-11 rounded-full px-3 text-sm font-semibold text-[#5B7A5E] hover:bg-[#F0EBE4]"
          >
            Switch to voice
          </button>
          <button
            type="button"
            onClick={() => void saveDraftAndExit()}
            disabled={saving}
            className="min-h-11 rounded-full px-3 text-sm font-semibold text-[#5B4F3E] hover:bg-[#F0EBE4]"
          >
            Save &amp; exit
          </button>
        </header>

        <section className="rounded-[1.75rem] border border-[#D8CDBF] bg-[#FDFCFA] p-5 shadow-sm sm:p-8">
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[#6B5D4D]">
              <span>About {TOTAL_PLAN_ESTIMATED_MINUTES} minutes total</span>
              <span>≤{MAX_SECTION_ESTIMATED_MINUTES} min per section</span>
            </div>
            <nav
              aria-label="Plan sections"
              className="mt-3 flex gap-2 overflow-x-auto pb-2"
            >
              {sectionPlan.map((section) => {
                const active = section === question.section;
                const hasAnswer = decisions.some(
                  (decision) => decision.section === section,
                );
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => moveToSection(section)}
                    disabled={saving || active}
                    aria-current={active ? 'step' : undefined}
                    className={`min-h-10 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
                      active
                        ? 'border-[#5B7A5E] bg-[#5B7A5E] text-white'
                        : hasAnswer
                          ? 'border-[#A9BCA9] bg-[#F4F7F3] text-[#446348] hover:border-[#5B7A5E]'
                          : 'border-[#D8CDBF] bg-white text-[#6B5D4D] hover:border-[#5B7A5E]'
                    } disabled:cursor-default`}
                  >
                    {sectionLabel(section)}
                  </button>
                );
              })}
            </nav>
          </div>

          <QuizProgress current={step + 1} total={questions.length} label="Plan question" />

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
            {sectionLabel(question.section)}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-[#2D2A26] outline-none sm:text-3xl"
          >
            {question.prompt}
          </h1>
          {question.help && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6B5D4D]">
              {question.help}
            </p>
          )}

          <AnswerField question={question} value={value} onChange={setValue} />

          {(errorMessage || operationError) && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {errorMessage || operationError}
            </p>
          )}

          {statusMessage && (
            <p
              aria-live="polite"
              className="mt-5 rounded-2xl border border-[#C9D7C8] bg-[#F4F7F3] px-4 py-3 text-sm text-[#446348]"
            >
              {statusMessage}
            </p>
          )}

          {question.askReasoning && (
            <div className="mt-5">
              <label
                htmlFor="guided-reasoning"
                className="text-sm font-semibold text-[#5B4F3E]"
              >
                Why does this feel right? <span className="font-normal text-[#9B8E7E]">(optional)</span>
              </label>
              <textarea
                id="guided-reasoning"
                value={reasoning}
                onChange={(event) => setReasoning(event.target.value)}
                rows={3}
                placeholder="A short reason will help when you review or compare answers later."
                className="mt-2 w-full resize-y rounded-2xl border border-[#D8CDBF] bg-white px-4 py-3 text-sm text-[#2D2A26] outline-none focus:border-[#5B7A5E] focus:ring-2 focus:ring-[#5B7A5E]/15"
              />
            </div>
          )}

          {nextSection && (
            <button
              type="button"
              onClick={skipSectionForNow}
              disabled={saving}
              className="mt-5 min-h-11 rounded-full px-3 text-sm font-semibold text-[#6B5D4D] underline decoration-[#B9AA98] underline-offset-4 hover:text-[#2D2A26] disabled:opacity-50"
            >
              Skip this section for now
            </button>
          )}

          <QuizNavigation
            canContinue={Boolean(value.trim()) && !saving}
            isFirst={step === 0}
            onBack={() => void moveToQuestion(Math.max(0, step - 1))}
            onContinue={() => void continueFlow()}
            continueLabel={
              saving
                ? 'Saving…'
                : step === questions.length - 1
                  ? 'Review my plan'
                  : 'Save & continue'
            }
          />
        </section>

        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-[#9B8E7E]">
          Answers save to the same private plan as the voice conversation. Do not
          enter passwords, account numbers, private keys, or other secrets.
        </p>
      </div>
    </main>
  );
}
