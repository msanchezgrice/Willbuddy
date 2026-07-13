export type ReadinessProfile = {
  planningFor: "individual" | "couple";
  children: "minor_children" | "adult_children" | "no_children";
  texas: "yes" | "no";
  priority: "guardianship" | "assets" | "healthcare" | "getting_started";
};

export type ReadinessItem = {
  id:
    | "will"
    | "guardian"
    | "executor"
    | "financial_decisions"
    | "medical_decisions"
    | "beneficiaries"
    | "asset_inventory"
    | "plan_review";
  title: string;
  description: string;
  priority: number;
};

export type ReadinessResult = {
  score: number;
  completedCount: number;
  totalCount: number;
  band: "getting_started" | "building_foundation" | "ready_to_review";
  nextSteps: ReadinessItem[];
};

const BASE_ITEMS: ReadinessItem[] = [
  {
    id: "will",
    title: "Put a current will in place",
    description: "Record who receives property and who handles the estate.",
    priority: 1,
  },
  {
    id: "executor",
    title: "Choose an executor and backup",
    description: "Ask them first and keep their contact details with your plan.",
    priority: 2,
  },
  {
    id: "financial_decisions",
    title: "Name a financial decision-maker",
    description: "Prepare a durable power of attorney for incapacity.",
    priority: 2,
  },
  {
    id: "medical_decisions",
    title: "Record medical decision-makers and wishes",
    description: "Coordinate a medical power of attorney and advance directive.",
    priority: 2,
  },
  {
    id: "beneficiaries",
    title: "Review beneficiary designations",
    description: "Check retirement, life insurance, and payable-on-death accounts.",
    priority: 3,
  },
  {
    id: "asset_inventory",
    title: "Create a simple asset and account inventory",
    description: "Record where important accounts and documents can be found.",
    priority: 3,
  },
  {
    id: "plan_review",
    title: "Set a review trigger",
    description: "Review after major life changes and on a regular calendar cadence.",
    priority: 4,
  },
];

const GUARDIAN_ITEM: ReadinessItem = {
  id: "guardian",
  title: "Nominate guardians and backups",
  description: "Record your choices for minor children and discuss them together.",
  priority: 1,
};

export function getApplicableReadinessItems(
  profile: ReadinessProfile
): ReadinessItem[] {
  const items = [...BASE_ITEMS];
  if (profile.children === "minor_children") {
    items.push(GUARDIAN_ITEM);
  }

  const priorityIds: Partial<
    Record<ReadinessProfile["priority"], ReadinessItem["id"][]>
  > = {
    guardianship: ["guardian", "will"],
    assets: ["will", "beneficiaries", "asset_inventory"],
    healthcare: ["medical_decisions", "financial_decisions"],
  };
  const favored = priorityIds[profile.priority] ?? [];

  return items.sort((a, b) => {
    const aRank = favored.indexOf(a.id);
    const bRank = favored.indexOf(b.id);
    if (aRank >= 0 || bRank >= 0) {
      if (aRank < 0) return 1;
      if (bRank < 0) return -1;
      return aRank - bRank;
    }
    return a.priority - b.priority;
  });
}

export function buildReadinessResult(
  profile: ReadinessProfile,
  completed: Partial<Record<ReadinessItem["id"], boolean>>
): ReadinessResult {
  const applicable = getApplicableReadinessItems(profile);
  const completedCount = applicable.filter((item) => completed[item.id]).length;
  const score = Math.round((completedCount / applicable.length) * 100);
  const band: ReadinessResult["band"] =
    score >= 75
      ? "ready_to_review"
      : score >= 40
        ? "building_foundation"
        : "getting_started";

  return {
    score,
    completedCount,
    totalCount: applicable.length,
    band,
    nextSteps: applicable.filter((item) => !completed[item.id]).slice(0, 3),
  };
}
