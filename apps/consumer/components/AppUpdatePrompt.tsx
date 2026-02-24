"use client";

import { useState, useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

const CHERRY = "#6D0D35";
const UPDATE_CHECK_INTERVAL_MS = 30_000;

function checkForUpdates() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistration().then((registration) => {
    registration?.update();
  });
}

export function AppUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = navigator.serviceWorker.getRegistration();
    if (!reg) return;
    reg.then((registration) => {
      if (!registration) return;
      registration.update();
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });
    const onControllerChange = () => {
      setUpdateAvailable(false);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdates();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white p-6"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      aria-modal="true"
      aria-labelledby="update-title"
      role="dialog"
    >
      <div className="max-w-sm w-full text-center">
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${CHERRY}15` }}
        >
          <ArrowClockwise size={32} weight="bold" className="text-primary" />
        </div>
        <h2 id="update-title" className="font-serif text-2xl font-medium text-slate-900 mb-2">
          Update required
        </h2>
        <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
          A new version of Gatherlii is available. Please update now to get the latest app icon, features, and improvements. Your experience will be better with the latest version.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 px-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109, 13, 53, 0.3)" }}
        >
          <ArrowClockwise size={20} weight="bold" />
          Update now
        </button>
      </div>
    </div>
  );
}
