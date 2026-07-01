'use client';

import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS, type Section } from '@/types';

/**
 * "Welcome back" recap shown at the top of a resumed session before the user
 * reconnects. Surfaces saved answers and progress so returning feels
 * continuous. Hidden once connected or when there's nothing to resume.
 */
export default function ResumeRecap() {
  const { decisions, sectionsCompleted, sectionPlan, isConnected } = useVoice();

  if (isConnected || decisions.length === 0) return null;

  const done = sectionsCompleted.filter((s) => sectionPlan.includes(s));
  const recent = decisions.slice(-3);

  return (
    <div className="mb-6 rounded-2xl border border-[#E8E0D6] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7A5E]">
        Welcome back
      </p>
      <p className="mt-1 text-sm text-[#5B4F3E]">
        You&apos;ve saved{' '}
        <span className="font-semibold text-[#2D2A26]">
          {decisions.length} answer{decisions.length === 1 ? '' : 's'}
        </span>{' '}
        across {done.length} of {sectionPlan.length} sections. Press the mic to
        pick up right where you left off.
      </p>

      {done.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {done.map((s) => (
            <span
              key={s}
              className="rounded-full bg-[#5B7A5E]/10 px-2.5 py-1 text-xs font-medium text-[#5B7A5E]"
            >
              {SECTION_LABELS[s as Section]}
            </span>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <dl className="mt-4 space-y-1.5 border-t border-[#F0EBE4] pt-3">
          {recent.map((d) => (
            <div key={d.id} className="flex items-baseline justify-between gap-3">
              <dt className="text-xs capitalize text-[#9B8E7E]">
                {d.key.replace(/_/g, ' ')}
              </dt>
              <dd className="truncate text-sm font-medium text-[#2D2A26]">
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
