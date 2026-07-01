import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { captureServerEvent } from "@/lib/analytics/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Section } from "@/types";

/**
 * GET /api/session - Get the user's active session (or most recent)
 * GET /api/session?id=xxx - Get a specific session with decisions + recent transcript
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const sessionId = request.nextUrl.searchParams.get("id");

  if (sessionId) {
    // Load specific session with full context for resume
    const [sessionResult, decisionsResult, transcriptResult, flagsResult] =
      await Promise.all([
        supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .single(),
        supabase
          .from("decisions")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
        supabase
          .from("transcript_entries")
          .select("*")
          .eq("session_id", sessionId)
          .order("timestamp", { ascending: false })
          .limit(10),
        supabase
          .from("flagged_items")
          .select("*")
          .eq("session_id", sessionId)
          .eq("resolved", false),
      ]);

    if (sessionResult.error || !sessionResult.data) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: sessionResult.data,
      decisions: decisionsResult.data ?? [],
      recentTranscript: (transcriptResult.data ?? []).reverse(),
      flaggedItems: flagsResult.data ?? [],
    });
  }

  // Find active session
  const { data: activeSession } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ session: activeSession ?? null });
}

/**
 * POST /api/session - Create a new session
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Ensure profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: userId,
      full_name: null,
    });
    void captureServerEvent("signup_completed", userId, {
      source: "api_session_profile_inserted",
    });
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ session });
}

/**
 * PATCH /api/session - Update session state
 * Body: { sessionId, currentSection?, sectionsCompleted?, status?, geminiResumeHandle?, onboarding?, sectionPlan?, goals?, userConfirmed? }
 */
export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const body = await request.json();
  const { sessionId, ...updates } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400 }
    );
  }

  // Map camelCase to snake_case for Supabase
  const dbUpdates: Record<string, unknown> = {};
  if (updates.currentSection !== undefined)
    dbUpdates.current_section = updates.currentSection as Section;
  if (updates.sectionsCompleted !== undefined)
    dbUpdates.sections_completed = updates.sectionsCompleted;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.geminiResumeHandle !== undefined)
    dbUpdates.gemini_resume_handle = updates.geminiResumeHandle;
  if (updates.onboarding !== undefined)
    dbUpdates.onboarding = updates.onboarding;
  if (updates.sectionPlan !== undefined)
    dbUpdates.section_plan = updates.sectionPlan;
  if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
  if (updates.userConfirmed !== undefined)
    dbUpdates.user_confirmed = updates.userConfirmed;
  if (updates.status === "completed")
    dbUpdates.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("sessions")
    .update(dbUpdates)
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
