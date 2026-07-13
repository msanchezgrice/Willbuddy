"use client";

import { useEffect, useRef } from "react";

export function useQuizStepFocus(step: number, enabled = true) {
  const questionRef = useRef<HTMLLegendElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const frame = window.requestAnimationFrame(() => {
      const question = questionRef.current;
      if (!question) return;

      question.focus({ preventScroll: true });

      if (step === 0 || !window.matchMedia("(max-width: 639px)").matches) {
        return;
      }

      const quizShell = question.closest<HTMLElement>("[data-quiz-shell]");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      quizShell?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enabled, step]);

  return questionRef;
}
