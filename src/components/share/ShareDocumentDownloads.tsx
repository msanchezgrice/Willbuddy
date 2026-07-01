"use client";

import { useState } from "react";
import { DOC_TYPE_LABELS, DOC_TYPE_FILENAMES, type DocType } from "@/types";

interface ShareDocumentDownloadsProps {
  token: string;
}

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

/**
 * PDF download actions for the public attorney share page.
 */
export function ShareDocumentDownloads({ token }: ShareDocumentDownloadsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/share/${token}/pdf`;

  async function handleDownload(
    key: string,
    url: string,
    filename: string
  ) {
    setLoading(key);
    setError(null);
    try {
      await downloadBlob(url, filename);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-[#E8E0D6] bg-white p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5B4F3E] mb-2">
        Download Documents
      </h2>
      <p className="text-sm text-[#9B8E7E] mb-5">
        Download as one combined PDF, five separate PDFs, or a ZIP of all
        documents.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            handleDownload("all", base, "WillBuddy_Estate_Plan.pdf")
          }
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5B7A5E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A6A4D] disabled:opacity-60"
        >
          {loading === "all" ? "Preparing…" : "All in One PDF"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            handleDownload(
              "zip",
              `${base}?format=zip`,
              "WillBuddy_Estate_Plan_Documents.zip"
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5B7A5E] px-5 py-2.5 text-sm font-semibold text-[#5B7A5E] transition-colors hover:bg-[#5B7A5E]/5 disabled:opacity-60"
        >
          {loading === "zip" ? "Preparing…" : "ZIP (5 separate PDFs)"}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((docType) => (
          <button
            key={docType}
            type="button"
            disabled={loading !== null}
            onClick={() =>
              handleDownload(
                docType,
                `${base}?docType=${docType}`,
                DOC_TYPE_FILENAMES[docType]
              )
            }
            className="flex items-center justify-between rounded-lg border border-[#E8E0D6] px-4 py-2.5 text-left text-sm text-[#5B4F3E] transition-colors hover:border-[#5B7A5E]/40 hover:bg-[#FAF8F5] disabled:opacity-60"
          >
            <span>{DOC_TYPE_LABELS[docType]}</span>
            <span className="text-xs font-medium text-[#5B7A5E]">
              {loading === docType ? "…" : "PDF ↓"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
