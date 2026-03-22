"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, PencilSimple, Trash, Sparkle } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { HelpHint } from "@/components/HelpHint";

import toast from "react-hot-toast";
import { API_URL, getNetworkErrorMessage, parseApiError, vendorFetch } from "@/lib/api";

interface Pkg {
  id: string;
  name: string;
  description: string | null;
  priceType: string;
  basePrice: string;
  minGuests: number | null;
  maxGuests: number | null;
  isActive: boolean;
  imageUrl: string | null;
}

export default function PackagesListPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [vendor, setVendor] = useState<{ businessName: string } | null>(null);
  const [spotlightPackageIds, setSpotlightPackageIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const meRes = await vendorFetch(`${API_URL}/api/vendor/me`);
        const meData = await meRes.json().catch(() => ({}));
        if (!meRes.ok) {
          if (!cancelled) {
            toast.error(parseApiError(meData) || "Could not load profile");
            setVendor(null);
            setPackages([]);
            setSpotlightPackageIds(new Set());
          }
          return;
        }
        const [pkgsRes, activeRes] = await Promise.all([
          vendorFetch(`${API_URL}/api/vendor/packages`),
          vendorFetch(`${API_URL}/api/vendor/spotlight/active`),
        ]);
        const pkgsData = pkgsRes.ok ? await pkgsRes.json().catch(() => []) : await pkgsRes.json().catch(() => ({}));
        const activeData = activeRes.ok ? await activeRes.json().catch(() => []) : await activeRes.json().catch(() => ({}));
        if (!cancelled) {
          setVendor(meData as { businessName: string });
          if (!pkgsRes.ok) {
            toast.error(parseApiError(pkgsData as { error?: string }) || "Could not load packages");
            setPackages([]);
          } else {
            setPackages(Array.isArray(pkgsData) ? pkgsData : []);
          }
          if (!activeRes.ok) {
            toast.error(parseApiError(activeData as { error?: string }) || "Could not load spotlight status");
            setSpotlightPackageIds(new Set());
          } else {
            const active = Array.isArray(activeData) ? activeData : [];
            setSpotlightPackageIds(new Set((active as { packageId: string }[]).map((a) => a.packageId)));
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getNetworkErrorMessage(err, "Could not load packages"));
          setVendor(null);
          setPackages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function requestDeactivate(id: string) {
    setConfirmDeactivate(id);
  }

  async function handleDelete(id: string) {
    setConfirmDeactivate(null);
    setDeleting(id);
    try {
      const res = await vendorFetch(`${API_URL}/api/vendor/packages/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        toast.success("Package deactivated");
      } else {
        toast.error(parseApiError(data) || "Could not deactivate package");
      }
    } catch (err) {
      toast.error(getNetworkErrorMessage(err, "Could not deactivate package"));
    } finally {
      setDeleting(null);
    }
  }

  const activePackages = packages.filter((p) => p.isActive);
  const inactivePackages = packages.filter((p) => !p.isActive);

  return (
    <VendorLayout>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Packages</h1>
          <p className="text-slate-500 mt-1">Manage your catering packages</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/packages/spotlight"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors"
          >
            <Sparkle size={20} weight="fill" />
            Put in Spotlight
          </Link>
          <Link
            href="/packages/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} weight="bold" />
            Add Package
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activePackages.length === 0 && inactivePackages.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Package size={32} weight="regular" className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mt-4">No packages yet</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Create packages to let customers book your catering services.
          </p>
          <Link
            href="/packages/new"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90"
          >
            <Plus size={18} weight="bold" />
            Add your first package
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activePackages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 text-slate-400 uppercase tracking-wider">
                Active
              </h2>
              <div className="space-y-4">
                {activePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center gap-5 p-5 rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} weight="regular" className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                        {spotlightPackageIds.has(pkg.id) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-primary">
                            <Sparkle size={10} weight="fill" />
                            In Spotlight
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {pkg.priceType === "per_person"
                          ? `${parseFloat(pkg.basePrice).toFixed(2)} BD/person`
                          : `${parseFloat(pkg.basePrice).toFixed(2)} BD fixed`}
                        {pkg.minGuests != null || pkg.maxGuests != null
                          ? ` · ${pkg.minGuests ?? "?"}–${pkg.maxGuests ?? "?"} guests`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href="/packages/spotlight"
                        className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"
                        title="Put in Spotlight — simulated payment until launch"
                      >
                        <Sparkle size={18} weight="fill" />
                      </Link>
                      <Link
                        href={`/packages/${pkg.id}/edit`}
                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                        title="Edit"
                      >
                        <PencilSimple size={18} weight="regular" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => requestDeactivate(pkg.id)}
                        disabled={deleting === pkg.id}
                        aria-label={`Deactivate package ${pkg.name}`}
                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-50"
                        title="Deactivate"
                      >
                        <Trash size={18} weight="regular" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {inactivePackages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 text-slate-400 uppercase tracking-wider">
                Inactive
              </h2>
              <div className="space-y-4">
                {inactivePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center gap-5 p-5 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} weight="regular" className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-600">{pkg.name}</h3>
                      <p className="text-sm text-slate-500">Deactivated</p>
                    </div>
                    <Link
                      href={`/packages/${pkg.id}/edit`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Reactivate
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDeactivate}
        title="Deactivate package?"
        message="It will no longer be visible to customers."
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={() => confirmDeactivate && handleDelete(confirmDeactivate)}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </VendorLayout>
  );
}
