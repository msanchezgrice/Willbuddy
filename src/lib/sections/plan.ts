import type { DocType, OnboardingQuizAnswers, Section } from "@/types";
import { SECTIONS } from "@/types";
import {
  childStatusIncludesMinor,
  minorChildGuardianshipIsAvailable,
} from "@/lib/family/children";

/**
 * Canonical ordering of every module. A session's plan is always a subset of
 * these, kept in this relative order (except the user's priority module, which
 * is pulled forward right after the required Family Snapshot).
 */
export const CANONICAL_ORDER: Section[] = [
  "family",
  "guardianship",
  "assets",
  "healthcare",
  "executor",
];

interface ModuleRule {
  /** Always in every plan (Family Snapshot feeds every document). */
  required?: boolean;
  /** Whether the module is on by default given the onboarding answers. */
  defaultOn: (o?: OnboardingQuizAnswers) => boolean;
}

/**
 * Which modules belong in a plan by default, based on onboarding.
 * Child guardianship is only relevant when a minor child is present or expected.
 */
export const MODULE_RULES: Record<Section, ModuleRule> = {
  family: { required: true, defaultOn: () => true },
  guardianship: {
    defaultOn: (o) => childStatusIncludesMinor(o?.children),
  },
  assets: { defaultOn: () => true },
  healthcare: { defaultOn: () => true },
  executor: { defaultOn: () => true },
};

export function sectionIsAvailable(
  section: Section,
  onboarding?: OnboardingQuizAnswers,
): boolean {
  if (section !== "guardianship") return true;
  return minorChildGuardianshipIsAvailable(onboarding?.children);
}

/** Map the onboarding "priority" answer to the module it corresponds to. */
export function priorityToSection(priority?: string): Section | null {
  switch (priority) {
    case "guardianship":
      return "guardianship";
    case "assets":
      return "assets";
    case "healthcare":
      return "healthcare";
    default:
      return null; // "getting_started" or unknown → no reordering
  }
}

/** The default set of modules for a set of onboarding answers. */
export function defaultModules(o?: OnboardingQuizAnswers): Section[] {
  return CANONICAL_ORDER.filter(
    (s) => MODULE_RULES[s].required || MODULE_RULES[s].defaultOn(o)
  );
}

/**
 * Build the ordered section plan for a session.
 *
 * - Family Snapshot is always included and always first (every doc needs it).
 * - If `selected` is provided (from the "what do you need" step) it wins;
 *   otherwise we derive the default set from onboarding.
 * - The user's stated priority module is pulled to the front (right after
 *   family) so the session opens where it matters most to them.
 */
export function buildSectionPlan(
  onboarding?: OnboardingQuizAnswers,
  selected?: Section[] | null
): Section[] {
  const base =
    selected && selected.length > 0 ? selected : defaultModules(onboarding);

  const set = new Set<Section>(
    base.filter((section) => sectionIsAvailable(section, onboarding)),
  );
  set.add("family"); // required, no matter what

  const ordered: Section[] = ["family"];

  const priority = priorityToSection(onboarding?.priority);
  if (priority && priority !== "family" && set.has(priority)) {
    ordered.push(priority);
  }

  for (const s of CANONICAL_ORDER) {
    if (s === "family") continue;
    if (set.has(s) && !ordered.includes(s)) ordered.push(s);
  }

  return ordered;
}

/**
 * Resolve the effective plan for a session, falling back to the legacy all-5
 * flow when no plan has been stored (older sessions, or plan not yet computed).
 */
export function resolvePlan(plan?: Section[] | null): Section[] {
  return plan && plan.length > 0 ? plan : [...SECTIONS];
}

/** The next module after `current` in the plan, or null if it's the last. */
export function nextSectionInPlan(
  plan: Section[],
  current: Section
): Section | null {
  const i = plan.indexOf(current);
  if (i === -1 || i >= plan.length - 1) return null;
  return plan[i + 1];
}

/** Whether `section` is the final module in the plan. */
export function isLastSection(plan: Section[], section: Section): boolean {
  return plan.length > 0 && plan[plan.length - 1] === section;
}

/**
 * Which documents a plan produces. A document is only generated when the
 * module(s) it depends on are in scope, so we never hand someone a document
 * (e.g. a Guardianship Designation) for a topic they didn't cover.
 */
export function docsForPlan(plan: Section[]): DocType[] {
  const set = new Set(plan);
  const docs: DocType[] = [];
  // Will needs assets and/or an executor to be meaningful.
  if (set.has("assets") || set.has("executor")) docs.push("will");
  if (set.has("guardianship")) docs.push("guardianship");
  if (set.has("healthcare")) docs.push("medical_poa");
  if (set.has("executor")) docs.push("durable_poa");
  if (set.has("healthcare")) docs.push("hipaa");
  return docs;
}

/**
 * Narrow a full set of generated documents down to the ones the plan produces.
 * Preserves document text for in-plan doc types only.
 */
export function pickPlanDocuments(
  documents: Partial<Record<DocType, string>>,
  plan: Section[]
): Partial<Record<DocType, string>> {
  const out: Partial<Record<DocType, string>> = {};
  for (const docType of docsForPlan(plan)) {
    const body = documents[docType];
    if (typeof body === "string") out[docType] = body;
  }
  return out;
}

/** Goal presets shown in the "what do you need" onboarding step. */
export interface PlanPreset {
  id: string;
  label: string;
  description: string;
  modules: Section[];
}

export const PLAN_PRESETS: PlanPreset[] = [
  {
    id: "essentials",
    label: "New-parent essentials",
    description:
      "Minor-child guardianship, will, healthcare directives & powers of attorney.",
    modules: ["family", "guardianship", "assets", "healthcare", "executor"],
  },
  {
    id: "guardianship",
    label: "Just minor-child guardianship",
    description: "Name who would raise a child under 18.",
    modules: ["family", "guardianship"],
  },
  {
    id: "healthcare",
    label: "Healthcare directives",
    description: "Medical power of attorney, HIPAA access & end-of-life wishes.",
    modules: ["family", "healthcare"],
  },
  {
    id: "full",
    label: "Full estate plan",
    description: "Every WillBuddy module that applies to your family.",
    modules: ["family", "guardianship", "assets", "healthcare", "executor"],
  },
];
