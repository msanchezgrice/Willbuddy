"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Decision, Section } from "@/types";
import { SECTIONS, SECTION_LABELS } from "@/types";

interface DecisionEditorProps {
  decisions: Decision[];
  sessionId: string;
}

export function DecisionEditor({ decisions, sessionId }: DecisionEditorProps) {
  const [localDecisions, setLocalDecisions] = useState<Decision[]>(decisions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Group decisions by section
  const decisionsBySection: Record<Section, Decision[]> = {} as Record<Section, Decision[]>;
  for (const section of SECTIONS) {
    decisionsBySection[section] = localDecisions.filter((d) => d.section === section);
  }

  const allConfirmed =
    localDecisions.length > 0 && localDecisions.every((d) => d.user_confirmed);

  function startEditing(decision: Decision) {
    setEditingId(decision.id);
    setEditValue(decision.value);
  }

  async function saveEdit(decisionId: string) {
    setSaving(true);
    const { error } = await supabase
      .from("decisions")
      .upsert(
        { id: decisionId, value: editValue, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (!error) {
      setLocalDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, value: editValue, updated_at: new Date().toISOString() } : d
        )
      );
    }
    setEditingId(null);
    setSaving(false);
  }

  async function toggleConfirmed(decisionId: string, currentValue: boolean) {
    const newValue = !currentValue;
    const { error } = await supabase
      .from("decisions")
      .upsert(
        { id: decisionId, user_confirmed: newValue, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (!error) {
      setLocalDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, user_confirmed: newValue } : d
        )
      );
    }
  }

  async function confirmAll() {
    setSaving(true);
    const ids = localDecisions.filter((d) => !d.user_confirmed).map((d) => d.id);

    for (const id of ids) {
      await supabase
        .from("decisions")
        .upsert(
          { id, user_confirmed: true, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
    }

    setLocalDecisions((prev) =>
      prev.map((d) => ({ ...d, user_confirmed: true }))
    );
    setSaving(false);
  }

  function getConfidenceBadge(confidence: Decision["confidence"]) {
    switch (confidence) {
      case "decisive":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#5B7A5E]/10 text-[#5B7A5E]">
            Decisive
          </span>
        );
      case "needs_discussion":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Needs Discussion
          </span>
        );
      case "flagged":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Flagged
          </span>
        );
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#5B4F3E]">
          Your Decisions
        </h2>
        {allConfirmed && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-[#5B7A5E]/10 text-[#5B7A5E]">
            <CheckIcon />
            All decisions confirmed
          </span>
        )}
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const sectionDecisions = decisionsBySection[section];
          if (sectionDecisions.length === 0) return null;

          return (
            <div
              key={section}
              className="bg-white rounded-[16px] border border-[#E8E0D6] p-6"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5B4F3E] mb-4">
                {SECTION_LABELS[section]}
              </h3>

              <div className="space-y-3">
                {sectionDecisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
                  >
                    {/* Confirmation checkbox */}
                    <label className="flex items-center mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={decision.user_confirmed}
                        onChange={() => toggleConfirmed(decision.id, decision.user_confirmed)}
                        className="w-4 h-4 rounded border-[#E8E0D6] text-[#5B7A5E] focus:ring-[#5B7A5E] cursor-pointer"
                      />
                    </label>

                    {/* Decision content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#5B4F3E] capitalize">
                          {decision.key.replace(/_/g, " ")}
                        </span>
                        {getConfidenceBadge(decision.confidence)}
                      </div>

                      {editingId === decision.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 text-sm text-[#5A5248] border border-[#5B7A5E] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/30"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(decision.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => saveEdit(decision.id)}
                            disabled={saving}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#5B7A5E] text-white hover:bg-[#4A6A4D] transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E8E0D6] text-[#9B8E7E] hover:bg-[#FAF8F5] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p
                          onClick={() => startEditing(decision)}
                          className="text-sm text-[#5A5248] cursor-pointer hover:text-[#5B7A5E] transition-colors"
                          title="Click to edit"
                        >
                          {decision.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm All button */}
      {!allConfirmed && localDecisions.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={confirmAll}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#5B7A5E] hover:bg-[#4A6A4D] text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <CheckIcon />
            Confirm All Decisions
          </button>
          <p className="text-xs text-[#9B8E7E] mt-3">
            Mark all decisions as verified before generating final documents.
          </p>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
