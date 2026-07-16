import { SECTION_CONFIG } from "@/lib/gemini/sections";
import type { Section } from "@/types";

export type GuidedQuestion = {
  section: Section;
  key: string;
  prompt: string;
  help?: string;
  placeholder?: string;
  input: "text" | "textarea" | "radio";
  options?: { value: string; label: string }[];
  askReasoning?: boolean;
};

const YES_NO_UNSURE = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Not sure yet", label: "Not sure yet" },
];

export const GUIDED_QUESTIONS: Record<Section, GuidedQuestion[]> = {
  family: [
    {
      section: "family",
      key: "full_name",
      prompt: "What is your full legal name?",
      help: "Use the name you would want shown on planning documents.",
      placeholder: "Your full legal name",
      input: "text",
    },
    {
      section: "family",
      key: "partner_name",
      prompt: "What is your spouse or partner's full legal name?",
      help: "If this does not apply, enter “Not applicable.”",
      placeholder: "Full legal name or Not applicable",
      input: "text",
    },
    {
      section: "family",
      key: "children",
      prompt: "Tell us about your children.",
      help: "List names and ages, including grown children. If you do not have children, enter “None.”",
      placeholder: "Names and ages, or None",
      input: "textarea",
    },
    {
      section: "family",
      key: "state",
      prompt: "Which state do you live in?",
      help: "WillBuddy currently prepares Texas-focused drafts.",
      placeholder: "Texas",
      input: "text",
    },
    {
      section: "family",
      key: "marital_status",
      prompt: "What is your current marital status?",
      input: "radio",
      options: [
        { value: "Married", label: "Married" },
        { value: "Single", label: "Single" },
        { value: "Divorced", label: "Divorced" },
        { value: "Widowed", label: "Widowed" },
        { value: "Domestic partnership", label: "Domestic partnership" },
      ],
    },
  ],
  guardianship: [
    {
      section: "guardianship",
      key: "primary_guardian",
      prompt: "Who would you want to raise your children if you could not?",
      help: "You can enter “Not sure yet” and revisit this before confirming.",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "guardianship",
      key: "backup_guardian",
      prompt: "Who would be your backup guardian?",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "guardianship",
      key: "guardian_named_individually",
      prompt: "How would you name the guardian?",
      help: "A Texas attorney can help you evaluate the wording and contingencies.",
      input: "radio",
      options: [
        { value: "Name one individual", label: "Name one individual" },
        { value: "Name a couple", label: "Name a couple" },
        { value: "Not sure yet", label: "Not sure yet" },
      ],
    },
    {
      section: "guardianship",
      key: "special_wishes",
      prompt: "Are there values or wishes a guardian should know?",
      help: "Examples include school, faith, family relationships, or where the children should live.",
      placeholder: "Your wishes, or None yet",
      input: "textarea",
    },
    {
      section: "guardianship",
      key: "talked_to_guardian",
      prompt: "Have you discussed this role with the people you may name?",
      input: "radio",
      options: YES_NO_UNSURE,
    },
  ],
  assets: [
    {
      section: "assets",
      key: "real_estate",
      prompt: "What real estate do you own?",
      help: "Categories and ownership are enough; do not enter account numbers.",
      placeholder: "Home jointly owned, rental property, or None",
      input: "textarea",
    },
    {
      section: "assets",
      key: "accounts",
      prompt: "What account categories should your plan account for?",
      help: "Include retirement, investment, checking, savings, and life insurance categories—not numbers.",
      placeholder: "Account categories, or None",
      input: "textarea",
    },
    {
      section: "assets",
      key: "business",
      prompt: "Do you own a business or business interest?",
      placeholder: "Brief description, or None",
      input: "textarea",
    },
    {
      section: "assets",
      key: "digital_assets",
      prompt: "What digital assets should your plan address?",
      help: "Examples include domains, crypto, creator accounts, or valuable files. Do not enter passwords or private keys.",
      placeholder: "Categories only, or None",
      input: "textarea",
    },
    {
      section: "assets",
      key: "distribution",
      prompt: "How would you like your assets distributed?",
      help: "Describe the intent in plain language; an attorney should review the final structure.",
      placeholder: "Who should receive what?",
      input: "textarea",
      askReasoning: true,
    },
    {
      section: "assets",
      key: "inheritance_age",
      prompt: "Should any beneficiary's inheritance be held until a certain age?",
      help: "Enter an age, or “Not applicable” if you want no age-based hold recorded.",
      placeholder: "For example, 25, or Not applicable",
      input: "text",
      askReasoning: true,
    },
  ],
  healthcare: [
    {
      section: "healthcare",
      key: "medical_poa",
      prompt: "Who should make medical decisions for you if you cannot?",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "healthcare",
      key: "partner_medical_poa",
      prompt: "Who should make medical decisions for your partner?",
      help: "If this does not apply, enter “Not applicable.”",
      placeholder: "Full name or Not applicable",
      input: "text",
      askReasoning: true,
    },
    {
      section: "healthcare",
      key: "life_support",
      prompt: "If recovery were not expected, would you want life-sustaining treatment continued?",
      help: "This is a planning preference, not a medical directive. Review it with a clinician and Texas attorney.",
      input: "radio",
      options: YES_NO_UNSURE,
      askReasoning: true,
    },
    {
      section: "healthcare",
      key: "organ_donation",
      prompt: "Would you want to donate organs or tissue?",
      input: "radio",
      options: YES_NO_UNSURE,
    },
  ],
  executor: [
    {
      section: "executor",
      key: "executor",
      prompt: "Who should carry out your wishes and handle estate paperwork?",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "executor",
      key: "backup_executor",
      prompt: "Who would be your backup executor?",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "executor",
      key: "financial_poa",
      prompt: "Who should manage your finances if you are alive but cannot?",
      placeholder: "Full name or Not sure yet",
      input: "text",
      askReasoning: true,
    },
    {
      section: "executor",
      key: "poa_activation",
      prompt: "When should financial power of attorney take effect?",
      input: "radio",
      options: [
        { value: "Immediately", label: "Immediately" },
        { value: "Only upon incapacity", label: "Only upon incapacity" },
        { value: "Not sure yet", label: "Not sure yet" },
      ],
      askReasoning: true,
    },
  ],
};

export function questionsForPlan(plan: Section[]): GuidedQuestion[] {
  return plan.flatMap((section) => GUIDED_QUESTIONS[section]);
}

export function sectionLabel(section: Section): string {
  return SECTION_CONFIG[section].label;
}
