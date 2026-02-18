"use client";

import { useState, useEffect } from "react";

export function useDisplayMode(): "standalone" | "browser" {
  const [mode, setMode] = useState<"standalone" | "browser">("browser");

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const mqFull = window.matchMedia("(display-mode: fullscreen)");
    const isStandalone =
      mq.matches || mqFull.matches || !!(navigator as { standalone?: boolean }).standalone;
    setMode(isStandalone ? "standalone" : "browser");
  }, []);

  return mode;
}
