import { NextRequest, NextResponse } from "next/server";
import { getDocumentsByShareToken } from "@/lib/documents/share-access";
import {
  renderDocumentPdf,
  renderEstatePlanPdf,
} from "@/lib/documents/pdf";
import { renderEstatePlanZip } from "@/lib/documents/pdf-bundle";
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

  const { documents } = access;

  if (format === "zip") {
    const zip = await renderEstatePlanZip(documents);
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
    const pdf = await renderDocumentPdf(docTypeParam, documents[docTypeParam]);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${DOC_TYPE_FILENAMES[docTypeParam]}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

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
