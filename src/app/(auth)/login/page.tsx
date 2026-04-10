"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Check your email for the magic link!");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1
            className="text-3xl font-bold text-[#2D2A26]"
            style={{ fontFamily: "var(--font-heading), serif" }}
          >
            Welcome to WillBuddy
          </h1>
          <p className="mt-3 text-[#2D2A26]/70">
            Sign in with your email to get started with your estate plan.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2D2A26]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 block w-full rounded-lg border border-[#2D2A26]/20 bg-white px-4 py-3 text-[#2D2A26] placeholder:text-[#2D2A26]/40 focus:border-[#5B7A5E] focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5B7A5E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#4a6a4d] focus:outline-none focus:ring-2 focus:ring-[#5B7A5E]/50 focus:ring-offset-2 focus:ring-offset-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <div className="rounded-lg border border-[#5B7A5E]/30 bg-[#5B7A5E]/10 px-4 py-3 text-center text-sm text-[#5B7A5E]">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
