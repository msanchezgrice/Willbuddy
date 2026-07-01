"use client";

import { useState } from "react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";
import type { DocType } from "@/types";
import { DOC_TYPE_FILENAMES } from "@/types";

interface DocumentDownloadButtonProps {
  sessionId: string;
  docType: DocType;
  label: string;
  isPaid: boolean;
  variant?: "card" | "inline";
}

export function DocumentDownloadButton({
  sessionId,
  docType,
  label,
  isPaid,
  variant = "card",
}: DocumentDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isPaid) return null;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/documents/pdf?sessionId=${sessionId}&docType=${docType}`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = DOC_TYPE_FILENAMES[docType];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      captureAnalyticsEvent("document_downloaded", {
        session_id: sessionId,
        doc_type: docType,
      });
    } catch (err) {
      console.error("[summary] single doc download error", err);
    } finally {
      setDownloading(false);
    }
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="text-sm font-medium text-[#5B7A5E] underline-offset-2 hover:underline disabled:opacity-60"
      >
        {downloading ? "Preparing…" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D6] px-3 py-1.5 text-xs font-semibold text-[#5B7A5E] transition-colors hover:border-[#5B7A5E]/40 hover:bg-[#5B7A5E]/5 disabled:opacity-60"
    >
      <DownloadIcon />
      {downloading ? "Preparing…" : "Download PDF"}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
