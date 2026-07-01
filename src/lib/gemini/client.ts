import { GoogleGenAI, Modality } from "@google/genai";
import type { Section, TranscriptEntry, VoiceState } from "@/types";
import { willBuddyTools } from "./tools";
import {
  getSystemPrompt,
  type OnboardingAnswers,
  type ResumeContext,
} from "./system-prompt";

const LIVE_MODEL = "gemini-3.1-flash-live-preview";

interface GeminiLiveClientOptions {
  apiKey: string;
  sessionId: string;
  resumeHandle?: string | null;
  resumeContext?: ResumeContext;
  onboarding?: OnboardingAnswers;
  sectionPlan?: Section[];
}

/**
 * Wraps @google/genai Live API for two-way voice conversations.
 * Follows BrowserBud patterns: session resumption, turn lifecycle,
 * multi-tool-call handling.
 */
export class GeminiLiveClient {
  private aiClient: GoogleGenAI;
  private session: Awaited<ReturnType<GoogleGenAI["live"]["connect"]>> | null =
    null;
  private sessionHandle: string | null;
  private options: GeminiLiveClientOptions;

  // Transcript accumulation (commit on lifecycle events, not per fragment)
  private currentInputTranscript = "";
  private currentOutputTranscript = "";
  private isModelSpeaking = false;

  // Callbacks
  onStateChange: ((state: VoiceState) => void) | null = null;
  onTranscript: ((entry: TranscriptEntry) => void) | null = null;
  onToolCall:
    | ((name: string, args: Record<string, unknown>) => void)
    | null = null;
  onSectionChange: ((section: Section) => void) | null = null;
  onAudioData: ((base64Audio: string) => void) | null = null;
  onSessionHandle: ((handle: string) => void) | null = null;
  onSessionComplete: (() => void) | null = null;

  constructor(options: GeminiLiveClientOptions) {
    this.options = options;
    this.aiClient = new GoogleGenAI({ apiKey: options.apiKey });
    this.sessionHandle = options.resumeHandle ?? null;
  }

  async connect(): Promise<void> {
    this.onStateChange?.("connecting");

    const systemPrompt = getSystemPrompt({
      resumeContext: this.options.resumeContext,
      onboarding: this.options.onboarding,
      sectionPlan: this.options.sectionPlan,
    });

    const config: Record<string, unknown> = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
      tools: [...willBuddyTools, { googleSearch: {} }],
      inputAudioTranscription: { languageCode: "en-US" },
      outputAudioTranscription: { languageCode: "en-US" },
    };

    if (this.sessionHandle) {
      (config as Record<string, unknown>).sessionResumption = {
        handle: this.sessionHandle,
      };
    }

