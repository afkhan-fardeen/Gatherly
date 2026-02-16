"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Envelope, Lock } from "@phosphor-icons/react";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthButton } from "@/components/ui/AuthButton";
import { API_URL, parseJsonResponse } from "@/lib/api";

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
    <AuthLayout
      title="Create your account"
      footer={
        <p className="text-[15px] text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-slate-900 font-semibold hover:underline decoration-primary decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <AuthInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={setName}
          required
          icon={<User size={18} weight="regular" />}
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          required
          icon={<Envelope size={18} weight="regular" />}
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
          icon={<Lock size={18} weight="regular" />}
        />
        <AuthButton loading={loading}>Sign Up</AuthButton>
      </form>
    </AuthLayout>
  );
}
