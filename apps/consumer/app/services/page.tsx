"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RemoteImage } from "@/components/RemoteImage";
import {
  MagnifyingGlass,
  ForkKnife,
  Heart,
  Star,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL } from "@/lib/api";

interface Vendor {
  id: string;
  businessName: string;
  businessType: string | null;
  description: string | null;
  cuisineTypes: string[];
  ratingAvg: number;
  ratingCount: number;
  logoUrl: string | null;
  featuredImageUrl: string | null;
  packages: { basePrice: number; priceType?: string }[];
}

const CATEGORIES = [
  { id: "catering", name: "Catering", image: "/images/services/catering.jpg", emoji: "🍽️", href: "/services/catering", available: true },
  { id: "decor", name: "Decor", image: "/images/services/decor.jpg", emoji: "✨", href: "/services/coming-soon/decor", available: false },
  { id: "entertainment", name: "Entertainment", image: "/images/services/entertainment.jpg", emoji: "🎵", href: "/services/coming-soon/entertainment", available: false },
  { id: "photography", name: "Photography", image: "/images/services/photography.jpg", emoji: "📸", href: "/services/coming-soon/photography", available: false },
  { id: "rentals", name: "Rentals", image: "/images/services/rentals.jpg", emoji: "🥂", href: "/services/coming-soon/rentals", available: false },
  { id: "florals", name: "Florals", image: "/images/services/pexels-gcman105-916416.jpg", emoji: "💐", href: "/services/coming-soon/florals", available: false },
];

const CAT_GRADIENTS = [
  "linear-gradient(135deg, #c4875a 0%, #8b4a2a 100%)",
  "linear-gradient(135deg, #2a2a3a 0%, #4a3a5a 100%)",
  "linear-gradient(135deg, #1a2a4a 0%, #3a5a8a 100%)",
  "linear-gradient(135deg, #1a3a2a 0%, #2a6a4a 100%)",
  "linear-gradient(135deg, #3a2a1a 0%, #6a4a2a 100%)",
  "linear-gradient(135deg, #3a1a2a 0%, #7a3a5a 100%)",
];

const FEAT_GRADIENTS = [
  "linear-gradient(135deg, #d4a574 0%, #9a5a2a 100%)",
  "linear-gradient(135deg, #2a1a1a 0%, #5a2a1a 100%)",
  "linear-gradient(135deg, #1a2a1a 0%, #2a5a2a 100%)",
];

const PARTNER_GRADIENTS = [
  "linear-gradient(135deg, #c49a6c 0%, #8a5a2a 100%)",
  "linear-gradient(135deg, #1a1a2a 0%, #3a2a1a 100%)",
  "linear-gradient(135deg, #2a1a3a 0%, #5a3a6a 100%)",
  "linear-gradient(135deg, #1a3a2a 0%, #2a6a4a 100%)",
];

