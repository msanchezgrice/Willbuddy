import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { DocType } from "@/types";

const DOC_TYPES: DocType[] = [
  "will",
  "guardianship",
  "medical_poa",
  "durable_poa",
  "hipaa",
];

const SHARE_EXPIRY_DAYS = 30;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const body = await request.json();
    const { sessionId } = body as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const shareToken = crypto.randomUUID();
    const shareExpiresAt = new Date(
      Date.now() + SHARE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    // Upsert a document row for each doc type with the share token
    for (const docType of DOC_TYPES) {
      const { error: upsertError } = await supabase
        .from("documents")
        .upsert(
          {
            session_id: sessionId,
            doc_type: docType,
            share_token: shareToken,
            share_expires_at: shareExpiresAt,
          },
          { onConflict: "session_id,doc_type" }
        );

      if (upsertError) {
        console.error(
          `[share] Failed to upsert document (${docType}):`,
          upsertError
        );
        return NextResponse.json(
          { error: "Failed to create share link" },
          { status: 500 }
        );
      }
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

    return NextResponse.json({ shareToken, shareUrl });
  } catch (err) {
    console.error("[share] Error:", err);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "token query parameter is required" },
        { status: 400 }
      );
    }

    // No auth required — public access via share token
    const supabase = createServiceClient();

    // Find any document with this share token
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("session_id, share_token, share_expires_at")
      .eq("share_token", token)
      .limit(1)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    // Check expiry
    if (
      doc.share_expires_at &&
      new Date(doc.share_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 }
      );
    }

    // Load decisions for the shared session
    const { data: decisions, error: decisionsError } = await supabase
      .from("decisions")
      .select("section, key, value, confidence")
      .eq("session_id", doc.session_id)
      .order("section");

    if (decisionsError) {
      console.error("[share] Failed to load decisions:", decisionsError);
      return NextResponse.json(
        { error: "Failed to load shared data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: doc.session_id,
      decisions: decisions ?? [],
    });
  } catch (err) {
    console.error("[share] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load share" },
      { status: 500 }
    );
  }
}
