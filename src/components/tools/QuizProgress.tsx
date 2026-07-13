import { ArrowLeft, ArrowRight } from "lucide-react";

type QuizProgressProps = {
  current: number;
  total: number;
  label?: string;
};

export function QuizProgress({
  current,
  total,
  label = "Question",
}: QuizProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div>
      <div
        className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B7A5E]"
        aria-live="polite"
      >
        <span>
          {label} {current} of {total}
        </span>
        <span aria-hidden="true">{percent}%</span>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8E0D6]"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-full bg-[#5B7A5E] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type QuizNavigationProps = {
  canContinue: boolean;
  isFirst: boolean;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
};

export function QuizNavigation({
  canContinue,
  isFirst,
  onBack,
  onContinue,
  continueLabel = "Continue",
}: QuizNavigationProps) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#E8E0D6] pt-5">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#5B4F3E] hover:bg-[#F0EBE4] disabled:pointer-events-none disabled:opacity-0"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#2D2A26] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#433F39] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
      >
        {continueLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
