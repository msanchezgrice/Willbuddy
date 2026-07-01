/**
 * Simulates a completed WillBuddy voice session and generates all PDF docs.
 * Run: npx tsx tests/simulate-documents.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateAllDocuments,
  getDocumentCompleteness,
} from "../src/lib/documents/generator";
import { renderDocumentPdf, renderEstatePlanPdf } from "../src/lib/documents/pdf";
import { renderEstatePlanZip } from "../src/lib/documents/pdf-bundle";
import { DOC_TYPE_LABELS, type Decision } from "../src/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const now = new Date().toISOString();

function decision(
  partial: Omit<Decision, "user_confirmed" | "updated_at" | "created_at" | "reasoning"> & {
    created_at?: string;
    reasoning?: string | null;
  }
): Decision {
  return {
    reasoning: null,
    ...partial,
    created_at: partial.created_at ?? now,
    updated_at: now,
    user_confirmed: true,
  };
}

const simulatedDecisions: Decision[] = [
  decision({ id: "1", session_id: "sim-session", section: "family", key: "full_name", value: "Miguel Sanchez-Grice", reasoning: "Legal name for documents.", confidence: "decisive" }),
  decision({ id: "2", session_id: "sim-session", section: "family", key: "partner_name", value: "Sarah Chen", reasoning: "Spouse and co-parent.", confidence: "decisive" }),
  decision({ id: "3", session_id: "sim-session", section: "family", key: "children", value: "Leo Sanchez-Chen (age 4) and Maya Sanchez-Chen (age 1)", reasoning: "Two minor children at home.", confidence: "decisive" }),
  decision({ id: "4", session_id: "sim-session", section: "family", key: "state", value: "Texas", confidence: "decisive" }),
  decision({ id: "5", session_id: "sim-session", section: "family", key: "marital_status", value: "Married", confidence: "decisive" }),
  decision({ id: "6", session_id: "sim-session", section: "guardianship", key: "primary_guardian", value: "Maria Sanchez (Miguel's sister, Austin TX)", reasoning: "Shares our values on education and faith; already close with the kids.", confidence: "decisive" }),
  decision({ id: "7", session_id: "sim-session", section: "guardianship", key: "backup_guardian", value: "David Chen (Sarah's brother, Houston TX)", reasoning: "Stable household; agreed to serve if Maria cannot.", confidence: "decisive" }),
  decision({ id: "8", session_id: "sim-session", section: "guardianship", key: "guardian_named_individually", value: "Yes — each guardian named individually, not as a couple", confidence: "decisive" }),
  decision({ id: "9", session_id: "sim-session", section: "guardianship", key: "talked_to_guardian", value: "Yes — both Maria and David have agreed verbally", confidence: "decisive" }),
  decision({ id: "10", session_id: "sim-session", section: "assets", key: "real_estate", value: "Primary home in Austin, TX (joint ownership)", confidence: "decisive" }),
  decision({ id: "11", session_id: "sim-session", section: "assets", key: "accounts", value: "401(k)s, Roth IRAs, joint savings, 529 plans for children", confidence: "decisive" }),
  decision({ id: "12", session_id: "sim-session", section: "assets", key: "business", value: "None", confidence: "decisive" }),
  decision({ id: "13", session_id: "sim-session", section: "assets", key: "digital_assets", value: "Domain names, cloud photo storage, crypto wallet (small balance)", confidence: "decisive" }),
  decision({ id: "14", session_id: "sim-session", section: "assets", key: "distribution", value: "All assets to surviving spouse; if both pass, estate divided equally between Leo and Maya with a trust until inheritance age.", reasoning: "Standard for married couples with young kids.", confidence: "decisive" }),
  decision({ id: "15", session_id: "sim-session", section: "assets", key: "inheritance_age", value: "25 years old", reasoning: "Want kids mature enough to manage money responsibly.", confidence: "decisive" }),
  decision({ id: "16", session_id: "sim-session", section: "healthcare", key: "medical_poa", value: "Sarah Chen", reasoning: "Spouse knows my wishes best.", confidence: "decisive" }),
  decision({ id: "17", session_id: "sim-session", section: "healthcare", key: "partner_medical_poa", value: "Miguel Sanchez-Grice", confidence: "decisive" }),
  decision({ id: "18", session_id: "sim-session", section: "healthcare", key: "life_support", value: "No prolonged life support if permanently unconscious with no reasonable chance of recovery", reasoning: "Prefer quality of life over indefinite machines.", confidence: "decisive" }),
  decision({ id: "19", session_id: "sim-session", section: "healthcare", key: "organ_donation", value: "Yes — willing to donate organs and tissue", confidence: "decisive" }),
  decision({ id: "20", session_id: "sim-session", section: "executor", key: "executor", value: "Sarah Chen", reasoning: "Organized and knows our finances.", confidence: "decisive" }),
  decision({ id: "21", session_id: "sim-session", section: "executor", key: "backup_executor", value: "James Rodriguez (close friend, CPA)", reasoning: "Financial background if Sarah cannot serve.", confidence: "decisive" }),
  decision({ id: "22", session_id: "sim-session", section: "executor", key: "financial_poa", value: "Sarah Chen", reasoning: "Same person who handles day-to-day finances.", confidence: "decisive" }),
  decision({ id: "23", session_id: "sim-session", section: "executor", key: "poa_activation", value: "Springing — activates only upon incapacitation (doctor certification)", reasoning: "Don't want POA active while I'm competent.", confidence: "decisive" }),
];

const outDir = join(root, "tests/output");
mkdirSync(outDir, { recursive: true });

const completeness = getDocumentCompleteness(simulatedDecisions);
const documents = generateAllDocuments(simulatedDecisions);

async function main() {
  console.log("\n=== Document completeness ===\n");
  for (const [docType, status] of Object.entries(completeness)) {
    const label = DOC_TYPE_LABELS[docType as keyof typeof DOC_TYPE_LABELS];
    console.log(`${status.complete ? "✓" : "✗"} ${label}`);
  }

  const combined = await renderEstatePlanPdf(documents);
  writeFileSync(join(outDir, "WillBuddy_Estate_Plan_SIMULATED.pdf"), combined);
  console.log(`\nCombined PDF: ${combined.length} bytes`);

  for (const docType of Object.keys(DOC_TYPE_LABELS) as (keyof typeof DOC_TYPE_LABELS)[]) {
    const single = await renderDocumentPdf(docType, documents[docType]);
    writeFileSync(join(outDir, `${docType}.pdf`), single);
    console.log(`${DOC_TYPE_LABELS[docType]}: ${single.length} bytes`);
  }

  const zip = await renderEstatePlanZip(documents);
  writeFileSync(join(outDir, "WillBuddy_Estate_Plan_Documents.zip"), zip);
  console.log(`\nZIP bundle: ${zip.length} bytes`);
  console.log(`\nOutput: ${outDir}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
