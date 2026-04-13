import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/couple/join/[token]
 * Returns the couple_session info for the given invite token (no auth required —
 * the join page uses this to show a welcome/confirm screen).
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: couple } = await supabase
    .from("couple_sessions")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (!couple) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (couple.invite_expires_at && new Date(couple.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  return NextResponse.json({ coupleSession: couple });
}

/**
 * POST /api/couple/join/[token]
 * Partner (authenticated via Clerk) accepts the invite. Creates their session,
 * links it to the couple_session as partner_session_id, returns the new session.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: couple } = await supabase
    .from("couple_sessions")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (!couple) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (couple.invite_expires_at && new Date(couple.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Block the primary user from joining their own invite
  const { data: primarySession } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("id", couple.primary_session_id)
    .single();

  if (primarySession?.user_id === userId) {
    return NextResponse.json(
      { error: "You can't join your own invite. Share this link with your partner." },
      { status: 400 }
    );
  }

  // If the partner already joined, return their existing session
  if (couple.partner_session_id) {
    const { data: existingPartner } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", couple.partner_session_id)
      .single();
    if (existingPartner && existingPartner.user_id === userId) {
      return NextResponse.json({ session: existingPartner, coupleSession: couple });
    }
    return NextResponse.json(
      { error: "This invite has already been claimed." },
      { status: 409 }
    );
  }

  // Ensure partner profile row exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  if (!profile) {
    await supabase.from("profiles").insert({ id: userId, full_name: null });
  }

  // Create partner session linked to the couple
  const { data: partnerSession, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      mode: "couple_async",
      couple_session_id: couple.id,
    })
    .select("*")
    .single();

  if (sessionError || !partnerSession) {
    console.error("[couple/join] session create failed", sessionError);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

  // Link back to couple_sessions
  const { error: linkError } = await supabase
    .from("couple_sessions")
    .update({
      partner_session_id: partnerSession.id,
      status: "comparing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", couple.id);

  if (linkError) {
    console.error("[couple/join] couple link failed", linkError);
  }

  return NextResponse.json({ session: partnerSession, coupleSession: couple });
}
