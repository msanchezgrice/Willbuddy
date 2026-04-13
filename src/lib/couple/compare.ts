import type { Decision, Section } from "@/types";

export interface DisagreementPair {
  section: Section;
  key: string;
  primary: Decision;
  partner: Decision;
}

export interface OnlyOneAnswered {
  section: Section;
  key: string;
  decision: Decision;
  who: "primary" | "partner";
}

export interface ComparisonResult {
  agreements: Decision[];
  disagreements: DisagreementPair[];
  onlyOneAnswered: OnlyOneAnswered[];
  totalKeys: number;
}

/**
 * Compare two sets of decisions, grouped by (section, key), and classify each
 * pair as agreement, disagreement, or only-one-answered.
 */
export function compareDecisions(
  primary: Decision[],
  partner: Decision[]
): ComparisonResult {
  const primaryMap = groupByKey(primary);
  const partnerMap = groupByKey(partner);
  const allKeys = new Set([
    ...Object.keys(primaryMap),
    ...Object.keys(partnerMap),
  ]);

  const agreements: Decision[] = [];
  const disagreements: DisagreementPair[] = [];
  const onlyOneAnswered: OnlyOneAnswered[] = [];

  for (const key of allKeys) {
    const p = primaryMap[key];
    const q = partnerMap[key];

    if (p && q) {
      if (valuesMatch(p.value, q.value)) {
        agreements.push(p);
      } else {
        disagreements.push({
          section: p.section,
          key: p.key,
          primary: p,
          partner: q,
        });
      }
    } else if (p) {
      onlyOneAnswered.push({
        section: p.section,
        key: p.key,
        decision: p,
        who: "primary",
      });
    } else if (q) {
      onlyOneAnswered.push({
        section: q.section,
        key: q.key,
        decision: q,
        who: "partner",
      });
    }
  }

  return {
    agreements,
    disagreements,
    onlyOneAnswered,
    totalKeys: allKeys.size,
  };
}

function groupByKey(decisions: Decision[]): Record<string, Decision> {
  const out: Record<string, Decision> = {};
  for (const d of decisions) {
    out[`${d.section}.${d.key}`] = d;
  }
  return out;
}

/**
 * Fuzzy equality for decision values.
 * Normalizes whitespace + case, and treats semantically-equivalent short
 * answers (yes/y, no/n) as matching.
 */
export function valuesMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (isYes(na) && isYes(nb)) return true;
  if (isNo(na) && isNo(nb)) return true;
  return false;
}

function normalize(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

function isYes(v: string): boolean {
  return v === "yes" || v === "y" || v === "true";
}

function isNo(v: string): boolean {
  return v === "no" || v === "n" || v === "false";
}
