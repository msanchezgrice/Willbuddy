"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  token: string;
  primaryName: string;
  alreadyJoined: boolean;
}

export function JoinInviteClient({ token, primaryName, alreadyJoined }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/couple/join/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not join — please try again.");
        setBusy(false);
        return;
      }
      router.push("/session");
    } catch (e) {
      console.error("[couple/join] client error", e);
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E0D6] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5B7A5E]">
          {alreadyJoined ? "Welcome back" : "You're invited"}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          {alreadyJoined
            ? `Continue your session with ${primaryName}`
            : `${primaryName} wants to plan your estate together`}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#5A5550]">
          You&apos;ll do your own 15-minute voice session with WillBuddy. When
          you&apos;re done, we&apos;ll show you where you and {primaryName}{" "}
          agree and where you need to talk. Take your time — there&apos;s no
          lawyer clock ticking.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a6a4e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? "Setting up your session..."
            : alreadyJoined
              ? "Continue my session"
              : "Start my session"}
        </button>
      </div>
    </main>
  );
}
