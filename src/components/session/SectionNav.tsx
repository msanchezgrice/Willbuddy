'use client';

import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS, type Section } from '@/types';
import { cn } from '@/lib/utils';
import ProgressBar from '@/components/session/ProgressBar';
import {
  estimatedPlanMinutes,
  MAX_SECTION_ESTIMATED_MINUTES,
} from '@/lib/gemini/sections';

export default function SectionNav({ onNavigate }: { onNavigate?: () => void }) {
  const { currentSection, sectionPlan, sectionsCompleted, decisions, jumpToSection } =
    useVoice();

  // Completion is authoritative from the session (sections_completed), with a
  // decisions-based heuristic as a fallback for older/interrupted sessions.
  const completedSections = new Set<Section>(sectionsCompleted);
  for (const d of decisions) {
    const sectionDecisions = decisions.filter((x) => x.section === d.section);
    if (sectionDecisions.length >= 2) completedSections.add(d.section);
  }
  // Only count modules that are actually in this session's plan.
  const planSet = new Set(sectionPlan);
  for (const s of [...completedSections]) {
    if (!planSet.has(s)) completedSections.delete(s);
  }

  const completedCount = completedSections.size;
  const remainingMin = estimatedPlanMinutes(sectionPlan.length - completedCount);
  const currentIndex = sectionPlan.indexOf(currentSection);
  const nextSection =
    currentIndex >= 0 ? sectionPlan[currentIndex + 1] : undefined;

  async function navigateToSection(section: Section) {
    try {
      await jumpToSection(section);
      onNavigate?.();
    } catch {
      // VoiceProvider displays the persistence error and keeps this menu open.
    }
  }

  function getStatus(section: Section): 'done' | 'active' | 'pending' {
    if (completedSections.has(section)) return 'done';
    if (section === currentSection) return 'active';
    return 'pending';
  }

  return (
    <nav className="flex h-full flex-col justify-between py-6 px-4">
      {/* Section list */}
      <div className="flex flex-col gap-1">
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9B8E7E]">
            Sections
          </h2>
          <p className="mt-1 text-xs text-[#9B8E7E]">Jump to any section.</p>
        </div>

        {sectionPlan.map((section) => {
          const status = getStatus(section);

          return (
            <button
              key={section}
              type="button"
              onClick={() => void navigateToSection(section)}
              aria-current={status === 'active' ? 'step' : undefined}
              title={`Jump to ${SECTION_LABELS[section]}`}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7A5E]/40',
                status === 'active' && 'bg-[#5B7A5E]/10 font-semibold text-[#2D2A26]',
                status === 'done' && 'text-[#5B7A5E] hover:bg-[#5B7A5E]/5',
                status === 'pending' && 'text-[#9B8E7E] hover:bg-[#5B7A5E]/5 hover:text-[#5B4F3E]',
              )}
            >
              {/* Dot indicator */}
              <span className="relative flex items-center justify-center">
                <span
                  className={cn(
                    'inline-block size-2.5 rounded-full transition-colors',
                    status === 'done' && 'bg-[#5B7A5E]',
                    status === 'active' && 'bg-[#5B7A5E]',
                    status === 'pending' && 'bg-[#E8E0D6]',
                  )}
                />
                {/* Glow ring for active */}
                {status === 'active' && (
                  <span className="absolute inline-block size-5 rounded-full border-2 border-[#5B7A5E]/40 animate-ping" />
                )}
              </span>

              {/* Label */}
              <span className="min-w-0 flex-1">{SECTION_LABELS[section]}</span>
              <span className="shrink-0 text-[0.68rem] font-normal text-[#9B8E7E]">
                ≤{MAX_SECTION_ESTIMATED_MINUTES} min
              </span>
            </button>
          );
        })}

        {nextSection && (
          <button
            type="button"
            onClick={() => void navigateToSection(nextSection)}
            className="mt-4 rounded-xl border border-[#D8CDBF] bg-white px-3 py-2.5 text-left text-xs font-semibold text-[#5B4F3E] transition hover:border-[#5B7A5E] hover:bg-[#F4F7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7A5E]/40"
          >
            Skip this section for now
            <span className="mt-0.5 block font-normal text-[#9B8E7E]">
              Go to {SECTION_LABELS[nextSection]}
            </span>
          </button>
        )}
      </div>

      {/* Progress footer */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#E8E0D6]">
        <ProgressBar completed={completedCount} total={sectionPlan.length} />
        <div className="flex items-center justify-between text-xs text-[#9B8E7E]">
          <span>
            {Math.round((completedCount / Math.max(sectionPlan.length, 1)) * 100)}% complete
          </span>
          <span>~{remainingMin} min remaining</span>
        </div>
      </div>
    </nav>
  );
}
