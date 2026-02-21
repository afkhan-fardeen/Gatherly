"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlass,
  ForkKnife,
  Star,
  MusicNotes,
  Camera,
  Confetti,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, INPUT, ROUND, SOFT_LILAC, SOFT_LILAC_DARK, TYPO } from "@/lib/events-ui";

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
        <header className="px-6 pt-8 pb-4 shrink-0">
          <h1 className={`${TYPO.H1} text-text-primary`}>Discover</h1>
          <p className={`${TYPO.SUBTEXT} mt-0.5`}>Find venues, catering & more</p>
        </header>
        <main className="px-6 pb-32 space-y-8">
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlass
              size={20}
              weight="regular"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT.SEARCH} pl-12`}
              placeholder="Search venues, catering, music..."
            />
          </div>

          {/* Category pills */}
          <div className="flex overflow-x-auto gap-3 scrollbar-hide -mx-6 px-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-full text-sm font-normal transition-colors ${
                  category === c.id
                    ? "text-white"
                    : "bg-white text-text-secondary border border-slate-200"
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
            <div className="mb-4">
              <h3 className="text-caption font-medium text-primary uppercase tracking-wider">
                Handpicked
              </h3>
              <p className="text-body font-medium text-text-primary mt-0.5">Top Rated Partners</p>
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
                <ForkKnife size={40} weight="regular" className="text-slate-300 mx-auto" />
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
                      className="bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-elevation-1 transition-all hover:border-slate-300 active:scale-[0.99]"
                    >
                      <div className="relative w-full h-28">
                        {(vendor.featuredImageUrl || vendor.logoUrl) ? (
                          <Image
                            src={vendor.featuredImageUrl || vendor.logoUrl || ""}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
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
          </section>

          {/* Browse by Category */}
          <section>
            <h3 className="text-caption font-medium text-primary uppercase tracking-wider mb-4">
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
                      className={item.available ? "" : "text-text-tertiary"}
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
                        className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: SOFT_LILAC, color: SOFT_LILAC_DARK }}
                      >
                        Available
                      </span>
                    ) : (
                      <span className={TYPO.CAPTION}>Coming soon</span>
                    )}
                    <CaretRight size={18} weight="regular" className="text-text-tertiary" />
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
