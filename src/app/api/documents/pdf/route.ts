import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateAllDocuments } from "@/lib/documents/generator";
import { renderEstatePlanPdf } from "@/lib/documents/pdf";
import { isSessionPaid } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * GET /api/documents/pdf?sessionId=xxx
 * Returns a combined PDF of all estate-plan documents.
 * Gated behind a completed payment for the session.
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Payment gate
  if (!(await isSessionPaid(supabase, sessionId))) {
    return NextResponse.json(
      { error: "Payment required to download documents." },
      { status: 402 }
    );
  }

  const { data: decisions } = await supabase
    .from("decisions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const documents = generateAllDocuments(decisions ?? []);
  const pdf = await renderEstatePlanPdf(documents);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="WillBuddy_Estate_Plan.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
