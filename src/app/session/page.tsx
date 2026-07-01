import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { resolvePlan } from "@/lib/sections/plan";
import { SECTION_LABELS, type Section, type Session } from "@/types";
import { StartPlanButton } from "@/components/session/StartPlanButton";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function SessionHomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  const list = (sessions as Session[]) ?? [];

  // First run (typically straight from onboarding): create a session and go.
  if (list.length === 0) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-[#FAF8F5] px-6 text-center">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
            Setting up your plan…
          </h1>
          <p className="mt-2 text-[#5B4F3E]">
            One moment while we open your first session.
          </p>
        </div>
        <StartPlanButton autoStart label="Start your plan" />
      </main>
    );
  }

  // Decision counts per session (one query for the answer-history badge).
  const countBySession: Record<string, number> = {};
  const { data: decisionRows } = await supabase
    .from("decisions")
    .select("session_id")
    .in(
      "session_id",
      list.map((s) => s.id)
    );
  for (const row of decisionRows ?? []) {
    const sid = (row as { session_id: string }).session_id;
    countBySession[sid] = (countBySession[sid] ?? 0) + 1;
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAF8F5]">
      <div className="flex items-center justify-between border-b border-[#E8E0D6] bg-white px-6 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-base font-bold text-[#2D2A26]"
        >
          WillBuddy
        </Link>
        <UserButton />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#2D2A26]">
              Your plans
            </h1>
            <p className="mt-1 text-[#9B8E7E]">
              Pick up where you left off, or start a fresh plan.
            </p>
          </div>
          <StartPlanButton label="Start a new plan" />
        </div>

        <ul className="flex flex-col gap-4">
          {list.map((session) => {
            const plan = resolvePlan(session.section_plan as Section[] | null);
            const completed = (session.sections_completed ?? []).filter((s) =>
              plan.includes(s as Section)
            );
            const pct = Math.round(
              (completed.length / Math.max(plan.length, 1)) * 100
            );
            const decisionCount = countBySession[session.id] ?? 0;
            const isComplete = session.status === "completed";

            return (
              <li
                key={session.id}
                className="rounded-2xl border border-[#E8E0D6] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isComplete
                            ? "bg-[#5B7A5E]/10 text-[#5B7A5E]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isComplete ? "Completed" : "In progress"}
                      </span>
                      <span className="text-xs text-[#9B8E7E]">
                        Started {formatDate(session.started_at)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#2D2A26]">
                      {plan.map((s) => SECTION_LABELS[s]).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-[#9B8E7E]">
                      {completed.length} of {plan.length} sections ·{" "}
                      {decisionCount} answer{decisionCount === 1 ? "" : "s"} saved
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {!isComplete && (
                        <Link
                          href={`/session/${session.id}`}
                          className="rounded-full bg-[#5B7A5E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4A6A4D]"
                        >
                          Resume
                        </Link>
                      )}
                      <Link
                        href={`/summary/${session.id}`}
                        className="rounded-full border border-[#E8E0D6] px-4 py-2 text-sm font-semibold text-[#5B7A5E] transition-colors hover:border-[#5B7A5E]/40 hover:bg-[#5B7A5E]/5"
                      >
                        {isComplete ? "Review & documents" : "View progress"}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E8E0D6]">
                  <div
                    className="h-full rounded-full bg-[#5B7A5E] transition-all"
                    style={{ width: `${Math.max(pct, isComplete ? 100 : 4)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
