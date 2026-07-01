import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateAllDocuments } from "@/lib/documents/generator";
import { renderDocumentPdf, renderEstatePlanPdf } from "@/lib/documents/pdf";
import { renderEstatePlanZip } from "@/lib/documents/pdf-bundle";
import { pickPlanDocuments, resolvePlan } from "@/lib/sections/plan";
import { DOC_TYPE_FILENAMES } from "@/types";
import { isSessionPaid } from "@/lib/payments";
import type { DocType, Section } from "@/types";
import { DOC_TYPE_LABELS } from "@/types";

export const runtime = "nodejs";

const DOC_TYPES = Object.keys(DOC_TYPE_LABELS) as DocType[];

function isDocType(value: string | null): value is DocType {
  return value !== null && DOC_TYPES.includes(value as DocType);
}

/**
 * GET /api/documents/pdf?sessionId=xxx
 * GET /api/documents/pdf?sessionId=xxx&docType=will
 * GET /api/documents/pdf?sessionId=xxx&format=zip
 *
 * Returns a combined PDF (or ZIP) of the in-plan documents, or a single
 * document when docType is set. Gated behind a completed payment, and scoped to
 * the session's tailored section plan.
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const docTypeParam = request.nextUrl.searchParams.get("docType");
  const format = request.nextUrl.searchParams.get("format");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  if (docTypeParam && !isDocType(docTypeParam)) {
    return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
  }

  if (format && format !== "zip") {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, section_plan")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const plan = resolvePlan(session.section_plan as Section[] | null);
  const planDocs = pickPlanDocuments(
    generateAllDocuments(decisions ?? []),
    plan
  );

  if (format === "zip") {
    const zip = await renderEstatePlanZip(planDocs);
    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="WillBuddy_Estate_Plan_Documents.zip"',
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (isDocType(docTypeParam)) {
    // Don't serve a document the tailored plan didn't produce.
    if (!(docTypeParam in planDocs)) {
      return NextResponse.json(
        { error: "Document not in plan" },
        { status: 404 }
      );
    }
    const pdf = await renderDocumentPdf(docTypeParam, planDocs[docTypeParam]!);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${DOC_TYPE_FILENAMES[docTypeParam]}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const pdf = await renderEstatePlanPdf(planDocs);

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
