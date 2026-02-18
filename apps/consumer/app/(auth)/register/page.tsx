"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Envelope, Lock } from "@phosphor-icons/react";
import { AuthScreenWrapper } from "@/components/auth/AuthScreenWrapper";
import { BrandHeading } from "@/components/auth/BrandHeading";
import { GlassCard } from "@/components/auth/GlassCard";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthButton } from "@/components/ui/AuthButton";
import { API_URL, parseJsonResponse } from "@/lib/api";

const CHERRY = "#6D0D35";
const SOFT_LILAC = "#CFD7F2";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role: "consumer" }),
      });
      const data = await parseJsonResponse<{ error?: string; token?: string; user?: unknown }>(res);
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
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
            Create your account
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: "#4B5563" }}
          >
            Sign up to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={setName}
            required
            icon={<User size={20} weight="regular" />}
          />
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={setEmail}
            required
            icon={<Envelope size={20} weight="regular" />}
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            error={error}
            required
            minLength={8}
            icon={<Lock size={20} weight="regular" />}
          />
          <div className="mt-4">
            <AuthButton loading={loading}>Sign Up</AuthButton>
          </div>
        </form>
      </GlassCard>

      <footer className="text-center">
        <p
          className="text-sm font-medium"
          style={{ color: "#4B5563" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline underline-offset-4"
            style={{ color: CHERRY }}
          >
            Sign in
          </Link>
        </p>
      </footer>
    </AuthScreenWrapper>
  );
}
