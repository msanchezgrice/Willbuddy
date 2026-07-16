import type { Decision, DocType, Section } from "@/types";
import { generateWillText } from "./templates/will";
import { generateGuardianshipText } from "./templates/guardianship";
import { generateMedicalPoaText } from "./templates/medical-poa";
import { generateDurablePoaText } from "./templates/durable-poa";
import { generateHipaaText } from "./templates/hipaa";

export interface DocumentGenerationOptions {
  sectionPlan?: Section[];
}

/**
 * Which decision keys are required for each document type.
 * If any key is missing from the decisions, the document is incomplete.
 */
const requiredKeys: Record<DocType, { section: string; key: string; label: string }[]> = {
  will: [
    { section: "family", key: "full_name", label: "Your full name" },
    { section: "executor", key: "executor", label: "Executor" },
    { section: "executor", key: "backup_executor", label: "Backup executor" },
    { section: "assets", key: "distribution", label: "Asset distribution wishes" },
    { section: "assets", key: "inheritance_age", label: "Age-based inheritance preference" },
  ],
  guardianship: [
    { section: "family", key: "full_name", label: "Your full name" },
    { section: "family", key: "children", label: "Children" },
    { section: "guardianship", key: "primary_guardian", label: "Primary guardian" },
    { section: "guardianship", key: "backup_guardian", label: "Backup guardian" },
  ],
  medical_poa: [
    { section: "family", key: "full_name", label: "Your full name" },
    { section: "healthcare", key: "medical_poa", label: "Medical POA designee" },
    { section: "healthcare", key: "life_support", label: "Life support preferences" },
    { section: "healthcare", key: "organ_donation", label: "Organ donation wishes" },
  ],
  durable_poa: [
    { section: "family", key: "full_name", label: "Your full name" },
    { section: "executor", key: "financial_poa", label: "Financial POA designee" },
    { section: "executor", key: "backup_executor", label: "Backup agent" },
    { section: "executor", key: "poa_activation", label: "Activation conditions" },
  ],
  hipaa: [
    { section: "family", key: "full_name", label: "Your full name" },
    { section: "healthcare", key: "medical_poa", label: "Medical POA designee" },
  ],
};

/**
 * Generate all 5 document texts from the user's decisions.
 */
export function generateAllDocuments(
  decisions: Decision[],
  options: DocumentGenerationOptions = {}
): Record<DocType, string> {
  const includeMinorChildGuardianship =
    options.sectionPlan?.includes("guardianship") ?? true;

  return {
    will: generateWillText(decisions, { includeMinorChildGuardianship }),
    guardianship: generateGuardianshipText(decisions),
    medical_poa: generateMedicalPoaText(decisions),
    durable_poa: generateDurablePoaText(decisions),
    hipaa: generateHipaaText(decisions),
  };
}

/**
 * Check which documents are complete (all required decisions present)
 * and which are missing information.
 */
export function getDocumentCompleteness(
  decisions: Decision[]
): Record<DocType, { complete: boolean; missing: string[] }> {
  const result = {} as Record<DocType, { complete: boolean; missing: string[] }>;

  for (const [docType, keys] of Object.entries(requiredKeys) as [
    DocType,
    (typeof requiredKeys)[DocType],
  ][]) {
    const missing: string[] = [];

    for (const req of keys) {
      const found = decisions.find(
        (dec) => dec.section === req.section && dec.key === req.key
      );
      if (!found) {
        missing.push(req.label);
      }
    }

    result[docType] = {
      complete: missing.length === 0,
      missing,
    };
  }

  return result;
}
