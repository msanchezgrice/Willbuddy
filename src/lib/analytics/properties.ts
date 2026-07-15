import type { Properties } from "posthog-js";

const SENSITIVE_PROPERTY_KEYS = [
  "email",
  "name",
  "message",
  "transcript",
  "decisions",
  "answers",
  "token",
  "invite_token",
  "share_token",
  "sessionId",
  "session_id",
  "userId",
  "user_id",
];

const ATTRIBUTION_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ttclid",
];

const MAX_ATTRIBUTION_VALUE_LENGTH = 160;
const POSTHOG_PUBLIC_TOKEN_PATTERN = /^phc_[A-Za-z0-9_-]+$/;

export const ANALYTICS_CONTEXT_PROPERTIES = {
  app: "willbuddy",
  site_domain: "mywillbuddy.com",
} as const;

type SearchParamsReader = {
  get(name: string): string | null;
};

export function stripSensitiveProperties(properties: Properties = {}): Properties {
  const sanitized: Properties = { ...properties };

  for (const key of SENSITIVE_PROPERTY_KEYS) {
    delete sanitized[key];
  }

  return sanitized;
}

/**
 * PostHog places its public project token in event.properties.token before
 * transport. Preserve only that SDK token while continuing to remove any
 * application-provided token-like value from analytics payloads.
 */
export function sanitizeTransportProperties(
  properties: Properties = {}
): Properties {
  const sanitized = stripSensitiveProperties(properties);
  const token = properties.token;

  if (typeof token === "string" && POSTHOG_PUBLIC_TOKEN_PATTERN.test(token)) {
    sanitized.token = token;
  }

  return sanitized;
}

export function getAttributionProperties(
  searchParams: SearchParamsReader
): Properties {
  const properties: Properties = {};

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = cleanAttributionValue(searchParams.get(key));
    if (value) {
      properties[key] = value;
    }
  }

  const paidSource = getPaidSource(properties);
  if (paidSource) {
    properties.paid_source = paidSource;
  }

  return properties;
}

export function getSafeAttributionQuery(properties: Properties): string {
  const searchParams = new URLSearchParams();

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = properties[key];
    if (typeof value === "string" && value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getPaidSource(properties: Properties): string | null {
  const source =
    typeof properties.utm_source === "string"
      ? properties.utm_source.toLowerCase()
      : "";

  if (
    source === "google" ||
    properties.gclid ||
    properties.gbraid ||
    properties.wbraid
  ) {
    return "google_ads";
  }

  if (source === "fb" || source === "facebook" || source === "ig" || source === "instagram" || properties.fbclid) {
    return "meta_ads";
  }

  if (source === "bing" || source === "microsoft" || properties.msclkid) {
    return "microsoft_ads";
  }

  if (source === "tiktok" || properties.ttclid) {
    return "tiktok_ads";
  }

  return null;
}

function cleanAttributionValue(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_ATTRIBUTION_VALUE_LENGTH);
}
