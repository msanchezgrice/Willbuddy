import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY not set");
  }
  cached = new Resend(key);
  return cached;
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM ?? "WillBuddy <hello@mywillbuddy.com>";
}

export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL ?? "support@mywillbuddy.com";
}

/** Where inbound mail to support@ / hello@ is forwarded. */
export function getInboundForwardTo(): string {
  return (
    process.env.INBOUND_FORWARD_TO ??
    process.env.SUPPORT_EMAIL ??
    "msanchezgrice@gmail.com"
  );
}

/**
 * Address that user replies to transactional/drip emails should land on.
 * Defaults to the support inbox so replies are received, not lost.
 */
export function getReplyToAddress(): string {
  return process.env.RESEND_REPLY_TO ?? getSupportEmail();
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://mywillbuddy.com";
}
