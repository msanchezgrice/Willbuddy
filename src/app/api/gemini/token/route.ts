import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[gemini/token] No authenticated user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[gemini/token] Authenticated user:", user.email);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[gemini/token] GEMINI_API_KEY not set");
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  // Ensure profile exists (required FK for sessions)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: user.id, full_name: user.user_metadata?.full_name ?? null });
    if (profileError) {
      console.error("[gemini/token] Failed to create profile:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }
  }

  // Create or resume a session
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  let sessionId: string;

  if (existingSession) {
    sessionId = existingSession.id;
  } else {
    const { data: newSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (sessionError || !newSession) {
      console.error("[gemini/token] Failed to create session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
    sessionId = newSession.id;
  }

  // MVP: return API key directly. V2: mint ephemeral scoped token.
  return NextResponse.json({ token: apiKey, sessionId });
}
