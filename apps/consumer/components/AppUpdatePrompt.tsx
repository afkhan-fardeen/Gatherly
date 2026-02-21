"use client";

import { useState, useEffect } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import toast from "react-hot-toast";

const CHERRY = "#6D0D35";

export function AppUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = navigator.serviceWorker.getRegistration();
    if (!reg) return;
    reg.then((registration) => {
      if (!registration) return;
      // Check for new version when app opens
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
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      setUpdateAvailable(false);
    });
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
