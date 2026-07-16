"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SummaryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Could not open plan review:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF8F5] px-6 text-center">
      <section className="w-full max-w-lg rounded-3xl border border-[#D8CDBF] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7A5E]">
          Your answers are safe
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          We couldn’t open the review screen.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5B4F3E]">
          This can happen after a connection change. Try opening the saved plan
          again; you won’t need to repeat your answers.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-full bg-[#5B7A5E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4A6A4D]"
          >
            Try review again
          </button>
          <Link
            href="/session"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D8CDBF] px-6 py-2.5 text-sm font-semibold text-[#5B4F3E] hover:border-[#5B7A5E]"
          >
            Go to my plans
          </Link>
        </div>
      </section>
    </main>
  );
}
