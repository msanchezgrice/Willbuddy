import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutPath = new URL("../src/app/layout.tsx", import.meta.url);
const analyticsClientPath = new URL("../src/lib/analytics/client.ts", import.meta.url);
const googleAdsPath = new URL("../src/lib/analytics/google-ads.ts", import.meta.url);
const providerPath = new URL("../src/app/providers.tsx", import.meta.url);

test("loads the WillBuddy GA4 tag on every route", async () => {
  const layout = await readFile(layoutPath, "utf8");

  assert.match(layout, /import Script from ["']next\/script["']/);
  assert.match(
    layout,
    /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-T00BH5C80B/,
  );
  assert.match(layout, /id=["']google-analytics["']/);
  assert.match(layout, /gtag\(["']config["'], ["']G-T00BH5C80B["']/);
  assert.match(layout, /willbuddy:google-tag-ready/);
});

test("connects Google Ads without automatic Ads page views", async () => {
  const layout = await readFile(layoutPath, "utf8");

  assert.match(layout, /gtag\(["']config["'], ["']AW-18323307402["']/);
  assert.match(layout, /["']send_page_view["']:\s*false/);
});

test("records the Google Ads conversion only for public tool completions", async () => {
  const [client, googleAds] = await Promise.all([
    readFile(analyticsClientPath, "utf8"),
    readFile(googleAdsPath, "utf8"),
  ]);

  assert.match(client, /captureGoogleAdsEvent\(event, properties\)/);
  assert.match(googleAds, /event !== ["']tool_completed["']/);
  assert.match(googleAds, /pathname === ["']\/tools["']/);
  assert.match(googleAds, /pathname\.startsWith\(["']\/tools\/["']\)/);
  assert.match(googleAds, /AW-18323307402\/PnhDCN-Ho9AcEIr3naFE/);
  assert.doesNotMatch(googleAds, /session_id|transcript|answers|asset_value/);
});

test("records normalized SPA pageviews and downstream GA4 funnel events", async () => {
  const [client, provider, googleAds] = await Promise.all([
    readFile(analyticsClientPath, "utf8"),
    readFile(providerPath, "utf8"),
    readFile(googleAdsPath, "utf8"),
  ]);

  assert.match(client, /captureGooglePageview\(pathname, attributionProperties\)/);
  assert.match(provider, /capturePageview\(pathname, searchParams\)/);
  assert.match(googleAds, /normalizeAnalyticsRoute/);
  assert.match(googleAds, /"generate_lead"/);
  assert.match(googleAds, /"begin_checkout"/);
  assert.match(googleAds, /"purchase"/);
  assert.doesNotMatch(googleAds, /window\.location\.href/);
});
