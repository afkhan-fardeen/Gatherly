"use client";

import Link from "next/link";
import Image from "next/image";

const CHERRY = "#6D0D35";
const BODY_COLOR = "#4B5563";

export default function WelcomePage() {
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden min-h-[100dvh] h-[100dvh] w-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "#FFFFFF",
      }}
    >
      {/* Top half: Image */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 pt-6">
        <div className="w-full max-w-[280px] aspect-square relative">
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(63, 8, 16, 0.15)",
              boxShadow: "0 4px 30px rgba(63, 8, 16, 0.04)",
            }}
          >
            <div className="relative w-[85%] aspect-square">
              <Image
                src="/images/welcome-screen/welcome.png"
                alt=""
                fill
                className="object-cover rounded-full"
                priority
                sizes="240px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom half: Text + button */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-[400px] px-6 pb-6 mx-auto">
        <div className="text-center space-y-2">
          <h1
            className="text-4xl font-normal tracking-tight"
            style={{ color: CHERRY }}
          >
            Welcome to Gatherlii
          </h1>
          <h2
            className="text-lg font-semibold font-sans"
            style={{ color: BODY_COLOR }}
          >
            Your Ultimate Events Planning Companion
          </h2>
          <p
            className="text-[15px] leading-relaxed font-medium font-sans px-2"
            style={{ color: BODY_COLOR }}
          >
            Plan, organise, and enjoy seamless events with ease. Discover the
            best of local vendors and inspiring ideas.
          </p>
        </div>

        <Link
          href="/get-started"
          className="w-full h-12 mt-6 flex items-center justify-center font-semibold rounded-full text-white transition-all active:scale-[0.98]"
          style={{
            backgroundColor: CHERRY,
              boxShadow: "0 10px 15px -3px rgba(109, 13, 53, 0.2)",
          }}
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