    this.session = await this.aiClient.live.connect({
      model: LIVE_MODEL,
      config: config as Parameters<GoogleGenAI["live"]["connect"]>[0]["config"],
      callbacks: {
        onopen: () => {
          this.connected = true;
          this.onStateChange?.("listening");
        },
        onmessage: (message: unknown) => {
          this.handleMessage(message as Record<string, unknown>);
        },
        onerror: (error: unknown) => {
          console.error("Gemini Live error:", error);
          this.onStateChange?.("error");
        },
        onclose: () => {
          this.connected = false;
          this.onStateChange?.("disconnected");
        },
      },
    });
  }

  private handleMessage(message: Record<string, unknown>) {
    // Debug: log every message type from Gemini
    const keys = Object.keys(message).filter(k => message[k] != null);
    console.debug("[WillBuddy] Gemini message:", keys.join(", "), message);

    const serverContent = message.serverContent as Record<string, unknown> | undefined;
    const sessionResumptionUpdate = message.sessionResumptionUpdate as Record<string, unknown> | undefined;
    const goAway = message.goAway as Record<string, unknown> | undefined;
    const toolCall = message.toolCall as Record<string, unknown> | undefined;

    // Session resumption handle (save for reconnection)
    if (
      sessionResumptionUpdate &&
      (sessionResumptionUpdate as Record<string, unknown>).resumable &&
      (sessionResumptionUpdate as Record<string, unknown>).newHandle
    ) {
      const newHandle = (sessionResumptionUpdate as Record<string, unknown>).newHandle as string;
      if (newHandle !== this.sessionHandle) {
        this.sessionHandle = newHandle;
        this.onSessionHandle?.(newHandle);
      }
    }

    // Connection rotation warning
    if (goAway) {
      console.info("Gemini connection rotation incoming", goAway);
    }

    // Input transcription (user speech)
    const inputTranscription = serverContent?.inputTranscription as Record<string, unknown> | undefined;
    if (inputTranscription?.text !== undefined) {
      this.currentInputTranscript = mergeTranscript(
        this.currentInputTranscript,
        inputTranscription.text as string
      );
    }

    // Model audio/text parts
    const modelTurn = serverContent?.modelTurn as Record<string, unknown> | undefined;
    const parts = modelTurn?.parts as Array<Record<string, unknown>> | undefined;
    if (parts?.length) {
      this.isModelSpeaking = true;
      this.onStateChange?.("ai_speaking");

      for (const part of parts) {
        // Audio data
        const inlineData = part.inlineData as Record<string, unknown> | undefined;
        if (inlineData?.data) {
          console.debug("[WillBuddy] Audio chunk received, size:", (inlineData.data as string).length);
          this.onAudioData?.(inlineData.data as string);
        }
        // Text part (for transcript)
        if (part.text) {
          console.debug("[WillBuddy] Text part:", part.text);
        }
      }
    }

    // Output transcription (AI speech text)
    const outputTranscription = serverContent?.outputTranscription as Record<string, unknown> | undefined;
    if (outputTranscription?.text !== undefined) {
      this.currentOutputTranscript = mergeTranscript(
        this.currentOutputTranscript,
        outputTranscription.text as string
      );
    }

    // Commit user transcript on lifecycle events (BrowserBud pattern)
    if (
      inputTranscription?.finished ||
      parts?.length ||
      toolCall ||
      serverContent?.turnComplete ||
      serverContent?.interrupted
    ) {
      this.commitUserTurn();
    }

    // Turn complete: commit model transcript
    if (serverContent?.turnComplete) {
      this.isModelSpeaking = false;
      this.commitModelTurn();
      this.onStateChange?.("listening");
    }

    // Interrupted: commit with marker, stop audio
    if (serverContent?.interrupted) {
      this.isModelSpeaking = false;
      this.commitModelTurn(" [Interrupted]");
      this.onStateChange?.("listening");
    }

    // Tool calls (may be an array)
    if (toolCall) {
      this.onStateChange?.("ai_thinking");
      const functionCalls = (toolCall as Record<string, unknown>).functionCalls as Array<Record<string, unknown>> | undefined;
      if (functionCalls) {
        void this.handleToolCalls(functionCalls);
      }
    }
  }

  private commitUserTurn() {
    const text = this.currentInputTranscript.trim();
    if (text) {
      this.onTranscript?.({
        id: crypto.randomUUID(),
        session_id: this.options.sessionId,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      });
      this.currentInputTranscript = "";
    }
  }

  private commitModelTurn(suffix = "") {
    const text = (this.currentOutputTranscript.trim() + suffix).trim();
    if (text) {
      this.onTranscript?.({
        id: crypto.randomUUID(),
        session_id: this.options.sessionId,
        role: "ai",
        content: text,
        timestamp: new Date().toISOString(),
      });
      this.currentOutputTranscript = "";
    }
  }

  private async handleToolCalls(
    functionCalls: Array<Record<string, unknown>>
  ) {
    const functionResponses: Array<Record<string, unknown>> = [];

    for (const call of functionCalls) {
      const name = call.name as string;
      const args = (call.args ?? {}) as Record<string, unknown>;

      // Dispatch to external handler
      this.onToolCall?.(name, args);

      // Handle section changes. A missing nextSection means the model has
      // finished the final module in the (possibly tailored) plan, so the
      // session is complete — this is plan-agnostic (no hardcoded last section).
      if (name === "updateProgress") {
        if (args.nextSection) {
          this.onSectionChange?.(args.nextSection as Section);
        } else {
          this.onSessionComplete?.();
        }
      }

      functionResponses.push({
        id: call.id,
        name,
        response: { result: "success" },
      });
    }

    // Send all tool responses back to Gemini
    if (this.session) {
      await this.session.sendToolResponse({ functionResponses });
    }
  }

  private connected = false;

  /** Send base64 PCM16 audio to Gemini */
  sendAudio(base64Pcm: string): void {
    if (!this.session || !this.connected) return;
    try {
      void this.session.sendRealtimeInput({
        audio: { data: base64Pcm, mimeType: "audio/pcm;rate=16000" },
      });
    } catch {
      // WebSocket already closed, ignore
    }
  }

  /** Send a text message to Gemini (for "type instead" mode) */
  sendText(text: string): void {
    if (!this.session) return;
    void this.session.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });

    // Also commit as transcript
    this.onTranscript?.({
      id: crypto.randomUUID(),
      session_id: this.options.sessionId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Steer the live model to a section the user tapped in the sidebar. Sent as a
   * control directive (NOT committed to the visible transcript) so the model
   * interrupts, transitions, and speaks its own natural acknowledgment. If the
   * WS is closed the jump is a no-op here — the provider stores currentSection
   * and it's applied via resumeContext on the next connect().
   */
  sendSectionJump(label: string): void {
    if (!this.session) return;
    const directive =
      `[Control: The user just tapped "${label}" in the section list to jump there now. ` +
      `Switch to the "${label}" section immediately: give a brief one-line spoken acknowledgment, ` +
      `then ask the first relevant question for that section. Do not re-ask anything already answered.]`;
    try {
      void this.session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: directive }] }],
        turnComplete: true,
      });
    } catch {
      // WebSocket already closed, ignore.
    }
  }

  disconnect(): void {
    this.connected = false;
    if (this.session) {
      try { this.session.close(); } catch { /* already closed */ }
      this.session = null;
    }
  }

  getSessionHandle(): string | null {
    return this.sessionHandle;
  }
}

/**
 * Merge incremental transcript fragments.
 * Gemini Live streams transcription as incremental deltas (not cumulative),
 * so fragments must be concatenated. We guard against the occasional case
 * where a provider re-sends the full cumulative string.
 */
function mergeTranscript(existing: string, incoming: string): string {
  if (!existing) return incoming;
  if (!incoming) return existing;
  // If the incoming chunk already contains everything we have, it's cumulative.
  if (incoming.startsWith(existing)) return incoming;
  return existing + incoming;
}
