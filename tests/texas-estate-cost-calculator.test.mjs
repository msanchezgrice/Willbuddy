import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculateEstatePlanningRanges,
  DEFAULT_COST_ASSUMPTIONS,
} from "../src/lib/tools/texas-estate-costs.ts";

test("calculates ranges from the visitor's stated assumptions", () => {
  const result = calculateEstatePlanningRanges({
    estateValue: 400_000,
    willPreparation: { low: 800, high: 2_000 },
    trustPreparation: { low: 2_500, high: 5_000 },
    trustFunding: { low: 300, high: 1_200 },
    probateFixed: { low: 1_500, high: 4_000 },
    probateEstatePercent: { low: 0.5, high: 1.5 },
  });

  assert.deepEqual(result.willPreparation, { low: 800, high: 2_000 });
  assert.deepEqual(result.trustPreparationAndFunding, { low: 2_800, high: 6_200 });
  assert.deepEqual(result.probateIllustration, { low: 3_500, high: 10_000 });
  assert.deepEqual(result.willPlusProbateIllustration, { low: 4_300, high: 12_000 });
});

test("normalizes reversed, negative, non-finite, and oversized assumptions", () => {
  const result = calculateEstatePlanningRanges({
    estateValue: Number.POSITIVE_INFINITY,
    willPreparation: { low: 2_000, high: -100 },
    trustPreparation: { low: Number.NaN, high: 5_000 },
    trustFunding: { low: 200, high: 900 },
    probateFixed: { low: 8_000, high: 1_000 },
    probateEstatePercent: { low: 500, high: -3 },
  });

  assert.deepEqual(result.willPreparation, { low: 0, high: 2_000 });
  assert.deepEqual(result.probateIllustration, { low: 1_000, high: 8_000 });
  assert.ok(result.notes.some((note) => /normalized/i.test(note)));
});

test("does not claim a trust eliminates probate or calculate savings", () => {
  const result = calculateEstatePlanningRanges(DEFAULT_COST_ASSUMPTIONS);

  assert.equal("savings" in result, false);
  assert.match(result.trustCaveat, /not assume.*avoids probate/i);
  assert.match(result.probateCaveat, /illustration.*not a quote/i);
});

test("default inputs are explicitly labeled as editable illustrations", () => {
  assert.equal(DEFAULT_COST_ASSUMPTIONS.kind, "editable illustration");
  assert.ok(DEFAULT_COST_ASSUMPTIONS.sourceNotes.length >= 3);
  assert.ok(
    DEFAULT_COST_ASSUMPTIONS.sourceNotes.some((note) =>
      note.href.startsWith("https://www.txcourts.gov/")
    )
  );
  assert.ok(
    DEFAULT_COST_ASSUMPTIONS.sourceNotes.some((note) =>
      note.href.includes("tcss.legis.texas.gov")
    )
  );
});
