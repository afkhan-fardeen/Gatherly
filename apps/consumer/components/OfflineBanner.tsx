"use client";

import { useState, useEffect } from "react";
import { WifiSlash } from "@phosphor-icons/react";

const BURGUNDY = "#3F0810";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-3 px-4 text-white text-sm font-medium"
      style={{
        backgroundColor: BURGUNDY,
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
      }}
    >
      <WifiSlash size={18} weight="bold" />
      <span>You&apos;re offline. Check your connection.</span>
    </div>
  );
}
