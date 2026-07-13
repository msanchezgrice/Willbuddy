export type MoneyRange = { low: number; high: number };
export type PercentRange = { low: number; high: number };

export type EstateCostInputs = {
  estateValue: number;
  willPreparation: MoneyRange;
  trustPreparation: MoneyRange;
  trustFunding: MoneyRange;
  probateFixed: MoneyRange;
  probateEstatePercent: PercentRange;
};

export const DEFAULT_COST_ASSUMPTIONS = {
  kind: "editable illustration",
  estateValue: 400_000,
  willPreparation: { low: 750, high: 2_500 },
  trustPreparation: { low: 2_500, high: 6_000 },
  trustFunding: { low: 300, high: 1_500 },
  probateFixed: { low: 1_500, high: 5_000 },
  probateEstatePercent: { low: 0.5, high: 2 },
  sourceNotes: [
    {
      label: "Texas Judicial Branch — court costs and fees",
      href: "https://www.txcourts.gov/publications-training/publications/filing-fees-courts-costs/",
      note: "Court costs are set through Texas law and local schedules; they are only one component of administration cost.",
    },
    {
      label: "Texas Estates Code § 352.001 — personal representative compensation",
      href: "https://tcss.legis.texas.gov/resources/ES/htm/ES.352.htm#352.001",
      note: "Statutory commissions apply to qualifying receipts and payments, with exclusions and a reasonableness cap—not automatically to total estate value.",
    },
    {
      label: "Texas Property Code § 112.021 — trust funding",
      href: "https://tcss.legis.texas.gov/resources/PR/htm/PR.112.htm#112.021",
      note: "Creating a trust document and transferring property to a trust are distinct steps.",
    },
  ],
} as const satisfies EstateCostInputs & {
  kind: "editable illustration";
  sourceNotes: ReadonlyArray<{ label: string; href: string; note: string }>;
};

const MAX_DOLLARS = 100_000_000;
const MAX_PERCENT = 100;

function finiteNonnegative(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), max);
}

function normalizeRange(range: MoneyRange, max = MAX_DOLLARS): MoneyRange {
  const first = finiteNonnegative(range.low, max);
  const second = finiteNonnegative(range.high, max);
  return { low: Math.min(first, second), high: Math.max(first, second) };
}

function addRanges(...ranges: MoneyRange[]): MoneyRange {
  return ranges.reduce(
    (total, range) => ({
      low: total.low + range.low,
      high: total.high + range.high,
    }),
    { low: 0, high: 0 }
  );
}

export function calculateEstatePlanningRanges(inputs: EstateCostInputs) {
  const estateValue = finiteNonnegative(inputs.estateValue, MAX_DOLLARS);
  const willPreparation = normalizeRange(inputs.willPreparation);
  const trustPreparation = normalizeRange(inputs.trustPreparation);
  const trustFunding = normalizeRange(inputs.trustFunding);
  const probateFixed = normalizeRange(inputs.probateFixed);
  const probatePercent = normalizeRange(
    inputs.probateEstatePercent,
    MAX_PERCENT
  );
  const estateBased = {
    low: estateValue * (probatePercent.low / 100),
    high: estateValue * (probatePercent.high / 100),
  };
  const probateIllustration = addRanges(probateFixed, estateBased);

  return {
    willPreparation,
    trustPreparationAndFunding: addRanges(trustPreparation, trustFunding),
    probateIllustration,
    willPlusProbateIllustration: addRanges(
      willPreparation,
      probateIllustration
    ),
    trustCaveat:
      "This model does not assume a trust avoids probate. Assets left outside a trust, disputes, debts, taxes, and administration can still create later costs.",
    probateCaveat:
      "The probate range is an illustration based only on the assumptions you entered, not a quote, prediction, statewide average, or statutory formula.",
    notes: [
      "Inputs are normalized into nonnegative low-to-high ranges; invalid values become zero.",
      "The percentage is a visitor-controlled modeling shortcut. Texas does not impose one universal probate percentage on the gross estate.",
      "The tool does not model taxes, creditor claims, property-specific transfer fees, litigation, ongoing trustee fees, or the value of anyone's time.",
    ],
  };
}
