import type { Properties } from "posthog-js";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Properties = {}
) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    return { ok: false, reason: "missing_posthog_token" };
  }

  const host = (
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: token,
        event,
        distinct_id: distinctId,
        properties: stripSensitiveProperties(properties),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[analytics] server capture failed", response.status);
      return { ok: false, reason: `posthog_${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.warn("[analytics] server capture threw", error);
    return { ok: false, reason: "posthog_request_failed" };
  }
}

function stripSensitiveProperties(properties: Properties): Properties {
  const sanitized: Properties = { ...properties };

  for (const key of [
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
  ]) {
    delete sanitized[key];
  }

  return sanitized;
}
