"use client";

import { useState } from "react";
import type { DocType } from "@/types";
import { DOC_TYPE_LABELS } from "@/types";

interface SummaryClientProps {
  sessionId: string;
  documents: Record<DocType, string>;
  shareToken: string | null;
}

/**
 * Client component for download and share actions on the summary page.
 */
export function SummaryClient({
  sessionId,
  documents,
  shareToken: initialShareToken,
}: SummaryClientProps) {
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Download all documents as individual text files. */
  function handleDownloadAll() {
    for (const [docType, text] of Object.entries(documents) as [DocType, string][]) {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WillBuddy_${DOC_TYPE_LABELS[docType].replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /** Create a share link (or copy existing one). */
  async function handleShare() {
    if (shareToken) {
      await copyShareLink(shareToken);
      return;
    }

    setShareLoading(true);
    try {
      const res = await fetch("/api/documents/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create share link");
      }

      const { token } = await res.json();
      setShareToken(token);
      await copyShareLink(token);
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setShareLoading(false);
    }
  }

  async function copyShareLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={handleDownloadAll}
        className="inline-flex items-center justify-center gap-2 bg-[#5B7A5E] hover:bg-[#4A6A4D] text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5"
      >
        <DownloadIcon />
        Download All Documents
      </button>

      <button
        onClick={handleShare}
        disabled={shareLoading}
        className="inline-flex items-center justify-center gap-2 border-2 border-[#5B7A5E] text-[#5B7A5E] hover:bg-[#5B7A5E]/5 font-semibold px-8 py-3.5 rounded-full transition-colors disabled:opacity-50"
      >
        <ShareIcon />
        {copied
          ? "Link Copied!"
          : shareLoading
            ? "Creating Link..."
            : shareToken
              ? "Copy Share Link"
              : "Share with Attorney"}
      </button>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="w-5 h-5"
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

function ShareIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}
