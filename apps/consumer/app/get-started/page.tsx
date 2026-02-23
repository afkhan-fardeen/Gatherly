"use client";

import Link from "next/link";
import { AppleLogo, Phone, Envelope } from "@phosphor-icons/react";
import { AuthScreenWrapper } from "@/components/auth/AuthScreenWrapper";
import { BrandHeading } from "@/components/auth/BrandHeading";

const CHERRY = "#6D0D35";
const CHERRY_LIGHT = "#f0d4e0";
const LIGHT_BG = "#FFFFFF";

export default function GetStartedPage() {
  return (
    <AuthScreenWrapper>
      <header className="text-center">
        <div className="flex justify-center mb-2">
          <BrandHeading />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <h1
          className="font-serif text-2xl font-normal text-center"
          style={{ color: CHERRY }}
        >
          Get Started
        </h1>
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-white/90 border h-[56px] rounded-full flex items-center justify-center gap-4 px-6 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-70"
            style={{ borderColor: CHERRY_LIGHT }}
            disabled
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0" style={{ color: CHERRY }}>
              <AppleLogo size={22} weight="regular" />
            </span>
            <span
              className="font-semibold text-[15px]"
              style={{ color: CHERRY }}
            >
              Continue with Apple
            </span>
          </button>
          <button
            type="button"
            className="w-full bg-white/90 border h-[56px] rounded-full flex items-center justify-center gap-4 px-6 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-70"
            style={{ borderColor: CHERRY_LIGHT }}
            disabled
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0" style={{ color: CHERRY }}>
              <Phone size={22} weight="regular" />
            </span>
            <span
              className="font-semibold text-[15px]"
              style={{ color: CHERRY }}
            >
              Continue with Phone
            </span>
          </button>
          <Link
            href="/register"
            className="w-full h-[56px] rounded-full flex items-center justify-center gap-4 px-6 active:scale-[0.98] transition-all shadow-lg"
            style={{
              backgroundColor: CHERRY,
              color: LIGHT_BG,
              boxShadow: "0 10px 15px -3px rgba(63, 8, 16, 0.2)",
            }}
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0">
              <Envelope size={22} weight="regular" />
            </span>
            <span className="font-semibold text-[15px]">Continue with Email</span>
          </Link>
        </div>
        <p
          className="text-[11px] leading-relaxed text-center px-4"
          style={{ color: "#4B5563" }}
        >
          By tapping Continue, you agree to our{" "}
          <Link
            href="#"
            className="font-semibold hover:underline"
            style={{ color: CHERRY }}
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="font-semibold hover:underline"
            style={{ color: CHERRY }}
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthScreenWrapper>
  );
}
