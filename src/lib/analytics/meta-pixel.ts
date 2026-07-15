"use client";

import type { Properties } from "posthog-js";

const META_PIXEL_READY_EVENT = "willbuddy:meta-pixel-ready";
const SAFE_MARKETING_PREFIXES = ["/tools", "/guides", "/blog"];
const SAFE_MARKETING_ROUTES = new Set([
  "/",
  "/contact",
  "/texas-estate-planning",
]);
const PURCHASE_VALUE_USD = 49;

type MetaPixel = (
  command: "track" | "trackCustom",
  event: string,
  properties?: Record<string, string | number>,
) => void;

declare global {
  interface Window {
    fbq?: MetaPixel;
  }
}

export function captureMetaPageview(pathname: string | null) {
  if (!pathname || !isSafeMarketingRoute(pathname)) return;

  runWhenMetaPixelReady(() => {
    window.fbq?.("track", "PageView");
  });
}

export function captureMetaEvent(event: string, properties: Properties = {}) {
  if (typeof window === "undefined") return;

  const tool = cleanToolName(properties.tool);
  const toolProperties = tool ? { content_name: tool } : undefined;

  if (event === "tool_started" && isSafeMarketingRoute(window.location.pathname)) {
    runWhenMetaPixelReady(() => {
      window.fbq?.("trackCustom", "ToolStart", toolProperties);
    });
    return;
  }

  if (event === "tool_completed" && isSafeMarketingRoute(window.location.pathname)) {
    runWhenMetaPixelReady(() => {
      window.fbq?.("trackCustom", "ToolComplete", toolProperties);
      window.fbq?.("track", "Lead", toolProperties);
    });
    return;
  }

  if (event === "onboarding_completed") {
    runWhenMetaPixelReady(() => {
      window.fbq?.("track", "CompleteRegistration");
    });
    return;
  }

  if (event === "checkout_started") {
    runWhenMetaPixelReady(() => {
      window.fbq?.("track", "InitiateCheckout", {
        value: PURCHASE_VALUE_USD,
        currency: "USD",
      });
    });
    return;
  }

  if (event === "payment_completed") {
    runWhenMetaPixelReady(() => {
      window.fbq?.("track", "Purchase", {
        value: PURCHASE_VALUE_USD,
        currency: "USD",
      });
    });
  }
}

function isSafeMarketingRoute(pathname: string) {
  return (
    SAFE_MARKETING_ROUTES.has(pathname) ||
    SAFE_MARKETING_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function cleanToolName(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return cleaned || null;
}

function runWhenMetaPixelReady(callback: () => void) {
  if (typeof window === "undefined") return;

  if (window.fbq) {
    callback();
    return;
  }

  window.addEventListener(META_PIXEL_READY_EVENT, callback, { once: true });
}
