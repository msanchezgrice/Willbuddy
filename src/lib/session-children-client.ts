import type { Decision, TranscriptEntry } from "@/types";

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    ...(body === undefined ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(result?.error || "Could not save or load your plan. Please try again.");
  }
  return result as T;
}

export async function saveOwnedDecision(sessionId: string, decision: Decision) {
  const result = await request<{ decision: Decision }>("/api/session/decisions", "POST", {
    sessionId,
    section: decision.section,
    key: decision.key,
    value: decision.value,
    reasoning: decision.reasoning,
    userConfirmed: decision.user_confirmed,
    confidence: decision.confidence,
  });
  return result.decision;
}

export async function updateOwnedDecision(
  sessionId: string,
  decisionId: string,
  updates: { value?: string; userConfirmed?: boolean },
) {
  const result = await request<{ decision: Decision }>("/api/session/decisions", "PATCH", {
    sessionId, decisionId, ...updates,
  });
  return result.decision;
}

export async function confirmOwnedDecisions(sessionId: string) {
  const result = await request<{ decisions: Decision[] }>("/api/session/decisions", "PATCH", {
    sessionId, confirmAll: true,
  });
  return result.decisions;
}

export async function readOwnedTranscript(sessionId: string) {
  const result = await request<{ entries: TranscriptEntry[] }>(
    `/api/session/transcript?sessionId=${encodeURIComponent(sessionId)}`, "GET",
  );
  return result.entries;
}

export async function appendOwnedTranscript(sessionId: string, entry: TranscriptEntry) {
  const result = await request<{ entry: TranscriptEntry }>("/api/session/transcript", "POST", {
    sessionId, role: entry.role, content: entry.content, timestamp: entry.timestamp,
  });
  return result.entry;
}
