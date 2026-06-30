"use client";

import type { CaptureResult } from "posthog-js";
import { stripSensitiveProperties } from "@/lib/analytics/properties";
import { normalizeAnalyticsRoute } from "@/lib/analytics/routes";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

type PostHogClient = typeof import("posthog-js").default;

let clientPromise: Promise<PostHogClient | null> | null = null;
let initialized = false;

export function loadPostHogClient(): Promise<PostHogClient | null> {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token || typeof window === "undefined") {
    return Promise.resolve(null);
  }

  clientPromise ??= import("posthog-js")
    .then(({ default: posthog }) => {
      if (!initialized) {
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
      }

      return posthog;
    })
    .catch((error) => {
      console.warn("[analytics] posthog load failed", error);
      clientPromise = null;
      return null;
    });

  return clientPromise;
}

export function scheduleAnalyticsWork(work: () => void) {
  if (typeof window === "undefined") {
    return;
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(work, { timeout: 3000 });
    return;
  }

  globalThis.setTimeout(work, 1200);
}

function sanitizePostHogEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) {
    return null;
  }

  const properties = stripSensitiveProperties(event.properties ?? {});
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

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
