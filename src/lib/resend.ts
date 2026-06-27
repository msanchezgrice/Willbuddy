import { Resend } from "resend";

export const APP_URL = "https://mywillbuddy.com";
export const SUPPORT_EMAIL = "support@mywillbuddy.com";
export const DEFAULT_FROM_ADDRESS = `WillBuddy <${SUPPORT_EMAIL}>`;

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
  return process.env.RESEND_FROM ?? DEFAULT_FROM_ADDRESS;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? APP_URL;
}
