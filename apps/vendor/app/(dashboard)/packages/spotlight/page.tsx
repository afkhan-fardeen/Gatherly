"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkle, CaretRight, ArrowLeft, CreditCard, Clock } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { API_URL, parseJsonResponse } from "@/lib/api";

const CHERRY = "#6D0D35";

interface Pkg {
  id: string;
  name: string;
  imageUrl: string | null;
  basePrice: string;
  priceType: string;
  vendor?: { featuredImageUrl: string | null; logoUrl: string | null };
}

interface PricingOption {
  durationDays: number;
  amountBhd: number;
}

interface ActivePlacement {
  id: string;
  packageId: string;
  package: { id: string; name: string; imageUrl: string | null };
  endDate: string;
  daysLeft: number;
}

export default function SpotlightPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [pricing, setPricing] = useState<PricingOption[]>([]);
  const [activeSpotlight, setActiveSpotlight] = useState<ActivePlacement[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Pkg | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/vendor/packages`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/api/vendor/spotlight/pricing`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/api/vendor/spotlight/active`, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([pkgs, prices, active]) => {
        setPackages(pkgs.filter((p: Pkg & { isActive?: boolean }) => p.isActive !== false));
        setPricing(prices);
        setActiveSpotlight(active);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedPrice = selectedDuration ? pricing.find((p) => p.durationDays === selectedDuration) : null;
  const imageUrl = selectedPackage?.imageUrl || selectedPackage?.vendor?.featuredImageUrl || selectedPackage?.vendor?.logoUrl;

  async function handlePurchase() {
    if (!selectedPackage || !selectedDuration) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setPurchasing(true);
    try {
      const res = await fetch(`${API_URL}/api/vendor/spotlight/purchase`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          durationDays: selectedDuration,
        }),
      });
      const data = await parseJsonResponse<{ error?: string; message?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Purchase failed");
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  }

  if (success) {
    return (
      <VendorLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${CHERRY}20` }}
          >
            <Sparkle size={40} weight="fill" style={{ color: CHERRY }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Spotlight activated!</h1>
          <p className="text-slate-600 mt-2">
            {selectedPackage?.name} is now featured on the consumer app for {selectedDuration} days.
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 font-semibold text-white rounded-xl"
            style={{ backgroundColor: CHERRY }}
          >
            <ArrowLeft size={20} weight="bold" />
            Back to Packages
          </Link>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <header className="mb-8">
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to Packages
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Feature in Spotlight</h1>
        <p className="text-slate-500 mt-1">
          Get your package featured on the consumer dashboard. Pay once, appear for your chosen duration.
        </p>
      </header>

      {loading ? (
        <div className="space-y-6">
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active spotlight */}
          {activeSpotlight.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Currently in Spotlight</h2>
              <div className="space-y-3">
                {activeSpotlight.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0">
                      {p.package.imageUrl ? (
                        <img src={p.package.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: CHERRY }}>
                          <Sparkle size={20} weight="fill" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{p.package.name}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-0.5">
                        <Clock size={14} weight="regular" />
                        {p.daysLeft} day{p.daysLeft !== 1 ? "s" : ""} left · ends{" "}
                        {new Date(p.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <span
                      className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: CHERRY }}
                    >
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Step 1: Select package */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Select a package</h2>
            {packages.length === 0 ? (
              <p className="text-slate-500">No active packages. Create one first.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {packages.map((pkg) => {
                  const isInSpotlight = activeSpotlight.some((a) => a.packageId === pkg.id);
                  return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => !isInSpotlight && setSelectedPackage(pkg)}
                    disabled={isInSpotlight}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      isInSpotlight
                        ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-75"
                        : selectedPackage?.id === pkg.id
                        ? "border-primary border-2 bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {pkg.imageUrl ? (
                        <img src={pkg.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                          <Sparkle size={24} weight="regular" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{pkg.name}</div>
                      <div className="text-sm text-slate-500">
                        {isInSpotlight ? (
                          <span className="text-primary font-medium">In Spotlight</span>
                        ) : (
                          pkg.priceType === "per_person"
                            ? `${parseFloat(pkg.basePrice).toFixed(2)} BD/person`
                            : `${parseFloat(pkg.basePrice).toFixed(2)} BD fixed`
                        )}
                      </div>
                    </div>
                  </button>
                );
                })}
              </div>
            )}
          </section>

          {/* Step 2: Choose duration */}
          {selectedPackage && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">2. Choose duration</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {pricing.map((opt) => (
                  <button
                    key={opt.durationDays}
                    type="button"
                    onClick={() => setSelectedDuration(opt.durationDays)}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      selectedDuration === opt.durationDays
                        ? "border-primary border-2 bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="font-bold text-slate-900">{opt.durationDays} days</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: CHERRY }}>
                      {opt.amountBhd} BHD
                    </div>
                    <div className="text-sm text-slate-500 mt-1">One-time payment</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: Preview */}
          {selectedPackage && selectedDuration && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">3. Preview</h2>
              <p className="text-sm text-slate-500 mb-4">
                This is how your package will appear on the consumer app:
              </p>
              <div className="inline-block p-6 rounded-2xl bg-slate-100">
                <div className="w-[280px] h-[220px] overflow-hidden border border-slate-200 rounded-2xl shadow-lg bg-white">
                  <div className="relative w-full h-full">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={selectedPackage.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: "#FFFFFF" }}
                      >
                        <span className="text-4xl font-normal" style={{ color: CHERRY }}>
                          {selectedPackage.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm">{selectedPackage.name}</h3>
                      <span
                        className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: CHERRY }}
                      >
                        Explore now
                        <CaretRight size={12} weight="bold" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Pay */}
          {selectedPackage && selectedDuration && selectedPrice && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">4. Pay</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-900">{selectedPackage.name}</span>
                  {" · "}
                  {selectedDuration} days · {selectedPrice.amountBhd} BHD
                </div>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: CHERRY }}
                >
                  <CreditCard size={22} weight="bold" />
                  {purchasing ? "Processing..." : `Pay ${selectedPrice.amountBhd} BHD`}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </VendorLayout>
  );
}
