"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { validateSession, getToken } from "@/lib/session";

const MIN_SPLASH_MS = 600;

/**
 * Shows splash on app open, validates session, redirects logged-in users from / to dashboard.
 * Ensures: splash → then content. No flash. 7-day logout via JWT expiry (validated on 401).
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) setShowSplash(false);
      }, remaining);
    };

    const token = getToken();
    if (!token || pathname !== "/") {
      finish();
      return;
    }

    validateSession().then((result) => {
      if (cancelled) return;
      if (result.valid) {
        router.replace("/dashboard");
        // Splash stays until pathname changes to /dashboard, then effect re-runs and calls finish
        return;
      }
      finish();
    });

    return () => { cancelled = true; };
  }, [pathname, router]);

  return (
    <>
      {showSplash && <SplashScreen />}
      {children}
    </>
  );
}
