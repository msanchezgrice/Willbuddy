export type ToolSlug =
  | "readiness"
  | "will-trust"
  | "intestacy"
  | "cost"
  | "poa";

export type ToolVideo = {
  slug: ToolSlug;
  eyebrow: string;
  title: string;
  shortTitle: string;
  promise: string;
  question: string;
  choices: string[];
  resultLabel: string;
  resultDetail: string;
  url: string;
  accent: string;
  secondary: string;
  ui: "quiz" | "map" | "calculator";
  voiceover: string[];
};

export const tools: ToolVideo[] = [
  {
    slug: "readiness",
    eyebrow: "Personalized checklist",
    title: "How ready is your estate plan?",
    shortTitle: "Readiness check",
    promise: "See your score and next three actions in about three minutes.",
    question: "Who are you planning for?",
    choices: ["Just me", "Me and my partner"],
    resultLabel: "Your next three actions",
    resultDetail: "A practical checklist shaped to your household and priorities.",
    url: "mywillbuddy.com/tools/estate-planning-readiness",
    accent: "#5B7A5E",
    secondary: "#DCE8DC",
    ui: "quiz",
    voiceover: [
      "Not sure where to begin with an estate plan?",
      "Answer a few household and priority questions.",
      "Then see a simple readiness score and your next three actions.",
      "It is free, private, and there is no email gate.",
    ],
  },
  {
    slug: "will-trust",
    eyebrow: "Will or trust decision tool",
    title: "Should you start with a will or discuss a trust?",
    shortTitle: "Will vs. trust",
    promise: "Work through five practical Texas planning questions.",
    question: "Do you own a home or other real estate?",
    choices: ["Yes", "No"],
    resultLabel: "Your starting point",
    resultDetail: "See which structure deserves the first conversation—and why.",
    url: "mywillbuddy.com/blog/wills-vs-trusts-texas",
    accent: "#5B7A5E",
    secondary: "#E8DED1",
    ui: "quiz",
    voiceover: [
      "Will or living trust? The answer is not one size fits all.",
      "Work through real estate, family complexity, privacy, and trust funding.",
      "The tool gives you a practical starting point, not a sales pitch.",
      "Use the result to have a better conversation with a Texas attorney.",
    ],
  },
  {
    slug: "intestacy",
    eyebrow: "Texas inheritance visualizer",
    title: "Who inherits in Texas without a will?",
    shortTitle: "Who inherits?",
    promise: "Trace selected Texas intestacy branches in a visual property map.",
    question: "Is there a surviving spouse?",
    choices: ["Yes", "No"],
    resultLabel: "Community property",
    resultDetail: "Spouse 100% · selected family branch",
    url: "mywillbuddy.com/tools/texas-intestacy-calculator",
    accent: "#B07A53",
    secondary: "#F0DFD1",
    ui: "map",
    voiceover: [
      "If someone dies without a will in Texas, does the spouse get everything?",
      "Not in every family and property situation.",
      "Trace a simplified branch, then compare community property and separate property.",
      "Use the map to spot questions—not to determine heirship.",
    ],
  },
  {
    slug: "cost",
    eyebrow: "Editable cost illustration",
    title: "Compare Texas estate-planning cost ranges.",
    shortTitle: "Cost ranges",
    promise: "Change every assumption without a fake quote or savings claim.",
    question: "Estate value used for the illustration",
    choices: ["$500,000", "Edit assumptions"],
    resultLabel: "Will preparation",
    resultDetail: "$800–$2,500 · preparation only",
    url: "mywillbuddy.com/tools/texas-estate-planning-cost-calculator",
    accent: "#5B7A5E",
    secondary: "#E8DED1",
    ui: "calculator",
    voiceover: [
      "Estate-planning costs should not be reduced to one magic number.",
      "Edit preparation, trust funding, estate value, and probate-path assumptions.",
      "The tool keeps today’s preparation separate from possible later administration.",
      "It is an illustration—not a quote or promise of savings.",
    ],
  },
  {
    slug: "poa",
    eyebrow: "Texas document navigator",
    title: "Five jobs, five different documents.",
    shortTitle: "POA navigator",
    promise: "Match financial, medical, treatment, records, and guardian jobs.",
    question: "Should someone handle finances if you cannot?",
    choices: ["Yes", "No"],
    resultLabel: "Documents to review",
    resultDetail: "Durable POA · medical POA · directive · HIPAA authorization",
    url: "mywillbuddy.com/tools/texas-power-of-attorney-navigator",
    accent: "#5B7A5E",
    secondary: "#DCE8DC",
    ui: "quiz",
    voiceover: [
      "A financial power of attorney does not cover every planning job.",
      "Answer five high-level questions about finances, healthcare, treatment, records, and guardianship.",
      "Then see the Texas documents that may deserve a closer review.",
      "No names, diagnoses, or account details required.",
    ],
  },
];

export const toolBySlug = Object.fromEntries(
  tools.map((tool) => [tool.slug, tool]),
) as Record<ToolSlug, ToolVideo>;
