"use client";

import { Sparkle } from "@phosphor-icons/react";

const CHERRY = "#6D0D35";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: CHERRY,
            boxShadow: "0 10px 40px rgba(109, 13, 53, 0.25)",
          }}
        >
          <Sparkle size={40} weight="fill" className="text-white" />
        </div>
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: CHERRY }}
        >
          Gatherlii
        </span>
      </div>
    </div>
  );
}
