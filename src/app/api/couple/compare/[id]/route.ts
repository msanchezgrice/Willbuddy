import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { compareDecisions } from "@/lib/couple/compare";
import type { Decision } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/couple/compare/[id]
 * Returns both partners' decisions + agreements/disagreements/only-one arrays.
 * Either partner (verified via Clerk userId against either session) may view it.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: couple } = await supabase
    .from("couple_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!couple) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [primaryRes, partnerRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("id", couple.primary_session_id)
      .single(),
    couple.partner_session_id
      ? supabase
          .from("sessions")
          .select("*")
          .eq("id", couple.partner_session_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const primarySession = primaryRes.data;
  const partnerSession = partnerRes.data;

  // Access control: caller must own one of the two sessions
  const isPrimary = primarySession?.user_id === userId;
  const isPartner = partnerSession?.user_id === userId;
  if (!isPrimary && !isPartner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [primaryDecisionsRes, partnerDecisionsRes] = await Promise.all([
    supabase
      .from("decisions")
      .select("*")
      .eq("session_id", couple.primary_session_id)
      .order("created_at", { ascending: true }),
    partnerSession
      ? supabase
          .from("decisions")
          .select("*")
          .eq("session_id", partnerSession.id)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const primaryDecisions = (primaryDecisionsRes.data ?? []) as Decision[];
  const partnerDecisions = (partnerDecisionsRes.data ?? []) as Decision[];

  const comparison = compareDecisions(primaryDecisions, partnerDecisions);

  return NextResponse.json({
    coupleSession: couple,
    primarySession,
    partnerSession,
    primaryDecisions,
    partnerDecisions,
    comparison,
    viewerRole: isPrimary ? "primary" : "partner",
  });
}
