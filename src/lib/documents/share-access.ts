import { createServiceClient } from "@/lib/supabase/server";
import { generateAllDocuments } from "@/lib/documents/generator";
import { resolvePlan } from "@/lib/sections/plan";
import type { Decision, DocType, Section } from "@/types";

export type ShareAccessResult =
  | {
      ok: true;
      sessionId: string;
      decisions: Decision[];
      documents: Record<DocType, string>;
      sectionPlan: Section[];
    }
  | { ok: false; reason: "not_found" | "expired" };

/** Load session documents via a public share token (no auth). */
export async function getDocumentsByShareToken(
  token: string
): Promise<ShareAccessResult> {
  const supabase = createServiceClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("session_id, share_expires_at")
    .eq("share_token", token)
    .limit(1)
    .single();

  if (!doc) {
    return { ok: false, reason: "not_found" };
  }

  if (doc.share_expires_at && new Date(doc.share_expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, section_plan")
    .eq("id", doc.session_id)
    .single();

  if (!session) {
    return { ok: false, reason: "not_found" };
  }

  const { data: decisions } = await supabase
    .from("decisions")
    .select("*")
    .eq("session_id", doc.session_id)
    .order("created_at", { ascending: true });

  const allDecisions = (decisions as Decision[]) ?? [];
  const sectionPlan = resolvePlan(session.section_plan as Section[] | null);

  return {
    ok: true,
    sessionId: doc.session_id,
    decisions: allDecisions,
    documents: generateAllDocuments(allDecisions, { sectionPlan }),
    sectionPlan,
  };
}
