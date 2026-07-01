'use client';

import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS, type Decision, type Section } from '@/types';
import { SECTION_CONFIG } from '@/lib/gemini/sections';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Small check icon
// ---------------------------------------------------------------------------
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PauseScreen — full-height overlay shown whenever the session is paused.
//
// Two variants:
//  • 'section' — the AI finished a section (updateProgress) and we're between
//    sections; shows what we captured + a preview of what's next.
//  • 'user'    — the person tapped "Pause session"; shows a "Where you left
//    off" recap so returning/unpausing feels continuous.
//
// Both resume via resumeFromPause(), which reconnects and rehydrates the
// Gemini session (resume handle + prior decisions/transcript) so audio picks
// up in context rather than restarting.
// ---------------------------------------------------------------------------
export default function PauseScreen() {
  const {
    isPaused,
    pauseReason,
    completedSection,
    pendingNextSection,
    decisions,
    currentSection,
    sectionPlan,
    sectionsCompleted,
    resumeFromPause,
    saveAndExit,
  } = useVoice();

  if (!isPaused) return null;

  // ---- User-initiated pause: "Where you left off" ----
  if (pauseReason !== 'section' || !completedSection || !pendingNextSection) {
    return (
      <WhereYouLeftOff
        currentSection={currentSection}
        sectionPlan={sectionPlan}
        sectionsCompleted={sectionsCompleted}
        decisions={decisions}
        onResume={() => void resumeFromPause()}
        onExit={saveAndExit}
      />
    );
  }

  const nextConfig = SECTION_CONFIG[pendingNextSection];
  const sectionDecisions = decisions.filter((d) => d.section === completedSection);

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#FAF8F5] px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E8E0D6] bg-white p-6 shadow-sm md:p-10">
        {/* Check + heading */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#5B7A5E] text-white">
            <CheckIcon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9B8E7E]">
              Section complete
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              {SECTION_LABELS[completedSection as Section]}
            </h2>
          </div>
        </div>

        {/* Decisions captured */}
        {sectionDecisions.length > 0 ? (
          <div className="mb-6 rounded-xl bg-[#F0EBE4] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
              What we captured
            </p>
            <ul className="space-y-1.5 text-sm text-[#2D2A26]">
              {sectionDecisions.map((d) => (
                <li key={d.id} className="flex gap-2">
                  <span className="text-[#9B8E7E]">•</span>
                  <span>
                    <span className="font-medium">{formatKey(d.key)}:</span>{' '}
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-6 text-sm text-[#9B8E7E]">
            Nice work. Take a breath before we keep going.
          </p>
        )}

        {/* Next section preview */}
        <div className="mb-8 border-l-2 border-[#5B7A5E] pl-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9B8E7E]">
            Next up
          </p>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
            {nextConfig.label}
          </h3>
          <p className="mt-1 text-sm text-[#5A5550]">{nextConfig.description}</p>
          <p className="mt-2 text-xs text-[#9B8E7E]">
            Takes about {nextConfig.estimatedMinutes} minutes.
            {nextConfig.emotionalGuidance
              ? ' This one can be emotional — there’s no wrong answer.'
              : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void resumeFromPause()}
            className={cn(
              'flex-1 rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white',
              'shadow-sm transition-colors hover:bg-[#4a6a4e]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7A5E]/40',
            )}
          >
            Continue now
          </button>
          <button
            type="button"
            onClick={saveAndExit}
            className={cn(
              'flex-1 rounded-xl border border-[#E8E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#2D2A26]',
              'transition-colors hover:bg-[#F0EBE4]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7A5E]/20',
            )}
          >
            Save and resume later
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WhereYouLeftOff — the user-pause variant. Recaps progress + saved answers
// and offers a single tap to resume the conversation in place.
// ---------------------------------------------------------------------------
function WhereYouLeftOff({
  currentSection,
  sectionPlan,
  sectionsCompleted,
  decisions,
  onResume,
  onExit,
}: {
  currentSection: Section;
  sectionPlan: Section[];
  sectionsCompleted: Section[];
  decisions: Decision[];
  onResume: () => void;
  onExit: () => void;
}) {
  const done = sectionsCompleted.filter((s) => sectionPlan.includes(s));
  const recent = decisions.slice(-4);

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#FAF8F5] px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E8E0D6] bg-white p-6 shadow-sm md:p-10">
        {/* Heading */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#5B7A5E] text-white">
            <PauseGlyph className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9B8E7E]">
              Session paused
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              Where you left off
            </h2>
          </div>
        </div>

        {/* Progress line */}
        <p className="mb-6 text-sm text-[#5A5550]">
          You&apos;re on{' '}
          <span className="font-semibold text-[#2D2A26]">
            {SECTION_LABELS[currentSection]}
          </span>{' '}
          — {done.length} of {sectionPlan.length} section
          {sectionPlan.length === 1 ? '' : 's'} done,{' '}
          {decisions.length} answer{decisions.length === 1 ? '' : 's'} saved.
        </p>

        {/* Recent answers */}
        {recent.length > 0 && (
          <div className="mb-8 rounded-xl bg-[#F0EBE4] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
              Recent answers
            </p>
            <ul className="space-y-1.5 text-sm text-[#2D2A26]">
              {recent.map((d) => (
                <li key={d.id} className="flex gap-2">
                  <span className="text-[#9B8E7E]">•</span>
                  <span>
                    <span className="font-medium">{formatKey(d.key)}:</span>{' '}
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onResume}
            className={cn(
              'flex-1 rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white',
              'shadow-sm transition-colors hover:bg-[#4a6a4e]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7A5E]/40',
            )}
          >
            Resume conversation
          </button>
          <button
            type="button"
            onClick={onExit}
            className={cn(
              'flex-1 rounded-xl border border-[#E8E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#2D2A26]',
              'transition-colors hover:bg-[#F0EBE4]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7A5E]/20',
            )}
          >
            Save &amp; exit
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pause glyph
// ---------------------------------------------------------------------------
function PauseGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Humanize a decision key ("primary_guardian" -> "Primary guardian")
// ---------------------------------------------------------------------------
function formatKey(key: string): string {
  const spaced = key.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
