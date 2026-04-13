import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { compareDecisions } from "@/lib/couple/compare";
import { SECTION_LABELS, type Decision, type Section } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoupleComparePage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/couple/compare/${id}`)}`);
  }

  const supabase = createServiceClient();

  const { data: couple } = await supabase
    .from("couple_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!couple) {
    return <NotFoundState />;
  }

  const [primaryRes, partnerRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("id", couple.primary_session_id)
      .single(),
    couple.partner_session_id
      ? supabase
          .from("sessions")
          .select("*")
          .eq("id", couple.partner_session_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const primarySession = primaryRes.data;
  const partnerSession = partnerRes.data;

  const isPrimary = primarySession?.user_id === userId;
  const isPartner = partnerSession?.user_id === userId;
  if (!isPrimary && !isPartner) {
    return <NotFoundState />;
  }

  // If the partner hasn't completed their session yet, show the waiting state
  if (!partnerSession) {
    return <WaitingState coupleToken={couple.invite_token} />;
  }

  const [primaryDecisionsRes, partnerDecisionsRes] = await Promise.all([
    supabase
      .from("decisions")
      .select("*")
      .eq("session_id", couple.primary_session_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("decisions")
      .select("*")
      .eq("session_id", partnerSession.id)
      .order("created_at", { ascending: true }),
  ]);

  const primaryDecisions = (primaryDecisionsRes.data ?? []) as Decision[];
  const partnerDecisions = (partnerDecisionsRes.data ?? []) as Decision[];

  const comparison = compareDecisions(primaryDecisions, partnerDecisions);

  const primaryName = await getName(supabase, primarySession?.user_id);
  const partnerName = await getName(supabase, partnerSession.user_id);

  const youName = isPrimary ? primaryName : partnerName;
  const themName = isPrimary ? partnerName : primaryName;

  // For display, always show viewer's side on the LEFT
  const yourDecisions = isPrimary ? primaryDecisions : partnerDecisions;
  const theirDecisions = isPrimary ? partnerDecisions : primaryDecisions;
  void yourDecisions;
  void theirDecisions;

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Hero */}
      <div className="bg-[#5B7A5E] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Couple Comparison
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold md:text-4xl">
            You and {themName} agreed on {comparison.agreements.length} of{" "}
            {comparison.totalKeys} decisions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
            {comparison.disagreements.length === 0
              ? "You're fully aligned. Ready to finalize your documents."
              : `${comparison.disagreements.length} need${comparison.disagreements.length === 1 ? "" : "s"} discussion. Takes about 10 minutes to talk through together.`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Disagreements — the hero of this page */}
        {comparison.disagreements.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-baseline gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                !
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
                Needs discussion ({comparison.disagreements.length})
              </h2>
            </div>
            <div className="space-y-4">
              {comparison.disagreements.map((d) => (
                <DisagreementCard
                  key={`${d.section}.${d.key}`}
                  section={d.section}
                  keyName={d.key}
                  yours={isPrimary ? d.primary : d.partner}
                  theirs={isPrimary ? d.partner : d.primary}
                  youName={youName}
                  themName={themName}
                />
              ))}
            </div>
          </section>
        )}

        {/* Only one answered */}
        {comparison.onlyOneAnswered.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-baseline gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                ?
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
                Only one of you answered ({comparison.onlyOneAnswered.length})
              </h2>
            </div>
            <div className="space-y-3">
              {comparison.onlyOneAnswered.map((o) => {
                const youAnswered = isPrimary ? o.who === "primary" : o.who === "partner";
                return (
                  <div
                    key={`${o.section}.${o.key}`}
                    className="rounded-xl border border-[#E8E0D6] bg-white p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9B8E7E]">
                      {SECTION_LABELS[o.section as Section]} · {formatKey(o.key)}
                    </p>
                    <p className="mt-1 text-sm text-[#2D2A26]">
                      <span className="font-semibold">
                        {youAnswered ? youName : themName}:
                      </span>{" "}
                      {o.decision.value}
                    </p>
                    {o.decision.reasoning && (
                      <p className="mt-1 text-xs italic text-[#5A5550]">
                        “{o.decision.reasoning}”
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Agreements (collapsed by default) */}
        {comparison.agreements.length > 0 && (
          <section className="mb-12">
            <details className="rounded-2xl border border-[#E8E0D6] bg-white">
              <summary className="flex cursor-pointer items-center gap-3 px-6 py-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#5B7A5E]/10 text-[#5B7A5E]">
                  ✓
                </span>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#2D2A26]">
                  Agreements ({comparison.agreements.length})
                </h2>
              </summary>
              <div className="space-y-2 px-6 pb-6">
                {comparison.agreements.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border border-[#F0EBE4] bg-[#FAF8F5] px-4 py-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9B8E7E]">
                      {SECTION_LABELS[d.section]} · {formatKey(d.key)}
                    </p>
                    <p className="mt-1 text-sm text-[#2D2A26]">{d.value}</p>
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* Next step */}
        <div className="mt-12 rounded-2xl border border-[#E8E0D6] bg-white p-8 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#2D2A26]">
            Ready to finalize?
          </h3>
          <p className="mt-2 text-sm text-[#5A5550]">
            Once you&apos;ve talked through the disagreements above, generate your
            final documents.
          </p>
          <Link
            href={`/summary/${couple.primary_session_id}`}
            className="mt-4 inline-block rounded-xl bg-[#5B7A5E] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to documents
          </Link>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------

function DisagreementCard({
  section,
  keyName,
  yours,
  theirs,
  youName,
  themName,
}: {
  section: Section;
  keyName: string;
  yours: Decision;
  theirs: Decision;
  youName: string;
  themName: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E0D6] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9B8E7E]">
        {SECTION_LABELS[section]} · {formatKey(keyName)}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Side label={`You (${youName})`} decision={yours} accent="#5B7A5E" />
        <Side label={themName} decision={theirs} accent="#9B8E7E" />
      </div>
    </div>
  );
}

function Side({
  label,
  decision,
  accent,
}: {
  label: string;
  decision: Decision;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-[#FAF8F5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#2D2A26]">{decision.value}</p>
      {decision.reasoning && (
        <p className="mt-2 text-xs italic leading-relaxed text-[#5A5550]">
          “{decision.reasoning}”
        </p>
      )}
    </div>
  );
}

function WaitingState({ coupleToken }: { coupleToken: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E0D6] bg-white p-8 text-center shadow-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          Waiting for your partner
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">
          Your answers are saved. We&apos;ll show the comparison as soon as your
          partner finishes their session.
        </p>
        <div className="mt-6 rounded-xl bg-[#F0EBE4] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9B8E7E]">
            Invite link
          </p>
          <p className="mt-1 break-all text-xs text-[#2D2A26]">
            /couple/join/{coupleToken}
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl border border-[#E8E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#2D2A26]"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#2D2A26]">
          Comparison not found
        </h1>
        <Link href="/" className="mt-4 inline-block text-sm text-[#5B7A5E] underline">
          Go home
        </Link>
      </div>
    </main>
  );
}

async function getName(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string | undefined
): Promise<string> {
  if (!userId) return "your partner";
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();
  return data?.full_name ?? "your partner";
}

function formatKey(key: string): string {
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
