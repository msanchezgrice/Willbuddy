'use client';

import { use } from 'react';
import VoiceProvider from '@/components/voice/VoiceProvider';
import VoiceControls from '@/components/voice/VoiceControls';
import TranscriptFeed from '@/components/voice/TranscriptFeed';
import SectionNav from '@/components/session/SectionNav';
import ContextPanel from '@/components/session/ContextPanel';
import ResumeRecap from '@/components/session/ResumeRecap';
import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function SessionLayout() {
  const { currentSection } = useVoice();
  const [showNav, setShowNav] = useState(false);
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="flex h-[100dvh] flex-col bg-[#FAF8F5]">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-[#E8E0D6] px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowNav(true)}
          className="flex size-9 items-center justify-center rounded-lg text-[#2D2A26] hover:bg-[#F0EBE4]"
          aria-label="Open navigation"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
        </button>
        <span className="text-sm font-semibold text-[#5B4F3E]">
          {SECTION_LABELS[currentSection]}
        </span>
        <button
          type="button"
          onClick={() => setShowContext(true)}
          className="flex size-9 items-center justify-center rounded-lg text-[#2D2A26] hover:bg-[#F0EBE4]"
          aria-label="Show context"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="7" /><path d="M10 7v3M10 13h.01" /></svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className={cn(
          'w-[280px] shrink-0 border-r border-[#E8E0D6] bg-[#F0EBE4] overflow-y-auto',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:transition-transform max-md:duration-200',
          showNav ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}>
          <SectionNav />
          {showNav && (
            <button type="button" onClick={() => setShowNav(false)} className="absolute top-3 right-3 md:hidden size-8 flex items-center justify-center rounded-lg hover:bg-[#E8E0D6]">
              ✕
            </button>
          )}
        </aside>

        {/* Center */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between border-b border-[#E8E0D6] px-8 py-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
              {SECTION_LABELS[currentSection]}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-12 md:py-6">
            <ResumeRecap />
            <TranscriptFeed />
          </div>
          <div className="border-t border-[#E8E0D6] px-4 py-4 md:px-12">
            <VoiceControls />
          </div>
        </main>

        {/* Right sidebar */}
        <aside className={cn(
          'w-[320px] shrink-0 border-l border-[#E8E0D6] bg-[#FDFCFA] overflow-y-auto',
          'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:h-[60vh] max-md:rounded-t-2xl max-md:border-t max-md:transition-transform max-md:duration-200',
          showContext ? 'max-md:translate-y-0' : 'max-md:translate-y-full'
        )}>
          <ContextPanel />
          {showContext && (
            <button type="button" onClick={() => setShowContext(false)} className="absolute top-3 right-3 md:hidden size-8 flex items-center justify-center rounded-lg hover:bg-[#E8E0D6]">
              ✕
            </button>
          )}
        </aside>
      </div>

      {/* Overlay backdrop for mobile panels */}
      {(showNav || showContext) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => { setShowNav(false); setShowContext(false); }}
        />
      )}
    </div>
  );
}

export default function ResumeSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <VoiceProvider sessionId={id}>
      <SessionLayout />
    </VoiceProvider>
  );
}
