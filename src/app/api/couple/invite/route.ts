import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/couple/invite
 * Body: { sessionId: string, email?: string }
 * Creates (or returns existing) couple_session for the caller's session and
 * returns the invite URL that the partner can open.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sessionId, email } = body ?? {};
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Verify the session belongs to the caller
  const { data: session } = await supabase
    .from("sessions")
    .select("id, user_id, couple_session_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Re-use an existing couple_session if one already exists for this primary
  if (session.couple_session_id) {
    const { data: existing } = await supabase
      .from("couple_sessions")
      .select("*")
      .eq("id", session.couple_session_id)
      .single();
    if (existing) {
      return NextResponse.json({
        coupleSession: existing,
        inviteUrl: buildInviteUrl(request, existing.invite_token),
      });
    }
  }

  // Generate 32-char url-safe token
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 14
  ).toISOString(); // 14 days

  const { data: coupleSession, error: insertError } = await supabase
    .from("couple_sessions")
    .insert({
      primary_session_id: sessionId,
      invite_token: token,
      invite_email: email ?? null,
      invite_expires_at: expiresAt,
      status: "awaiting_partner",
    })
    .select("*")
    .single();

  if (insertError || !coupleSession) {
    console.error("[couple/invite] insert failed", insertError);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  // Link session to couple_session and mark as couple_async mode
  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      couple_session_id: coupleSession.id,
      mode: "couple_async",
    })
    .eq("id", sessionId);

  if (updateError) {
    console.error("[couple/invite] session link failed", updateError);
  }

  return NextResponse.json({
    coupleSession,
    inviteUrl: buildInviteUrl(request, token),
  });
}

function buildInviteUrl(request: NextRequest, token: string): string {
  const origin =
    request.headers.get("origin") ??
    `https://${request.headers.get("host") ?? "willbuddy.app"}`;
  return `${origin}/couple/join/${token}`;
}
