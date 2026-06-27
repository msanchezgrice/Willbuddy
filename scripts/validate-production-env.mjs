const REQUIRED_PRODUCTION_ORIGIN = "https://mywillbuddy.com";
const REQUIRED_EMAIL_DOMAIN = "mywillbuddy.com";

const isProductionDeploy = process.env.VERCEL_ENV === "production";

if (!isProductionDeploy) {
  console.log("[env] Production env guard skipped outside Vercel Production.");
  process.exit(0);
}

const errors = [];

function value(name) {
  return (process.env[name] ?? "").trim();
}

function requireValue(name) {
  const current = value(name);
  if (!current) {
    errors.push(`${name} is required for Vercel Production.`);
  }
  return current;
}

function requirePrefix(name, prefix, label) {
  const current = requireValue(name);
  if (!current) return;
  if (!current.startsWith(prefix)) {
    errors.push(`${name} must be a ${label} value (${prefix}...).`);
  }
}

function originOf(rawUrl) {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return "";
  }
}

function senderAddress(from) {
  const bracketMatch = from.match(/<([^>]+)>/);
  return (bracketMatch?.[1] ?? from).trim().toLowerCase();
}

requirePrefix(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "pk_live_",
  "Clerk live publishable key",
);
requirePrefix("CLERK_SECRET_KEY", "sk_live_", "Clerk live secret key");

const appUrl = requireValue("NEXT_PUBLIC_APP_URL");
if (appUrl && originOf(appUrl) !== REQUIRED_PRODUCTION_ORIGIN) {
  errors.push(`NEXT_PUBLIC_APP_URL must resolve to ${REQUIRED_PRODUCTION_ORIGIN}.`);
}

const from = requireValue("RESEND_FROM");
if (from) {
  const address = senderAddress(from);
  if (address.endsWith("@resend.dev")) {
    errors.push("RESEND_FROM must not use the resend.dev sandbox sender.");
  }
  if (!address.endsWith(`@${REQUIRED_EMAIL_DOMAIN}`)) {
    errors.push(`RESEND_FROM must send from ${REQUIRED_EMAIL_DOMAIN}.`);
  }
}

if (errors.length > 0) {
  console.error("WillBuddy production env validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error(
    "Use the production Clerk instance and a verified Resend sender such as WillBuddy <support@mywillbuddy.com>.",
  );
  process.exit(1);
}

console.log("[env] Production env guard passed.");
