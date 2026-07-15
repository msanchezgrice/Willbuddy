import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutPath = new URL("../src/app/layout.tsx", import.meta.url);
const providerPath = new URL("../src/app/providers.tsx", import.meta.url);
const pixelPath = new URL("../src/lib/analytics/meta-pixel.ts", import.meta.url);

test("loads the WillBuddy Meta Pixel without an automatic global PageView", async () => {
  const layout = await readFile(layoutPath, "utf8");

  assert.match(layout, /id=["']meta-pixel["']/);
  assert.match(layout, /2542612909548568/);
  assert.match(layout, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.doesNotMatch(layout, /fbq\(["']track["'],\s*["']PageView["']/);
});

test("limits Meta signals to public marketing and free-tool routes", async () => {
  const [provider, pixel] = await Promise.all([
    readFile(providerPath, "utf8"),
    readFile(pixelPath, "utf8"),
  ]);

  assert.match(provider, /captureMetaPageview\(pathname\)/);
  assert.match(pixel, /SAFE_MARKETING_PREFIXES/);
  assert.match(pixel, /"\/tools"/);
  assert.match(pixel, /"\/guides"/);
  assert.match(pixel, /"\/blog"/);
  assert.doesNotMatch(pixel, /"\/session"/);
  assert.doesNotMatch(pixel, /"\/summary"/);
});

test("maps privacy-safe lead, checkout, and purchase events to Meta", async () => {
  const pixel = await readFile(pixelPath, "utf8");

  assert.match(pixel, /event === "tool_started"/);
  assert.match(pixel, /event === "tool_completed"/);
  assert.match(pixel, /"trackCustom", "ToolStart"/);
  assert.match(pixel, /"trackCustom", "ToolComplete"/);
  assert.match(pixel, /"track", "Lead"/);
  assert.match(pixel, /"track", "CompleteRegistration"/);
  assert.match(pixel, /"track", "InitiateCheckout"/);
  assert.match(pixel, /"track", "Purchase"/);
  assert.doesNotMatch(pixel, /transcript|answers|asset_value|session_id/);
});
