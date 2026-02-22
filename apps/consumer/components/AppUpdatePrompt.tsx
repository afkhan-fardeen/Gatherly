"use client";

import { useState, useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import toast from "react-hot-toast";

const CHERRY = "#6D0D35";
const UPDATE_CHECK_INTERVAL_MS = 60_000;

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

  useEffect(() => {
    if (!updateAvailable) return;
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">New version available</span>
          <button
            onClick={() => {
              window.location.reload();
              toast.dismiss(t.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: CHERRY }}
          >
            <ArrowClockwise size={14} weight="bold" />
            Refresh
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-500 hover:text-slate-700 text-xs"
          >
            Later
          </button>
        </div>
      ),
      { duration: Infinity, id: "app-update" }
    );
    return () => {
      toast.dismiss("app-update");
    };
  }, [updateAvailable]);

  return null;
}
