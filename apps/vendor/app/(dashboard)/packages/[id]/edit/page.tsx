"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";
import { FormSection } from "@/components/FormSection";
import { AuthButton } from "@/components/ui/AuthButton";
import { StepIndicator } from "@/components/ui/StepIndicator";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 form-input-focus";

const EDIT_STEPS = [
  { label: "Basic info" },
  { label: "Pricing" },
  { label: "Menu items" },
  { label: "Review" },
];

const MENU_CATEGORIES = ["Appetizer", "Main", "Dessert", "Beverage", "Other"] as const;

function MenuItemsSection({
  packageId,
  items,
  onItemsChange,
}: {
  packageId: string;
  items: PackageItem[];
  onItemsChange: (items: PackageItem[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", category: "" as string });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function addItem() {
    if (!newItem.name.trim() || !token) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages/${packageId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newItem.name.trim(),
          description: newItem.description.trim() || null,
          category: newItem.category || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item");
      onItemsChange([...items, data]);
      setNewItem({ name: "", description: "", category: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  async function updateItem(itemId: string, updates: Partial<PackageItem>) {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages/${packageId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item");
      onItemsChange(items.map((i) => (i.id === itemId ? data : i)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update item");
    }
  }

  async function removeItem(itemId: string) {
    if (!token || !confirm("Remove this menu item?")) return;
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages/${packageId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove item");
      }
      onItemsChange(items.filter((i) => i.id !== itemId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove item");
    }
  }

  return (
    <FormSection title="Menu Items">
      <p className="text-sm text-slate-600 mb-4">
        Add dishes and items included in this package (appetizers, mains, desserts, etc.).
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-3 items-center p-3 rounded-xl border border-slate-200 bg-slate-50/50"
          >
            <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px]">Img</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !token) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  try {
                    const res = await fetch(`${API_URL}/api/upload/image?folder=menu-items`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: fd,
                    });
                    const data = await res.json();
                    if (res.ok && data.url) updateItem(item.id, { imageUrl: data.url });
                  } catch {
                    alert("Upload failed");
                  }
                  e.target.value = "";
                }}
              />
            </div>
            <input
              type="text"
              defaultValue={item.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== item.name) updateItem(item.id, { name: v });
              }}
              className={`${inputClass} h-10 text-sm`}
              placeholder="Item name"
            />
            <select
              value={item.category ?? ""}
              onChange={(e) => updateItem(item.id, { category: e.target.value || null })}
              className={`${inputClass} h-10 text-sm w-[130px]`}
            >
              <option value="">Category</option>
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              defaultValue={item.description ?? ""}
              onBlur={(e) => {
                const v = e.target.value.trim() || null;
                if (v !== (item.description ?? null)) updateItem(item.id, { description: v });
              }}
              className={`${inputClass} h-10 text-sm`}
              placeholder="Description (optional)"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr_auto_1fr_auto] gap-3 items-center">
        <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" aria-hidden />
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))}
          className={`${inputClass} h-10 text-sm`}
          placeholder="Name"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem((n) => ({ ...n, category: e.target.value }))}
          className={`${inputClass} h-10 text-sm w-[130px]`}
        >
          <option value="">Category</option>
          {MENU_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))}
          className={`${inputClass} h-10 text-sm`}
          placeholder="Description (optional)"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={adding || !newItem.name.trim()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {adding ? "Adding…" : "Add item"}
        </button>
      </div>
    </FormSection>
  );
}

type PackageItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  dietaryTags: string[];
  allergenWarnings: string[];
  displayOrder: number;
};

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [pkg, setPkg] = useState<{ isActive: boolean; imageUrl?: string | null; packageItems?: PackageItem[] } | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "" as string | null,
    priceType: "per_person" as "per_person" | "fixed",
    basePrice: "",
    minGuests: "",
    maxGuests: "",
    dietaryTags: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((pkgs: { id: string; name: string; description: string | null; imageUrl: string | null; priceType: string; basePrice: string; minGuests: number | null; maxGuests: number | null; dietaryTags: string[]; isActive: boolean; packageItems?: PackageItem[] }[]) => {
        const found = pkgs.find((p) => p.id === id);
        if (found) {
          setPkg({ ...found, packageItems: found.packageItems ?? [] });
          setForm({
            name: found.name,
            description: found.description || "",
            imageUrl: found.imageUrl || null,
            priceType: found.priceType as "per_person" | "fixed",
            basePrice: found.basePrice,
            minGuests: found.minGuests != null ? String(found.minGuests) : "",
            maxGuests: found.maxGuests != null ? String(found.maxGuests) : "",
            dietaryTags: (found.dietaryTags || []).join(", "),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl?.trim() || null,
          priceType: form.priceType,
          basePrice: parseFloat(form.basePrice) || 0,
          minGuests: form.minGuests ? parseInt(form.minGuests, 10) : null,
          maxGuests: form.maxGuests ? parseInt(form.maxGuests, 10) : null,
          dietaryTags: form.dietaryTags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          ...(pkg && !pkg.isActive && { isActive: true }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.push("/packages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded-lg w-48" />
            <div className="h-64 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Edit package"
          subtitle="Update your catering package."
          backLink={{ href: "/packages", label: "Back to packages" }}
        />

        <StepIndicator steps={EDIT_STEPS} currentStep={step} />

        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {(step === 1 || step === 2 || step === 3 || step === 4) && (
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    step === s ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {EDIT_STEPS[s - 1].label}
                </button>
              ))}
            </div>
          )}

          {(step === 1 || step === 4) && (
          <FormSection title="Package Details">
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
              <label className="text-sm font-medium text-slate-700">Package image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">No image</span>
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
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                  />
                </div>
              </div>
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
          )}

          {(step === 2 || step === 4) && (
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
                <label className="text-sm font-medium text-slate-700">Base price (BD) *</label>
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
          )}

          {(step === 2 || step === 4) && (
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
          )}

          {(step === 2 || step === 4) && (
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
          )}

          {(step === 3 || step === 4) && (
          <MenuItemsSection packageId={id} items={pkg?.packageItems ?? []} onItemsChange={(items) => setPkg((p) => (p ? { ...p, packageItems: items } : null))} />
          )}

          <div className="pt-10 flex items-center justify-end gap-4 border-t border-slate-100">
            <Link
              href="/packages"
              className="px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            >
              Cancel
            </Link>
            <AuthButton loading={saving} className="!w-auto shrink-0">
              Save changes
            </AuthButton>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
}
