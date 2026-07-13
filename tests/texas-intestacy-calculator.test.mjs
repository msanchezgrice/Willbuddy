import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculateTexasIntestacy,
  TEXAS_INTESTACY_SOURCES,
} from "../src/lib/tools/texas-intestacy.ts";

function shares(result, propertyType) {
  return Object.fromEntries(
    result[propertyType].map(({ heir, share, interest }) => [
      heir,
      { share, interest },
    ])
  );
}

test("a spouse inherits the decedent's community share when every descendant is shared", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: true,
    hasDescendants: true,
    allDescendantsAlsoSpouseDescendants: true,
    hasParentsOrSiblings: true,
  });

  assert.deepEqual(shares(result, "communityProperty"), {
    "Surviving spouse": { share: 1, interest: "outright" },
  });
  assert.equal(shares(result, "separatePersonalProperty")["Surviving spouse"].share, 1 / 3);
  assert.equal(shares(result, "separatePersonalProperty").Descendants.share, 2 / 3);
  assert.equal(shares(result, "separateRealProperty")["Surviving spouse"].interest, "life estate");
  assert.equal(shares(result, "separateRealProperty").Descendants.share, 2 / 3);
  assert.match(result.explanation, /decedent's share of community property/i);
});

test("descendants inherit the decedent's community share when at least one is not the spouse's", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: true,
    hasDescendants: true,
    allDescendantsAlsoSpouseDescendants: false,
    hasParentsOrSiblings: false,
  });

  assert.deepEqual(shares(result, "communityProperty"), {
    Descendants: { share: 1, interest: "outright" },
  });
  assert.match(result.communityNote, /surviving spouse keeps their own one-half/i);
  assert.ok(result.sections.includes("Tex. Est. Code § 201.003(c)"));
});

test("with no descendants, spouse receives personal property and shares separate realty with collateral family", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: true,
    hasDescendants: false,
    allDescendantsAlsoSpouseDescendants: null,
    hasParentsOrSiblings: true,
  });

  assert.equal(shares(result, "separatePersonalProperty")["Surviving spouse"].share, 1);
  assert.equal(shares(result, "separateRealProperty")["Surviving spouse"].share, 1 / 2);
  assert.equal(shares(result, "separateRealProperty")["Parents and/or siblings"].share, 1 / 2);
  assert.ok(result.caveats.some((caveat) => /exact parent-and-sibling split/i.test(caveat)));
});

test("with no spouse, descendants inherit each property category", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: false,
    hasDescendants: true,
    allDescendantsAlsoSpouseDescendants: null,
    hasParentsOrSiblings: true,
  });

  for (const propertyType of [
    "communityProperty",
    "separatePersonalProperty",
    "separateRealProperty",
  ]) {
    assert.deepEqual(shares(result, propertyType), {
      Descendants: { share: 1, interest: "outright" },
    });
  }
});

test("the collateral-family branch does not pretend to allocate an unknowable exact split", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: false,
    hasDescendants: false,
    allDescendantsAlsoSpouseDescendants: null,
    hasParentsOrSiblings: true,
  });

  assert.deepEqual(shares(result, "separateRealProperty"), {
    "Parents and/or siblings": { share: 1, interest: "statutory branch" },
  });
  assert.match(result.caveats.join(" "), /representation|half blood|adoption/i);
});

test("an incomplete family tree returns a court-determination warning instead of a false heir", () => {
  const result = calculateTexasIntestacy({
    hasSpouse: false,
    hasDescendants: false,
    allDescendantsAlsoSpouseDescendants: null,
    hasParentsOrSiblings: false,
  });

  assert.equal(result.communityProperty[0].heir, "Other legal heirs, if any");
  assert.ok(result.caveats.some((caveat) => /does not mean the state automatically inherits/i.test(caveat)));
});

test("official source registry points to Chapter 201 sections", () => {
  assert.ok(TEXAS_INTESTACY_SOURCES.length >= 4);
  for (const source of TEXAS_INTESTACY_SOURCES) {
    assert.match(source.href, /^https:\/\/tcss\.legis\.texas\.gov\/resources\/ES\/htm\/ES\.201\.htm#201\./);
  }
});
