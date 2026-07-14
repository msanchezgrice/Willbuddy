import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutPath = new URL("../src/app/layout.tsx", import.meta.url);

test("loads the WillBuddy GA4 tag on every route", async () => {
  const layout = await readFile(layoutPath, "utf8");

  assert.match(layout, /import Script from ["']next\/script["']/);
  assert.match(
    layout,
    /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-T00BH5C80B/,
  );
  assert.match(layout, /id=["']google-analytics["']/);
  assert.match(layout, /gtag\(["']config["'], ["']G-T00BH5C80B["']\)/);
});
