"use client";

import Image from "next/image";

const CHERRY = "#6D0D35";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: CHERRY }}
      aria-hidden="true"
    >
      {/* Content */}
      <div className="flex flex-col items-center gap-0">
        <div className="relative w-[clamp(11rem,45vw,22rem)] h-[clamp(11rem,45vw,22rem)]">
          <Image
            src="/images/welcome-screen/g.png"
            alt=""
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 45vw, 22rem"
          />
        </div>
        <div className="relative w-[clamp(14rem,70vw,28rem)] h-20 md:h-24">
          <Image
            src="/images/welcome-screen/logo.png"
            alt="Gatherlii"
            fill
            className="object-contain object-center"
            priority
            sizes="(max-width: 768px) 70vw, 28rem"
          />
        </div>
      </div>
    </div>
  );
}
