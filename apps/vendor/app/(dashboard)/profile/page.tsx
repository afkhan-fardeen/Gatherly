"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { VendorLayout } from "@/components/VendorLayout";
import { AuthButton } from "@/components/ui/AuthButton";
import { VENDOR_CATEGORIES } from "@/lib/categories";

import { API_URL } from "@/lib/api";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

interface DayHours {
  open?: string;
  close?: string;
}

interface Vendor {
  id: string;
  businessName: string;
  businessType: string | null;
  ownerName: string | null;
  description: string | null;
  cuisineTypes: string[];
  serviceAreas: string[];
  physicalAddress: string | null;
  logoUrl: string | null;
  featuredImageUrl: string | null;
  operatingHours: Record<string, DayHours> | null;
  user: { name: string; email: string };
}

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const defaultHours = DAYS.reduce(
    (acc, d) => ({ ...acc, [d]: { open: "", close: "" } }),
    {} as Record<string, { open: string; close: string }>
  );
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    ownerName: "",
    description: "",
    cuisineTypes: "",
    serviceAreas: "",
    physicalAddress: "",
    logoUrl: "",
    featuredImageUrl: "",
    operatingHours: defaultHours,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v) {
          setVendor(v);
          const hours = v.operatingHours as Record<string, { open?: string; close?: string }> | null;
          const mergedHours = DAYS.reduce(
            (acc, d) => ({
              ...acc,
              [d]: {
                open: hours?.[d]?.open ?? "",
                close: hours?.[d]?.close ?? "",
              },
            }),
            {} as Record<string, { open: string; close: string }>
          );
          setForm({
            businessName: v.businessName || "",
            businessType: v.businessType || "catering",
            ownerName: v.ownerName || "",
            description: v.description || "",
            cuisineTypes: (v.cuisineTypes || []).join(", "),
            serviceAreas: (v.serviceAreas || []).join(", "),
            physicalAddress: v.physicalAddress || "",
            logoUrl: v.logoUrl || "",
            featuredImageUrl: v.featuredImageUrl || "",
            operatingHours: mergedHours,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/vendor/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: form.businessName.trim() || undefined,
          businessType: form.businessType || null,
          ownerName: form.ownerName.trim() || null,
          description: form.description.trim() || null,
          cuisineTypes: form.cuisineTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          serviceAreas: form.serviceAreas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          physicalAddress: form.physicalAddress.trim() || null,
          logoUrl: form.logoUrl.trim() || null,
          featuredImageUrl: form.featuredImageUrl.trim() || null,
          operatingHours: (() => {
            const h: Record<string, { open: string; close: string }> = {};
            for (const d of DAYS) {
              const open = form.operatingHours[d]?.open?.trim();
              const close = form.operatingHours[d]?.close?.trim();
              if (open || close) h[d] = { open: open || "", close: close || "" };
            }
            return Object.keys(h).length ? h : null;
          })(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setVendor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded-lg w-48" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </VendorLayout>
    );
  }

  const inputClass =
    "w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 form-input-focus";

  return (
    <VendorLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Edit your business information</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <section className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Business info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Business name *
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                className={inputClass}
                placeholder="Your catering business name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Category
              </label>
                  <p className="text-xs text-slate-500 mb-3">
                Your service category. More options coming soon.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VENDOR_CATEGORIES.map(({ slug, name, Icon, available }) => (
              <button
                key={slug}
                type="button"
                onClick={() => available && setForm((f) => ({ ...f, businessType: slug }))}
                disabled={!available}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.businessType === slug
                    ? "border-primary bg-primary/5"
                    : available
                    ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    : "border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    available ? "bg-primary/10" : "bg-slate-200"
                  }`}
                >
                  <Icon size={20} weight="regular" className={available ? "text-primary" : "text-slate-400"} />
                </div>
                <span className="font-semibold text-slate-900 text-sm">{name}</span>
                {!available && (
                  <span className="text-[10px] font-bold uppercase text-slate-400">Coming soon</span>
                )}
              </button>
            ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 form-input-focus resize-none"
                placeholder="Tell customers about your catering business"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Cuisine types
              </label>
              <input
                type="text"
                value={form.cuisineTypes}
                onChange={(e) => setForm((f) => ({ ...f, cuisineTypes: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Italian, BBQ, Vegan (comma-separated)"
              />
            </div>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Contact
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Owner name
            </label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
        </section>

        <section className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Service areas
              </label>
              <input
                type="text"
                value={form.serviceAreas}
                onChange={(e) => setForm((f) => ({ ...f, serviceAreas: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Downtown, North Side (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Physical address
              </label>
              <input
                type="text"
                value={form.physicalAddress}
                onChange={(e) => setForm((f) => ({ ...f, physicalAddress: e.target.value }))}
                className={inputClass}
                placeholder="Street address"
              />
            </div>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Operating hours
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Set your typical business hours. Leave blank for closed.
          </p>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3"
              >
                <label className="w-24 text-sm font-medium text-slate-600 capitalize">
                  {day}
                </label>
                <input
                  type="time"
                  value={form.operatingHours[day]?.open ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      operatingHours: {
                        ...f.operatingHours,
                        [day]: {
                          ...f.operatingHours[day],
                          open: e.target.value,
                          close: f.operatingHours[day]?.close ?? "",
                        },
                      },
                    }))
                  }
                  className="h-10 px-3 rounded-lg border border-slate-200 text-slate-900"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="time"
                  value={form.operatingHours[day]?.close ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      operatingHours: {
                        ...f.operatingHours,
                        [day]: {
                          ...f.operatingHours[day],
                          open: f.operatingHours[day]?.open ?? "",
                          close: e.target.value,
                        },
                      },
                    }))
                  }
                  className="h-10 px-3 rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Branding
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">No logo</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const token = localStorage.getItem("token");
                    if (!token) {
                      toast.error("Please log in to upload images");
                      return;
                    }
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await fetch(
                        `${API_URL}/api/upload/image?folder=vendor-logos`,
                        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }
                      );
                      const data = await res.json();
                      if (res.ok && data.url) {
                        setForm((f) => ({ ...f, logoUrl: data.url }));
                      } else if (res.status === 401) {
                        toast.error("Session expired. Please log in again.");
                      } else {
                        toast.error(data.error || "Upload failed");
                      }
                    } catch {
                      toast.error("Upload failed");
                    }
                    e.target.value = "";
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Upload a logo (JPEG, PNG, WebP or GIF, max 5MB)
                </p>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Featured image
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Hero banner shown on your profile and catering list. Uses logo if not set.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {form.featuredImageUrl ? (
                    <img src={form.featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">None</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const token = localStorage.getItem("token");
                      if (!token) {
                        toast.error("Please log in to upload images");
                        return;
                      }
                      const fd = new FormData();
                      fd.append("file", file);
                      try {
                        const res = await fetch(
                          `${API_URL}/api/upload/image?folder=vendor-featured`,
                          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }
                        );
                        const data = await res.json();
                        if (res.ok && data.url) {
                          setForm((f) => ({ ...f, featuredImageUrl: data.url }));
                        } else if (res.status === 401) {
                          toast.error("Session expired. Please log in again.");
                        } else {
                          toast.error(data.error || "Upload failed");
                        }
                      } catch {
                        toast.error("Upload failed");
                      }
                      e.target.value = "";
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <AuthButton loading={saving}>Save changes</AuthButton>
      </form>
    </VendorLayout>
  );
}
