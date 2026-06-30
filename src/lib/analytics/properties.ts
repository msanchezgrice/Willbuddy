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

  return properties;
}

function cleanAttributionValue(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_ATTRIBUTION_VALUE_LENGTH);
}
