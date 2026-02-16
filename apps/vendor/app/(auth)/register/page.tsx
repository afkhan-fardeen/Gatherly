"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Envelope, Lock, User, Storefront, ForkKnife, MapPin, Tag, CaretDown } from "@phosphor-icons/react";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthButton } from "@/components/ui/AuthButton";
import { VENDOR_CATEGORIES } from "@/lib/categories";
import { API_URL, parseJsonResponse } from "@/lib/api";

export default function VendorRegisterPage() {
  const router = useRouter();
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
      router.replace("/dashboard");
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
      title="Create vendor account"
      wide
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
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <AuthInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={setName}
            required
            icon={<User size={18} weight="regular" />}
          />
          <AuthInput
            label="Business name"
            placeholder="Your catering business name"
            value={businessName}
            onChange={setBusinessName}
            error={error}
            required
            icon={<Storefront size={18} weight="regular" />}
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
            required
            minLength={8}
            icon={<Lock size={18} weight="regular" />}
          />
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-600 mb-2 ml-1"
            >
              Service category
            </label>
            <div className="flex items-center h-[58px] bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 focus-within:bg-white transition-all">
              <div className="pl-4 shrink-0 text-slate-400">
                <Tag size={18} weight="regular" />
              </div>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 min-w-0 h-full bg-transparent pl-3 pr-10 text-slate-900 outline-none appearance-none cursor-pointer"
              >
              {VENDOR_CATEGORIES.map(({ slug, name, available }) => (
                <option key={slug} value={slug} disabled={!available}>
                  {name}{!available ? " (Coming soon)" : ""}
                </option>
              ))}
              </select>
              <div className="pr-4 shrink-0 text-slate-400 pointer-events-none">
                <CaretDown size={16} weight="bold" />
              </div>
            </div>
          </div>
          <AuthInput
            label="Cuisine types (optional)"
            placeholder="e.g. Italian, BBQ, Vegan"
            value={cuisineTypes}
            onChange={setCuisineTypes}
            icon={<ForkKnife size={18} weight="regular" />}
          />
          <AuthInput
            label="Service areas (optional)"
            placeholder="e.g. Downtown, North Side"
            value={serviceAreas}
            onChange={setServiceAreas}
            icon={<MapPin size={18} weight="regular" />}
          />
        </div>
        <div className="mt-6">
          <AuthButton loading={loading}>Sign Up</AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}
