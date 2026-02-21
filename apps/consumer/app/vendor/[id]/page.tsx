"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ForkKnife,
  Star,
  MapPin,
  CheckCircle,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { ROUND, MINTY_LIME, MINTY_LIME_DARK, TYPO } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

interface Vendor {
  id: string;
  businessName: string;
  businessType: string | null;
  description: string | null;
  cuisineTypes: string[];
  ratingAvg: number;
  ratingCount: number;
  serviceAreas: string[];
  physicalAddress: string | null;
  logoUrl: string | null;
  featuredImageUrl: string | null;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  priceType: string;
  minGuests: number | null;
  maxGuests: number | null;
  packageItems: { name: string }[];
}

export default function VendorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const eventId = searchParams.get("eventId");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([
      fetch(`${API_URL}/api/vendors/${id}`).then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) setError("Vendor not found");
          return null;
        }
        return res.json();
      }),
      fetch(`${API_URL}/api/vendors/${id}/packages`).then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([v, p]) => {
        setVendor(v);
        setPackages(p ?? []);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className={TYPO.SUBTEXT}>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAFAFA]">
          <p className={`${TYPO.SUBTEXT} text-center`}>{error || "Vendor not found"}</p>
          <Link
            href="/services"
            className={`mt-4 ${TYPO.LINK} text-primary hover:underline`}
          >
            Back to discover
          </Link>
        </div>
      </AppLayout>
    );
  }

  const location = vendor.physicalAddress || vendor.serviceAreas?.[0] || vendor.cuisineTypes?.[0] || "—";
  const minCapacity = packages.reduce((min, p) => (p.minGuests != null && (min == null || p.minGuests < min) ? p.minGuests : min), null as number | null);
  const maxCapacity = packages.reduce((max, p) => (p.maxGuests != null && (max == null || p.maxGuests > max) ? p.maxGuests : max), null as number | null);
  const capacityStr = minCapacity != null && maxCapacity != null ? `${minCapacity} - ${maxCapacity}` : minCapacity != null ? `${minCapacity}+` : maxCapacity != null ? `Up to ${maxCapacity}` : "—";
  const minPrice = packages.length > 0 ? Math.min(...packages.map((p) => Number(p.basePrice))) : null;
  const rangeStr = minPrice != null ? `From ${minPrice} BD` : "—";

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] pb-24">
        {/* Hero */}
        <section className="relative h-[240px] w-full overflow-hidden">
          {(vendor.featuredImageUrl || vendor.logoUrl) ? (
            <Image
              src={vendor.featuredImageUrl || vendor.logoUrl || ""}
              alt={vendor.businessName}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: "#F9F2E7" }}
            >
              <ForkKnife size={40} weight="regular" className="text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </section>

        {/* Nav overlay - fixed above content to avoid z-index issues */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 pb-4 flex justify-between items-center">
          <Link
            href="/services"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-slate-200 text-text-primary shadow-sm"
          >
            <ArrowLeft size={22} weight="regular" />
          </Link>
        </nav>

        {/* Main card */}
        <section className="px-6 -mt-6 relative z-10">
          <div
            className={`bg-white p-6 border ${ROUND}`}
            style={{ borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
          >
            <span
              className="inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3"
              style={{ backgroundColor: MINTY_LIME, color: MINTY_LIME_DARK }}
            >
              Premium Partner
            </span>
            <h1 className={`${TYPO.H1_LARGE} text-text-primary mb-2`}>
              {vendor.businessName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className={`flex items-center ${TYPO.SUBTEXT}`}>
                <MapPin size={14} weight="regular" className="mr-1.5 shrink-0" />
                {location}
              </span>
              <span className="flex items-center text-amber-600">
                <Star size={14} weight="fill" className="mr-1 shrink-0" />
                {Number(vendor.ratingAvg).toFixed(1)} · {vendor.ratingCount} reviews
              </span>
            </div>
            <div className="flex border-t border-slate-100 pt-4 mt-2 justify-around">
              <div className="text-center">
                <p className={TYPO.CAPTION}>Capacity</p>
                <p className="text-sm font-medium text-text-primary">{capacityStr}</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className={TYPO.CAPTION}>Category</p>
                <p className="text-sm font-medium text-text-primary">
                  {vendor.businessType || "Catering"}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className={TYPO.CAPTION}>Range</p>
                <p className="text-sm font-medium text-text-primary">{rangeStr}</p>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        {vendor.description && (
          <section className="px-6 mt-8">
            <h3 className={`${TYPO.H2} mb-3`}>About Vendor</h3>
            <p className={`${TYPO.BODY} leading-relaxed`}>
              {vendor.description}
            </p>
          </section>
        )}

        {/* Service Packages */}
        <section className="px-6 mt-8">
          <h3 className={`${TYPO.H2} mb-4`}>Service Packages</h3>
          {packages.length === 0 ? (
            <p className={`${TYPO.SUBTEXT} text-center py-8`}>No packages available</p>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg, idx) => {
                const isPopular = idx === 1 || (idx === 0 && packages.length > 1);
                const priceSuffix = pkg.priceType === "per_person" ? "/ Guest" : "";
                return (
                  <Link
                    key={pkg.id}
                    href={eventId ? `/vendor/${id}/package/${pkg.id}?eventId=${eventId}` : `/vendor/${id}/package/${pkg.id}`}
                    className={`block p-4 rounded-2xl border bg-white transition-all active:scale-[0.99] ${
                      isPopular ? "border-primary ring-1 ring-primary/20" : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={TYPO.CARD_TITLE}>{pkg.name}</h4>
                          {isPopular && (
                            <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Popular
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className={`${TYPO.CAPTION} mt-1 line-clamp-2`}>{pkg.description}</p>
                        )}
                        {pkg.packageItems.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {pkg.packageItems.slice(0, 3).map((item, i) => (
                              <li key={i} className={`flex items-center ${TYPO.CAPTION}`}>
                                <CheckCircle size={12} weight="fill" className="text-emerald-500 mr-1.5 shrink-0" />
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end">
                        <p className={`${TYPO.BODY_MEDIUM} text-primary`}>
                          {Number(pkg.basePrice).toFixed(0)} BD
                          {priceSuffix && <span className={`${TYPO.CAPTION} text-text-tertiary ml-0.5`}>{priceSuffix}</span>}
                        </p>
                        <span className={`${TYPO.LINK} text-primary mt-2 flex items-center gap-0.5`}>
                          View <CaretRight size={16} weight="bold" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
