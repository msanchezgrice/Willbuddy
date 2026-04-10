'use client';

import { useState, type FormEvent } from 'react';
import { useVoice } from '@/components/voice/VoiceProvider';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Inline SVG icons (avoids external dep)
// ---------------------------------------------------------------------------
function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated waveform bars (listening / speaking)
// ---------------------------------------------------------------------------
function WaveformBars() {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-full bg-white animate-waveform"
          style={{
            height: '16px',
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
function Spinner() {
  return (
    <svg className="size-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// VoiceControls
// ---------------------------------------------------------------------------
export default function VoiceControls() {
  const { voiceState, connect, disconnect, toggleMic, sendTextMessage, isConnected, isMicMuted } =
    useVoice();

  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');

  // ------- Button click handler -------
  function handleMicClick() {
    switch (voiceState) {
      case 'idle':
      case 'error':
        connect();
        break;
      case 'listening':
      case 'ai_thinking':
      case 'ai_speaking':
        toggleMic();
        break;
      case 'mic_denied':
        connect(); // retry
        break;
      default:
        break;
    }
  }

  // ------- Text send -------
  function handleTextSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = textValue.trim();
    if (!trimmed) return;
    sendTextMessage(trimmed);
    setTextValue('');
  }

  // ------- Derive label -------
  function stateLabel(): string {
    switch (voiceState) {
      case 'idle':
        return 'Tap to start';
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return isMicMuted ? 'Muted' : 'Listening...';
      case 'ai_thinking':
        return 'Thinking...';
      case 'ai_speaking':
        return 'Speaking...';
      case 'mic_denied':
        return 'Microphone access needed';
      case 'disconnected':
        return 'Reconnecting...';
      case 'error':
        return 'Tap to retry';
      default:
        return '';
    }
  }

  // ------- Derive button appearance -------
  const isActive = isConnected;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* ---- Mic button ---- */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={voiceState === 'connecting' || voiceState === 'disconnected'}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all duration-300',
          'size-14 md:size-20', // 56px mobile, 80px desktop
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7A5E]/40',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          // idle / error
          voiceState === 'idle' || voiceState === 'error'
            ? 'bg-[#9B8E7E] text-white shadow-md hover:bg-[#8a7d6e]'
            : '',
          // mic_denied
          voiceState === 'mic_denied' ? 'bg-amber-500 text-white shadow-md' : '',
          // connecting / disconnected
          voiceState === 'connecting' || voiceState === 'disconnected'
            ? 'bg-[#5B7A5E] text-white shadow-md'
            : '',
          // active states (listening, thinking, speaking)
          isActive ? 'bg-[#5B7A5E] text-white shadow-lg shadow-[#5B7A5E]/30' : '',
          // pulsing glow for ai_thinking
          voiceState === 'ai_thinking' ? 'animate-pulse-glow' : '',
          // muted state overlay
          isActive && isMicMuted ? 'opacity-70' : '',
        )}
      >
        {/* Icon content */}
        {voiceState === 'connecting' || voiceState === 'disconnected' ? (
          <Spinner />
        ) : voiceState === 'mic_denied' ? (
          <WarningIcon className="size-6 md:size-8" />
        ) : voiceState === 'listening' || voiceState === 'ai_speaking' ? (
          <WaveformBars />
        ) : (
          <MicIcon className="size-6 md:size-8" />
        )}
      </button>

      {/* ---- State label ---- */}
      <span className="text-sm text-[#9B8E7E] font-medium select-none">
        {stateLabel()}
      </span>

      {/* ---- Disconnect when connected ---- */}
      {isConnected && (
        <button
          type="button"
          onClick={disconnect}
          className="text-xs text-[#9B8E7E] hover:text-[#2D2A26] underline underline-offset-2 transition-colors"
        >
          End session
        </button>
      )}

      {/* ---- Type instead toggle ---- */}
      {!showTextInput ? (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="text-sm text-[#5B7A5E] hover:text-[#4a6a4e] underline underline-offset-2 transition-colors"
        >
          Type instead
        </button>
      ) : (
        <form
          onSubmit={handleTextSend}
          className="flex w-full max-w-md items-center gap-2 px-4"
        >
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              'flex-1 rounded-xl border border-[#E8E0D6] bg-white px-4 py-2.5 text-sm',
              'text-[#2D2A26] placeholder:text-[#9B8E7E]',
              'focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/30 focus:border-[#5B7A5E]',
              'transition-all',
            )}
          />
          <button
            type="submit"
            disabled={!textValue.trim()}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl',
              'bg-[#5B7A5E] text-white',
              'hover:bg-[#4a6a4e] disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors',
            )}
          >
            <SendIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTextInput(false);
              setTextValue('');
            }}
            className="text-xs text-[#9B8E7E] hover:text-[#2D2A26] transition-colors ml-1"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