export default function ServicesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    if (search.trim()) params.set("search", search.trim());
    fetch(`${API_URL}/api/vendors?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [search]);

  const featuredVendors = vendors.slice(0, 3);
  const allVendors = vendors;

  return (
    <AppLayout contentBg="bg-cream">
      <div className="min-h-full bg-cream">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3.5"
          style={{
            background: "linear-gradient(to bottom, #f4ede5 80%, transparent)",
          }}
        >
          <h1 className="font-serif text-[34px] font-normal leading-none tracking-[-0.8px] text-[#1e0f14]">
            Dis<span className="italic font-normal text-primary">cover</span>
          </h1>
          <p className="text-[12.5px] font-light text-[#9e8085] mb-4">Find venues, catering & more</p>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="regular"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e8085] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search venues, catering, music…"
              className="w-full py-3.5 pl-11 pr-4 rounded-2xl text-sm font-normal text-[#1e0f14] placeholder:text-[#9e8085] placeholder:font-light outline-none transition-all"
              style={{
                background: "#fdfaf7",
                border: "1.5px solid transparent",
                boxShadow: "0 2px 16px rgba(109,13,53,0.06)",
              }}
            />
          </div>
        </header>

        <main className="px-4 pb-32 space-y-7">
          {/* Categories */}
          <div className="overflow-x-auto scrollbar-hide overscroll-x-contain -mx-4 py-4">
            <div className="flex gap-3 pl-4 pr-5 py-2 min-w-min">
              {CATEGORIES.map((cat, i) => (
                <Link
                key={cat.id}
                  href={cat.href}
                  className="shrink-0 w-[72px] flex flex-col items-center gap-2"
                >
                  <div
                    className="relative w-[72px] h-[72px] rounded-[20px] overflow-hidden border-2 border-transparent transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={cat.available ? { borderColor: "#6D0D35", boxShadow: "0 4px 16px rgba(109,13,53,0.2)" } : {}}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <span
                    className={`font-serif text-[11px] text-center ${
                      cat.available ? "text-primary font-medium" : "text-[#9e8085] font-normal"
                    }`}
                  >
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured - Top Rated (horizontal scroll) */}
          <div className="py-4">
            <div className="flex items-end justify-between mb-3.5">
              <div>
                <p className="font-serif text-[9.5px] font-semibold uppercase tracking-[2px] text-primary mb-0.5">Editor&apos;s Choice</p>
                <h2 className="font-serif text-[22px] font-normal text-[#1e0f14] tracking-[-0.3px] leading-tight">Top Rated</h2>
              </div>
              <Link href="/services/catering" className="text-xs text-primary font-normal opacity-80 hover:opacity-100 transition-opacity pb-0.5 border-b border-primary/20">
                See all
              </Link>
            </div>

            {loading ? (
              <div className="flex gap-3.5 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shrink-0 w-[240px] h-[280px] rounded-[22px] bg-white/60 border border-primary/10 animate-pulse" />
                ))}
              </div>
            ) : featuredVendors.length === 0 ? (
              <div className="rounded-[22px] border border-primary/10 bg-white py-16 text-center">
                <ForkKnife size={40} weight="regular" className="text-primary/40 mx-auto" />
                <p className="text-sm font-normal text-[#9e8085] mt-3">No vendors yet</p>
                <p className="text-xs font-light text-[#9e8085] mt-1">We&apos;re adding partners soon</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide -mx-4 py-2">
                <div className="flex gap-3.5 pl-4 pr-5 py-2 min-w-min">
                {featuredVendors.map((vendor, i) => {
                  const pkg = vendor.packages[0];
                  const minPrice = pkg?.basePrice;
                  const priceType = pkg?.priceType || "per_person";
                  const priceSuffix = priceType === "per_person" ? "/ person" : "/ event";
                  const rating = Number(vendor.ratingAvg) || 0;
                  const count = Number(vendor.ratingCount) || 0;

                  return (
                    <Link
                      key={vendor.id}
                      href={`/vendor/${vendor.id}`}
                      className="shrink-0 w-[240px] bg-white rounded-[22px] border border-primary/10 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="w-full h-[150px] relative overflow-hidden">
                        <RemoteImage
                            src={vendor.featuredImageUrl || vendor.logoUrl}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
                            sizes="240px"
                            fallback={
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: FEAT_GRADIENTS[i % FEAT_GRADIENTS.length] }}
                              >
                                <ForkKnife size={32} weight="regular" className="text-primary/50" />
                              </div>
                            }
                          />
                        <div className="absolute top-2.5 left-2.5 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-white">
                          ⭐ Premium
                        </div>
                        <button
                          type="button"
                          onClick={(e) => e.preventDefault()}
                          className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-full bg-white/90 flex items-center justify-center text-primary hover:bg-white transition-colors"
                        >
                          <Heart size={14} weight="regular" />
                        </button>
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-amber-600 text-[11px] font-light">★★★★★</span>
                          <span className="text-[11px] font-light text-[#9e8085]">
                            {rating.toFixed(1)} ({count})
                          </span>
                        </div>
                        <h3 className="font-serif text-[17px] font-normal text-[#1e0f14] tracking-[-0.2px] truncate mb-0.5">
                          {vendor.businessName}
                        </h3>
                        <p className="text-[11.5px] font-light text-[#9e8085] mb-3 truncate">
                          {vendor.cuisineTypes?.slice(0, 2).join(" · ") || "Catering"}
                        </p>
                        <div className="flex items-center justify-between pt-2.5 border-t border-primary/5">
                          <span className="font-serif text-[20px] font-normal text-primary leading-none">
                            {minPrice != null ? `${minPrice} BD` : "—"}
                            <span className="text-[11px] font-light text-[#9e8085] ml-0.5">{minPrice != null ? priceSuffix : ""}</span>
                          </span>
                          <span
                            className="px-4 py-1.5 rounded-full text-[11.5px] font-normal text-white"
                            style={{ background: "#6D0D35" }}
                          >
                            View
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          {/* All Partners */}
          <div>
            <div className="flex items-end justify-between mb-3.5">
              <div>
                <p className="font-serif text-[9.5px] font-semibold uppercase tracking-[2px] text-primary mb-0.5">Handpicked</p>
                <h2 className="font-serif text-[22px] font-normal text-[#1e0f14] tracking-[-0.3px] leading-tight">All Partners</h2>
              </div>
              <Link href="/services/catering" className="text-xs text-primary font-normal opacity-80 hover:opacity-100 transition-opacity pb-0.5 border-b border-primary/20">
                Filter
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-[20px] bg-white/60 border border-primary/10 animate-pulse" />
                ))}
              </div>
            ) : allVendors.length === 0 ? (
              <div className="rounded-[20px] border border-primary/10 bg-white py-16 text-center">
                <ForkKnife size={40} weight="regular" className="text-primary/40 mx-auto" />
                <p className="text-sm font-normal text-[#9e8085] mt-3">No vendors found</p>
                <p className="text-xs font-light text-[#9e8085] mt-1">Try a different search</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {allVendors.map((vendor, i) => {
                  const pkg = vendor.packages[0];
                  const minPrice = pkg?.basePrice;
                  const priceType = pkg?.priceType || "per_person";
                  const priceSuffix = priceType === "per_person" ? "/ person" : "/ event";
                  const rating = Number(vendor.ratingAvg) || 0;
                  const count = Number(vendor.ratingCount) || 0;

                  return (
                    <Link
                      key={vendor.id}
                      href={`/vendor/${vendor.id}`}
                      className="bg-white rounded-[20px] border border-primary/10 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/20"
                    >
                      <div className="w-full h-[180px] relative overflow-hidden">
                        <RemoteImage
                          src={vendor.featuredImageUrl || vendor.logoUrl}
                          alt={vendor.businessName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 430px) 100vw, 400px"
                          fallback={
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: PARTNER_GRADIENTS[i % PARTNER_GRADIENTS.length] }}
                            >
                              <ForkKnife size={40} weight="regular" className="text-primary/50" />
                            </div>
                          }
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)",
                          }}
                        />
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
                          <div className="relative w-10 h-10 rounded-xl border-2 border-white overflow-hidden bg-[#ede4da] flex items-center justify-center shrink-0">
                            <RemoteImage
                              src={vendor.logoUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                              fallback={<ForkKnife size={18} weight="regular" className="text-primary/60" />}
                            />
                          </div>
                          <div className="flex items-center gap-1 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-normal text-amber-400">
                            <Star size={11} weight="fill" />
                            {rating.toFixed(1)} · {count} reviews
                          </div>
                        </div>
                      </div>
                      <div className="p-3.5 px-4 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-serif text-[20px] font-normal text-[#1e0f14] tracking-[-0.3px] leading-tight line-clamp-2">
                            {vendor.businessName}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => e.preventDefault()}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-primary/10 transition-colors"
                            style={{ background: "rgba(109,13,53,0.07)" }}
                          >
                            <Heart size={14} weight="regular" className="text-primary" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(vendor.cuisineTypes?.slice(0, 3) || ["Catering"]).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-normal text-[#5c3d47] border border-primary/10"
                              style={{ background: "#f4ede5" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-primary/5">
                          <div>
                            <span className="text-[9.5px] font-normal uppercase tracking-wider text-[#9e8085]">From</span>
                            <div className="font-serif text-[24px] font-normal text-primary leading-none">
                              {minPrice != null ? `${minPrice} BD` : "—"}
                              <span className="text-[11px] font-light text-[#9e8085]"> {minPrice != null ? priceSuffix : ""}</span>
                            </div>
                          </div>
                          <span
                            className="px-4 py-1.5 rounded-full text-[11.5px] font-normal text-white"
                            style={{ background: "#6D0D35" }}
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
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
