"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RemoteImage } from "@/components/RemoteImage";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MagnifyingGlass,
  ForkKnife,
  Heart,
  Star,
  List,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
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
  packages: { basePrice: number; priceType?: string }[];
  minCapacity?: number | null;
  maxCapacity?: number | null;
}

const FILTER_CHIPS = ["All", "Italian", "Arabic", "Mediterranean", "Asian", "Organic", "Buffet"];

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #d4a574 0%, #8a5020 100%)",
  "linear-gradient(135deg, #1a1010 0%, #4a2010 100%)",
  "linear-gradient(135deg, #c09060 0%, #705030 100%)",
  "linear-gradient(135deg, #2a1a0a 0%, #5a3010 100%)",
];

function fitsCapacity(guestCount: number, minCap: number | null | undefined, maxCap: number | null | undefined): boolean {
  if (minCap != null && guestCount < minCap) return false;
  if (maxCap != null && guestCount > maxCap) return false;
  return true;
}

function getCapacityLabel(minCap: number | null | undefined, maxCap: number | null | undefined): string {
  if (minCap == null && maxCap == null) return "";
  if (minCap != null && maxCap != null) return `Min ${minCap} · Max ${maxCap} guests`;
  if (minCap != null) return `Min ${minCap} guests`;
  if (maxCap != null) return `Up to ${maxCap} guests`;
  return "";
}

