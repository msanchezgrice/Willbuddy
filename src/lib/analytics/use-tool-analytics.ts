"use client";

import { useCallback, useRef } from "react";
import type { Properties } from "posthog-js";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

export function useToolAnalytics(tool: string, toolVersion = "2026-07-13") {
  const startedRef = useRef(false);

  const recordStart = useCallback(
    (entryPoint = "interaction") => {
      if (startedRef.current) return;
      startedRef.current = true;
      captureAnalyticsEvent("tool_started", {
        tool,
        tool_version: toolVersion,
        entry_point: entryPoint,
      });
    },
    [tool, toolVersion]
  );

  const recordComplete = useCallback(
    (properties: Properties = {}) => {
      recordStart("completion");
      captureAnalyticsEvent("tool_completed", {
        tool,
        tool_version: toolVersion,
        ...properties,
      });
    },
    [recordStart, tool, toolVersion]
  );

  return { recordStart, recordComplete };
}
