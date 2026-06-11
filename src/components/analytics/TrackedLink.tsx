"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { Properties } from "posthog-js";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event: string;
  eventProperties?: Properties;
};

export function TrackedLink({
  event,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(clickEvent) => {
        onClick?.(clickEvent);
        if (!clickEvent.defaultPrevented) {
          captureAnalyticsEvent(event, eventProperties);
        }
      }}
    />
  );
}
