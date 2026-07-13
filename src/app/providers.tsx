"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { capturePageview } from "@/lib/analytics/client";
import { loadPostHogClient } from "@/lib/analytics/posthog-client";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsIdentity />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}

function AnalyticsIdentity() {
  const { isLoaded, user } = useUser();
  const pathname = usePathname();
  const previousUserIdRef = useRef<string | null>(null);
  const privacyModeRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    void loadPostHogClient().then((posthog) => {
      if (!posthog || cancelled) return;

      // Research answers must never inherit a signed-in Clerk identity. Reset
      // once on entry so the survey uses a fresh anonymous PostHog distinct ID.
      if (pathname === "/research/texas-estate-planning-readiness") {
        if (!privacyModeRef.current) {
          posthog.reset();
          privacyModeRef.current = true;
        }
        previousUserIdRef.current = null;
        return;
      }

      privacyModeRef.current = false;

      if (user?.id) {
        if (previousUserIdRef.current !== user.id) {
          posthog.identify(user.id, { is_authenticated: true });
        }
        previousUserIdRef.current = user.id;
        return;
      }

      if (previousUserIdRef.current) {
        posthog.reset();
        previousUserIdRef.current = null;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, pathname, user?.id]);

  return null;
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPageviewRef = useRef<string | null>(null);

  useEffect(() => {
    const pageviewKey = `${pathname ?? ""}?${searchParams.toString()}`;
    if (lastPageviewRef.current === pageviewKey) return;
    lastPageviewRef.current = pageviewKey;
    capturePageview(pathname, searchParams);
  }, [pathname, searchParams]);

  return null;
}
