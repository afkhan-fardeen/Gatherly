"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";
import { FormSection } from "@/components/FormSection";
import { AuthButton } from "@/components/ui/AuthButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 form-input-focus";

export default function NewPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: null as string | null,
    priceType: "per_person" as "per_person" | "fixed",
    basePrice: "",
    minGuests: "",
    maxGuests: "",
    dietaryTags: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl,
          priceType: form.priceType,
          basePrice: parseFloat(form.basePrice) || 0,
          minGuests: form.minGuests ? parseInt(form.minGuests, 10) : null,
          maxGuests: form.maxGuests ? parseInt(form.maxGuests, 10) : null,
          dietaryTags: form.dietaryTags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      router.push(`/packages/${data.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <VendorLayout>
      <div>
        <PageHeader
          title="Add package"
          subtitle="Create a new catering package for your customers."
          backLink={{ href: "/packages", label: "Back to packages" }}
        />

        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <FormSection title="Package Details">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Package image</label>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">No image</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const token = localStorage.getItem("token");
                    if (!token) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await fetch(`${API_URL}/api/upload/image?folder=packages`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                      });
                      const data = await res.json();
                      if (res.ok && data.url) setForm((f) => ({ ...f, imageUrl: data.url }));
                    } catch {
                      alert("Upload failed");
                    }
                    e.target.value = "";
                  }}
                  className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Package name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={`${inputClass} h-12`}
                placeholder="e.g. Premium Buffet"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Describe what's included in this package..."
              />
            </div>
          </FormSection>

          <FormSection title="Pricing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price type *</label>
                <select
                  value={form.priceType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priceType: e.target.value as "per_person" | "fixed",
                    }))
                  }
                  className={`${inputClass} h-12 appearance-none cursor-pointer pr-10`}
                >
                  <option value="per_person">Per person</option>
                  <option value="fixed">Fixed price</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Base price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                  className={`${inputClass} h-12`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Capacity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Min guests</label>
                <input
                  type="number"
                  min="1"
                  value={form.minGuests}
                  onChange={(e) => setForm((f) => ({ ...f, minGuests: e.target.value }))}
                  className={`${inputClass} h-12`}
                  placeholder="—"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Max guests</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={(e) => setForm((f) => ({ ...f, maxGuests: e.target.value }))}
                  className={`${inputClass} h-12`}
                  placeholder="—"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Dietary Tags">
            <div className="space-y-2">
              <input
                type="text"
                value={form.dietaryTags}
                onChange={(e) => setForm((f) => ({ ...f, dietaryTags: e.target.value }))}
                className={`${inputClass} h-12`}
                placeholder="e.g. Vegan, Gluten-free (comma-separated)"
              />
            </div>
          </FormSection>

          <div className="pt-10 flex items-center justify-end gap-4 border-t border-slate-100">
            <Link
              href="/packages"
              className="px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            >
              Cancel
            </Link>
            <AuthButton loading={loading} className="!w-auto shrink-0">
              Save Package
            </AuthButton>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
}
