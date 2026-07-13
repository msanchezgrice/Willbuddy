export type TexasIntestacyInputs = {
  hasSpouse: boolean;
  hasDescendants: boolean;
  allDescendantsAlsoSpouseDescendants: boolean | null;
  hasParentsOrSiblings: boolean;
};

export type InheritanceShare = {
  heir: string;
  share: number;
  interest: "outright" | "life estate" | "statutory branch";
  detail?: string;
};

export type TexasIntestacyResult = {
  communityProperty: InheritanceShare[];
  separatePersonalProperty: InheritanceShare[];
  separateRealProperty: InheritanceShare[];
  explanation: string;
  communityNote: string;
  caveats: string[];
  sections: string[];
};

export const TEXAS_INTESTACY_SOURCES = [
  {
    label: "Tex. Est. Code § 201.001 — separate estate, no spouse",
    href: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm#201.001",
  },
  {
    label: "Tex. Est. Code § 201.002 — separate estate with a spouse",
    href: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm#201.002",
  },
  {
    label: "Tex. Est. Code § 201.003 — community estate",
    href: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm#201.003",
  },
  {
    label: "Tex. Est. Code § 201.101 — per-capita and representation rules",
    href: "https://tcss.legis.texas.gov/resources/ES/htm/ES.201.htm#201.101",
  },
] as const;

const outright = (
  heir: string,
  share: number,
  detail?: string
): InheritanceShare => ({ heir, share, interest: "outright", detail });

const EVERY_PROPERTY = {
  communityProperty: [outright("Descendants", 1)],
  separatePersonalProperty: [outright("Descendants", 1)],
  separateRealProperty: [outright("Descendants", 1)],
};

const generalCaveats = [
  "This simplified map assumes Texas law applies and does not account for a valid will, trust ownership, beneficiary designations, survivorship agreements, debts, homestead rights, exempt property, family allowance, disclaimer, divorce, or simultaneous death.",
  "Descendant shares can pass by representation. Adoption, parentage, posthumous children, half-blood relatives, and prior deaths can change who takes and in what share.",
  "The percentages describe the decedent's intestate interest in each category—not necessarily the percentage of a house, account, or combined marital estate.",
];

export function calculateTexasIntestacy(
  inputs: TexasIntestacyInputs
): TexasIntestacyResult {
  const caveats = [...generalCaveats];

  if (!inputs.hasSpouse && inputs.hasDescendants) {
    return {
      ...EVERY_PROPERTY,
      explanation:
        "With no surviving spouse, descendants take the decedent's intestate estate under the descendant branch.",
      communityNote:
        "The map treats the decedent's interest as the amount being distributed.",
      caveats,
      sections: ["Tex. Est. Code § 201.001(b)", "Tex. Est. Code § 201.101"],
    };
  }

  if (!inputs.hasSpouse && !inputs.hasDescendants) {
    if (inputs.hasParentsOrSiblings) {
      caveats.push(
        "The exact parent-and-sibling split depends on which parents, siblings, and descendants of siblings survive; this tool intentionally does not guess that family tree."
      );
      const collateral = [
        {
          heir: "Parents and/or siblings",
          share: 1,
          interest: "statutory branch" as const,
          detail: "The exact split requires a fuller family tree.",
        },
      ];
      return {
        communityProperty: collateral,
        separatePersonalProperty: collateral,
        separateRealProperty: collateral,
        explanation:
          "With no spouse or descendants, Texas law next looks to parents, siblings, and descendants of siblings.",
        communityNote:
          "Property characterization can still matter before the decedent's interest is identified.",
        caveats,
        sections: ["Tex. Est. Code § 201.001(c)–(f)"],
      };
    }

    caveats.push(
      "Selecting no spouse, descendants, parents, or siblings does not mean the state automatically inherits. Texas continues through a broader family-tree analysis before escheat can occur."
    );
    const otherHeirs = [
      {
        heir: "Other legal heirs, if any",
        share: 1,
        interest: "statutory branch" as const,
        detail: "A court may need a fuller heirship record.",
      },
    ];
    return {
      communityProperty: otherHeirs,
      separatePersonalProperty: otherHeirs,
      separateRealProperty: otherHeirs,
      explanation:
        "A fuller family tree is required to identify the next statutory heirs.",
      communityNote:
        "This tool stops before remote-kin and escheat rules because the necessary facts were not asked.",
      caveats,
      sections: ["Tex. Est. Code § 201.001", "Tex. Est. Code § 201.101"],
    };
  }

  if (inputs.hasSpouse && inputs.hasDescendants) {
    const allShared = inputs.allDescendantsAlsoSpouseDescendants === true;
    return {
      communityProperty: allShared
        ? [outright("Surviving spouse", 1)]
        : [outright("Descendants", 1)],
      separatePersonalProperty: [
        outright("Surviving spouse", 1 / 3),
        outright("Descendants", 2 / 3),
      ],
      separateRealProperty: [
        {
          heir: "Surviving spouse",
          share: 1 / 3,
          interest: "life estate",
          detail: "A life estate in one-third, not one-third outright.",
        },
        outright(
          "Descendants",
          2 / 3,
          "Plus the remainder after the spouse's one-third life estate."
        ),
      ],
      explanation: allShared
        ? "Because every descendant is also a descendant of the surviving spouse, the spouse inherits the decedent's share of community property. Separate property follows different rules."
        : "Because at least one descendant is not also a descendant of the surviving spouse, descendants inherit the decedent's share of community property. Separate property follows different rules.",
      communityNote: allShared
        ? "The surviving spouse already owns their own community-property interest and inherits the decedent's community interest in this branch."
        : "The surviving spouse keeps their own one-half community interest; descendants take the decedent's one-half community interest shown here as 100% of the amount being distributed.",
      caveats,
      sections: [
        "Tex. Est. Code § 201.002(b)",
        allShared
          ? "Tex. Est. Code § 201.003(b)"
          : "Tex. Est. Code § 201.003(c)",
      ],
    };
  }

  // Surviving spouse, no descendants.
  const realProperty = inputs.hasParentsOrSiblings
    ? [
        outright("Surviving spouse", 1 / 2),
        {
          heir: "Parents and/or siblings",
          share: 1 / 2,
          interest: "statutory branch" as const,
          detail: "The exact split within this half needs a fuller family tree.",
        },
      ]
    : [outright("Surviving spouse", 1)];

  if (inputs.hasParentsOrSiblings) {
    caveats.push(
      "The exact parent-and-sibling split within their half of separate real property depends on who survives."
    );
  }

  return {
    communityProperty: [outright("Surviving spouse", 1)],
    separatePersonalProperty: [outright("Surviving spouse", 1)],
    separateRealProperty: realProperty,
    explanation: inputs.hasParentsOrSiblings
      ? "With no descendants, the spouse takes the community estate and separate personal property, but shares separate real property with the parent-and-sibling branch."
      : "With no descendants, parents, or siblings in the simplified family tree, the spouse takes each category shown.",
    communityNote:
      "The surviving spouse keeps their own community interest and inherits the decedent's community interest in this branch.",
    caveats,
    sections: ["Tex. Est. Code § 201.002(c)", "Tex. Est. Code § 201.003(b)"],
  };
}
