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
import {
  SECTION_LABELS,
  type Decision,
  type Section,
  type TranscriptEntry,
  type VoiceState,
} from '@/types';
import { createClient } from '@/lib/supabase/client';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { buildSectionPlan, resolvePlan } from '@/lib/sections/plan';
import type { SessionGoals } from '@/types';
import type { GeminiLiveClient } from '@/lib/gemini/client';
import type { AudioRecorder } from '@/lib/gemini/audio-recorder';
import type { AudioPlayer } from '@/lib/gemini/audio-player';
import type { OnboardingAnswers } from '@/lib/gemini/system-prompt';

const ONBOARDING_STORAGE_KEY = 'willbuddy_onboarding';
const GOALS_STORAGE_KEY = 'willbuddy_goals';
const sessionCacheKey = (id: string) => `willbuddy_session_cache_${id}`;

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------
interface VoiceContextValue {
  voiceState: VoiceState;
  isConnected: boolean;
  currentSection: Section;
  sectionPlan: Section[];
  sectionsCompleted: Section[];
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
  jumpToSection: (section: Section) => void;
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
  const [sectionPlan, setSectionPlan] = useState<Section[]>(() => resolvePlan(null));
  const [sectionsCompleted, setSectionsCompleted] = useState<Section[]>([]);
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
  const goalsRef = useRef<SessionGoals | null>(null);
  const planRef = useRef<Section[]>(sectionPlan);
  const planPersistedRef = useRef(false);
  const sessionStartedTrackedRef = useRef(false);
  const sessionCompletedTrackedRef = useRef(false);

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { currentSectionRef.current = currentSection; }, [currentSection]);
  useEffect(() => { decisionsRef.current = decisions; }, [decisions]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Load onboarding answers + section goals from localStorage on mount
  // (captured pre-account, before the session row exists).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingAnswers;
        if (parsed && typeof parsed === 'object') {
          onboardingRef.current = parsed;
        }
      }
      const goalsRaw = window.localStorage.getItem(GOALS_STORAGE_KEY);
      if (goalsRaw) {
        const parsedGoals = JSON.parse(goalsRaw) as SessionGoals;
        if (parsedGoals && Array.isArray(parsedGoals.modules)) {
          goalsRef.current = parsedGoals;
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
        setSectionsCompleted(mergedCompleted);
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

    // Instant paint: hydrate from the last cached snapshot while the network
    // fetch is in flight. The DB response below reconciles authoritatively.
    try {
      const raw = window.localStorage.getItem(sessionCacheKey(sessionId));
      if (raw) {
        const cached = JSON.parse(raw) as {
          plan?: Section[];
          sectionsCompleted?: Section[];
          currentSection?: Section;
          decisions?: Decision[];
          transcript?: TranscriptEntry[];
        };
        if (Array.isArray(cached.plan) && cached.plan.length) {
          const cachedPlan = resolvePlan(cached.plan);
          planRef.current = cachedPlan;
          setSectionPlan(cachedPlan);
        }
        if (Array.isArray(cached.sectionsCompleted)) {
          sectionsCompletedRef.current = cached.sectionsCompleted;
          setSectionsCompleted(cached.sectionsCompleted);
        }
        if (typeof cached.currentSection === 'string') {
          setCurrentSection(cached.currentSection);
        }
        if (Array.isArray(cached.decisions) && cached.decisions.length) {
          setDecisions(cached.decisions);
        }
        if (Array.isArray(cached.transcript) && cached.transcript.length) {
          setTranscript(cached.transcript);
        }
      }
    } catch {
      // Corrupt/absent cache — non-fatal, the fetch below hydrates.
    }

    async function loadSession() {
      const res = await fetch(`/api/session?id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.session) {
        setCurrentSection(data.session.current_section ?? 'family');
        const completed = (data.session.sections_completed ?? []) as Section[];
        sectionsCompletedRef.current = completed;
        setSectionsCompleted(completed);
        resumeHandleRef.current = data.session.gemini_resume_handle ?? null;
        // DB onboarding wins over localStorage (survives device switches) and
        // means we don't need to re-persist it.
        if (data.session.onboarding) {
          onboardingRef.current = data.session.onboarding as OnboardingAnswers;
          onboardingPersistedRef.current = true;
        }
        if (data.session.goals) {
          goalsRef.current = data.session.goals as SessionGoals;
        }
        // A stored plan is authoritative for a returning session — don't
        // recompute or overwrite it on connect.
        if (data.session.section_plan?.length) {
          const storedPlan = resolvePlan(data.session.section_plan as Section[]);
          planRef.current = storedPlan;
          setSectionPlan(storedPlan);
          planPersistedRef.current = true;
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

  // Keep a lightweight snapshot in localStorage so returning to a session
  // paints answers/progress/chat instantly before the DB round-trip.
  useEffect(() => {
    const id = sessionIdRef.current;
    if (!id) return;
    try {
      window.localStorage.setItem(
        sessionCacheKey(id),
        JSON.stringify({
          plan: sectionPlan,
          sectionsCompleted,
          currentSection,
          decisions,
          transcript: transcript.slice(-10),
          ts: Date.now(),
        }),
      );
    } catch {
      // Storage full/unavailable — non-fatal.
    }
  }, [sessionId, sectionPlan, sectionsCompleted, currentSection, decisions, transcript]);

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

      // Compute the tailored section plan (once). A plan loaded from the DB for
      // a returning session already set planPersistedRef, so we won't overwrite.
      if (!planPersistedRef.current) {
        const computedPlan = buildSectionPlan(
          onboardingRef.current ?? undefined,
          goalsRef.current?.modules ?? null,
        );
        planRef.current = computedPlan;
        setSectionPlan(computedPlan);
        planPersistedRef.current = true;
        if (sid) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              sectionPlan: computedPlan,
              goals: goalsRef.current ?? { preset: null, modules: computedPlan },
            }),
          });
        }
      }

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
        sectionPlan: planRef.current,
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
  // Jump to a section from the sidebar. Updates state + persists immediately,
  // and — if the model is live — steers it to that section so voice stays in
  // sync with the click. If paused/idle, the section is stored and applied via
  // resumeContext when the user reconnects.
  // -----------------------------------------------------------------------
  const jumpToSection = useCallback((section: Section) => {
    if (section === currentSectionRef.current) return;
    currentSectionRef.current = section;
    setCurrentSection(section);

    const sid = sessionIdRef.current;
    if (sid) {
      void fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, currentSection: section }),
      });
    }

    // Steer the live model (no-op if the WS is closed — resumeContext handles it).
    if (clientRef.current) {
      // Cut any in-flight speech so the switch feels instant.
      playerRef.current?.stop();
      clientRef.current.sendSectionJump(SECTION_LABELS[section]);
    }
  }, []);

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
  // Stops audio + the WS but KEEPS the user on the session page in a paused
  // state so they can resume in place (with audio/context sync) rather than
  // being dumped back to the landing page. All progress is already persisted.
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
    setIsPaused(true);
  }, []);

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
    // Don't auto-reconnect while paused — an intentional pause closes the WS,
    // which fires 'disconnected'; reconnecting would restart audio behind the
    // pause overlay. Resuming is explicit via resumeFromPause().
    if (voiceState === 'disconnected' && !isPaused) {
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 2000);
    }
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [voiceState, isPaused, connect]);

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
        sectionPlan,
        sectionsCompleted,
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
        jumpToSection,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}
