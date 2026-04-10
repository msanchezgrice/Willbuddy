import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateAllDocuments, getDocumentCompleteness } from "@/lib/documents/generator";
import { DOC_TYPE_LABELS } from "@/types";
import type { DocType, Decision, Session } from "@/types";
import { SummaryClient } from "./summary-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: Props) {
  const { id: sessionId } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
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

  // Generate documents and check completeness
  const documents = generateAllDocuments(allDecisions);
  const completeness = getDocumentCompleteness(allDecisions);

  // Check for existing share token
  const { data: existingDoc } = await supabase
    .from("documents")
    .select("share_token")
    .eq("session_id", sessionId)
    .not("share_token", "is", null)
    .limit(1)
    .single();

  const shareToken = existingDoc?.share_token ?? null;

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
      {/* Hero / completion message */}
      <div className="bg-[#5B7A5E] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">&#127881;</div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-4">
            You just did something most families never do.
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-xl mx-auto">
            You sat down, talked it through, and made real decisions about what matters most.
            Your draft estate plan documents are ready for attorney review.
          </p>
        </div>
      </div>

      {/* Document cards */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#5B4F3E] mb-8">
          Your Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((docType) => {
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
              </div>
            );
          })}
        </div>

        {/* Action buttons — client component handles downloads and share link */}
        <SummaryClient
          sessionId={sessionId}
          documents={documents}
          shareToken={shareToken}
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
