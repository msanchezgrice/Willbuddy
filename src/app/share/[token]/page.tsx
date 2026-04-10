import { createServerClient } from "@supabase/ssr";
import { generateAllDocuments, getDocumentCompleteness } from "@/lib/documents/generator";
import { DOC_TYPE_LABELS, SECTION_LABELS } from "@/types";
import type { DocType, Decision, Section } from "@/types";

interface Props {
  params: Promise<{ token: string }>;
}

/**
 * Public share page — no auth required.
 * Uses the service role key to bypass RLS and load by share_token.
 */
export default async function SharePage({ params }: Props) {
  const { token } = await params;

  // Use service role client to bypass RLS for public share access
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op for service role client
        },
      },
    }
  );

  // Find the document by share token
  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("share_token", token)
    .limit(1)
    .single();

  if (!doc) {
    return <ExpiredOrNotFound reason="not_found" />;
  }

  // Check expiration
  if (doc.share_expires_at && new Date(doc.share_expires_at) < new Date()) {
    return <ExpiredOrNotFound reason="expired" />;
  }

  // Load the session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", doc.session_id)
    .single();

  if (!session) {
    return <ExpiredOrNotFound reason="not_found" />;
  }

  // Load decisions
  const { data: decisions } = await supabase
    .from("decisions")
    .select("*")
    .eq("session_id", doc.session_id)
    .order("created_at", { ascending: true });

  const allDecisions: Decision[] = (decisions as Decision[]) ?? [];

  // Generate documents
  const documents = generateAllDocuments(allDecisions);
  const completeness = getDocumentCompleteness(allDecisions);

  // Group decisions by section
  const decisionsBySection: Record<string, Decision[]> = {};
  for (const dec of allDecisions) {
    if (!decisionsBySection[dec.section]) {
      decisionsBySection[dec.section] = [];
    }
    decisionsBySection[dec.section].push(dec);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E0D6] py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#5B4F3E]">
              WillBuddy
            </h1>
            <p className="text-sm text-[#9B8E7E]">
              Estate Plan — Shared for Attorney Review
            </p>
          </div>
          <span className="text-xs bg-[#5B7A5E]/10 text-[#5B7A5E] font-semibold px-3 py-1.5 rounded-full">
            Read-Only
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Decision summary */}
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#5B4F3E] mb-6">
            Decisions Summary
          </h2>

          <div className="space-y-6">
            {Object.entries(decisionsBySection).map(([section, decs]) => (
              <div
                key={section}
                className="bg-white rounded-xl border border-[#E8E0D6] p-6"
              >
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#5B4F3E] mb-4">
                  {SECTION_LABELS[section as Section] ?? section}
                </h3>
                <div className="space-y-3">
                  {decs.map((dec) => (
                    <div
                      key={dec.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          dec.confidence === "decisive"
                            ? "bg-[#5B7A5E]"
                            : dec.confidence === "needs_discussion"
                              ? "bg-amber-400"
                              : "bg-red-400"
                        }`}
                      />
                      <div>
                        <span className="font-medium text-[#5B4F3E] capitalize">
                          {dec.key.replace(/_/g, " ")}:
                        </span>{" "}
                        <span className="text-[#5A5248]">{dec.value}</span>
                        {dec.confidence === "needs_discussion" && (
                          <span className="ml-2 text-xs text-amber-600 font-medium">
                            (needs discussion)
                          </span>
                        )}
                        {dec.confidence === "flagged" && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            (flagged for review)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Document texts */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#5B4F3E] mb-6">
            Draft Documents
          </h2>

          <div className="space-y-8">
            {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((docType) => {
              const isComplete = completeness[docType].complete;

              return (
                <div
                  key={docType}
                  className="bg-white rounded-xl border border-[#E8E0D6] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE4]">
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
                      {isComplete ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                  <pre className="p-6 text-xs text-[#5A5248] whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {documents[docType]}
                  </pre>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-[#9B8E7E] py-8 border-t border-[#E8E0D6]">
          <p className="mb-2">
            These documents were generated by WillBuddy as drafts for attorney review.
          </p>
          <p>
            WillBuddy is not a law firm and does not provide legal advice.
            All documents should be reviewed by a licensed Texas estate planning attorney.
          </p>
        </div>
      </div>
    </main>
  );
}

function ExpiredOrNotFound({ reason }: { reason: "expired" | "not_found" }) {
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#5B4F3E] mb-3">
          {reason === "expired"
            ? "This link has expired"
            : "Document not found"}
        </h1>
        <p className="text-[#9B8E7E] leading-relaxed">
          {reason === "expired"
            ? "The share link for these estate planning documents has expired. Please ask the document owner to generate a new link."
            : "We couldn&apos;t find documents at this link. It may have been removed or the URL may be incorrect."}
        </p>
      </div>
    </main>
  );
}
