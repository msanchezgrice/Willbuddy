import type { Section } from "@/types";

export interface SectionConfig {
  label: string;
  description: string;
  estimatedMinutes: number;
  questions: string[];
  contextTips: string[];
  emotionalGuidance?: string;
}

export const TOTAL_PLAN_ESTIMATED_MINUTES = 15;
export const MAX_SECTION_ESTIMATED_MINUTES = 4;

export function estimatedPlanMinutes(sectionCount: number): number {
  return Math.min(
    TOTAL_PLAN_ESTIMATED_MINUTES,
    Math.max(0, sectionCount) * MAX_SECTION_ESTIMATED_MINUTES,
  );
}

export const SECTION_CONFIG: Record<Section, SectionConfig> = {
  family: {
    label: "Family Snapshot",
    description: "Basic information about your family",
    estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES,
    questions: [
      "What are your and your partner's full legal names?",
      "How many children do you have, including grown children, and what are their names and ages?",
      "What state do you live in?",
      "Are you currently married?",
    ],
    contextTips: [
      "This section helps us personalize everything that follows.",
      "We need legal names as they'll appear on official documents.",
      "Your state determines which laws apply to your estate plan.",
    ],
  },
  guardianship: {
    label: "Minor-Child Guardianship",
    description: "Who would raise a child under 18",
    estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES,
    questions: [
      "If something happened to both of you, who would you want to raise your children?",
      "Does this person share your values on education, discipline, and lifestyle?",
      "Should we name them individually or as a couple?",
      "Who would be your backup guardian if your first choice can't serve?",
      "Have you talked to these people about being named as guardian?",
    ],
    contextTips: [
      "Without a named guardian, a court decides who raises your children.",
      "Name an individual, not a couple, to avoid complications if they divorce.",
      "The guardian is not legally obligated to accept, so talk to them first.",
      "Consider proximity, financial stability, and willingness to take multiple children.",
    ],
    emotionalGuidance:
      "This is the hardest section for most parents. Take your time. There's no wrong answer, and it's normal to find this difficult.",
  },
  assets: {
    label: "Assets & Property",
    description: "What you own and how to distribute it",
    estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES,
    questions: [
      "Do you own real estate? Is it in one name or both?",
      "Do you have retirement accounts, investment accounts, or savings?",
      "Do you own a business or have business interests?",
      "Do you have digital assets like crypto, domains, or valuable online accounts?",
      "How would you like your assets distributed?",
      "Should any beneficiary's inheritance be held until a certain age?",
    ],
    contextTips: [
      "We don't need exact dollar amounts, just categories.",
      "Life insurance and retirement accounts pass by beneficiary designation, not through a will.",
      "Some families use age-based trusts for younger beneficiaries; others choose outright distribution.",
      "An attorney can help tailor beneficiary trusts for minor or adult beneficiaries.",
    ],
  },
  healthcare: {
    label: "Healthcare Wishes",
    description: "Medical decisions if you're incapacitated",
    estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES,
    questions: [
      "Who should make medical decisions for you if you can't make them yourself?",
      "And who should make medical decisions for your partner?",
      "If you were in a permanent vegetative state with no chance of recovery, would you want to be kept on life support?",
      "Would you like to be an organ donor?",
    ],
    contextTips: [
      "A Medical Power of Attorney lets someone you trust make healthcare decisions when you can't.",
      "Your medical POA can access your medical records via HIPAA authorization.",
      "These decisions give your family clarity during an already difficult time.",
      "You can change these decisions at any time while you're able to.",
    ],
    emotionalGuidance:
      "These questions are about giving your family clarity, not giving up. Knowing your wishes means your family won't have to guess during the hardest moment of their lives.",
  },
  executor: {
    label: "Executor & POA",
    description: "Who handles your affairs",
    estimatedMinutes: MAX_SECTION_ESTIMATED_MINUTES,
    questions: [
      "Who do you trust to carry out your wishes and handle the legal and financial paperwork?",
      "Who would be the backup if your first choice can't serve?",
      "Who should manage your finances if you're alive but incapacitated?",
      "Should financial power of attorney activate immediately or only upon incapacitation?",
    ],
    contextTips: [
      "The executor handles probate, pays debts, and distributes assets according to your will.",
      "Choose someone organized and trustworthy. They don't need to be a financial expert.",
      "Durable Power of Attorney for finances is separate from your will.",
      "Most people choose 'springing' activation (only when incapacitated).",
    ],
  },
};

/** Get context tips for the current section */
export function getSectionTips(section: Section): string[] {
  return SECTION_CONFIG[section].contextTips;
}

/** Get emotional guidance note if the section has one */
export function getSectionEmotionalGuidance(
  section: Section
): string | undefined {
  return SECTION_CONFIG[section].emotionalGuidance;
}
