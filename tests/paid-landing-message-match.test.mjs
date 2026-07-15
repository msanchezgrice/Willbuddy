import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("paid tool landers expose the free, no-signup, two-minute promise", async () => {
  const [intestacyPage, costPage] = await Promise.all([
    read("src/app/(marketing)/tools/texas-intestacy-calculator/page.tsx"),
    read("src/app/(marketing)/tools/texas-estate-planning-cost-calculator/page.tsx"),
  ]);

  for (const page of [intestacyPage, costPage]) {
    assert.match(page, /Free · No signup/i);
    assert.match(page, /about two minutes/i);
    assert.match(page, /id="calculator"/);
    assert.match(page, /px-3 py-3/);
  }

  assert.match(costPage, /hidden text-sm text-\[#7F7467\] md:block/);
  assert.match(costPage, /hidden max-w-3xl text-lg[^\n]+md:block/);
});

test("intestacy records ToolStart on the first answer, not only Continue", async () => {
  const calculator = await read(
    "src/components/tools/TexasIntestacyCalculator.tsx"
  );

  assert.match(
    calculator,
    /selected=\{currentValue === "yes"\}[\s\S]{0,180}recordStart\(\)/
  );
  assert.match(
    calculator,
    /selected=\{currentValue === "no"\}[\s\S]{0,180}recordStart\(\)/
  );
});

test("voice creative stays paused until a matching public route exists", async () => {
  const blueprint = await read(
    "marketing/ads/imports/meta-campaign-blueprint.csv"
  );
  const voiceRow = blueprint
    .split("\n")
    .find((row) => row.includes("C | Voice | Lifestyle | V2"));

  assert.ok(voiceRow);
  assert.match(voiceRow, /,PAUSED,/);
});