export function CateringContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const guestCountParam = searchParams.get("guestCount");
  const eventGuests = guestCountParam ? parseInt(guestCountParam, 10) : null;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/api/vendors?${params}`);
    const data = res.ok ? await res.json() : [];
    let list = Array.isArray(data) ? data : [];
    if (filter !== "All") {
      list = list.filter((v) => v.cuisineTypes?.some((c: string) => c.toLowerCase().includes(filter.toLowerCase())));
    }
    if (eventGuests != null && !isNaN(eventGuests) && eventGuests >= 1) {
      list = [...list].sort((a, b) => {
        const aFit = fitsCapacity(eventGuests, a.minCapacity, a.maxCapacity);
        const bFit = fitsCapacity(eventGuests, b.minCapacity, b.maxCapacity);
        if (aFit && !bFit) return -1;
        if (!aFit && bFit) return 1;
        const aMin = a.minCapacity ?? 0;
        const bMin = b.minCapacity ?? 0;
        return aMin - bMin;
      });
    }
    setVendors(list);
  }, [search, filter, eventGuests]);

  useEffect(() => {
    setLoading(true);
    fetchVendors().finally(() => setLoading(false));
  }, [fetchVendors]);

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <PullToRefresh onRefresh={fetchVendors}>
        <div className="min-h-full bg-[#f4ede5]">
          {/* Topbar */}
          <header
            className="sticky top-0 z-20 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3.5"
            style={{ background: "linear-gradient(to bottom, #f4ede5 78%, transparent)" }}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <Link
                href={eventId ? `/events/${eventId}` : "/services"}
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-[#fdfaf7] border border-primary/10 text-[#5c3d47] shadow-sm mt-0.5"
              >
                <ArrowLeft size={15} weight="regular" />
              </Link>
              <div>
                <h1 className="font-serif text-[30px] font-medium leading-none tracking-[-0.5px] text-[#1e0f14]">
                  <span className="italic font-normal text-primary">Cat</span>ering
                </h1>
                <p className="text-[12.5px] font-light text-[#a0888d] mt-1">Find the best caterers</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlass
                size={15}
                weight="regular"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0888d] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search caterers…"
                className="w-full py-3.5 pl-11 pr-4 rounded-[14px] text-sm font-normal text-[#1e0f14] placeholder:text-[#a0888d] placeholder:font-light outline-none transition-all bg-[#fdfaf7] border border-transparent focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,13,53,0.07)]"
                style={{ boxShadow: "0 2px 12px rgba(109,13,53,0.05)" }}
              />
            </div>
          </header>

          <main className="px-4 pb-32 space-y-3">
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-4 px-4">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFilter(chip)}
                  className={`shrink-0 py-2 px-3.5 rounded-full text-[12.5px] font-normal transition-all ${
                    filter === chip
                      ? "bg-primary/7 text-primary border-2 border-primary"
                      : "bg-[#fdfaf7] text-[#5c3d47] border-2 border-transparent hover:border-primary/10"
                  }`}
                  style={{ boxShadow: filter === chip ? "none" : "0 1px 6px rgba(0,0,0,0.04)" }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Sort row */}
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[12px] font-light text-[#a0888d]">
                <strong className="font-medium text-[#5c3d47]">{vendors.length}</strong> caterers found
              </span>
              <button type="button" className="flex items-center gap-1.5 text-[12px] font-normal text-[#5c3d47] hover:text-primary transition-colors">
                <List size={13} weight="regular" />
                Sort: Top Rated
              </button>
            </div>

            {/* Vendor cards */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[280px] rounded-[20px] bg-white/60 border border-primary/10 animate-pulse" />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="rounded-[20px] border border-primary/10 bg-white py-16 text-center">
                <ForkKnife size={40} weight="regular" className="text-primary/40 mx-auto" />
                <p className="text-sm font-normal text-[#a0888d] mt-3">No caterers found</p>
                <p className="text-xs font-light text-[#a0888d] mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vendors.map((vendor, i) => {
                  const pkg = vendor.packages[0];
                  const minPrice = pkg?.basePrice;
                  const priceType = pkg?.priceType || "per_person";
                  const priceSuffix = priceType === "per_person" ? "/ person" : "/ event";
                  const rating = Number(vendor.ratingAvg) || 0;
                  const count = Number(vendor.ratingCount) || 0;
                  const minCap = vendor.minCapacity;
                  const maxCap = vendor.maxCapacity;
                  const capacityLabel = getCapacityLabel(minCap, maxCap);
                  let href = `/vendor/${vendor.id}`;
                  if (eventId) href += `?eventId=${eventId}`;
                  if (eventGuests != null) href += `${eventId ? "&" : "?"}guestCount=${eventGuests}`;

                  return (
                    <Link
                      key={vendor.id}
                      href={href}
                      className="bg-white rounded-[20px] border border-primary/10 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(109,13,53,0.11)] hover:border-primary/15 animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="relative w-full h-[170px] overflow-hidden">
                        <RemoteImage
                          src={vendor.featuredImageUrl || vendor.logoUrl}
                          alt={vendor.businessName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 430px) 100vw, 400px"
                          fallback={
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                            >
                              <ForkKnife size={40} weight="regular" className="text-white/50" />
                            </div>
                          }
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.4) 100%)",
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-semibold uppercase tracking-wider"
                            style={{
                              background: "rgba(184,147,90,0.25)",
                              border: "1px solid rgba(184,147,90,0.4)",
                              color: "#f5d99a",
                            }}
                          >
                            Premium
                          </span>
                          <button
                            type="button"
                            onClick={(e) => e.preventDefault()}
                            className="w-[30px] h-[30px] rounded-full bg-white/90 flex items-center justify-center text-[#5c3d47]"
                          >
                            <Heart size={14} weight="regular" />
                          </button>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/90 rounded-full px-2.5 py-1">
                          <Star size={11} weight="fill" className="text-amber-500" />
                          <span className="text-[12px] font-medium text-[#1e0f14]">{rating.toFixed(1)}</span>
                          <span className="text-[10px] font-light text-[#a0888d]">· {count}</span>
                        </div>
                      </div>
                      <div className="p-4 pt-3.5">
                        <h3 className="font-serif text-[20px] font-medium text-[#1e0f14] tracking-[-0.3px] leading-tight mb-2.5">
                          {vendor.businessName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {(vendor.cuisineTypes?.slice(0, 3) || ["Catering"]).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10.5px] font-normal text-[#5c3d47] border border-primary/10"
                              style={{ background: "#f4ede5" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-primary/10">
                          <div>
                            <div className="font-serif text-[22px] font-medium text-primary leading-none">
                              {minPrice != null ? `${minPrice} BD` : "—"}
                              <span className="text-[11px] font-light text-[#a0888d]"> {minPrice != null ? priceSuffix : ""}</span>
                            </div>
                            {capacityLabel && (
                              <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">{capacityLabel}</div>
                            )}
                          </div>
                          <span
                            className="px-4 py-2 rounded-full text-[12.5px] font-medium text-white"
                            style={{ background: "#6D0D35", boxShadow: "0 3px 12px rgba(109,13,53,0.25)" }}
                          >
                            View
                          </span>
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
