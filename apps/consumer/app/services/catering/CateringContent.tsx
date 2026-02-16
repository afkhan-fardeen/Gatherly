"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MagnifyingGlass, ForkKnife, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Vendor {
  id: string;
  businessName: string;
  description: string | null;
  cuisineTypes: string[];
  ratingAvg: number;
  ratingCount: number;
  logoUrl: string | null;
  featuredImageUrl: string | null;
  packages: { basePrice: number }[];
}

export function CateringContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    if (search) params.set("search", search);
    fetch(`${API_URL}/api/vendors?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/services"
            className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} weight="regular" className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Catering</h1>
            <p className="text-slate-500 text-xs">Find the best caterers</p>
          </div>
        </div>
        <div className="relative">
          <MagnifyingGlass size={20} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/20 outline-none"
            placeholder="Search vendors..."
          />
        </div>
      </header>

      <main className="p-6 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16">
            <ForkKnife size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No vendors found</p>
            <p className="text-slate-400 text-sm mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={eventId ? `/vendor/${vendor.id}?eventId=${eventId}` : `/vendor/${vendor.id}`}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors min-w-0 overflow-hidden"
              >
                <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {(vendor.featuredImageUrl || vendor.logoUrl) ? (
                    <img
                      src={vendor.featuredImageUrl || vendor.logoUrl || ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ForkKnife size={24} weight="regular" className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-sm truncate">
                    {vendor.businessName}
                  </h3>
                  <p className="text-slate-500 text-xs truncate">
                    {vendor.cuisineTypes.join(", ")}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-700">
                      ★ {Number(vendor.ratingAvg).toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({vendor.ratingCount})
                    </span>
                    {vendor.packages[0] && (
                      <span className="text-primary text-xs font-semibold">
                        From {Number(vendor.packages[0].basePrice)} BD
                      </span>
                    )}
                  </div>
                </div>
                <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
