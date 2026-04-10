'use client';

import { useState } from 'react';
import VoiceProvider from '@/components/voice/VoiceProvider';
import VoiceControls from '@/components/voice/VoiceControls';
import TranscriptFeed from '@/components/voice/TranscriptFeed';
import SectionNav from '@/components/session/SectionNav';
import ContextPanel from '@/components/session/ContextPanel';
import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS } from '@/types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Inner layout (needs VoiceProvider context)
// ---------------------------------------------------------------------------
function SessionLayout() {
  const { currentSection } = useVoice();
  const [showNav, setShowNav] = useState(false);
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="flex h-[100dvh] flex-col bg-[#FAF8F5]">
      {/* ---- Mobile top bar ---- */}
      <header className="flex items-center justify-between border-b border-[#E8E0D6] px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowNav(true)}
          className="flex size-9 items-center justify-center rounded-lg text-[#2D2A26] hover:bg-[#F0EBE4] transition-colors"
          aria-label="Open navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[#2D2A26]">
          {SECTION_LABELS[currentSection]}
        </h1>

        <button
          type="button"
          onClick={() => setShowContext(true)}
          className="flex size-9 items-center justify-center rounded-lg text-[#2D2A26] hover:bg-[#F0EBE4] transition-colors"
          aria-label="Show context"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </header>

      {/* ---- Desktop 3-column grid ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar (desktop) */}
        <aside className="hidden w-[280px] shrink-0 border-r border-[#E8E0D6] bg-white md:block">
          <SectionNav />
        </aside>

        {/* Center content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop section header */}
          <div className="hidden border-b border-[#E8E0D6] px-6 py-4 md:block">
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
              {SECTION_LABELS[currentSection]}
            </h1>
          </div>

          {/* Transcript */}
          <TranscriptFeed />

          {/* Voice controls - fixed at bottom on mobile */}
          <div className="shrink-0 border-t border-[#E8E0D6] bg-white/80 backdrop-blur-sm">
            <VoiceControls />
          </div>
        </main>

        {/* Right sidebar (desktop) */}
        <aside className="hidden w-[320px] shrink-0 border-l border-[#E8E0D6] bg-white lg:block">
          <ContextPanel />
        </aside>
      </div>

      {/* ---- Mobile nav overlay ---- */}
      {showNav && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowNav(false)}
          />
          <div className="relative z-10 w-[280px] bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E0D6] px-4 py-3">
              <span className="text-sm font-semibold text-[#2D2A26]">Sections</span>
              <button
                type="button"
                onClick={() => setShowNav(false)}
                className="flex size-8 items-center justify-center rounded-lg text-[#9B8E7E] hover:bg-[#F0EBE4]"
                aria-label="Close navigation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <SectionNav />
          </div>
        </div>
      )}

      {/* ---- Mobile context sheet ---- */}
      {showContext && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowContext(false)}
          />
          <div className="relative z-10 max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-white shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E8E0D6] bg-white px-4 py-3">
              <span className="text-sm font-semibold text-[#2D2A26]">Context</span>
              <button
                type="button"
                onClick={() => setShowContext(false)}
                className="flex size-8 items-center justify-center rounded-lg text-[#9B8E7E] hover:bg-[#F0EBE4]"
                aria-label="Close context"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ContextPanel />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page (wraps in VoiceProvider)
// ---------------------------------------------------------------------------
export default function SessionPage() {
  return (
    <VoiceProvider>
      <SessionLayout />
    </VoiceProvider>
  );
}
