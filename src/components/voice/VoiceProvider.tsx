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
  isSessionReady: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMic: () => void;
  sendTextMessage: (text: string) => void;
  updateDecision: (decisionId: string, newValue: string) => Promise<void>;
  saveGuidedDecision: (input: {
    section: Section;
    key: string;
    value: string;
    reasoning?: string;
  }) => Promise<void>;
  completeGuidedSession: () => Promise<void>;
  inputMethod: SessionGoals["inputMethod"];
  selectInputMethod: (method: NonNullable<SessionGoals["inputMethod"]>) => Promise<void>;
  operationError: string | null;
  clearOperationError: () => void;
  isMicMuted: boolean;
  // Pause / section-breakpoint state
  isPaused: boolean;
  pauseReason: 'section' | 'user' | null;
  completedSection: Section | null;
  pendingNextSection: Section | null;
  resumeFromPause: () => Promise<void>;
  saveAndExit: () => Promise<void>;
  pauseSession: () => void;
  finishSession: () => Promise<void>;
  jumpToSection: (section: Section) => Promise<void>;
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
  const [isSessionReady, setIsSessionReady] = useState(!initialSessionId);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<'section' | 'user' | null>(null);
  const [completedSection, setCompletedSection] = useState<Section | null>(null);
  const [pendingNextSection, setPendingNextSection] = useState<Section | null>(null);
  const [inputMethod, setInputMethod] = useState<SessionGoals["inputMethod"]>();
  const [operationError, setOperationError] = useState<string | null>(null);

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

  const clearOperationError = useCallback(() => setOperationError(null), []);

  const stopVoiceTransport = useCallback(() => {
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

  const requireSuccessfulResponse = useCallback(
    async (response: Response, fallbackMessage: string) => {
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || fallbackMessage);
      }
    },
    [],
  );

  const navigateToSummary = useCallback(
    (sid: string) => {
      const destination = `/summary/${sid}`;
      router.replace(destination);

      // Client transitions can occasionally stall after a long audio session on
      // mobile Safari. Fall back to a normal navigation only if the route has
      // not changed, so a completed plan never leaves the user stranded.
      window.setTimeout(() => {
        if (window.location.pathname !== destination) {
          window.location.assign(destination);
        }
      }, 2000);
    },
    [router],
  );

  const completeSessionPersistently = useCallback(
    async (sid: string, trigger: 'guided' | 'model' | 'user') => {
      clearOperationError();
      const completedPlan = [...planRef.current];
      const finalSection = completedPlan[completedPlan.length - 1] ?? 'family';
      let lastError: unknown;

      // Completion is idempotent. One retry covers a transient mobile-network
      // drop, including the case where the server committed but the response was
      // lost before the browser received it.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              sectionsCompleted: completedPlan,
              currentSection: finalSection,
              status: 'completed',
            }),
          });
          await requireSuccessfulResponse(
            response,
            trigger === 'guided'
              ? 'Could not complete this plan.'
              : 'Could not complete this session.',
          );
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          if (attempt === 0) {
            await new Promise<void>((resolve) => window.setTimeout(resolve, 350));
          }
        }
      }

      if (lastError) throw lastError;

      sectionsCompletedRef.current = completedPlan;
      currentSectionRef.current = finalSection;
      setSectionsCompleted(completedPlan);
      setCurrentSection(finalSection);

      if (!sessionCompletedTrackedRef.current) {
        sessionCompletedTrackedRef.current = true;
        if (trigger === 'guided') {
          captureAnalyticsEvent('guided_plan_completed', {
            section_count: completedPlan.length,
            decision_count: decisionsRef.current.length,
          });
        } else {
          captureAnalyticsEvent('session_completed', {
            session_id: sid,
            trigger,
          });
        }
      }

      stopVoiceTransport();
      navigateToSummary(sid);
    },
    [
      clearOperationError,
      navigateToSummary,
      requireSuccessfulResponse,
      stopVoiceTransport,
    ],
  );

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
      if (!sid) throw new Error('Session is not ready yet');
      const { error } = await supabase.current
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
      if (error) throw error;
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
        void (async () => {
          try {
            await saveDecision(decision);
            setDecisions((prev) => {
              const idx = prev.findIndex(
                (d) => d.section === decision.section && d.key === decision.key,
              );
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = decision;
                decisionsRef.current = next;
                return next;
              }
              const next = [...prev, decision];
              decisionsRef.current = next;
              return next;
            });
          } catch (error) {
            console.error('Could not save voice decision:', error);
            setOperationError('We could not save that answer. Please retry before continuing.');
          }
        })();
      }

      if (name === 'updateProgress') {
        const section = args.section as Section;
        const nextSection = args.nextSection as Section | undefined;
        void (async () => {
          try {
            // Merge with previously completed sections rather than overwriting.
            const mergedCompleted = [
              ...new Set([...sectionsCompletedRef.current, section]),
            ];
            const sid = sessionIdRef.current;
            if (!sid) throw new Error('Session is not ready yet');
            const response = await fetch('/api/session', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: sid,
                sectionsCompleted: mergedCompleted,
                currentSection: nextSection ?? section,
              }),
            });
            await requireSuccessfulResponse(
              response,
              'Could not save section progress.',
            );
            sectionsCompletedRef.current = mergedCompleted;
            setSectionsCompleted(mergedCompleted);
            // Show the section breakpoint only after progress is durable.
            if (nextSection) {
              setCompletedSection(section);
              setPendingNextSection(nextSection);
              setPauseReason('section');
              setIsPaused(true);
              stopVoiceTransport();
            }
          } catch (error) {
            console.error('Could not save section progress:', error);
            setOperationError(
              'We could not save this section, so your plan has not advanced. Please try again.',
            );
          }
        })();
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
    [requireSuccessfulResponse, saveDecision, stopVoiceTransport],
  );

  // -----------------------------------------------------------------------
  // Load existing session data on mount (for session resume)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!sessionId) return;
    const activeSessionId = sessionId;

    // Instant paint: hydrate from the last cached snapshot while the network
    // fetch is in flight. The DB response below reconciles authoritatively.
    try {
      const raw = window.localStorage.getItem(sessionCacheKey(activeSessionId));
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
      try {
        const res = await fetch(`/api/session?id=${activeSessionId}`);
        await requireSuccessfulResponse(res, 'Could not reload your plan.');
        const data = await res.json();
        if (data.session) {
          if (data.session.status === 'completed') {
            navigateToSummary(activeSessionId);
            return;
          }

          const storedCompleted = (data.session.sections_completed ?? []) as Section[];
          resumeHandleRef.current = data.session.gemini_resume_handle ?? null;

          // DB onboarding wins over localStorage (survives device switches) and
          // means we don't need to re-persist it.
          if (data.session.onboarding) {
            onboardingRef.current = data.session.onboarding as OnboardingAnswers;
            onboardingPersistedRef.current = true;
          }

          const storedGoals = data.session.goals
            ? (data.session.goals as SessionGoals)
            : goalsRef.current;
          const storedPlan = data.session.section_plan?.length
            ? resolvePlan(data.session.section_plan as Section[])
            : storedGoals?.modules ?? null;
          const resolvedPlan = buildSectionPlan(
            onboardingRef.current ?? undefined,
            storedPlan,
          );
          const completed = storedCompleted.filter((section) =>
            resolvedPlan.includes(section),
          );
          const storedCurrent = data.session.current_section as Section | undefined;
          const resolvedCurrent =
            storedCurrent && resolvedPlan.includes(storedCurrent)
              ? storedCurrent
              : resolvedPlan.find((section) => !completed.includes(section)) ??
                resolvedPlan[resolvedPlan.length - 1] ??
                'family';
          const resolvedGoals: SessionGoals = {
            preset: storedGoals?.preset ?? null,
            modules: resolvedPlan,
            inputMethod: storedGoals?.inputMethod,
          };

          planRef.current = resolvedPlan;
          planPersistedRef.current = true;
          goalsRef.current = resolvedGoals;
          sectionsCompletedRef.current = completed;
          currentSectionRef.current = resolvedCurrent;
          setSectionPlan(resolvedPlan);
          setSectionsCompleted(completed);
          setCurrentSection(resolvedCurrent);
          setInputMethod(resolvedGoals.inputMethod);

          const planChanged =
            JSON.stringify(storedPlan) !== JSON.stringify(resolvedPlan);
          const progressChanged =
            JSON.stringify(storedCompleted) !== JSON.stringify(completed) ||
            storedCurrent !== resolvedCurrent;
          if (
            !data.session.section_plan?.length ||
            planChanged ||
            progressChanged ||
            (!data.session.onboarding && onboardingRef.current)
          ) {
            const persistResponse = await fetch('/api/session', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: activeSessionId,
                onboarding: onboardingRef.current ?? undefined,
                sectionPlan: resolvedPlan,
                goals: resolvedGoals,
                sectionsCompleted: completed,
                currentSection: resolvedCurrent,
              }),
            });
            await requireSuccessfulResponse(
              persistResponse,
              'Could not save your tailored plan.',
            );
            if (onboardingRef.current) onboardingPersistedRef.current = true;
          }
        }
        if (data.decisions?.length) {
          decisionsRef.current = data.decisions;
          setDecisions(data.decisions);
        }
        if (data.recentTranscript?.length) {
          setTranscript(data.recentTranscript);
        }
      } catch (error) {
        console.error('Could not reload session:', error);
        setOperationError(
          'We could not reload your plan. Check your connection and try again.',
        );
      } finally {
        setIsSessionReady(true);
      }
    }
    void loadSession();
  }, [navigateToSummary, requireSuccessfulResponse, sessionId]);

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
        const computedGoals: SessionGoals = {
          preset: goalsRef.current?.preset ?? null,
          modules: computedPlan,
          inputMethod: goalsRef.current?.inputMethod,
        };
        planRef.current = computedPlan;
        goalsRef.current = computedGoals;
        setSectionPlan(computedPlan);
        planPersistedRef.current = true;
        if (sid) {
          void fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              sectionPlan: computedPlan,
              goals: computedGoals,
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
        if (!sid) return;
        void completeSessionPersistently(sid, 'model').catch((error) => {
          console.error('Could not complete voice session:', error);
          setOperationError(
            'Your answers are still here, but we could not finish saving the session. Please try again.',
          );
          setVoiceState('error');
        });
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
  }, [
    completeSessionPersistently,
    handleToolCall,
    isMicMuted,
    persistOnboarding,
    saveTranscript,
  ]);

  // -----------------------------------------------------------------------
  // Disconnect
  // -----------------------------------------------------------------------
  const disconnect = useCallback(() => {
    stopVoiceTransport();
  }, [stopVoiceTransport]);

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
      if (sessionId) {
        const { error } = await supabase.current
          .from('decisions')
          .update({ value: newValue, updated_at: now })
          .eq('id', decisionId);
        if (error) {
          setOperationError('We could not save that edit. Please try again.');
          throw error;
        }
      }
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, value: newValue, updated_at: now } : d
        )
      );
    },
    [sessionId],
  );

  const saveGuidedDecision = useCallback(
    async ({
      section,
      key,
      value,
      reasoning,
    }: {
      section: Section;
      key: string;
      value: string;
      reasoning?: string;
    }) => {
      const sid = sessionIdRef.current;
      if (!sid) throw new Error('Session is not ready yet');

      const existing = decisionsRef.current.find(
        (decision) => decision.section === section && decision.key === key,
      );
      const now = new Date().toISOString();
      const decision: Decision = {
        id: existing?.id ?? crypto.randomUUID(),
        session_id: sid,
        section,
        key,
        value,
        reasoning: reasoning?.trim() || null,
        user_confirmed: false,
        confidence: value === 'Not sure yet' ? 'needs_discussion' : 'decisive',
        created_at: existing?.created_at ?? now,
        updated_at: now,
      };

      try {
        clearOperationError();
        await saveDecision(decision);
        const next = existing
          ? decisionsRef.current.map((item) =>
              item.section === section && item.key === key ? decision : item,
            )
          : [...decisionsRef.current, decision];
        decisionsRef.current = next;
        setDecisions(next);
        captureAnalyticsEvent('guided_plan_answer_saved', {
          section,
          question: key,
        });
      } catch (error) {
        setOperationError('We could not save that answer. Please try again.');
        throw error;
      }
    },
    [clearOperationError, saveDecision],
  );

  const completeGuidedSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) throw new Error('Session is not ready yet');
    try {
      await completeSessionPersistently(sid, 'guided');
    } catch (error) {
      setOperationError(
        'Your answer was saved, but we could not finish the plan. Please try again.',
      );
      throw error;
    }
  }, [completeSessionPersistently]);

  const selectInputMethod = useCallback(
    async (method: NonNullable<SessionGoals['inputMethod']>) => {
      clearOperationError();
      if (method === 'guided') {
        stopVoiceTransport();
      }
      const safePlan = buildSectionPlan(
        onboardingRef.current ?? undefined,
        planRef.current,
      );
      if (JSON.stringify(safePlan) !== JSON.stringify(planRef.current)) {
        planRef.current = safePlan;
        setSectionPlan(safePlan);
      }
      const goals: SessionGoals = {
        preset: goalsRef.current?.preset ?? null,
        modules: safePlan,
        inputMethod: method,
      };
      const sid = sessionIdRef.current;
      try {
        if (sid) {
          const response = await fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, goals, sectionPlan: safePlan }),
          });
          await requireSuccessfulResponse(
            response,
            'Could not save your input preference.',
          );
        }
      } catch (error) {
        console.error('Could not switch planning methods:', error);
        setOperationError(
          'We could not switch planning methods because your preference did not save. Please try again.',
        );
        return;
      }
      goalsRef.current = goals;
      try {
        window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      } catch {
        // Storage may be unavailable; the session row remains authoritative.
      }
      setInputMethod(method);
      captureAnalyticsEvent('session_input_method_selected', { method });
      captureAnalyticsEvent(
        method === 'guided' ? 'guided_plan_started' : 'voice_plan_started',
        { source: 'session_method_selected' },
      );
    },
    [clearOperationError, requireSuccessfulResponse, stopVoiceTransport],
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
  const jumpToSection = useCallback(async (section: Section) => {
    if (section === currentSectionRef.current) return;
    clearOperationError();
    try {
      const sid = sessionIdRef.current;
      if (sid) {
        const response = await fetch('/api/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, currentSection: section }),
        });
        await requireSuccessfulResponse(
          response,
          'Could not save your new section.',
        );
      }

      currentSectionRef.current = section;
      setCurrentSection(section);

      // Steer the live model (no-op if the WS is closed — resumeContext handles it).
      if (clientRef.current) {
        // Cut any in-flight speech so the switch feels instant.
        playerRef.current?.stop();
        clientRef.current.sendSectionJump(SECTION_LABELS[section]);
      }
    } catch (error) {
      console.error('Could not jump to section:', error);
      setOperationError(
        'We could not save your new section. Check your connection and try again.',
      );
      throw error;
    }
  }, [clearOperationError, requireSuccessfulResponse]);

  // -----------------------------------------------------------------------
  // Save current progress and redirect to home (section-break or user pause).
  // State is already persisted on each tool call; this just exits cleanly.
  // -----------------------------------------------------------------------
  const saveAndExit = useCallback(async () => {
    try {
      clearOperationError();
      // At a section breakpoint, persist the next pointer before leaving so
      // resume never replays a section the user already completed.
      if (pendingNextSection && sessionId) {
        const response = await fetch('/api/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            currentSection: pendingNextSection,
          }),
        });
        await requireSuccessfulResponse(
          response,
          'Could not save your current position.',
        );
      }
      stopVoiceTransport();
      setIsPaused(false);
      setPauseReason(null);
      setCompletedSection(null);
      setPendingNextSection(null);
      router.push('/');
    } catch (error) {
      console.error('Could not save and exit:', error);
      setOperationError(
        'We could not save your current position, so you have not been redirected. Please try again.',
      );
    }
  }, [
    clearOperationError,
    pendingNextSection,
    requireSuccessfulResponse,
    router,
    sessionId,
    stopVoiceTransport,
  ]);

  // -----------------------------------------------------------------------
  // Explicit user-initiated pause (button in VoiceControls).
  // Stops audio + the WS but KEEPS the user on the session page in a paused
  // state so they can resume in place (with audio/context sync) rather than
  // being dumped back to the landing page. All progress is already persisted.
  // -----------------------------------------------------------------------
  const pauseSession = useCallback(() => {
    stopVoiceTransport();
    setPauseReason('user');
    setIsPaused(true);
  }, [stopVoiceTransport]);

  // -----------------------------------------------------------------------
  // User-initiated finish: mark the session complete and go to the summary,
  // regardless of whether the model emitted its completion tool call. This is
  // the reliable "I'm done" path so completion never depends solely on the AI.
  // -----------------------------------------------------------------------
  const finishSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    stopVoiceTransport();
    setIsPaused(false);
    setPauseReason(null);
    setCompletedSection(null);
    setPendingNextSection(null);

    if (!sid) {
      setOperationError(
        'We could not find this session, so it has not been marked complete.',
      );
      return;
    }

    try {
      await completeSessionPersistently(sid, 'user');
    } catch (error) {
      console.error('Could not finish session:', error);
      setOperationError(
        'Your answers are still here, but we could not finish saving the session. Please try again.',
      );
    }
  }, [completeSessionPersistently, stopVoiceTransport]);

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
        isSessionReady,
        connect,
        disconnect,
        toggleMic,
        sendTextMessage,
        updateDecision,
        saveGuidedDecision,
        completeGuidedSession,
        inputMethod,
        selectInputMethod,
        operationError,
        clearOperationError,
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
