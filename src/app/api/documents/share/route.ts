import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

/**
 * POST /api/documents/share
 * Create a share token for a session's documents (expires in 30 days).
 *
 * Body: { sessionId: string }
 * Returns: { token: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { sessionId } = body;
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  // Verify user owns the session
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  // Check if a share token already exists for this session
  const { data: existingDoc } = await supabase
    .from("documents")
    .select("share_token")
    .eq("session_id", sessionId)
    .not("share_token", "is", null)
    .limit(1)
    .single();

  if (existingDoc?.share_token) {
    return NextResponse.json({ token: existingDoc.share_token });
  }

  // Generate a new share token (30-day expiry)
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Update all documents for this session with the share token
  const { error } = await supabase
    .from("documents")
    .update({
      share_token: token,
      share_expires_at: expiresAt.toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    // If no documents exist yet, create a placeholder row
    const { error: insertError } = await supabase.from("documents").insert({
      session_id: sessionId,
      doc_type: "will",
      share_token: token,
      share_expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create share link" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ token });
}
