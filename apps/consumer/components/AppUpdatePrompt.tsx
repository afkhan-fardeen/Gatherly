"use client";

import { useState, useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

const CHERRY = "#6D0D35";
const UPDATE_CHECK_INTERVAL_MS = 30_000; // Check every 30s for quick updates

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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6"
      aria-modal="true"
      aria-labelledby="update-title"
      role="dialog"
    >
      <div className="max-w-sm w-full text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${CHERRY}15` }}
        >
          <ArrowClockwise size={32} weight="bold" className="text-primary" />
        </div>
        <h2 id="update-title" className="text-xl font-semibold text-slate-900 mb-2">
          Update available
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          A new version of Gatherlii is ready. Please update to continue using the app.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: CHERRY }}
        >
          <ArrowClockwise size={20} weight="bold" />
          Update now
        </button>
      </div>
    </div>
  );
}
