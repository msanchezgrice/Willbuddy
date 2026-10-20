import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SECTIONS, VALID_DECISION_KEYS, type Section } from "@/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const invalid = () => json({ error: "Invalid request" }, 400);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const keysOnly = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
const text = (value: unknown, max = 32768): value is string =>
  typeof value === "string" && value.length <= max;
const uuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

async function authenticatedJson(request: Request) {
  const { userId } = await auth();
  if (!userId) return { response: json({ error: "Unauthorized" }, 401) };

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return { response: json({ error: "Forbidden" }, 403) };
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: invalid() };
  }
  if (!object(body)) return { response: invalid() };
  return { userId, body };
}

async function ownedSession(userId: string, sessionId: string) {
  const client = createServiceClient();
  // Clerk subjects are text identities. Never accept an owner from the body or
  // infer ownership from a child id, a couple link, or an anonymous DB client.
  const { data, error } = await client
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { response: json({ error: "Could not verify session" }, 500) };
  if (!data) return { response: json({ error: "Session not found" }, 404) };
  return { client };
}

export async function saveDecision(request: Request) {
  const parsed = await authenticatedJson(request);
  if (parsed.response) return parsed.response;
  const body = parsed.body;
  if (
    !keysOnly(body, ["sessionId", "section", "key", "value", "reasoning", "userConfirmed", "confidence"]) ||
    !uuid(body.sessionId) || !text(body.section, 40) ||
    !SECTIONS.includes(body.section as Section) || !text(body.key, 100) ||
    !VALID_DECISION_KEYS[body.section as Section].includes(body.key) || !text(body.value) ||
    (body.reasoning !== undefined && body.reasoning !== null && !text(body.reasoning)) ||
    (body.userConfirmed !== undefined && typeof body.userConfirmed !== "boolean") ||
    (body.confidence !== undefined && !["decisive", "needs_discussion", "flagged"].includes(String(body.confidence)))
  ) return invalid();

  const access = await ownedSession(parsed.userId, body.sessionId);
  if (access.response) return access.response;
  const values = {
    value: body.value,
    reasoning: body.reasoning ?? null,
    user_confirmed: body.userConfirmed ?? false,
    confidence: body.confidence ?? "decisive",
    updated_at: new Date().toISOString(),
  };
  // Never update id, created_at, or the natural key. Updates match all three
  // natural-key columns inside the verified session. Inserts use DB defaults.
  const updateExisting = () => access.client
    .from("decisions")
    .update(values)
    .eq("session_id", body.sessionId)
    .eq("section", body.section)
    .eq("key", body.key)
    .select("*")
    .maybeSingle();
  const existing = await updateExisting();
  if (existing.error) return json({ error: "Could not save decision" }, 500);
  if (existing.data) return json({ decision: existing.data });

  const created = await access.client.from("decisions").insert({
    session_id: body.sessionId,
    section: body.section,
    key: body.key,
    ...values,
  }).select("*").single();
  if (!created.error && created.data) return json({ decision: created.data });

  // Two first saves may race at the existing unique(session_id,section,key)
  // constraint. Only that conflict class retries a scoped UPDATE, never a
  // global-id upsert or a write that moves an existing child to this session.
  if (created.error?.code === "23505") {
    const raced = await updateExisting();
    if (!raced.error && raced.data) return json({ decision: raced.data });
  }
  return json({ error: "Could not save decision" }, 500);
}

export async function updateDecision(request: Request) {
  const parsed = await authenticatedJson(request);
  if (parsed.response) return parsed.response;
  const body = parsed.body;
  if (!uuid(body.sessionId)) return invalid();

  if (body.confirmAll === true) {
    if (!keysOnly(body, ["sessionId", "confirmAll"])) return invalid();
    const access = await ownedSession(parsed.userId, body.sessionId);
    if (access.response) return access.response;
    const { data, error } = await access.client
      .from("decisions")
      .update({ user_confirmed: true, updated_at: new Date().toISOString() })
      .eq("session_id", body.sessionId)
      .select("*");
    if (error) return json({ error: "Could not confirm decisions" }, 500);
    return json({ decisions: data ?? [] });
  }

  if (
    !keysOnly(body, ["sessionId", "decisionId", "value", "userConfirmed"]) ||
    !uuid(body.decisionId) ||
    (body.value === undefined && body.userConfirmed === undefined) ||
    (body.value !== undefined && !text(body.value)) ||
    (body.userConfirmed !== undefined && typeof body.userConfirmed !== "boolean")
  ) return invalid();
  const access = await ownedSession(parsed.userId, body.sessionId);
  if (access.response) return access.response;
  const updates = {
    ...(body.value !== undefined ? { value: body.value } : {}),
    ...(body.userConfirmed !== undefined ? { user_confirmed: body.userConfirmed } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await access.client
    .from("decisions")
    .update(updates)
    .eq("id", body.decisionId)
    .eq("session_id", body.sessionId)
    .select("*")
    .maybeSingle();
  if (error) return json({ error: "Could not update decision" }, 500);
  if (!data) return json({ error: "Decision not found" }, 404);
  return json({ decision: data });
}

export async function readTranscript(request: Request) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!uuid(sessionId)) return invalid();
  const access = await ownedSession(userId, sessionId);
  if (access.response) return access.response;
  const { data, error } = await access.client
    .from("transcript_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp", { ascending: true });
  if (error) return json({ error: "Could not load transcript" }, 500);
  return json({ entries: data ?? [] });
}

export async function appendTranscript(request: Request) {
  const parsed = await authenticatedJson(request);
  if (parsed.response) return parsed.response;
  const body = parsed.body;
  if (
    !keysOnly(body, ["sessionId", "role", "content", "timestamp"]) ||
    !uuid(body.sessionId) || !["user", "ai"].includes(String(body.role)) ||
    !text(body.content) ||
    (body.timestamp !== undefined && (!text(body.timestamp, 80) || !Number.isFinite(Date.parse(body.timestamp))))
  ) return invalid();
  const access = await ownedSession(parsed.userId, body.sessionId);
  if (access.response) return access.response;
  const { data, error } = await access.client
    .from("transcript_entries")
    // Append only. The database supplies its id; no client id conflict can
    // overwrite or move another session's transcript entry.
    .insert({
      session_id: body.sessionId,
      role: body.role,
      content: body.content,
      timestamp: body.timestamp ?? new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) return json({ error: "Could not save transcript" }, 500);
  return json({ entry: data });
}
