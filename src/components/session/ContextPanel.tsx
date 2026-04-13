'use client';

import { useState } from 'react';
import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS, type Section, type Decision } from '@/types';

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

function EditableDecision({ decision }: { decision: Decision }) {
  const { updateDecision } = useVoice();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(decision.value);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (draft.trim() === decision.value || !draft.trim()) {
      setIsEditing(false);
      setDraft(decision.value);
      return;
    }
    setSaving(true);
    await updateDecision(decision.id, draft.trim());
    setSaving(false);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(decision.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-baseline justify-between gap-2 group">
        <dt className="text-xs text-[#9B8E7E] capitalize shrink-0">
          {decision.key.replace(/_/g, ' ')}
        </dt>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void save();
              if (e.key === 'Escape') cancel();
            }}
            onBlur={save}
            disabled={saving}
            autoFocus
            className="flex-1 text-sm font-medium text-[#2D2A26] text-right bg-[#F0EBE4] border border-[#5B7A5E] rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#5B7A5E] min-w-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-baseline justify-between gap-2 group cursor-text hover:bg-[#F0EBE4]/40 rounded -mx-1 px-1"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <dt className="text-xs text-[#9B8E7E] capitalize shrink-0">
        {decision.key.replace(/_/g, ' ')}
      </dt>
      <dd className="text-sm font-medium text-[#2D2A26] text-right truncate max-w-[60%] flex items-center gap-1">
        <span className="truncate">{decision.value}</span>
        <svg
          className="size-3 opacity-0 group-hover:opacity-60 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </dd>
    </div>
  );
}

export default function ContextPanel() {
  const { currentSection, decisions } = useVoice();
  const tips = SECTION_TIPS[currentSection];

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
      {/* Current Topic Card */}
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

      {/* Decisions So Far */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9B8E7E]">
            Decisions So Far
          </h3>
          {decisions.length > 0 && (
            <span className="text-[10px] text-[#9B8E7E]/70">Click to edit</span>
          )}
        </div>

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
                  <EditableDecision key={d.id} decision={d} />
                ))}
              </dl>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
