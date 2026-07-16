import type { ChildStatus, OnboardingChildStatus } from "@/types";

export const CHILD_STATUS_OPTIONS: ReadonlyArray<{
  value: ChildStatus;
  label: string;
}> = [
  { value: "minor_children", label: "Minor children only (under 18)" },
  { value: "adult_children", label: "Adult children only (18+)" },
  {
    value: "minor_and_adult_children",
    label: "Both minor and adult children",
  },
  { value: "expecting", label: "Expecting a child" },
  { value: "no_children", label: "No children" },
];

/** Legacy onboarding values remain readable for existing saved sessions. */
const CHILD_STATUS_LABELS: Record<OnboardingChildStatus, string> = {
  minor_children: "they have minor children",
  adult_children: "they have adult children only",
  minor_and_adult_children: "they have both minor and adult children",
  expecting: "they are expecting a child",
  no_children: "they do not have children",
  have_kids: "they have minor children",
  no_kids: "they do not have children",
};

export function childStatusIncludesMinor(
  status?: OnboardingChildStatus | string,
): boolean {
  return (
    status === "minor_children" ||
    status === "minor_and_adult_children" ||
    status === "expecting" ||
    status === "have_kids"
  );
}

export function childStatusDescription(
  status?: OnboardingChildStatus | string,
): string | null {
  if (!status) return null;
  return CHILD_STATUS_LABELS[status as OnboardingChildStatus] ?? null;
}

/**
 * Child guardianship in WillBuddy means a designation for minor children.
 * With no saved child status, keep the module available for legacy/custom plans;
 * once a status is known, suppress it unless a minor child is involved.
 */
export function minorChildGuardianshipIsAvailable(
  status?: OnboardingChildStatus | string,
): boolean {
  return status === undefined || childStatusIncludesMinor(status);
}
