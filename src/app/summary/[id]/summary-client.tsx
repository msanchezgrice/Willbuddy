"use client";

import { useEffect, useRef, useState } from "react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

interface SummaryActionsProps {
  sessionId: string;
  isPaid: boolean;
  justPaid: boolean;
  shareToken: string | null;
  /** Human labels for the documents this session's plan produces. */
  docLabels: string[];
}

/**
 * Client component for the paywall + download/share actions on the summary page.
 * When the session is unpaid, we show an unlock CTA that starts Stripe Checkout.
 * When paid, we show the PDF download and attorney-share actions.
 */
export function SummaryActions({
  sessionId,
  isPaid,
  justPaid,
  shareToken: initialShareToken,
  docLabels,
}: SummaryActionsProps) {
  const docCount = docLabels.length;
  const docCountLabel =
    docCount === 1 ? "1 document" : `${docCount} documents`;
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paidTracked = useRef(false);

  // Fire the funnel-completing event exactly once when the user just paid.
  useEffect(() => {
    if (justPaid && !paidTracked.current) {
      paidTracked.current = true;
      captureAnalyticsEvent("payment_completed", { session_id: sessionId });
    }
  }, [justPaid, sessionId]);

  async function handleUnlock() {
    setCheckoutLoading(true);
    setError(null);
    captureAnalyticsEvent("checkout_started", { session_id: sessionId });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not start checkout");
      }
      window.location.href = json.url;
    } catch (err) {
      console.error("[summary] checkout error", err);
      setError("Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }

  async function handleDownloadPdf() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/pdf?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "WillBuddy_Estate_Plan.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      captureAnalyticsEvent("document_downloaded", { session_id: sessionId });
    } catch (err) {
      console.error("[summary] download error", err);
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadZip() {
    setDownloadingZip(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/documents/pdf?sessionId=${sessionId}&format=zip`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "WillBuddy_Estate_Plan_Documents.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      captureAnalyticsEvent("document_downloaded", {
        session_id: sessionId,
        format: "zip",
      });
    } catch (err) {
      console.error("[summary] zip download error", err);
      setError("Download failed. Please try again.");
    } finally {
      setDownloadingZip(false);
    }
  }

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
      if (!res.ok) throw new Error("Failed to create share link");
      const { token } = await res.json();
      setShareToken(token);
      await copyShareLink(token);
    } catch (err) {
      console.error("Share error:", err);
      setError("Could not create a share link. Please try again.");
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

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8E0D6] bg-white p-8 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-2">
          <LockIcon />
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
            Your documents are ready
          </p>
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          Unlock your complete estate plan
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5A5550]">
          Download your {docCountLabel} as a single PDF you can bring to any
          Texas estate attorney to finalize and sign.
        </p>
        <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm text-[#5A5550]">
          {[
            docLabels.join(", "),
            docCount > 1
              ? `Combined PDF or ZIP of ${docCount} separate PDFs`
              : "Downloadable PDF",
            "Shareable link for your attorney",
            "Free to revisit and update your answers",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleUnlock}
          disabled={checkoutLoading}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#5B7A5E] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A6A4D] disabled:opacity-60"
        >
          {checkoutLoading ? "Starting checkout…" : "Unlock documents — $49"}
        </button>
        <p className="mt-3 text-xs text-[#9B8E7E]">
          One-time payment · Secure checkout by Stripe
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {justPaid && (
        <p className="rounded-lg bg-[#5B7A5E]/10 px-4 py-2 text-sm font-medium text-[#5B7A5E]">
          Payment received — your documents are unlocked. Thank you!
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading || downloadingZip}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5B7A5E] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A6A4D] disabled:opacity-60"
        >
          <DownloadIcon />
          {downloading
            ? "Preparing PDF…"
            : docCount > 1
              ? "Download All (One PDF)"
              : "Download PDF"}
        </button>

        {docCount > 1 && (
          <button
            onClick={handleDownloadZip}
            disabled={downloading || downloadingZip}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5B7A5E] px-8 py-3.5 font-semibold text-[#5B7A5E] transition-colors hover:bg-[#5B7A5E]/5 disabled:opacity-60"
          >
            <DownloadIcon />
            {downloadingZip ? "Preparing ZIP…" : `Download ZIP (${docCount} PDFs)`}
          </button>
        )}

        <button
          onClick={handleShare}
          disabled={shareLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#5B7A5E] px-8 py-3.5 font-semibold text-[#5B7A5E] transition-colors hover:bg-[#5B7A5E]/5 disabled:opacity-50"
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
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 text-[#5B7A5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7A5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
