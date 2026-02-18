"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Envelope, Lock, GoogleLogo } from "@phosphor-icons/react";
import { AuthScreenWrapper } from "@/components/auth/AuthScreenWrapper";
import { BrandHeading } from "@/components/auth/BrandHeading";
import { GlassCard } from "@/components/auth/GlassCard";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthButton } from "@/components/ui/AuthButton";
import { API_URL, parseJsonResponse } from "@/lib/api";

const CHERRY = "#6D0D35";
const SOFT_LILAC = "#CFD7F2";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJsonResponse<{ error?: string; token?: string; user?: unknown }>(res);
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg === "Failed to fetch" ? "Unable to connect. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenWrapper>
      <header className="text-center">
        <div className="flex justify-center">
          <BrandHeading />
        </div>
      </header>

      <GlassCard>
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold leading-tight mb-2"
            style={{ color: CHERRY }}
          >
            Welcome Back
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: "#4B5563" }}
          >
            Sign in to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={setEmail}
            error={error}
            required
            icon={<Envelope size={20} weight="regular" />}
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
            icon={<Lock size={20} weight="regular" />}
            forgotPasswordHref="#"
          />
          <div className="mt-4">
          <AuthButton loading={loading}>Sign In</AuthButton>
        </div>
          <div className="flex items-center gap-4 py-2">
            <div
              className="h-[1px] flex-1"
              style={{ backgroundColor: "rgba(207, 215, 242, 0.5)" }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#4B5563" }}
            >
              or
            </span>
            <div
              className="h-[1px] flex-1"
              style={{ backgroundColor: "rgba(207, 215, 242, 0.5)" }}
            />
          </div>
          <button
            type="button"
            className="w-full border py-3.5 rounded-full flex items-center justify-center gap-4 hover:bg-white/30 transition-all font-semibold text-sm"
            style={{ borderColor: SOFT_LILAC, color: CHERRY }}
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0" style={{ color: CHERRY }}>
              <GoogleLogo size={20} weight="regular" />
            </span>
            Continue with Google
          </button>
        </form>
      </GlassCard>

      <footer className="text-center">
        <p
          className="text-sm font-medium"
          style={{ color: "#4B5563" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline underline-offset-4"
            style={{ color: CHERRY }}
          >
            Sign up
          </Link>
        </p>
      </footer>
    </AuthScreenWrapper>
  );
}
