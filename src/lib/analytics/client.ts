"use client";

import posthog from "posthog-js";
import type { Properties } from "posthog-js";
import { normalizeAnalyticsRoute } from "@/lib/analytics/routes";

export function captureAnalyticsEvent(
  event: string,
  properties: Properties = {}
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || typeof window === "undefined") {
    return;
  }

  const route = normalizeAnalyticsRoute(window.location.pathname);

  try {
    posthog.capture(event, {
      ...stripSensitiveProperties(properties),
      route,
      path: route,
    });
  } catch (error) {
    console.warn("[analytics] capture failed", error);
  }
}

function stripSensitiveProperties(properties: Properties): Properties {
  const sanitized: Properties = { ...properties };
  const blocked = [
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

  for (const key of blocked) {
    delete sanitized[key];
  }

  return sanitized;
}
