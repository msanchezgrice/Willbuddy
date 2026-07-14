"use client";

import type { Properties } from "posthog-js";
import {
  getAttributionProperties,
  stripSensitiveProperties,
} from "@/lib/analytics/properties";
import { loadPostHogClient } from "@/lib/analytics/posthog-client";
import { captureMetaEvent } from "@/lib/analytics/meta-pixel";
import { normalizeAnalyticsRoute } from "@/lib/analytics/routes";

type SearchParamsReader = {
  get(name: string): string | null;
};

export function captureAnalyticsEvent(
  event: string,
  properties: Properties = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const attributionProperties = getAttributionProperties(
    new URLSearchParams(window.location.search)
  );

  void capturePostHogEvent(event, {
    ...properties,
    ...attributionProperties,
  });
  captureMetaEvent(event, properties);
}

export function capturePageview(
  pathname: string | null,
  searchParams: SearchParamsReader | null
) {
  if (!pathname || typeof window === "undefined") {
    return;
  }

  const attributionProperties = searchParams
    ? getAttributionProperties(searchParams)
    : {};

  void capturePostHogEvent("$pageview", attributionProperties, pathname, {
    registerProperties: attributionProperties,
  });
}

async function capturePostHogEvent(
  event: string,
  properties: Properties = {},
  pathname = window.location.pathname,
  options: { registerProperties?: Properties } = {}
) {
  const posthog = await loadPostHogClient();
  if (!posthog) {
    return;
  }

  const route = normalizeAnalyticsRoute(pathname);
  const registerProperties = stripSensitiveProperties(
    options.registerProperties ?? {}
  );

  if (Object.keys(registerProperties).length > 0) {
    posthog.register(registerProperties);
  }

  try {
    posthog.capture(event, {
      ...stripSensitiveProperties(properties),
      route,
      path: route,
      $pathname: route,
      $current_url: `${window.location.origin}${route}`,
    });
  } catch (error) {
    console.warn("[analytics] capture failed", error);
  }
}
