'use client';

import { use } from 'react';
import VoiceProvider from '@/components/voice/VoiceProvider';
import VoiceControls from '@/components/voice/VoiceControls';
import TranscriptFeed from '@/components/voice/TranscriptFeed';
import SectionNav from '@/components/session/SectionNav';
import ContextPanel from '@/components/session/ContextPanel';
import ResumeRecap from '@/components/session/ResumeRecap';
import PauseScreen from '@/components/session/PauseScreen';
import GuidedPlanFlow from '@/components/session/GuidedPlanFlow';
import { useVoice } from '@/components/voice/VoiceProvider';
import { SECTION_LABELS } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function SessionLayout() {
  const {
    currentSection,
    isPaused,
    inputMethod,
    isSessionReady,
    selectInputMethod,
    operationError,
  } = useVoice();
  const [showNav, setShowNav] = useState(false);
  const [showContext, setShowContext] = useState(false);

  function chooseInputMethod(method: 'voice' | 'guided') {
    void selectInputMethod(method).catch(() => {
      // VoiceProvider exposes a user-facing operationError for this failure.
    });
  }

  if (!isSessionReady) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF8F5] px-6 text-center">
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D8CDBF] border-t-[#5B7A5E] motion-reduce:animate-none" />
          <p className="mt-4 text-sm font-medium text-[#5B4F3E]">Opening your plan…</p>
        </div>
      </main>
    );
  }

  if (!inputMethod) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF8F5] px-5 py-10">
        <section className="w-full max-w-3xl rounded-[2rem] border border-[#D8CDBF] bg-[#FDFCFA] p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
            Your plan, your pace
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-[#2D2A26] sm:text-4xl">
            How would you like to work through your plan?
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#5B4F3E]">
            Both paths save the same decisions and lead to the same review and
            document flow. You can switch methods later without starting over.
          </p>
          <p className="mt-3 text-sm font-semibold text-[#5B7A5E]">
            About 15 minutes total. Most sections take 4 minutes or less.
          </p>

          {operationError && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {operationError}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseInputMethod('voice')}
              className="min-h-44 rounded-3xl border-2 border-[#5B7A5E] bg-[#F4F7F3] p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="block font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
                Talk it through
              </span>
              <span className="mt-3 block text-sm leading-relaxed text-[#5B4F3E]">
                Have a guided voice conversation with context and follow-up
                questions.
              </span>
            </button>
            <button
              type="button"
              onClick={() => chooseInputMethod('guided')}
              className="min-h-44 rounded-3xl border-2 border-[#D8CDBF] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#5B7A5E] hover:shadow-md"
            >
              <span className="block font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
                Answer step by step
              </span>
              <span className="mt-3 block text-sm leading-relaxed text-[#5B4F3E]">
                Type one answer at a time, pause whenever you need, and review
                every choice.
              </span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (inputMethod === 'guided') {
    return <GuidedPlanFlow />;
  }

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
        <button
          type="button"
          onClick={() => chooseInputMethod('guided')}
          className="text-sm font-semibold text-[#5B4F3E]"
        >
          Answer step by step
        </button>
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
          <SectionNav onNavigate={() => setShowNav(false)} />
          {showNav && (
            <button type="button" onClick={() => setShowNav(false)} className="absolute top-3 right-3 md:hidden size-8 flex items-center justify-center rounded-lg hover:bg-[#E8E0D6]">
              ✕
            </button>
          )}
        </aside>

        {/* Center */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {isPaused ? (
            <PauseScreen />
          ) : (
            <>
              <div className="hidden md:flex items-center justify-between border-b border-[#E8E0D6] px-8 py-4">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
                  {SECTION_LABELS[currentSection]}
                </h2>
                <button
                  type="button"
                  onClick={() => chooseInputMethod('guided')}
                  className="min-h-11 rounded-full px-4 text-sm font-semibold text-[#5B7A5E] hover:bg-[#F0EBE4]"
                >
                  Answer step by step
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-12 md:py-6">
                {operationError && (
                  <p
                    role="alert"
                    className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {operationError}
                  </p>
                )}
                <ResumeRecap />
                <TranscriptFeed />
              </div>
              <div className="border-t border-[#E8E0D6] px-4 py-4 md:px-12">
                <VoiceControls />
              </div>
            </>
          )}
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
