import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const read = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

test("living trust guide is substantial, source-backed, canonical, and honest about product scope", async () => {
  const source = await read(
    "src/app/(marketing)/guides/living-trust-texas/page.tsx"
  );

  assert.match(source, /canonicalPath\s*=\s*["']\/guides\/living-trust-texas["']/);
  assert.match(source, /alternates:\s*\{\s*canonical:\s*canonicalPath\s*\}/);
  assert.match(source, /Texas Property Code Chapter 112/i);
  assert.match(source, /Texas Estates Code Chapter 201/i);
  assert.match(source, /revocable/i);
  assert.match(source, /fund(?:ing|ed)/i);
  assert.match(source, /WillBuddy does not create trusts/i);
  assert.match(source, /attorney conversation/i);
  assert.match(source, /not a law firm/i);
  assert.match(source, /["']Article["']/);
  assert.match(source, /["']BreadcrumbList["']/);
  assert.match(source, /replace\(\/<\/g/);
  assert.ok(source.split(/\s+/).length >= 850, "guide should be substantial");
});

test("living trust cost guide explains ranges and methodology without promising savings", async () => {
  const source = await read(
    "src/app/(marketing)/guides/living-trust-cost-texas/page.tsx"
  );

  assert.match(
    source,
    /canonicalPath\s*=\s*["']\/guides\/living-trust-cost-texas["']/
  );
  assert.match(source, /alternates:\s*\{\s*canonical:\s*canonicalPath\s*\}/);
  assert.match(source, /Texas Property Code Chapter 112/i);
  assert.match(source, /funding/i);
  assert.match(source, /deed/i);
  assert.match(source, /fee agreement/i);
  assert.match(source, /WillBuddy does not create trusts/i);
  assert.match(source, /attorney conversation/i);
  assert.match(source, /not a law firm/i);
  assert.match(source, /Is a living trust always cheaper than probate\?[\s\S]{0,160}No\./i);
  assert.doesNotMatch(source, /guaranteed savings/i);
  assert.match(source, /["']Article["']/);
  assert.match(source, /["']FAQPage["']/);
  assert.ok(source.split(/\s+/).length >= 850, "guide should be substantial");
});

test("Texas POA navigator covers five distinct documents and reveals results before CTA", async () => {
  const [page, navigator] = await Promise.all([
    read("src/app/(marketing)/tools/texas-power-of-attorney-navigator/page.tsx"),
    read("src/components/tools/TexasPowerOfAttorneyNavigator.tsx"),
  ]);

  assert.match(
    page,
    /canonicalPath\s*=\s*["']\/tools\/texas-power-of-attorney-navigator["']/
  );
  assert.match(page, /alternates:\s*\{\s*canonical:\s*canonicalPath\s*\}/);
  assert.match(page, /Texas Estates Code Chapter 752/i);
  assert.match(page, /Texas Health and Safety Code Chapter 166/i);
  assert.match(page, /Texas Estates Code Chapter 1104/i);
  assert.match(page, /Texas Health and Human Services/i);
  assert.match(page, /educational information/i);
  assert.match(page, /not\s+legal\s+advice/i);
  assert.match(page, /["']WebApplication["']/);
  assert.match(page, /["']FAQPage["']/);

  for (const label of [
    "Statutory durable power of attorney",
    "Medical power of attorney",
    "Directive to physicians",
    "HIPAA authorization",
    "Declaration of guardian",
  ]) {
    assert.match(navigator, new RegExp(label, "i"));
  }

  const resultPosition = navigator.indexOf("Your document map");
  const ctaPosition = navigator.indexOf("Organize the next conversation");
  assert.ok(resultPosition > -1, "result section should be rendered");
  assert.ok(ctaPosition > resultPosition, "CTA should follow the result");
  assert.match(navigator, /aria-live=["']polite["']/);
  assert.match(navigator, /texas_directive_navigator_completed/);
  assert.doesNotMatch(navigator, /captureAnalyticsEvent\([\s\S]{0,200}(answer|selection|document_ids)/i);
});

test("trust and directive pages avoid retired official resource URLs", async () => {
  const corpus = (
    await Promise.all([
      read("src/app/(marketing)/guides/living-trust-texas/page.tsx"),
      read("src/app/(marketing)/guides/living-trust-cost-texas/page.tsx"),
      read("src/app/(marketing)/tools/texas-power-of-attorney-navigator/page.tsx"),
    ])
  ).join("\n");

  assert.doesNotMatch(corpus, /sll\.texas\.gov\/faqs\/probate\//);
  assert.doesNotMatch(corpus, /hhs\.texas\.gov\/regulations\/forms\/advance-directives["']/);
  assert.doesNotMatch(corpus, /txcourts\.gov\/media\/1457525\//);
  assert.match(corpus, /sll\.texas\.gov\/faqs\/\?category=Wills\+%26\+Estates/);
  assert.match(corpus, /hhs\.texas\.gov\/regulations\/forms\/advance-directives\/medical-power-attorney-designation-health-care-agent-mpoa/);
  assert.match(corpus, /txcourts\.gov\/media\/1459244\/texas-disciplinary-rules-of-professional-conduct-pdf\.pdf/);
});
