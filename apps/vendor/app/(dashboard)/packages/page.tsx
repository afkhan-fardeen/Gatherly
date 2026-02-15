"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, PencilSimple, Trash, CaretRight } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Pkg {
  id: string;
  name: string;
  description: string | null;
  priceType: string;
  basePrice: string;
  minGuests: number | null;
  maxGuests: number | null;
  isActive: boolean;
}

export default function PackagesListPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [vendor, setVendor] = useState<{ businessName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/vendor/me`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API_URL}/api/vendor/packages`, { headers }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([v, pkgs]) => {
        setVendor(v);
        setPackages(pkgs);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this package? It will no longer be visible to customers.")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/api/vendor/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  const activePackages = packages.filter((p) => p.isActive);
  const inactivePackages = packages.filter((p) => !p.isActive);

  return (
    <VendorLayout businessName={vendor?.businessName}>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Packages</h1>
          <p className="text-slate-500 mt-1">Manage your catering packages</p>
        </div>
        <Link
          href="/packages/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={20} weight="bold" />
          Add Package
        </Link>
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
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package size={24} weight="regular" className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                      <p className="text-sm text-slate-500 truncate">
                        {pkg.priceType === "per_person"
                          ? `$${parseFloat(pkg.basePrice).toFixed(2)}/person`
                          : `$${parseFloat(pkg.basePrice).toFixed(2)} fixed`}
                        {pkg.minGuests != null || pkg.maxGuests != null
                          ? ` · ${pkg.minGuests ?? "?"}–${pkg.maxGuests ?? "?"} guests`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/packages/${pkg.id}/edit`}
                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                        title="Edit"
                      >
                        <PencilSimple size={18} weight="regular" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
                        disabled={deleting === pkg.id}
                        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-50"
                        title="Deactivate"
                      >
                        <Trash size={18} weight="regular" />
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
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                      <Package size={24} weight="regular" className="text-slate-500" />
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
    </VendorLayout>
  );
}
