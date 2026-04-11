"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TranscriptEntry } from "@/types";

interface TranscriptViewerProps {
  sessionId: string;
}

export function TranscriptViewer({ sessionId }: TranscriptViewerProps) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (expanded && entries.length === 0) {
      loadTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  async function loadTranscript() {
    setLoading(true);
    const { data, error } = await supabase
      .from("transcript_entries")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (!error && data) {
      setEntries(data as TranscriptEntry[]);
    }
    setLoading(false);
  }

  const filteredEntries = searchQuery
    ? entries.filter((e) =>
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function downloadTranscript() {
    const lines = entries.map((e) => {
      const time = new Date(e.timestamp).toLocaleString();
      const role = e.role === "ai" ? "WillBuddy" : "You";
      return `[${time}] ${role}: ${e.content}`;
    });

    const text = lines.join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WillBuddy_Transcript_${sessionId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pb-12">
      <div className="bg-white rounded-[16px] border border-[#E8E0D6] overflow-hidden">
        {/* Toggle header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-[#FAF8F5] transition-colors"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#5B4F3E]">
            View Full Transcript
          </h2>
          <ChevronIcon expanded={expanded} />
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-[#E8E0D6]">
            {/* Search and download bar */}
            <div className="flex items-center gap-3 p-4 border-b border-[#F0EBE4]">
              <div className="relative flex-1">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-[#E8E0D6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/30 focus:border-[#5B7A5E]"
                />
              </div>
              <button
                onClick={downloadTranscript}
                disabled={entries.length === 0}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-[#E8E0D6] text-[#5B4F3E] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50"
              >
                <DownloadIcon />
                Download
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center py-12 text-[#9B8E7E]">
                  Loading transcript...
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-[#9B8E7E]">
                  {searchQuery ? "No messages match your search." : "No transcript entries found."}
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        entry.role === "user"
                          ? "bg-[#5B7A5E] text-white"
                          : "bg-white border border-[#E8E0D6] text-[#5A5248]"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1.5 ${
                          entry.role === "user" ? "text-white/60" : "text-[#9B8E7E]"
                        }`}
                      >
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#9B8E7E] transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8E7E]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
