'use client';

import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTIONS, SECTION_LABELS, type Section } from '@/types';
import { cn } from '@/lib/utils';
import ProgressBar from '@/components/session/ProgressBar';

// Estimate ~6 min per section, 5 sections = 30 min total
const MINUTES_PER_SECTION = 6;

export default function SectionNav() {
  const { currentSection, decisions } = useVoice();

  // Derive which sections are done based on decisions captured
  const completedSections = new Set<Section>();
  for (const d of decisions) {
    // If we have at least 2 decisions for a section, consider it done
    const sectionDecisions = decisions.filter((x) => x.section === d.section);
    if (sectionDecisions.length >= 2) {
      completedSections.add(d.section);
    }
  }

  const completedCount = completedSections.size;
  const remainingMin = (SECTIONS.length - completedCount) * MINUTES_PER_SECTION;

  function getStatus(section: Section): 'done' | 'active' | 'pending' {
    if (completedSections.has(section)) return 'done';
    if (section === currentSection) return 'active';
    return 'pending';
  }

  function canNavigate(section: Section): boolean {
    const status = getStatus(section);
    return status === 'done' || status === 'active';
  }

  return (
    <nav className="flex h-full flex-col justify-between py-6 px-4">
      {/* Section list */}
      <div className="flex flex-col gap-1">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9B8E7E]">
          Sections
        </h2>

        {SECTIONS.map((section) => {
          const status = getStatus(section);
          const navigable = canNavigate(section);

          return (
            <button
              key={section}
              type="button"
              disabled={!navigable}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                'disabled:cursor-not-allowed',
                status === 'active' && 'bg-[#5B7A5E]/10 font-semibold text-[#2D2A26]',
                status === 'done' && 'text-[#5B7A5E] hover:bg-[#5B7A5E]/5',
                status === 'pending' && 'text-[#9B8E7E]',
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
              <span>{SECTION_LABELS[section]}</span>
            </button>
          );
        })}
      </div>

      {/* Progress footer */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#E8E0D6]">
        <ProgressBar completed={completedCount} total={SECTIONS.length} />
        <div className="flex items-center justify-between text-xs text-[#9B8E7E]">
          <span>{Math.round((completedCount / SECTIONS.length) * 100)}% complete</span>
          <span>~{remainingMin} min remaining</span>
        </div>
      </div>
    </nav>
  );
}
