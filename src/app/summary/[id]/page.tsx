import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { getDocumentCompleteness } from "@/lib/documents/generator";
import { isSessionPaid, verifyAndRecordCheckout } from "@/lib/payments";
import { docsForPlan, resolvePlan } from "@/lib/sections/plan";
import { DOC_TYPE_LABELS } from "@/types";
import type { DocType, Decision, Section } from "@/types";
import { SummaryActions } from "./summary-client";
import { DecisionEditor } from "@/components/summary/DecisionEditor";
import { TranscriptViewer } from "@/components/summary/TranscriptViewer";
import { CoupleInvite } from "@/components/summary/CoupleInvite";
import { DocumentDownloadButton } from "@/components/summary/DocumentDownloadButton";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}

export default async function SummaryPage({ params, searchParams }: Props) {
  const { id: sessionId } = await params;
  const { checkout } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createServiceClient();

  // Load session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    redirect("/");
  }

  // Load decisions
  const { data: decisions } = await supabase
    .from("decisions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const allDecisions: Decision[] = (decisions as Decision[]) ?? [];

  // Only the documents this session's tailored plan actually produces.
  const planDocTypes = docsForPlan(
    resolvePlan(session.section_plan as Section[] | null)
  );

  // Check completeness for the document cards
  const completeness = getDocumentCompleteness(allDecisions);

  // Payment gate: documents are only downloadable after a completed payment.
  let paid = await isSessionPaid(supabase, sessionId);
  let justPaid = false;
  if (!paid && checkout) {
    // Returning from Stripe — verify immediately (don't wait for the webhook).
    if (await verifyAndRecordCheckout(supabase, sessionId, checkout)) {
      paid = true;
      justPaid = true;
    }
  }

  // Check for existing share token
  const { data: existingDoc } = await supabase
    .from("documents")
    .select("share_token")
    .eq("session_id", sessionId)
    .not("share_token", "is", null)
    .limit(1)
    .single();

  const shareToken = existingDoc?.share_token ?? null;

  // Load couple_session if this session is linked to one
  const { data: coupleSession } = session.couple_session_id
    ? await supabase
        .from("couple_sessions")
        .select("id, invite_token")
        .eq("id", session.couple_session_id)
        .single()
    : { data: null };

  // Group decisions by section for display
  const decisionsBySection: Record<string, Decision[]> = {};
  for (const dec of allDecisions) {
    if (!decisionsBySection[dec.section]) {
      decisionsBySection[dec.section] = [];
    }
    decisionsBySection[dec.section].push(dec);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Account bar */}
      <div className="flex items-center justify-between border-b border-[#E8E0D6] bg-white px-6 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-base font-bold text-[#2D2A26]"
        >
          WillBuddy
        </Link>
        <UserButton />
      </div>

      {/* Hero / completion message */}
      <div className="bg-[#5B7A5E] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">&#127881;</div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-4">
            You just did something most families never do.
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-xl mx-auto">
            You worked through the questions and made real decisions about what matters most.
            Your draft estate plan documents are ready for attorney review.
          </p>
        </div>
      </div>

      {/* Decision Editor */}
      <DecisionEditor decisions={allDecisions} sessionId={sessionId} />

      {/* Document cards */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#5B4F3E] mb-8">
          Your Documents
        </h2>

        <p className="text-sm text-[#9B8E7E] mb-8 max-w-2xl">
          {paid
            ? "Download everything as one PDF, or grab individual documents to send to your attorney."
            : "Unlock to download a combined PDF or individual documents for each part of your plan."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {planDocTypes.map((docType) => {
            const isComplete = completeness[docType].complete;
            const missing = completeness[docType].missing;

            return (
              <div
                key={docType}
                className="bg-white rounded-xl border border-[#E8E0D6] p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5B4F3E]">
                    {DOC_TYPE_LABELS[docType]}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isComplete
                        ? "bg-[#5B7A5E]/10 text-[#5B7A5E]"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isComplete ? "Complete" : "Needs Discussion"}
                  </span>
                </div>

                {!isComplete && missing.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-amber-600 font-medium mb-1">Missing:</p>
                    <ul className="text-xs text-[#9B8E7E] space-y-0.5">
                      {missing.map((item) => (
                        <li key={item}>&#8226; {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key decisions for this doc */}
                <KeyDecisions docType={docType} decisions={allDecisions} />

                <div className="mt-4 pt-4 border-t border-[#E8E0D6]">
                  <DocumentDownloadButton
                    sessionId={sessionId}
                    docType={docType}
                    label="Download PDF"
                    isPaid={paid}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons — client component handles paywall, downloads and share link */}
        <SummaryActions
          sessionId={sessionId}
          isPaid={paid}
          justPaid={justPaid}
          shareToken={shareToken}
          docLabels={planDocTypes.map((d) => DOC_TYPE_LABELS[d])}
        />

        {/* Couple invite CTA */}
        <CoupleInvite
          sessionId={sessionId}
          existingCoupleSessionId={coupleSession?.id ?? null}
          existingInviteToken={coupleSession?.invite_token ?? null}
        />

        {/* Lawyer referral section */}
        <div className="mt-16 bg-white rounded-xl border border-[#E8E0D6] p-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#5B4F3E] mb-3">
            Ready for the next step?
          </h2>
          <p className="text-[#9B8E7E] mb-6 max-w-lg mx-auto leading-relaxed">
            These are draft documents. A licensed Texas estate planning attorney should
            review and finalize them before signing. This ensures everything is legally
            sound and tailored to your situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer&Template=/CustomSource/MemberDirectory/MemberDirectory.cfm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#5B4F3E] hover:bg-[#4A3F31] text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Find a Texas Estate Attorney
            </a>
            <a
              href="https://www.nolo.com/legal-encyclopedia/texas-estate-planning"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-[#E8E0D6] hover:border-[#9B8E7E] text-[#5B4F3E] font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Learn About Texas Estate Law
            </a>
          </div>
          <p className="text-xs text-[#9B8E7E] mt-6">
            WillBuddy is not a law firm and does not provide legal advice.
          </p>
        </div>
      </div>

      {/* Transcript Viewer */}
      <TranscriptViewer sessionId={sessionId} />
    </main>
  );
}

/** Show the key decisions relevant to each document type. */
function KeyDecisions({
  docType,
  decisions,
}: {
  docType: DocType;
  decisions: Decision[];
}) {
  // Map doc types to the relevant section + keys to show
  const relevantKeys: Record<DocType, { section: string; key: string }[]> = {
    will: [
      { section: "executor", key: "executor" },
      { section: "assets", key: "distribution" },
      { section: "assets", key: "inheritance_age" },
    ],
    guardianship: [
      { section: "guardianship", key: "primary_guardian" },
      { section: "guardianship", key: "backup_guardian" },
      { section: "guardianship", key: "special_wishes" },
    ],
    medical_poa: [
      { section: "healthcare", key: "medical_poa" },
      { section: "healthcare", key: "life_support" },
      { section: "healthcare", key: "organ_donation" },
    ],
    durable_poa: [
      { section: "executor", key: "financial_poa" },
      { section: "executor", key: "poa_activation" },
    ],
    hipaa: [
      { section: "healthcare", key: "medical_poa" },
    ],
  };

  const keys = relevantKeys[docType];
  const matching = keys
    .map(({ section, key }) =>
      decisions.find((dec) => dec.section === section && dec.key === key)
    )
    .filter(Boolean) as Decision[];

  if (matching.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-[#F0EBE4]">
      <p className="text-xs font-semibold text-[#5B4F3E] mb-2">Key Decisions:</p>
      <ul className="space-y-1.5">
        {matching.map((dec) => (
          <li key={dec.id} className="flex items-start gap-2">
            <span
              className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                dec.confidence === "decisive"
                  ? "bg-[#5B7A5E]"
                  : dec.confidence === "needs_discussion"
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
            />
            <span className="text-xs text-[#5A5248]">
              <span className="font-medium capitalize">
                {dec.key.replace(/_/g, " ")}:
              </span>{" "}
              {dec.value.length > 80 ? dec.value.slice(0, 80) + "..." : dec.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
