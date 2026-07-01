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
import { useRouter } from 'next/navigation';
import type {
  Decision,
  Section,
  TranscriptEntry,
  VoiceState,
} from '@/types';
import { createClient } from '@/lib/supabase/client';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import type { GeminiLiveClient } from '@/lib/gemini/client';
import type { AudioRecorder } from '@/lib/gemini/audio-recorder';
import type { AudioPlayer } from '@/lib/gemini/audio-player';
import type { OnboardingAnswers } from '@/lib/gemini/system-prompt';

const ONBOARDING_STORAGE_KEY = 'willbuddy_onboarding';

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
  updateDecision: (decisionId: string, newValue: string) => Promise<void>;
  isMicMuted: boolean;
  // Pause / section-breakpoint state
  isPaused: boolean;
  pauseReason: 'section' | 'user' | null;
  completedSection: Section | null;
  pendingNextSection: Section | null;
  resumeFromPause: () => Promise<void>;
  saveAndExit: () => void;
  pauseSession: () => void;
  finishSession: () => void;
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
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [currentSection, setCurrentSection] = useState<Section>('family');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<'section' | 'user' | null>(null);
  const [completedSection, setCompletedSection] = useState<Section | null>(null);
  const [pendingNextSection, setPendingNextSection] = useState<Section | null>(null);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useRef(createClient());

  // Refs mirror state so async callbacks (wired once into the Gemini client)
  // always read the latest values instead of a stale closure snapshot. This is
  // critical because sessionId is set AFTER connect() begins.
  const sessionIdRef = useRef<string | null>(initialSessionId ?? null);
  const currentSectionRef = useRef<Section>('family');
  const decisionsRef = useRef<Decision[]>([]);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const sectionsCompletedRef = useRef<Section[]>([]);
  const resumeHandleRef = useRef<string | null>(null);
  const onboardingRef = useRef<OnboardingAnswers | null>(null);
  const onboardingPersistedRef = useRef(false);
  const sessionStartedTrackedRef = useRef(false);
  const sessionCompletedTrackedRef = useRef(false);

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { currentSectionRef.current = currentSection; }, [currentSection]);
  useEffect(() => { decisionsRef.current = decisions; }, [decisions]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Load onboarding answers from localStorage on mount (captured pre-account).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingAnswers;
        if (parsed && typeof parsed === 'object') {
          onboardingRef.current = parsed;
        }
      }
    } catch {
      // localStorage unavailable / malformed — non-fatal.
    }
  }, []);

  // Persist onboarding answers onto the session row once we have both.
  const persistOnboarding = useCallback(() => {
    const sid = sessionIdRef.current;
    if (!sid || !onboardingRef.current || onboardingPersistedRef.current) return;
    onboardingPersistedRef.current = true;
    void fetch('/api/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, onboarding: onboardingRef.current }),
    });
  }, []);

  // -----------------------------------------------------------------------
  // Persist transcript entry to Supabase
  // -----------------------------------------------------------------------
  const saveTranscript = useCallback(
    async (entry: TranscriptEntry) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await supabase.current
        .from('transcript_entries')
        .upsert({
          id: entry.id,
          session_id: sid,
          role: entry.role,
          content: entry.content,
          timestamp: entry.timestamp,
        });
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Persist decision to Supabase
  // -----------------------------------------------------------------------
  const saveDecision = useCallback(
    async (decision: Decision) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      await supabase.current
        .from('decisions')
        .upsert(
          {
            id: decision.id,
            session_id: sid,
            section: decision.section,
            key: decision.key,
            value: decision.value,
            reasoning: decision.reasoning,
            user_confirmed: decision.user_confirmed,
            confidence: decision.confidence,
            created_at: decision.created_at,
            updated_at: decision.updated_at,
          },
          { onConflict: 'id' },
        );
    },
    [],
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
          session_id: sessionIdRef.current ?? '',
          section: (args.section as string) as Decision['section'],
          key: args.key as string,
          value: args.value as string,
          reasoning: (args.reasoning as string | undefined) ?? null,
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
        const section = args.section as Section;
        const nextSection = args.nextSection as Section | undefined;
        // Merge with previously completed sections rather than overwriting.
        const mergedCompleted = [
          ...new Set([...sectionsCompletedRef.current, section]),
        ];
        sectionsCompletedRef.current = mergedCompleted;
        // Persist section-complete to Supabase immediately
        const sid = sessionIdRef.current;
        if (sid) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              sectionsCompleted: mergedCompleted,
              currentSection: nextSection ?? section,
            }),
          });
        }
        // Show the section breakpoint instead of advancing immediately.
        // Disconnect audio so the user can read in peace.
        if (nextSection) {
          setCompletedSection(section);
          setPendingNextSection(nextSection);
          setPauseReason('section');
          setIsPaused(true);
          // Stop audio + WS but keep state in provider for resume.
          recorderRef.current?.stop();
          playerRef.current?.stop();
          clientRef.current?.disconnect();
          clientRef.current = null;
          recorderRef.current = null;
          playerRef.current = null;
          setVoiceState('idle');
        }
      }

      if (name === 'flagForReview') {
        const sid = sessionIdRef.current;
        if (sid) {
          void supabase.current.from('flagged_items').insert({
            session_id: sid,
            topic: args.topic as string,
            reason: args.reason as string,
          });
        }
      }
    },
    [saveDecision],
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
        sectionsCompletedRef.current = data.session.sections_completed ?? [];
        resumeHandleRef.current = data.session.gemini_resume_handle ?? null;
        // DB onboarding wins over localStorage (survives device switches) and
        // means we don't need to re-persist it.
        if (data.session.onboarding) {
          onboardingRef.current = data.session.onboarding as OnboardingAnswers;
          onboardingPersistedRef.current = true;
        }
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
      const sid = newSessionId ?? sessionIdRef.current;
      // Update the ref SYNCHRONOUSLY so callbacks wired below persist correctly,
      // even before the setSessionId re-render lands.
      if (sid) sessionIdRef.current = sid;
      if (newSessionId) setSessionId(newSessionId);

      // Persist onboarding answers onto the session (once).
      persistOnboarding();

      // Dynamically import so the modules are only loaded client-side
      const { GeminiLiveClient: GeminiCls } = await import('@/lib/gemini/client');
      const { AudioRecorder: RecorderCls } = await import('@/lib/gemini/audio-recorder');
      const { AudioPlayer: PlayerCls } = await import('@/lib/gemini/audio-player');

      // Build resume context from the latest data (refs avoid stale closures).
      const priorDecisions = decisionsRef.current;
      const resumeContext = priorDecisions.length > 0 ? {
        currentSection: currentSectionRef.current,
        sectionsCompleted: sectionsCompletedRef.current,
        decisions: priorDecisions,
        flaggedItems: [],
        recentTranscript: transcriptRef.current.slice(-10),
      } : undefined;

      const gemini = new GeminiCls({
        apiKey: token,
        sessionId: sid ?? '',
        resumeHandle: resumeHandleRef.current,
        resumeContext,
        onboarding: onboardingRef.current ?? undefined,
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
      gemini.onSectionChange = (section: Section) => {
        currentSectionRef.current = section;
        setCurrentSection(section);
      };
      gemini.onAudioData = (base64Audio: string) => player.play(base64Audio);
      gemini.onSessionHandle = (handle: string) => {
        resumeHandleRef.current = handle;
        if (sid) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, geminiResumeHandle: handle }),
          });
        }
      };
      gemini.onSessionComplete = () => {
        // Mark session complete and redirect to summary
        if (sid) {
          if (!sessionCompletedTrackedRef.current) {
            sessionCompletedTrackedRef.current = true;
            captureAnalyticsEvent('session_completed', {
              session_id: sid,
              trigger: 'model',
            });
          }
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, status: 'completed' }),
          }).then(() => {
            recorderRef.current?.stop();
            clientRef.current?.disconnect();
            router.push(`/summary/${sid}`);
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

      // Funnel: fire session_started once per mounted session.
      if (!sessionStartedTrackedRef.current) {
        sessionStartedTrackedRef.current = true;
        captureAnalyticsEvent('session_started', { session_id: sid ?? undefined });
      }
    } catch (err) {
      console.error('Voice connect error:', err);
      setVoiceState('error');
    }
  }, [handleToolCall, isMicMuted, saveTranscript, persistOnboarding, router]);

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
        session_id: sessionIdRef.current ?? '',
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setTranscript((prev) => [...prev, entry]);
      saveTranscript(entry);

      clientRef.current.sendText(text);
    },
    [saveTranscript],
  );

  // -----------------------------------------------------------------------
  // Update a decision (user inline-edits in the context panel)
  // -----------------------------------------------------------------------
  const updateDecision = useCallback(
    async (decisionId: string, newValue: string) => {
      const now = new Date().toISOString();
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, value: newValue, updated_at: now } : d
        )
      );
      if (sessionId) {
        await supabase.current
          .from('decisions')
          .update({ value: newValue, updated_at: now })
          .eq('id', decisionId);
      }
    },
    [sessionId],
  );

  // -----------------------------------------------------------------------
  // Resume from a section breakpoint: advance to next section, reconnect.
  // -----------------------------------------------------------------------
  const resumeFromPause = useCallback(async () => {
    if (pendingNextSection) {
      currentSectionRef.current = pendingNextSection;
      setCurrentSection(pendingNextSection);
    }
    setIsPaused(false);
    setPauseReason(null);
    setCompletedSection(null);
    setPendingNextSection(null);
    await connect();
  }, [connect, pendingNextSection]);

  // -----------------------------------------------------------------------
  // Save current progress and redirect to home (section-break or user pause).
  // State is already persisted on each tool call; this just exits cleanly.
  // -----------------------------------------------------------------------
  const saveAndExit = useCallback(() => {
    // If we were mid-section, advance the section pointer so resume lands
    // on the next section rather than replaying the just-finished one.
    if (pendingNextSection && sessionId) {
      void fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          currentSection: pendingNextSection,
        }),
      });
    }
    recorderRef.current?.stop();
    playerRef.current?.stop();
    clientRef.current?.disconnect();
    clientRef.current = null;
    recorderRef.current = null;
    playerRef.current = null;
    setVoiceState('idle');
    setIsPaused(false);
    setPauseReason(null);
    setCompletedSection(null);
    setPendingNextSection(null);
    router.push('/');
  }, [pendingNextSection, router, sessionId]);

  // -----------------------------------------------------------------------
  // Explicit user-initiated pause (button in VoiceControls).
  // Cleanly disconnects and redirects home.
  // -----------------------------------------------------------------------
  const pauseSession = useCallback(() => {
    recorderRef.current?.stop();
    playerRef.current?.stop();
    clientRef.current?.disconnect();
    clientRef.current = null;
    recorderRef.current = null;
    playerRef.current = null;
    setVoiceState('idle');
    setPauseReason('user');
    router.push('/');
  }, [router]);

  // -----------------------------------------------------------------------
  // User-initiated finish: mark the session complete and go to the summary,
  // regardless of whether the model emitted its completion tool call. This is
  // the reliable "I'm done" path so completion never depends solely on the AI.
  // -----------------------------------------------------------------------
  const finishSession = useCallback(() => {
    const sid = sessionIdRef.current;
    recorderRef.current?.stop();
    playerRef.current?.stop();
    clientRef.current?.disconnect();
    clientRef.current = null;
    recorderRef.current = null;
    playerRef.current = null;
    setVoiceState('idle');
    setIsPaused(false);
    setPauseReason(null);
    setCompletedSection(null);
    setPendingNextSection(null);

    if (!sid) {
      router.push('/');
      return;
    }

    if (!sessionCompletedTrackedRef.current) {
      sessionCompletedTrackedRef.current = true;
      captureAnalyticsEvent('session_completed', {
        session_id: sid,
        trigger: 'user',
      });
    }

    void fetch('/api/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, status: 'completed' }),
    }).finally(() => {
      router.push(`/summary/${sid}`);
    });
  }, [router]);

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
        updateDecision,
        isMicMuted,
        isPaused,
        pauseReason,
        completedSection,
        pendingNextSection,
        resumeFromPause,
        saveAndExit,
        pauseSession,
        finishSession,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}
