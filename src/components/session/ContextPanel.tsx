'use client';

import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS, type Section } from '@/types';

// ---------------------------------------------------------------------------
// Section-specific tips
// ---------------------------------------------------------------------------
const SECTION_TIPS: Record<Section, { title: string; tips: string[] }> = {
  family: {
    title: 'Family Snapshot',
    tips: [
      'Include full legal names for you and your partner.',
      "List all children, including any from previous relationships.",
      'Your state of residence affects how property is divided.',
    ],
  },
  guardianship: {
    title: 'Guardianship',
    tips: [
      'Choose someone who shares your parenting values.',
      'Always name a backup guardian in case your first choice is unable.',
      'Talk to your chosen guardian before finalizing -- their consent matters.',
    ],
  },
  assets: {
    title: 'Assets & Property',
    tips: [
      'Include real estate, bank accounts, investments, and retirement funds.',
      'Digital assets (crypto, online accounts) should be documented too.',
      'Consider setting an age for children to inherit (e.g., 25).',
    ],
  },
  healthcare: {
    title: 'Healthcare Wishes',
    tips: [
      'Your Medical POA speaks for you if you cannot speak for yourself.',
      'Be clear about your wishes regarding life support.',
      'Consider organ donation preferences.',
    ],
  },
  executor: {
    title: 'Executor & POA',
    tips: [
      'Your executor manages your estate after you pass -- choose someone organized.',
      'A financial POA handles your finances if you are incapacitated.',
      'Decide if the POA activates immediately or only upon incapacity.',
    ],
  },
};

export default function ContextPanel() {
  const { currentSection, decisions } = useVoice();
  const tips = SECTION_TIPS[currentSection];

  // Group decisions by section for display
  const decisionsBySection = decisions.reduce(
    (acc, d) => {
      if (!acc[d.section]) acc[d.section] = [];
      acc[d.section].push(d);
      return acc;
    },
    {} as Record<string, typeof decisions>,
  );

  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto py-6 px-4">
      {/* ---- Current Topic Card ---- */}
      <div className="rounded-2xl border border-[#E8E0D6] bg-white p-6">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#2D2A26] mb-3">
          {tips.title}
        </h3>
        <ul className="flex flex-col gap-2.5">
          {tips.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#2D2A26]/80 leading-relaxed">
              <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-[#5B7A5E]" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- Decisions So Far ---- */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9B8E7E]">
          Decisions So Far
        </h3>

        {decisions.length === 0 ? (
          <p className="text-sm text-[#9B8E7E]">
            Your decisions will appear here as you discuss each topic.
          </p>
        ) : (
          Object.entries(decisionsBySection).map(([section, sectionDecisions]) => (
            <div key={section} className="rounded-xl border border-[#E8E0D6] bg-white p-4">
              <h4 className="text-xs font-semibold text-[#5B7A5E] mb-2">
                {SECTION_LABELS[section as Section]}
              </h4>
              <dl className="flex flex-col gap-1.5">
                {sectionDecisions.map((d) => (
                  <div key={d.id} className="flex items-baseline justify-between gap-2">
                    <dt className="text-xs text-[#9B8E7E] capitalize">
                      {d.key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-sm font-medium text-[#2D2A26] text-right truncate max-w-[60%]">
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
