"use client";

import type { Properties } from "posthog-js";

const META_PIXEL_READY_EVENT = "willbuddy:meta-pixel-ready";
const SAFE_MARKETING_PREFIXES = ["/tools", "/guides", "/blog"];
const SAFE_MARKETING_ROUTES = new Set([
  "/",
  "/contact",
  "/texas-estate-planning",
]);

type MetaPixel = (
  command: "track" | "trackCustom",
  event: string,
  properties?: Record<string, string>,
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
  if (typeof window === "undefined" || !isSafeMarketingRoute(window.location.pathname)) {
    return;
  }

  const metaEvent =
    event === "tool_started"
      ? "ToolStart"
      : event === "tool_completed"
        ? "ToolComplete"
        : null;

  if (!metaEvent) return;

  const tool = cleanToolName(properties.tool);
  const safeProperties = tool ? { tool } : undefined;

  runWhenMetaPixelReady(() => {
    window.fbq?.("trackCustom", metaEvent, safeProperties);
  });
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
