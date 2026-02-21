"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useDisplayMode } from "@/hooks/useDisplayMode";
import { X } from "@phosphor-icons/react";

const INSTALL_PROMPT_ROUTES = ["/", "/welcome", "/get-started", "/dashboard"];
const DASHBOARD_ONCE_KEY = "installPromptDashboardShown";

const CHERRY = "#6D0D35";
const DISMISS_KEY = "installPromptDismissed";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function InstallPrompt() {
  const pathname = usePathname();
  const displayMode = useDisplayMode();

  const showOnRoute = pathname && INSTALL_PROMPT_ROUTES.includes(pathname);
  const [dashboardAlreadyShown, setDashboardAlreadyShown] = useState(false);
  useEffect(() => {
    if (pathname === "/dashboard" && typeof window !== "undefined") {
      setDashboardAlreadyShown(!!localStorage.getItem(DASHBOARD_ONCE_KEY));
    }
  }, [pathname]);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (displayMode !== "browser") return;

    const wasDismissed = sessionStorage.getItem(DISMISS_KEY);
    if (wasDismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const timer = setTimeout(() => {
      if (isIOS()) {
        setDismissed(false);
      }
      setVisible(true);
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [displayMode]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
    if (pathname === "/dashboard") {
      localStorage.setItem(DASHBOARD_ONCE_KEY, "1");
    }
  }, [pathname]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") handleDismiss();
  }, [deferredPrompt, handleDismiss]);

  if (!showOnRoute || displayMode !== "browser" || dismissed || !visible) return null;
  if (pathname === "/dashboard" && dashboardAlreadyShown) return null;

  const showChromePrompt = deferredPrompt !== null;
  const showIOSPrompt = isIOS() && !deferredPrompt;

  if (!showChromePrompt && !showIOSPrompt) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 shadow-elevation-4"
      style={{
        backgroundColor: "#F9F2E7",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="max-w-[400px] mx-auto flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: CHERRY }}>
            Install the app
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
            {showChromePrompt
              ? "Get a better experience with the app on your device."
              : "Tap Share, then Add to Home Screen to install."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
          style={{ color: "#4B5563" }}
          aria-label="Dismiss"
        >
          <X size={22} weight="bold" />
        </button>
      </div>
      {showChromePrompt && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 h-[52px] rounded-xl font-semibold text-base text-white transition-all active:scale-[0.98]"
            style={{
              backgroundColor: CHERRY,
              boxShadow: "0 4px 12px rgba(109, 13, 53, 0.2)",
            }}
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 h-12 rounded-xl font-semibold text-sm border transition-all active:scale-[0.98]"
            style={{ borderColor: CHERRY, color: CHERRY }}
          >
            Not now
          </button>
        </div>
      )}
    </div>
  );
}
