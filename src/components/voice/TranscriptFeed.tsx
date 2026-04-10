'use client';

import { useEffect, useRef } from 'react';
import { useVoice } from '@/components/voice/VoiceProvider';
import { cn } from '@/lib/utils';

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return '';
  }
}

export default function TranscriptFeed() {
  const { transcript } = useVoice();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length]);

  if (transcript.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-center text-sm text-[#9B8E7E]">
          Your conversation will appear here.
          <br />
          Tap the microphone to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 scroll-smooth">
      {transcript.map((entry) => {
        const isUser = entry.role === 'user';

        return (
          <div
            key={entry.id}
            className={cn(
              'flex flex-col gap-1 max-w-[85%]',
              isUser ? 'self-end items-end' : 'self-start items-start',
            )}
          >
            {/* Speaker label */}
            <span className="text-[11px] font-medium text-[#9B8E7E] px-1">
              {isUser ? 'You' : 'WillBuddy'}
            </span>

            {/* Bubble */}
            <div
              className={cn(
                'px-4 py-3 text-sm leading-relaxed',
                isUser
                  ? 'bg-[#5B7A5E] text-white rounded-2xl rounded-br-md'
                  : 'bg-white text-[#2D2A26] border border-[#E8E0D6] rounded-2xl rounded-bl-md',
              )}
            >
              {entry.content}
            </div>

            {/* Timestamp */}
            <span className="text-[10px] text-[#9B8E7E]/70 px-1">
              {formatTime(entry.timestamp)}
            </span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
