"use client";

import type { Properties } from "posthog-js";
import { getSafeAttributionQuery } from "@/lib/analytics/properties";
import { normalizeAnalyticsRoute } from "@/lib/analytics/routes";

const GOOGLE_TAG_READY_EVENT = "willbuddy:google-tag-ready";
const GOOGLE_ADS_TOOL_COMPLETION = "AW-18323307402/PnhDCN-Ho9AcEIr3naFE";
const PURCHASE_VALUE_USD = 49;

type GoogleTag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GoogleTag;
  }
}

export function captureGooglePageview(
  pathname: string,
  attributionProperties: Properties = {}
) {
  if (typeof window === "undefined") return;

  const route = normalizeAnalyticsRoute(pathname);
  const pageLocation = `${window.location.origin}${route}${getSafeAttributionQuery(attributionProperties)}`;

  runWhenGoogleTagReady(() => {
    window.gtag?.("event", "page_view", {
      app_name: "willbuddy",
      page_path: route,
      page_location: pageLocation,
    });
  });
}

export function captureGoogleAdsEvent(
  event: string,
  properties: Properties = {}
) {
  if (typeof window === "undefined") return;

  const route = normalizeAnalyticsRoute(window.location.pathname);
  const ga4Event = getGa4Event(event);

  if (ga4Event) {
    const tool = cleanToolName(properties.tool);
    const commerceProperties =
      event === "checkout_started" || event === "payment_completed"
        ? { value: PURCHASE_VALUE_USD, currency: "USD" }
        : {};

    runWhenGoogleTagReady(() => {
      window.gtag?.("event", ga4Event, {
        app_name: "willbuddy",
        page_path: route,
        page_location: `${window.location.origin}${route}`,
        ...(tool ? { tool } : {}),
        ...commerceProperties,
      });
    });
  }

  if (event !== "tool_completed" || !isPublicToolRoute(window.location.pathname)) {
    return;
  }

  runWhenGoogleTagReady(() => {
    window.gtag?.("event", "conversion", {
      send_to: GOOGLE_ADS_TOOL_COMPLETION,
      value: 1,
      currency: "USD",
    });
  });
}

function getGa4Event(event: string): string | null {
  switch (event) {
    case "tool_started":
      return "tool_start";
    case "tool_completed":
      return "generate_lead";
    case "onboarding_started":
      return "onboarding_start";
    case "onboarding_completed":
      return "onboarding_complete";
    case "checkout_started":
      return "begin_checkout";
    case "payment_completed":
      return "purchase";
    default:
      return null;
  }
}

function isPublicToolRoute(pathname: string) {
  return pathname === "/tools" || pathname.startsWith("/tools/");
}

function cleanToolName(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return cleaned || null;
}

function runWhenGoogleTagReady(callback: () => void) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    callback();
    return;
  }

  window.addEventListener(GOOGLE_TAG_READY_EVENT, callback, { once: true });
}
