import assert from "node:assert/strict";
import test from "node:test";

const resendConfig = await import("../src/lib/resend.ts");

function restoreEnv(previous) {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

test("email helpers default to WillBuddy launch-domain addresses", () => {
  const previous = {
    RESEND_FROM: process.env.RESEND_FROM,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  delete process.env.RESEND_FROM;
  delete process.env.SUPPORT_EMAIL;
  delete process.env.NEXT_PUBLIC_APP_URL;

  try {
    assert.equal(
      resendConfig.getFromAddress(),
      "WillBuddy <hello@mywillbuddy.com>"
    );
    assert.equal(resendConfig.getSupportEmail(), "support@mywillbuddy.com");
    assert.equal(resendConfig.getAppUrl(), "https://mywillbuddy.com");
  } finally {
    restoreEnv(previous);
  }
});

test("email helpers prefer explicit environment values", () => {
  const previous = {
    RESEND_FROM: process.env.RESEND_FROM,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  process.env.RESEND_FROM = "WillBuddy <sender@example.com>";
  process.env.SUPPORT_EMAIL = "support@example.com";
  process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

  try {
    assert.equal(resendConfig.getFromAddress(), "WillBuddy <sender@example.com>");
    assert.equal(resendConfig.getSupportEmail(), "support@example.com");
    assert.equal(resendConfig.getAppUrl(), "https://example.com");
  } finally {
    restoreEnv(previous);
  }
});
