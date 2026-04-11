'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Decision,
  Section,
  TranscriptEntry,
  VoiceState,
} from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { GeminiLiveClient } from '@/lib/gemini/client';
import type { AudioRecorder } from '@/lib/gemini/audio-recorder';
import type { AudioPlayer } from '@/lib/gemini/audio-player';

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------
interface VoiceContextValue {
  voiceState: VoiceState;
  isConnected: boolean;
  currentSection: Section;
  transcript: TranscriptEntry[];
  decisions: Decision[];
  sessionId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMic: () => void;
  sendTextMessage: (text: string) => void;
  isMicMuted: boolean;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface VoiceProviderProps {
  children: ReactNode;
  sessionId?: string;
}

export default function VoiceProvider({ children, sessionId: initialSessionId }: VoiceProviderProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [currentSection, setCurrentSection] = useState<Section>('family');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useRef(createClient());

  // -----------------------------------------------------------------------
  // Persist transcript entry to Supabase
  // -----------------------------------------------------------------------
  const saveTranscript = useCallback(
    async (entry: TranscriptEntry) => {
      if (!sessionId) return;
      await supabase.current
        .from('transcript_entries')
        .upsert({
          id: entry.id,
          session_id: sessionId,
          role: entry.role,
          content: entry.content,
          timestamp: entry.timestamp,
        });
    },
    [sessionId],
  );

  // -----------------------------------------------------------------------
  // Persist decision to Supabase
  // -----------------------------------------------------------------------
  const saveDecision = useCallback(
    async (decision: Decision) => {
      if (!sessionId) return;
      await supabase.current
        .from('decisions')
        .upsert(
          {
            id: decision.id,
            session_id: sessionId,
            section: decision.section,
            key: decision.key,
            value: decision.value,
            user_confirmed: decision.user_confirmed,
            confidence: decision.confidence,
            created_at: decision.created_at,
            updated_at: decision.updated_at,
          },
          { onConflict: 'id' },
        );
    },
    [sessionId],
  );

  // -----------------------------------------------------------------------
  // Handle tool calls from Gemini (save_decision, etc.)
  // -----------------------------------------------------------------------
  const handleToolCall = useCallback(
    (name: string, args: Record<string, unknown>) => {
      if (name === 'recordDecision') {
        const now = new Date().toISOString();
        const decision: Decision = {
          id: crypto.randomUUID(),
          session_id: sessionId ?? '',
          section: (args.section as string) as Decision['section'],
          key: args.key as string,
          value: args.value as string,
          user_confirmed: false,
          confidence: (args.confidence as string as Decision['confidence']) ?? 'decisive',
          created_at: now,
          updated_at: now,
        };
        setDecisions((prev) => {
          const idx = prev.findIndex(
            (d) => d.section === decision.section && d.key === decision.key,
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = decision;
            return next;
          }
          return [...prev, decision];
        });
        saveDecision(decision);
      }

      if (name === 'updateProgress') {
        const section = args.section as string;
        const nextSection = args.nextSection as string | undefined;
        // Update session state via API
        if (sessionId) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              sectionsCompleted: [...new Set([section])],
              currentSection: nextSection ?? section,
            }),
          });
        }
        if (nextSection) {
          setCurrentSection(nextSection as Section);
        }
      }

      if (name === 'flagForReview') {
        if (sessionId) {
          void supabase.current.from('flagged_items').insert({
            session_id: sessionId,
            topic: args.topic as string,
            reason: args.reason as string,
          });
        }
      }
    },
    [saveDecision, sessionId],
  );

  // -----------------------------------------------------------------------
  // Load existing session data on mount (for session resume)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!sessionId) return;
    async function loadSession() {
      const res = await fetch(`/api/session?id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.session) {
        setCurrentSection(data.session.current_section ?? 'family');
      }
      if (data.decisions?.length) {
        setDecisions(data.decisions);
      }
      if (data.recentTranscript?.length) {
        setTranscript(data.recentTranscript);
      }
    }
    void loadSession();
  }, [sessionId]);

  // -----------------------------------------------------------------------
  // Connect to Gemini Live
  // -----------------------------------------------------------------------
  const connect = useCallback(async () => {
    if (clientRef.current) return;
    setVoiceState('connecting');

    try {
      // Fetch ephemeral token
      const res = await fetch('/api/gemini/token', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to fetch Gemini token');
      const { token, sessionId: newSessionId } = await res.json();
      if (newSessionId) setSessionId(newSessionId);

      // Dynamically import so the modules are only loaded client-side
      const { GeminiLiveClient: GeminiCls } = await import('@/lib/gemini/client');
      const { AudioRecorder: RecorderCls } = await import('@/lib/gemini/audio-recorder');
      const { AudioPlayer: PlayerCls } = await import('@/lib/gemini/audio-player');

      const sid = newSessionId ?? sessionId;

      // Build resume context if we have prior session data
      const resumeContext = decisions.length > 0 ? {
        currentSection,
        sectionsCompleted: [] as Section[],
        decisions,
        flaggedItems: [],
        recentTranscript: transcript.slice(-10),
      } : undefined;

      const gemini = new GeminiCls({
        apiKey: token,
        sessionId: sid ?? '',
        resumeContext,
      });
      const recorder = new RecorderCls();
      const player = new PlayerCls();

      // Wire up event handlers
      gemini.onStateChange = (state: VoiceState) => setVoiceState(state);
      gemini.onTranscript = (entry: TranscriptEntry) => {
        setTranscript((prev) => [...prev, entry]);
        saveTranscript(entry);
      };
      gemini.onToolCall = handleToolCall;
      gemini.onSectionChange = (section: Section) => setCurrentSection(section);
      gemini.onAudioData = (base64Audio: string) => player.play(base64Audio);
      gemini.onSessionHandle = (handle: string) => {
        // Save Gemini resume handle for session continuity
        if (sid) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, geminiResumeHandle: handle }),
          });
        }
      };

      recorder.onData = (base64Pcm: string) => {
        if (!isMicMuted) gemini.sendAudio(base64Pcm);
      };
      recorder.onPermissionDenied = () => setVoiceState('mic_denied');

      await gemini.connect();
      await recorder.start();

      clientRef.current = gemini;
      recorderRef.current = recorder;
      playerRef.current = player;

      setVoiceState('listening');
    } catch (err) {
      console.error('Voice connect error:', err);
      setVoiceState('error');
    }
  }, [handleToolCall, isMicMuted, saveTranscript]);

  // -----------------------------------------------------------------------
  // Disconnect
  // -----------------------------------------------------------------------
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    recorderRef.current?.stop();
    playerRef.current?.stop();
    clientRef.current?.disconnect();
    clientRef.current = null;
    recorderRef.current = null;
    playerRef.current = null;
    setVoiceState('idle');
  }, []);

  // -----------------------------------------------------------------------
  // Toggle microphone mute
  // -----------------------------------------------------------------------
  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  // -----------------------------------------------------------------------
  // Send a text message (type-instead mode)
  // -----------------------------------------------------------------------
  const sendTextMessage = useCallback(
    (text: string) => {
      if (!clientRef.current) return;

      // Add user bubble immediately
      const entry: TranscriptEntry = {
        id: crypto.randomUUID(),
        session_id: sessionId ?? '',
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setTranscript((prev) => [...prev, entry]);
      saveTranscript(entry);

      clientRef.current.sendText(text);
    },
    [sessionId, saveTranscript],
  );

  // -----------------------------------------------------------------------
  // Auto-reconnect on unexpected disconnect
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (voiceState === 'disconnected') {
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 2000);
    }
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [voiceState, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isConnected =
    voiceState === 'listening' ||
    voiceState === 'ai_thinking' ||
    voiceState === 'ai_speaking';

  return (
    <VoiceContext.Provider
      value={{
        voiceState,
        isConnected,
        currentSection,
        transcript,
        decisions,
        sessionId,
        connect,
        disconnect,
        toggleMic,
        sendTextMessage,
        isMicMuted,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}
