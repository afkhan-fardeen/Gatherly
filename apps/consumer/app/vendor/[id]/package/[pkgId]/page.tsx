"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ForkKnife } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Package {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  priceType: string;
  minGuests: number | null;
  maxGuests: number | null;
  setupFee?: number;
  packageItems: { name: string; imageUrl: string | null }[];
}

interface Vendor {
  id: string;
  businessName: string;
}

export default function PackageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const pkgId = params.pkgId as string;
  const eventId = searchParams.get("eventId");
  const [pkg, setPkg] = useState<Package | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([
      fetch(`${API_URL}/api/vendors/${id}`).then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      }),
      fetch(`${API_URL}/api/vendors/${id}/packages`).then(async (r) => {
        if (!r.ok) return [];
        const pkgs = await r.json();
        return pkgs;
      }),
    ])
      .then(([v, pkgs]) => {
        setVendor(v);
        const found = (pkgs ?? []).find((p: Package) => p.id === pkgId);
        setPkg(found ?? null);
        if (!found) setError("Package not found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, pkgId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!pkg || !vendor) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-slate-500 text-center">{error || "Package not found"}</p>
          <Link
            href={`/vendor/${id}`}
            className="mt-4 text-primary font-semibold hover:underline"
          >
            Back to vendor
          </Link>
        </div>
      </AppLayout>
    );
  }

  const bookHref = eventId
    ? `/vendor/${id}/book?packageId=${pkgId}&eventId=${eventId}`
    : `/vendor/${id}/book?packageId=${pkgId}`;

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={eventId ? `/vendor/${id}?eventId=${eventId}` : `/vendor/${id}`}
            className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} weight="regular" className="text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">{pkg.name}</h1>
            <p className="text-slate-500 text-xs truncate">{vendor.businessName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 min-h-0">
        <div className="p-6 space-y-6">
          {pkg.imageUrl && (
            <div className="w-full h-48 overflow-hidden bg-slate-100 rounded-md">
              <img src={pkg.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h2 className="font-bold text-lg text-slate-900">{pkg.name}</h2>
            {pkg.description && (
              <p className="text-slate-600 text-sm mt-2">{pkg.description}</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-md space-y-2">
            <p className="text-primary font-bold text-xl">
              {pkg.priceType === "per_person"
                ? `From ${Number(pkg.basePrice).toFixed(2)} BD per person`
                : `${Number(pkg.basePrice).toFixed(2)} BD fixed`}
            </p>
            {(pkg.minGuests || pkg.maxGuests) && (
              <p className="text-slate-600 text-sm">
                {pkg.minGuests && `Min ${pkg.minGuests} guests`}
                {pkg.minGuests && pkg.maxGuests && " · "}
                {pkg.maxGuests && `Max ${pkg.maxGuests} guests`}
              </p>
            )}
            {pkg.setupFee != null && Number(pkg.setupFee) > 0 && (
              <p className="text-slate-600 text-sm">
                Setup fee: {Number(pkg.setupFee).toFixed(2)} BD
              </p>
            )}
          </div>

          {pkg.packageItems.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Menu items
              </h3>
              <div className="space-y-2">
                {pkg.packageItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 border border-slate-100 bg-white rounded-md"
                  >
                    {item.imageUrl ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <ForkKnife size={20} weight="regular" className="text-slate-400" />
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={bookHref}
            className="block w-full py-3 bg-primary text-white font-semibold text-center rounded-md hover:bg-primary/90 transition-colors"
          >
            Book this package
          </Link>
        </div>
      </main>
    </AppLayout>
  );
}
