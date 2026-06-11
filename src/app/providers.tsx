"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import type { CaptureResult, Properties } from "posthog-js";
import { normalizeAnalyticsRoute } from "@/lib/analytics/routes";

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!token || initialized) {
      return;
    }

    posthog.init(token, {
      api_host: POSTHOG_HOST,
      defaults: "2026-01-30",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_performance: false,
      disable_session_recording: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      mask_personal_data_properties: true,
      custom_personal_data_properties: [
        "email",
        "name",
        "message",
        "token",
        "sessionId",
        "session_id",
      ],
      before_send: sanitizePostHogEvent,
    });

    initialized = true;
  }, []);

  useEffect(() => {
    if (!initialized || !pathname || typeof window === "undefined") {
      return;
    }

    const route = normalizeAnalyticsRoute(pathname);
    posthog.capture("$pageview", {
      route,
      path: route,
      $pathname: route,
      $current_url: `${window.location.origin}${route}`,
    });
  }, [pathname]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

function sanitizePostHogEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) {
    return null;
  }

  const properties = sanitizeProperties(event.properties ?? {});
  const path = getString(properties.$pathname) ?? window.location.pathname;
  const route = normalizeAnalyticsRoute(path);

  properties.route = route;
  properties.path = route;
  properties.$pathname = route;
  properties.$current_url = `${window.location.origin}${route}`;

  return {
    ...event,
    properties,
  };
}

function sanitizeProperties(properties: Properties): Properties {
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

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
