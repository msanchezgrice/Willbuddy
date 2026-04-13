"use client";

import { useState } from "react";

interface Props {
  sessionId: string;
  existingCoupleSessionId: string | null;
  existingInviteToken: string | null;
}

/**
 * Summary-page CTA that creates a couple invite and lets the user copy the
 * link to send to their partner. Shown even after the solo session is done,
 * so couples can "upgrade" to async comparison any time.
 */
export function CoupleInvite({
  sessionId,
  existingCoupleSessionId,
  existingInviteToken,
}: Props) {
  const [coupleId, setCoupleId] = useState<string | null>(existingCoupleSessionId);
  const [token, setToken] = useState<string | null>(existingInviteToken);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/couple/join/${token}`
      : null;

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/couple/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email: partnerEmail.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not create invite.");
        setBusy(false);
        return;
      }
      setToken(json.coupleSession.invite_token);
      setCoupleId(json.coupleSession.id);
      if (partnerEmail.trim()) setEmailSent(true);
    } catch (e) {
      console.error("[couple-invite] error", e);
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Long-press the link to copy manually.");
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[#E8E0D6] bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
        Couple mode
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
        Invite your partner to compare answers
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">
        Send them a link. They&apos;ll do their own 25-minute session, then
        we&apos;ll show you where you agree and where to talk it through. No
        45-minute marathon, no lawyer clock.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!token ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="partner@example.com (optional)"
            className="flex-1 rounded-xl border border-[#E8E0D6] bg-white px-4 py-3 text-sm text-[#2D2A26] placeholder:text-[#9B8E7E] focus:border-[#5B7A5E] focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/20"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            className="rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a6a4e] disabled:opacity-60"
          >
            {busy
              ? "Creating..."
              : partnerEmail.trim()
                ? "Send invite"
                : "Generate link"}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {emailSent && (
            <p className="rounded-lg bg-[#5B7A5E]/10 px-3 py-2 text-sm text-[#5B7A5E]">
              Invite email sent. The link is also below if you want to share it another way.
            </p>
          )}
          <div className="flex items-center gap-3 rounded-xl border border-[#E8E0D6] bg-[#FAF8F5] px-4 py-3">
            <code className="flex-1 truncate text-xs text-[#2D2A26]">
              {inviteUrl}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-[#5B7A5E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4a6a4e]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {coupleId && (
            <a
              href={`/couple/compare/${coupleId}`}
              className="inline-block text-sm font-semibold text-[#5B7A5E] underline underline-offset-2"
            >
              View comparison →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
