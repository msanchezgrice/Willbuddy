import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const adFiles = [
  "marketing/ads/imports/google-rsa.csv",
  "marketing/ads/imports/google-keywords.csv",
  "marketing/ads/imports/meta-campaign-blueprint.csv",
];

test("every paid-ad destination is first-party and has complete UTMs", async () => {
  for (const relativePath of adFiles) {
    const source = await readFile(path.join(repoRoot, relativePath), "utf8");
    const destinations = source.match(/https:\/\/mywillbuddy\.com\/[^,\s\"]*/g) ?? [];

    assert.ok(destinations.length > 0, `${relativePath} has no destinations`);

    for (const destination of destinations) {
      const url = new URL(destination);
      assert.equal(url.protocol, "https:");
      assert.equal(url.hostname, "mywillbuddy.com");
      assert.ok(url.pathname === "/tools" || url.pathname.startsWith("/tools/"));
      assert.ok(url.searchParams.get("utm_source"), `${destination} lacks utm_source`);
      assert.ok(url.searchParams.get("utm_medium"), `${destination} lacks utm_medium`);
      assert.equal(url.searchParams.get("utm_campaign"), "tools_test_jul26");
      assert.ok(url.searchParams.get("utm_content"), `${destination} lacks utm_content`);
    }
  }
});

test("paid tracking uses the configured production IDs", async () => {
  const [layout, googleAds] = await Promise.all([
    readFile(path.join(repoRoot, "src/app/layout.tsx"), "utf8"),
    readFile(path.join(repoRoot, "src/lib/analytics/google-ads.ts"), "utf8"),
  ]);

  assert.match(layout, /G-T00BH5C80B/);
  assert.match(layout, /AW-18323307402/);
  assert.match(layout, /2542612909548568/);
  assert.match(googleAds, /AW-18323307402\/PnhDCN-Ho9AcEIr3naFE/);
});
