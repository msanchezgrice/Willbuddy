import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateAllDocuments } from "@/lib/documents/generator";
import { pickPlanDocuments, resolvePlan } from "@/lib/sections/plan";
import type { Section } from "@/types";

/**
 * POST /api/documents
 * Generate all estate planning documents for a completed session.
 *
 * Body: { sessionId: string }
 * Returns only the documents included in the session's tailored plan.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Parse body
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

  // Load the session and verify ownership
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  // Session must be confirmed by the user before generating documents
  if (!session.user_confirmed) {
    return NextResponse.json(
      {
        error:
          "Session has not been confirmed. Please review and confirm your decisions before generating documents.",
      },
      { status: 403 }
    );
  }

  // Load all decisions for this session
  const { data: decisions, error: decisionsError } = await supabase
    .from("decisions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (decisionsError) {
    return NextResponse.json(
      { error: "Failed to load decisions" },
      { status: 500 }
    );
  }

  // Generate all documents
  const sectionPlan = resolvePlan(session.section_plan as Section[] | null);
  const documents = pickPlanDocuments(
    generateAllDocuments(decisions ?? [], { sectionPlan }),
    sectionPlan
  );

  return NextResponse.json({ documents });
}
