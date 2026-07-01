import { NextRequest, NextResponse } from "next/server";
import { getDocumentsByShareToken } from "@/lib/documents/share-access";
import {
  renderDocumentPdf,
  renderEstatePlanPdf,
} from "@/lib/documents/pdf";
import { renderEstatePlanZip } from "@/lib/documents/pdf-bundle";
import { pickPlanDocuments } from "@/lib/sections/plan";
import { DOC_TYPE_FILENAMES, DOC_TYPE_LABELS } from "@/types";
import type { DocType } from "@/types";

export const runtime = "nodejs";

const DOC_TYPES = Object.keys(DOC_TYPE_LABELS) as DocType[];

function isDocType(value: string | null): value is DocType {
  return value !== null && DOC_TYPES.includes(value as DocType);
}

/**
 * GET /api/share/[token]/pdf
 * GET /api/share/[token]/pdf?docType=will
 * GET /api/share/[token]/pdf?format=zip
 *
 * Public PDF downloads for attorney share links (token-gated, no auth).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const docTypeParam = request.nextUrl.searchParams.get("docType");
  const format = request.nextUrl.searchParams.get("format");

  if (docTypeParam && !isDocType(docTypeParam)) {
    return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
  }

  if (format && format !== "zip") {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const access = await getDocumentsByShareToken(token);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "expired" ? "Link expired" : "Not found" },
      { status: access.reason === "expired" ? 410 : 404 }
    );
  }

  const { documents, sectionPlan } = access;
  const planDocs = pickPlanDocuments(documents, sectionPlan);

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
    if (!(docTypeParam in planDocs)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
