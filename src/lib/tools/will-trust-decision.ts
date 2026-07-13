export type WillTrustAnswers = {
  ownsRealEstate: boolean;
  ownsPropertyOutsideTexas: boolean;
  hasComplexPlanningNeeds: boolean;
  probatePrivacyPriority: "low" | "high";
  preparedToFundTrust: boolean;
};

export type WillTrustRecommendation = {
  id: "will_first" | "compare_both" | "will_plus_trust_conversation";
  title: string;
  summary: string;
  reasons: string[];
  nextSteps: string[];
};

export function getWillTrustRecommendation(
  answers: WillTrustAnswers
): WillTrustRecommendation {
  const reasons: string[] = [];
  let trustSignals = 0;

  if (answers.ownsPropertyOutsideTexas) {
    trustSignals += 2;
    reasons.push(
      "Real estate in another state can create a second probate proceeding, so coordinated planning deserves a closer look."
    );
  } else if (answers.ownsRealEstate) {
    trustSignals += 1;
    reasons.push(
      "Texas real estate makes title, transfer-on-death, and probate options worth comparing."
    );
  }

  if (answers.hasComplexPlanningNeeds) {
    trustSignals += 2;
    reasons.push(
      "A blended family, business interest, beneficiary with special needs, or detailed distribution rules can require tailored advice."
    );
  }

  if (answers.probatePrivacyPriority === "high") {
    trustSignals += 1;
    reasons.push(
      "Avoiding probate administration or keeping more of the plan private is important to you."
    );
  }

  if (trustSignals >= 3 && answers.preparedToFundTrust) {
    return {
      id: "will_plus_trust_conversation",
      title: "Build a will, then have a trust conversation",
      summary:
        "Your answers raise several reasons to compare a funded living trust with other Texas transfer tools. Keep a will in the foundation and take these questions to a Texas estate-planning attorney; WillBuddy does not create trusts.",
      reasons,
      nextSteps: [
        "List each major asset, its owner, and its current beneficiary designation.",
        "Ask an attorney which assets should move into a trust and which should stay outside it.",
        "Prepare a will, powers of attorney, and medical directives even if you add a trust.",
      ],
    };
  }

  if (trustSignals >= 2) {
    return {
      id: "compare_both",
      title: "Compare a will plan with a funded trust plan",
      summary:
        "A will-centered plan may still fit, but your priorities justify a side-by-side attorney conversation. A trust only works as intended when the right assets are retitled or otherwise coordinated with it.",
      reasons,
      nextSteps: [
        "Compare total setup, retitling, maintenance, and administration work—not just the document price.",
        "Ask what must be retitled to fund a trust and what happens if an asset is left out.",
        "Keep a will and incapacity documents in either plan.",
      ],
    };
  }

  return {
    id: "will_first",
    title: "Start with a will-first foundation",
    summary:
      "Your answers point to a straightforward will-centered starting point. A trust can be added later if your property, family, or privacy goals change.",
    reasons:
      reasons.length > 0
        ? reasons
        : [
            "You did not identify an out-of-state property, complex planning need, or strong probate-avoidance priority.",
          ],
    nextSteps: [
      "Name the people who should receive your property and the person who should settle your estate.",
      "Add guardian nominations if you have minor children.",
      "Prepare financial and medical decision documents for incapacity.",
    ],
  };
}
