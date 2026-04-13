import { VALID_DECISION_KEYS, type Section } from "@/types";

// Tool declarations for Gemini Flash Live
export const willBuddyTools = [
  {
    functionDeclarations: [
      {
        name: "recordDecision",
        description:
          "Record a structured estate planning decision from the conversation.",
        parameters: {
          type: "OBJECT" as const,
          properties: {
            section: {
              type: "STRING" as const,
              description:
                "Section: family, guardianship, assets, healthcare, executor",
            },
            key: {
              type: "STRING" as const,
              description:
                "Decision key, e.g. primary_guardian, inheritance_age",
            },
            value: {
              type: "STRING" as const,
              description:
                "The decision value as plain text (e.g. 'Anya Petrov', '25 years old')",
            },
            reasoning: {
              type: "STRING" as const,
              description:
                "WHY the user chose this — their own reasoning in 1-2 sentences. Critical for the couple comparison view so partners can understand each other. Leave blank only if the user truly had no reason.",
            },
            confidence: {
              type: "STRING" as const,
              description: "decisive, needs_discussion, or flagged",
            },
          },
          required: ["section", "key", "value"],
        },
      },
      {
        name: "explainTopic",
        description:
          "When the user is uncertain or asks for more information, use this to signal that you are going deeper on a topic with stats, legal implications, and tradeoffs. Pass the topic and depth ('brief', 'detailed', 'comprehensive'). After calling this tool, deliver the explanation conversationally, then ask if they want more or are ready to decide.",
        parameters: {
          type: "OBJECT" as const,
          properties: {
            topic: {
              type: "STRING" as const,
              description: "The estate planning topic being explained",
            },
            depth: {
              type: "STRING" as const,
              description: "brief, detailed, or comprehensive",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "updateProgress",
        description:
          "Mark a section as complete and advance to the next section.",
        parameters: {
          type: "OBJECT" as const,
          properties: {
            section: {
              type: "STRING" as const,
              description: "The section just completed",
            },
            nextSection: {
              type: "STRING" as const,
              description: "The next section to begin",
            },
          },
          required: ["section"],
        },
      },
      {
        name: "flagForReview",
        description:
          "Flag a topic that needs more discussion or is unresolved.",
        parameters: {
          type: "OBJECT" as const,
          properties: {
            topic: {
              type: "STRING" as const,
              description: "What needs review",
            },
            reason: {
              type: "STRING" as const,
              description: "Why it was flagged",
            },
          },
          required: ["topic", "reason"],
        },
      },
    ],
  },
];

/**
 * Validate a tool call against the whitelist of valid section/key pairs.
 * Returns true if the call is valid, false otherwise.
 */
export function validateToolCall(
  section: string,
  key: string,
  value: string
): boolean {
  const validKeys = VALID_DECISION_KEYS[section as Section];
  if (!validKeys) return false;
  if (!validKeys.includes(key)) return false;
  if (value.length > 2000) return false;
  return true;
}
