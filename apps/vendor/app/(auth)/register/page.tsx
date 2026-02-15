"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthButton } from "@/components/ui/AuthButton";
import { VENDOR_CATEGORIES } from "@/lib/categories";
import { API_URL, parseJsonResponse } from "@/lib/api";

type Step = 1 | 2 | 3;

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<string>("catering");
  const [cuisineTypes, setCuisineTypes] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
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
        body: JSON.stringify({
          email,
          password,
          name,
          role: "vendor",
          businessName: businessName.trim(),
        }),
      });
      const data = await parseJsonResponse<{ error?: string; token?: string; user?: unknown; details?: { fieldErrors?: { businessName?: string[] } } }>(res);
      if (!res.ok) throw new Error(data.error || data.details?.fieldErrors?.businessName?.[0] || "Registration failed");
      if (!data.token || !data.user) throw new Error("Invalid response from server");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const cuisineArr = cuisineTypes.split(",").map((s) => s.trim()).filter(Boolean);
      const areasArr = serviceAreas.split(",").map((s) => s.trim()).filter(Boolean);
      await fetch(`${API_URL}/api/vendor/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          businessType: category,
          ...(cuisineArr.length > 0 && { cuisineTypes: cuisineArr }),
          ...(areasArr.length > 0 && { serviceAreas: areasArr }),
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg === "Failed to fetch" ? "Unable to connect. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <AuthLayout
        title="Create vendor account"
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (!businessName.trim()) {
              setError("Business name is required");
              return;
            }
            setStep(2);
          }}
          className="space-y-5 flex-1"
        >
          <AuthInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={setName}
            required
          />
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            required
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
          />
          <AuthInput
            label="Business name"
            placeholder="Your catering business name"
            value={businessName}
            onChange={setBusinessName}
            error={error}
            required
          />
          <AuthButton type="submit">Continue</AuthButton>
        </form>
      </AuthLayout>
    );
  }

  if (step === 2) {
    return (
      <AuthLayout
        title="Select your category"
        footer={
          <p className="text-[15px] text-slate-500">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-900 font-semibold hover:underline decoration-primary decoration-2 underline-offset-4"
            >
              Back
            </button>
            {" · "}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (category === "catering") setStep(3);
          }}
          className="space-y-6 flex-1"
        >
          <p className="text-sm text-slate-600">
            Choose the service category for your business. More categories coming soon.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {VENDOR_CATEGORIES.map(({ slug, name, Icon, available }) => (
              <button
                key={slug}
                type="button"
                onClick={() => available && setCategory(slug)}
                disabled={!available}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                  category === slug
                    ? "border-primary bg-primary/5"
                    : available
                    ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    : "border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    available ? "bg-primary/10" : "bg-slate-200"
                  }`}
                >
                  <Icon size={24} weight="regular" className={available ? "text-primary" : "text-slate-400"} />
                </div>
                <span className="font-semibold text-slate-900">{name}</span>
                {!available && (
                  <span className="text-[10px] font-bold uppercase text-slate-400">Coming soon</span>
                )}
              </button>
            ))}
          </div>
          <AuthButton type="submit">Continue</AuthButton>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Optional details"
      footer={
        <p className="text-[15px] text-slate-500">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="text-slate-900 font-semibold hover:underline decoration-primary decoration-2 underline-offset-4"
          >
            Back
          </button>
          {" · "}
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
          label="Cuisine types (optional)"
          placeholder="e.g. Italian, BBQ, Vegan"
          value={cuisineTypes}
          onChange={setCuisineTypes}
        />
        <AuthInput
          label="Service areas (optional)"
          placeholder="e.g. Downtown, North Side"
          value={serviceAreas}
          onChange={setServiceAreas}
        />
        <AuthButton loading={loading}>Sign Up</AuthButton>
      </form>
    </AuthLayout>
  );
}
