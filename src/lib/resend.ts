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
  return process.env.RESEND_FROM ?? "WillBuddy <onboarding@resend.dev>";
}

export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL ?? "support@willbuddy.app";
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://willbuddy.app";
}
