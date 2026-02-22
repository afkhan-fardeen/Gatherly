"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MagnifyingGlass, ForkKnife } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ROUND, TYPO } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

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

  const fetchVendors = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/api/vendors?${params}`);
    const data = res.ok ? await res.json() : [];
    setVendors(Array.isArray(data) ? data : []);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchVendors().finally(() => setLoading(false));
  }, [fetchVendors]);

  return (
    <AppLayout>
      <PullToRefresh onRefresh={fetchVendors}>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="shrink-0 px-6 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/services"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border flex items-center justify-center shrink-0"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <ArrowLeft size={22} weight="regular" className="text-text-secondary" />
            </Link>
            <div>
              <h1 className={TYPO.H1}>Catering</h1>
              <p className={TYPO.CAPTION}>Find the best caterers</p>
            </div>
          </div>
          <div className="form-no-zoom relative">
            <MagnifyingGlass
              size={20}
              weight="regular"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-5 font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#6D0D35]/20 focus:border-[#6D0D35]/40 outline-none transition-all duration-200"
              style={{ fontSize: "16px" }}
              placeholder="Search caterers..."
            />
          </div>
        </header>

        <main className="px-6 pb-40">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-64 bg-slate-200/60 animate-pulse ${ROUND}`}
                />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div
              className={`text-center py-16 bg-white border ${ROUND}`}
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <ForkKnife size={40} weight="regular" className="text-slate-300 mx-auto" />
              <p className={`${TYPO.BODY} mt-4 font-medium`}>No vendors found</p>
              <p className={`${TYPO.SUBTEXT} mt-1`}>
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vendors.map((vendor) => {
                const minPrice = vendor.packages[0]?.basePrice;
                const href = eventId ? `/vendor/${vendor.id}?eventId=${eventId}` : `/vendor/${vendor.id}`;
                return (
                  <Link
                    key={vendor.id}
                    href={href}
                    className="bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-elevation-1 transition-all hover:border-slate-300 active:scale-[0.99]"
                  >
                    <div className="relative w-full h-28 bg-white">
                      {vendor.logoUrl ? (
                        <Image
                          src={vendor.logoUrl}
                          alt={vendor.businessName}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 430px) 100vw, 400px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-section-alt)]">
                          <ForkKnife size={28} weight="regular" className="text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className={TYPO.CARD_TITLE}>{vendor.businessName}</h4>
                      <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                        {vendor.cuisineTypes?.slice(0, 2).join(", ") || "Catering"}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                        <p className={TYPO.BODY_MEDIUM}>
                          {minPrice != null ? (
                            <span className="text-text-primary">{minPrice} BD</span>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                          {minPrice != null && <span className={`${TYPO.CAPTION} ml-1`}>/ event</span>}
                        </p>
                        <span className={`${TYPO.LINK} text-primary`}>View</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
      </PullToRefresh>
    </AppLayout>
  );
}
