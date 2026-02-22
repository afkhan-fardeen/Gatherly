"use client";

import Image from "next/image";

const CHERRY = "#6D0D35";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/welcome-screen/welcome.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Primary color overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${CHERRY}E6` }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <span
          className="font-logo text-white drop-shadow-lg"
          style={{ fontSize: "clamp(6rem, 28vw, 12rem)", lineHeight: 1 }}
        >
          G
        </span>
        <span
          className="font-logo text-white text-4xl md:text-6xl font-normal tracking-tight drop-shadow-md"
        >
          Gatherlii
        </span>
      </div>
    </div>
  );
}
