"use client";

const GOOGLE_ADS_TOOL_COMPLETION = "AW-18323307402/PnhDCN-Ho9AcEIr3naFE";

type GoogleTag = (
  command: "event",
  event: "conversion",
  properties: {
    send_to: string;
    value: number;
    currency: "USD";
  },
) => void;

declare global {
  interface Window {
    gtag?: GoogleTag;
  }
}

export function captureGoogleAdsEvent(event: string) {
  if (
    typeof window === "undefined" ||
    event !== "tool_completed" ||
    !isPublicToolRoute(window.location.pathname)
  ) {
    return;
  }

  window.gtag?.("event", "conversion", {
    send_to: GOOGLE_ADS_TOOL_COMPLETION,
    value: 1,
    currency: "USD",
  });
}

function isPublicToolRoute(pathname: string) {
  return pathname === "/tools" || pathname.startsWith("/tools/");
}
