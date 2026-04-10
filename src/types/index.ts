// Session status
export type SessionStatus = "in_progress" | "completed" | "abandoned";

// The 5 estate planning sections
export type Section =
  | "family"
  | "guardianship"
  | "assets"
  | "healthcare"
  | "executor";

export const SECTIONS: Section[] = [
  "family",
  "guardianship",
  "assets",
  "healthcare",
  "executor",
];

export const SECTION_LABELS: Record<Section, string> = {
  family: "Family Snapshot",
  guardianship: "Guardianship",
  assets: "Assets & Property",
  healthcare: "Healthcare Wishes",
  executor: "Executor & POA",
};

// Decision confidence levels
export type Confidence = "decisive" | "needs_discussion" | "flagged";

// Document types generated
export type DocType =
  | "will"
  | "guardianship"
  | "medical_poa"
  | "durable_poa"
  | "hipaa";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  will: "Last Will & Testament",
  guardianship: "Guardianship Designation",
  medical_poa: "Medical Power of Attorney",
  durable_poa: "Durable Power of Attorney",
  hipaa: "HIPAA Authorization",
};

// Whitelist of valid decision keys per section (Codex security finding)
export const VALID_DECISION_KEYS: Record<Section, string[]> = {
  family: [
    "full_name",
    "partner_name",
    "children",
    "state",
    "marital_status",
  ],
  guardianship: [
    "primary_guardian",
    "backup_guardian",
    "guardian_named_individually",
    "special_wishes",
    "talked_to_guardian",
  ],
  assets: [
    "real_estate",
    "accounts",
    "business",
    "digital_assets",
    "distribution",
    "inheritance_age",
  ],
  healthcare: [
    "medical_poa",
    "partner_medical_poa",
    "life_support",
    "organ_donation",
  ],
  executor: [
    "executor",
    "backup_executor",
    "financial_poa",
    "poa_activation",
  ],
};

// Voice connection states
export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "ai_thinking"
  | "ai_speaking"
  | "disconnected"
  | "mic_denied"
  | "error";

// Payment status
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// Database row types
export interface Profile {
  id: string;
  full_name: string | null;
  partner_name: string | null;
  state: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  status: SessionStatus;
  current_section: Section;
  sections_completed: Section[];
  gemini_resume_handle: string | null;
  started_at: string;
  completed_at: string | null;
  user_confirmed: boolean;
}

export interface Decision {
  id: string;
  session_id: string;
  section: Section;
  key: string;
  value: string;
  user_confirmed: boolean;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
}

export interface TranscriptEntry {
  id: string;
  session_id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export interface FlaggedItem {
  id: string;
  session_id: string;
  topic: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  session_id: string;
  doc_type: DocType;
  storage_path: string | null;
  share_token: string | null;
  share_expires_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  session_id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  completed_at: string | null;
}
