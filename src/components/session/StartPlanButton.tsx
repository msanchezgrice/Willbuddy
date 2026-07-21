"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StartPlanButtonProps {
  /** Auto-create a session on mount (used for the seamless first-run). */
  autoStart?: boolean;
  label?: string;
  className?: string;
}

/**
 * Creates a fresh session and routes into it. The tailored plan (from the
 * onboarding "what to cover" step, stored in localStorage) is applied by the
 * VoiceProvider once the session connects.
 */
export function StartPlanButton({
  autoStart = false,
  label = "Start a new plan",
  className,
}: StartPlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(autoStart);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function start() {
    if (started.current) return;
    started.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.session?.id) {
        throw new Error(json.error ?? "Could not start a session");
      }
      router.push(`/session/${json.session.id}`);
    } catch (err) {
      console.error("[session] start error", err);
      setError("Could not start a session. Please try again.");
      setLoading(false);
      started.current = false;
    }
  }

  useEffect(() => {
    if (autoStart) void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        data-testid="cta-start-plan"
        data-agent-action="start-plan"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full bg-[#5B7A5E] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#5B7A5E]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A6A4D] disabled:opacity-60",
          className
        )}
      >
        {loading ? "Starting…" : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
