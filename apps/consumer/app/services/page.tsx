"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlass,
  ForkKnife,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { ROUND, SOFT_LILAC, SOFT_LILAC_DARK, TYPO } from "@/lib/events-ui";

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
  { id: "catering", name: "Catering", businessType: "catering", imageSlug: "catering" },
  { id: "decor", name: "Decor", businessType: "decor", imageSlug: "decor" },
  { id: "entertainment", name: "Entertainment", businessType: "entertainment", imageSlug: "entertainment" },
  { id: "photography", name: "Photography", businessType: "photography", imageSlug: "photography" },
  { id: "rentals", name: "Rentals", businessType: "rentals", imageSlug: "rentals" },
];

const BROWSE_CATEGORIES = [
  { slug: "catering", name: "Catering", desc: "Food & beverage", imageSlug: "catering", href: "/services/catering", available: true },
  { slug: "decor", name: "Decor", desc: "Florals & styling", imageSlug: "decor", href: "/services/coming-soon/decor", available: false },
  { slug: "entertainment", name: "Entertainment", desc: "Music & entertainment", imageSlug: "entertainment", href: "/services/coming-soon/entertainment", available: false },
  { slug: "photography", name: "Photography", desc: "Photos & videography", imageSlug: "photography", href: "/services/coming-soon/photography", available: false },
  { slug: "rentals", name: "Rentals", desc: "Chairs, tables & more", imageSlug: "rentals", href: "/services/coming-soon/rentals", available: false },
];

export default function ServicesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("catering");
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
        <main className="px-6 pb-40 space-y-6">
          {/* Search bar - form-no-zoom prevents iOS zoom on focus */}
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
              className="w-full h-12 pl-12 pr-5 font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3F0810]/20 focus:border-[#3F0810]/40 outline-none transition-all duration-200"
              style={{ fontSize: "16px" }}
              placeholder="Search venues, catering, music..."
            />
          </div>

          {/* Category tabs - square image cards */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide overscroll-x-contain -mx-6 px-6 pb-1">
            {CATEGORIES.map((c) => {
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className="shrink-0 w-[72px] flex flex-col items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <div
                    className={`relative w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 ${
                      isActive ? "border-2 border-primary" : "border border-slate-200 bg-slate-100"
                    }`}
                  >
                    <Image
                      src={`/images/services/${c.imageSlug}.jpg`}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                      unoptimized
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium truncate w-full text-center ${
                      isActive ? "text-primary" : "text-text-secondary"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Top Rated Partners */}
          <section>
            <div className="mb-3">
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
                  {category === "catering" ? "No vendors found" : "Coming soon"}
                </p>
                <p className={`${TYPO.SUBTEXT} mt-1`}>
                  {category === "catering" ? "Try a different search" : "We're adding partners in this category"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {topVendors.map((vendor) => {
                  const pkg = vendor.packages[0];
                  const minPrice = pkg?.basePrice;
                  const priceType = pkg?.priceType || "per_person";
                  const priceSuffix = priceType === "per_person" ? "/ person" : "/ event";
                  return (
                    <Link
                      key={vendor.id}
                      href={`/vendor/${vendor.id}`}
                      className="bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-elevation-1 transition-all hover:border-slate-300 active:scale-[0.99]"
                    >
                      <div className="relative w-full h-28 bg-slate-100">
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
                        <div className="flex items-center gap-3">
                          {vendor.logoUrl && (
                            <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-100">
                              <Image
                                src={vendor.logoUrl}
                                alt=""
                                fill
                                className="object-contain p-1.5"
                                sizes="56px"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className={TYPO.CARD_TITLE}>{vendor.businessName}</h4>
                            <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                              {vendor.cuisineTypes?.slice(0, 2).join(", ") || "Catering"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                          <p className={TYPO.BODY_MEDIUM}>
                            {minPrice != null ? (
                              <span className="text-text-primary">{minPrice} BD</span>
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                            {minPrice != null && <span className={`${TYPO.CAPTION} ml-1`}>{priceSuffix}</span>}
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

          {/* Browse by Category - list layout with images */}
          <section>
            <h3 className="text-caption font-medium text-primary uppercase tracking-wider mb-3">
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
                  className="flex items-center gap-3 p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 ${
                      item.available ? "" : "opacity-60"
                    }`}
                  >
                    <Image
                      src={`/images/services/${item.imageSlug}.jpg`}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-text-primary">{item.name}</p>
                    <p className="text-body-sm font-normal text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.available ? (
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: SOFT_LILAC, color: SOFT_LILAC_DARK }}
                      >
                        Available
                      </span>
                    ) : (
                      <span className="text-caption-sm font-light text-text-tertiary">Coming soon</span>
                    )}
                    <CaretRight size={16} weight="regular" className="text-text-tertiary" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom spacing */}
          <div className="h-8" aria-hidden />
        </main>
      </div>
    </AppLayout>
  );
}
