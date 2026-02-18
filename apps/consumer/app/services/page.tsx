"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlass,
  SlidersHorizontal,
  ForkKnife,
  Star,
  Heart,
  MusicNotes,
  Camera,
  Confetti,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, MINTY_LIME_DARK, WARM_PEACH, WARM_PEACH_DARK, SOFT_LILAC, SOFT_LILAC_DARK, TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  packages: { basePrice: number }[];
}

const CATEGORIES = [
  { id: "all", name: "All", businessType: "" },
  { id: "catering", name: "Catering", businessType: "catering" },
  { id: "venues", name: "Venues", businessType: "venues" },
  { id: "music", name: "Music", businessType: "music" },
  { id: "decor", name: "Decor", businessType: "decor" },
];

const BROWSE_CATEGORIES = [
  { slug: "catering", name: "Catering", desc: "Food & beverage", icon: ForkKnife, href: "/services/catering", available: true },
  { slug: "entertainment", name: "Bands & DJs", desc: "Music & entertainment", icon: MusicNotes, href: "/services/coming-soon/entertainment", available: false },
  { slug: "photography", name: "Photography", desc: "Photos & videography", icon: Camera, href: "/services/coming-soon/photography", available: false },
  { slug: "decor", name: "Decor", desc: "Florals & styling", icon: Confetti, href: "/services/coming-soon/decor", available: false },
];

export default function ServicesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const selectedCat = CATEGORIES.find((c) => c.id === category);
  const businessType = selectedCat?.businessType || "";

  useEffect(() => {
    const params = new URLSearchParams();
    if (businessType) params.set("businessType", businessType);
    if (search.trim()) params.set("search", search.trim());
    fetch(`${API_URL}/api/vendors?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [search, businessType]);

  const topVendors = vendors.slice(0, 6);
  const hasVendors = topVendors.length > 0;

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] min-h-full">
        <main className="px-6 pt-8 pb-32 space-y-8">
          {/* Search + Filter bar */}
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                weight="regular"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full text-[16px] placeholder:text-slate-400 focus:ring-2 focus:ring-[#6D0D35]/20 focus:border-[#6D0D35]/40 outline-none transition-all"
                placeholder="Search venues, catering, music..."
              />
            </div>
            <button
              className="w-12 h-12 shrink-0 bg-white border border-slate-200 rounded-full flex items-center justify-center transition-colors hover:bg-slate-50"
              style={{ color: CHERRY }}
              aria-label="Filters"
            >
              <SlidersHorizontal size={20} weight="regular" />
            </button>
          </div>

          {/* Category pills */}
          <div className="flex overflow-x-auto gap-3 scrollbar-hide -mx-6 px-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-normal transition-colors ${
                  category === c.id
                    ? "text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
                style={
                  category === c.id
                    ? { backgroundColor: CHERRY, boxShadow: `${CHERRY}33 0 4px 12px` }
                    : undefined
                }
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Top Rated Partners */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className={TYPO.H3} style={{ color: MINTY_LIME_DARK }}>
                  Handpicked
                </h3>
                <p className={`${TYPO.H2} mt-0.5`}>Top Rated Partners</p>
              </div>
              <button className={TYPO.LINK} style={{ color: CHERRY }}>
                See map
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-64 bg-slate-200/60 animate-pulse ${ROUND}`}
                  />
                ))}
              </div>
            ) : !hasVendors ? (
              <div
                className={`text-center py-16 bg-white border border-slate-200 ${ROUND}`}
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <ForkKnife size={48} weight="regular" className="text-slate-300 mx-auto" />
                <p className={`${TYPO.BODY} mt-4 font-medium`}>
                  {category === "all" || category === "catering"
                    ? "No vendors found"
                    : "Coming soon"}
                </p>
                <p className={`${TYPO.SUBTEXT} mt-1`}>
                  {category === "all" || category === "catering"
                    ? "Try a different search"
                    : "We're adding partners in this category"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {topVendors.map((vendor) => {
                  const minPrice = vendor.packages[0]?.basePrice;
                  return (
                    <Link
                      key={vendor.id}
                      href={`/vendor/${vendor.id}`}
                      className={`bg-white overflow-hidden border group ${ROUND}`}
                      style={{ borderColor: "rgba(0,0,0,0.06)" }}
                    >
                      <div className="relative h-36">
                        {(vendor.featuredImageUrl || vendor.logoUrl) ? (
                          <Image
                            src={vendor.featuredImageUrl || vendor.logoUrl || ""}
                            alt={vendor.businessName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 430px) 100vw, 400px"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: "#F9F2E7" }}
                          >
                            <ForkKnife size={40} weight="regular" style={{ color: CHERRY }} />
                          </div>
                        )}
                        <button
                          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center"
                          onClick={(e) => e.preventDefault()}
                          style={{ color: CHERRY }}
                        >
                          <Heart size={16} weight="regular" />
                        </button>
                        <span
                          className="absolute bottom-2 left-2 text-white text-[9px] font-normal px-2 py-0.5 rounded-full uppercase tracking-widest"
                          style={{ backgroundColor: WARM_PEACH, color: WARM_PEACH_DARK }}
                        >
                          Premium Catering
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={TYPO.CARD_TITLE}>
                              {vendor.businessName}
                            </h4>
                            <div className={`flex items-center ${TYPO.SUBTEXT} mt-0.5`}>
                              <ForkKnife size={14} weight="regular" className="mr-1" />
                              <span>
                                {vendor.cuisineTypes?.slice(0, 2).join(", ") || "Catering"}
                              </span>
                            </div>
                          </div>
                          {vendor.ratingCount > 0 && (
                            <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-full">
                              <Star size={14} weight="fill" className="text-amber-500 mr-1" />
                              <span className="font-normal text-amber-700 text-sm">
                                {Number(vendor.ratingAvg).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-50">
                          <p className={TYPO.SUBTEXT}>
                            {minPrice != null ? (
                              <>
                                <span className="text-slate-900 font-normal">{minPrice} BD</span> / event
                              </>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </p>
                          <span className={`${TYPO.LINK}`} style={{ color: CHERRY }}>
                            View Details
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Browse by Category */}
          <section>
            <h3 className={`${TYPO.H3} mb-4`} style={{ color: WARM_PEACH_DARK }}>
              Browse by Category
            </h3>
              <div
                className={`bg-white border overflow-hidden divide-y divide-slate-100 ${ROUND}`}
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
              {BROWSE_CATEGORIES.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      item.available ? "" : "bg-slate-100"
                    }`}
                    style={item.available ? { backgroundColor: SOFT_LILAC } : undefined}
                  >
                    <item.icon
                      size={22}
                      weight="regular"
                      className={item.available ? "" : "text-slate-400"}
                      style={item.available ? { color: SOFT_LILAC_DARK } : undefined}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={TYPO.CARD_TITLE}>{item.name}</p>
                    <p className={`${TYPO.SUBTEXT} mt-0.5`}>{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.available ? (
                      <span
                        className="text-[10px] font-normal uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: SOFT_LILAC, color: SOFT_LILAC_DARK }}
                      >
                        Available
                      </span>
                    ) : (
                      <span className={TYPO.CAPTION}>Coming soon</span>
                    )}
                    <CaretRight size={18} weight="regular" className="text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
