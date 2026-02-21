"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";
import { FormSection } from "@/components/FormSection";
import { AuthButton } from "@/components/ui/AuthButton";
import { StepIndicator } from "@/components/ui/StepIndicator";

import { API_URL } from "@/lib/api";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 form-input-focus";

const STEPS = [
  { label: "Basic info" },
  { label: "Pricing" },
  { label: "Menu items" },
  { label: "Review" },
];

const MENU_CATEGORIES = ["Appetizer", "Main", "Dessert", "Beverage", "Other"] as const;

type MenuItem = { id: string; name: string; description: string | null; category: string | null };

export default function NewPackagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [packageId, setPackageId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", category: "" });
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

  async function createPackage() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    setCreating(true);
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
      return data.id as string;
    } finally {
      setCreating(false);
    }
  }

  async function addMenuItem() {
    if (!newItem.name.trim() || !packageId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
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
      setMenuItems((prev) => [...prev, { id: data.id, name: data.name, description: data.description, category: data.category }]);
      setNewItem({ name: "", description: "", category: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    setError("");
    if (step === 2) {
      const id = await createPackage();
      if (id) {
        setPackageId(id);
        setStep(3);
      } else {
        setError("Failed to create package");
      }
    } else if (step < 4) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleFinish() {
    router.push("/packages");
    router.refresh();
  }

  const canProceedStep1 = form.name.trim().length > 0;
  const canProceedStep2 = form.basePrice && parseFloat(form.basePrice) >= 0;

  return (
    <VendorLayout>
      <div>
        <PageHeader
          title="Add package"
          subtitle="Create a new catering package in a few steps."
          backLink={{ href: "/packages", label: "Back to packages" }}
        />

        <StepIndicator steps={STEPS} currentStep={step} />

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-8">
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
                        toast.error("Upload failed");
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
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="space-y-8">
            <FormSection title="Pricing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Price type *</label>
                  <select
                    value={form.priceType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceType: e.target.value as "per_person" | "fixed" }))
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
              <input
                type="text"
                value={form.dietaryTags}
                onChange={(e) => setForm((f) => ({ ...f, dietaryTags: e.target.value }))}
                className={`${inputClass} h-12`}
                placeholder="e.g. Vegan, Gluten-free (comma-separated)"
              />
            </FormSection>
          </div>
        )}

        {/* Step 3: Menu items */}
        {step === 3 && packageId && (
          <FormSection title="Menu Items">
            <p className="text-sm text-slate-600 mb-4">
              Add dishes and items included in this package (optional). You can add more later when editing.
            </p>
            <div className="space-y-2 mb-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <span className="font-medium">{item.name}</span>
                  {item.category && (
                    <span className="text-slate-500 text-sm">({item.category})</span>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (!token) return;
                      try {
                        const res = await fetch(
                          `${API_URL}/api/vendor/packages/${packageId}/items/${item.id}`,
                          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (res.ok) setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
                      } catch {
                        setError("Failed to remove item");
                      }
                    }}
                    className="ml-auto text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))}
                className={`${inputClass} h-10 text-sm w-48`}
                placeholder="Item name"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem((n) => ({ ...n, category: e.target.value }))}
                className={`${inputClass} h-10 text-sm w-32`}
              >
                <option value="">Category</option>
                {MENU_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))}
                className={`${inputClass} h-10 text-sm flex-1 min-w-[120px]`}
                placeholder="Description (optional)"
              />
              <button
                type="button"
                onClick={addMenuItem}
                disabled={loading || !newItem.name.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Adding…" : "Add item"}
              </button>
            </div>
          </FormSection>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6 p-6 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-lg font-semibold text-slate-900">Review your package</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium">{form.name}</dd>
              </div>
              {form.description && (
                <div>
                  <dt className="text-slate-500">Description</dt>
                  <dd className="text-slate-700">{form.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Pricing</dt>
                <dd className="font-medium">
                  {parseFloat(form.basePrice || "0").toFixed(2)} BD
                  {form.priceType === "per_person" ? " per person" : " fixed"}
                  {(form.minGuests || form.maxGuests) &&
                    ` · ${form.minGuests || "?"}–${form.maxGuests || "?"} guests`}
                </dd>
              </div>
              {menuItems.length > 0 && (
                <div>
                  <dt className="text-slate-500">Menu items</dt>
                  <dd className="text-slate-700">{menuItems.length} items</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="pt-10 flex items-center justify-between gap-4 border-t border-slate-100 mt-10">
          <div>
            {step > 1 && step < 4 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {step < 4 ? (
              <>
                <Link
                  href="/packages"
                  className="px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </Link>
                <AuthButton
                  loading={creating && step === 2}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  onClick={handleNext}
                  type="button"
                  className="!w-auto"
                >
                  {step === 2 ? "Create & continue" : "Continue"}
                </AuthButton>
              </>
            ) : (
              <AuthButton onClick={handleFinish} type="button" className="!w-auto">
                Done
              </AuthButton>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
