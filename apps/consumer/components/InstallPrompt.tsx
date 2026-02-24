"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useDisplayMode } from "@/hooks/useDisplayMode";
import { X, ShareNetwork, Plus } from "@phosphor-icons/react";

function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

/** Routes where we never show install prompt (auth, etc.) */
const BLOCKED_ROUTES = ["/login", "/register", "/forgot-password"];

/** Routes without bottom nav - position prompt at screen bottom */
const NO_NAV_ROUTES = ["/", "/welcome", "/get-started"];

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

  const isBlocked = pathname && BLOCKED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const hasBottomNav = pathname && !NO_NAV_ROUTES.includes(pathname);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (displayMode !== "browser" || isDesktop() || isBlocked) return;

    const wasDismissed = sessionStorage.getItem(DISMISS_KEY);
    if (wasDismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const timer = setTimeout(() => {
      setDismissed(false);
      setVisible(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [displayMode, isBlocked]);

  useEffect(() => {
    if (deferredPrompt && !dismissed) {
      setVisible(true);
    }
  }, [deferredPrompt, dismissed]);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("install-prompt-visible");
    } else {
      document.body.classList.remove("install-prompt-visible");
    }
    return () => document.body.classList.remove("install-prompt-visible");
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") handleDismiss();
  }, [deferredPrompt, handleDismiss]);

  if (isBlocked || displayMode !== "browser" || dismissed || !visible) return null;
  if (isDesktop()) return null;

  const showChromePrompt = deferredPrompt !== null;
  const showIOSPrompt = isIOS() && !deferredPrompt;

  if (!showChromePrompt && !showIOSPrompt) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[9998] p-4 shadow-elevation-4 animate-slide-in-up md:hidden"
      style={{
        backgroundColor: "#FFFFFF",
        bottom: hasBottomNav ? "calc(5.5rem + env(safe-area-inset-bottom, 0px))" : "0",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
        paddingTop: "0.75rem",
      }}
    >
      <div className="max-w-[400px] mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: CHERRY }}>
              Add to Home Screen
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
              {showChromePrompt
                ? "Get the app icon and a better experience on your device."
                : "Tap Share, then Add to Home Screen to install."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ color: "#4B5563" }}
            aria-label="Dismiss"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        {showChromePrompt ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: CHERRY,
                boxShadow: "0 4px 12px rgba(109, 13, 53, 0.2)",
              }}
            >
              <Plus size={18} weight="bold" />
              Add to Home Screen
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 h-11 rounded-xl font-medium text-sm border transition-all active:scale-[0.98]"
              style={{ borderColor: CHERRY, color: CHERRY }}
            >
              Not now
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
            <ShareNetwork size={16} weight="regular" />
            <span>Share button is in the Safari menu bar</span>
          </div>
        )}
      </div>
    </div>
  );
}
