"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthScreenWrapper } from "@/components/auth/AuthScreenWrapper";

const CHERRY = "#6D0D35";

export default function ForgotPasswordPage() {
  return (
    <AuthScreenWrapper backgroundColor="#f9f2e7">
      <header className="text-center">
        <div className="flex justify-center mb-2">
          <Link href="/login">
            <Image
              src="/logo/logo1.png"
              alt="Gatherlii"
              width={240}
              height={64}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <h2
            className="text-xl font-medium leading-tight mb-2"
            style={{ color: CHERRY }}
          >
            Forgot password?
          </h2>
          <p
            className="text-xs font-normal"
            style={{ color: "#4B5563" }}
          >
            Password reset is coming soon. Please contact support if you need help.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full py-4 text-center text-white font-medium rounded-[12px] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm"
          style={{
            backgroundColor: CHERRY,
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          Back to login
        </Link>
      </div>
    </AuthScreenWrapper>
  );
}
