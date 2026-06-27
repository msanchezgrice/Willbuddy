import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("./validate-production-env.mjs", import.meta.url);

function run(overrides) {
  return spawnSync(process.execPath, [script.pathname], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      ...overrides,
    },
  });
}

test("skips outside Vercel Production", () => {
  const result = run({});

  assert.equal(result.status, 0);
  assert.match(result.stdout, /guard skipped/);
});

test("accepts live Clerk and mywillbuddy.com email production config", () => {
  const result = run({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_example",
    CLERK_SECRET_KEY: "sk_live_example",
    NEXT_PUBLIC_APP_URL: "https://mywillbuddy.com",
    RESEND_FROM: "WillBuddy <support@mywillbuddy.com>",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /guard passed/);
});

test("rejects Clerk test keys and sandbox email sender in production", () => {
  const result = run({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
    NEXT_PUBLIC_APP_URL: "https://willbuddy.vercel.app",
    RESEND_FROM: "WillBuddy <onboarding@resend.dev>",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.match(result.stderr, /CLERK_SECRET_KEY/);
  assert.match(result.stderr, /NEXT_PUBLIC_APP_URL/);
  assert.match(result.stderr, /resend\.dev/);
});
