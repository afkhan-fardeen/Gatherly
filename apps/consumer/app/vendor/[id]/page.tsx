"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { RemoteImage } from "@/components/RemoteImage";
import {
  ArrowLeft,
  ForkKnife,
  MapPin,
  Heart,
  ShareNetwork,
  Clock,
  Check,
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
  const guestCountParam = searchParams.get("guestCount");
  const eventGuests = guestCountParam ? parseInt(guestCountParam, 10) : null;
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
      <AppLayout contentBg="bg-[#fdfaf7]">
        <div className="flex-1 flex items-center justify-center min-h-[40vh]">
          <p className="text-sm font-normal text-[#a0888d]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <AppLayout contentBg="bg-[#fdfaf7]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[40vh]">
          <p className="text-sm font-normal text-[#a0888d] text-center">{error || "Vendor not found"}</p>
          <Link href="/services" className="mt-4 text-sm font-normal text-primary hover:underline">
            Back to discover
          </Link>
        </div>
      </AppLayout>
    );
  }

  const location = vendor.physicalAddress || vendor.serviceAreas?.[0] || vendor.cuisineTypes?.[0] || "—";
  const minCapacity = packages.reduce((min, p) => (p.minGuests != null && (min == null || p.minGuests < min) ? p.minGuests : min), null as number | null);
  const maxCapacity = packages.reduce((max, p) => (p.maxGuests != null && (max == null || p.maxGuests > max) ? p.maxGuests : max), null as number | null);
  const capacityStr = minCapacity != null && maxCapacity != null ? `${minCapacity}–${maxCapacity}` : minCapacity != null ? `${minCapacity}+` : maxCapacity != null ? `Up to ${maxCapacity}` : "—";
  const minPrice = packages.length > 0 ? Math.min(...packages.map((p) => Number(p.basePrice))) : null;
  const rating = Number(vendor.ratingAvg) || 0;
  const count = Number(vendor.ratingCount) || 0;

  const fits = (p: Package) =>
    eventGuests != null &&
    (p.minGuests == null || eventGuests >= p.minGuests) &&
    (p.maxGuests == null || eventGuests <= p.maxGuests);
  const sorted =
    eventGuests != null && eventGuests >= 1
      ? [...packages].sort((a, b) => {
          const aF = fits(a);
          const bF = fits(b);
          if (aF && !bF) return -1;
          if (!aF && bF) return 1;
          return (a.minGuests ?? 0) - (b.minGuests ?? 0);
        })
      : packages;

  return (
    <AppLayout contentBg="bg-[#fdfaf7]">
      <div className="bg-[#fdfaf7] pb-32">
        {/* Hero - minimal, warm gradient */}
        <section
          className="relative h-[260px] overflow-hidden"
          style={{ background: "linear-gradient(160deg, #e8d5c0 0%, #c9a07a 50%, #9a6040 100%)" }}
        >
          <RemoteImage
            src={vendor.featuredImageUrl || vendor.logoUrl}
            alt={vendor.businessName}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            fallback={
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(160deg, #e8d5c0 0%, #c9a07a 50%, #9a6040 100%)" }}
              />
            }
          />
          <div
            className="absolute inset-0"
            style={{
              background: vendor.featuredImageUrl || vendor.logoUrl
                ? "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.4) 100%)"
                : "none",
            }}
          />
          <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-0 right-0 flex justify-between items-center px-4">
            <Link
              href={eventId ? `/services/catering?eventId=${eventId}${eventGuests != null ? `&guestCount=${eventGuests}` : ""}` : "/services"}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#1e0f14] shadow-sm"
            >
              <ArrowLeft size={15} weight="regular" />
            </Link>
            <div className="flex gap-2">
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#1e0f14] shadow-sm" aria-label="Save">
                <Heart size={15} weight="regular" />
              </button>
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#1e0f14] shadow-sm" aria-label="Share">
                <ShareNetwork size={14} weight="regular" />
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="px-5 pb-8">
          {/* Identity */}
          <div className="pt-6 pb-5 border-b border-primary/8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-medium uppercase tracking-wider"
                style={{ background: "rgba(184,147,90,0.12)", border: "1px solid rgba(184,147,90,0.22)", color: "#b8935a" }}
              >
                Premium Partner
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-medium uppercase tracking-wider"
                style={{ background: "rgba(46,125,94,0.09)", border: "1px solid rgba(46,125,94,0.16)", color: "#2e7d5e" }}
              >
                <Check size={10} weight="bold" /> Verified
              </span>
            </div>
            <h1 className="font-serif text-[28px] font-normal text-[#1e0f14] tracking-[-0.4px] leading-tight mb-2">
              {vendor.businessName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[12.5px] font-light text-[#a0888d]">
              <span className="flex items-center gap-1">
                <MapPin size={11} weight="regular" className="opacity-55" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <span className="flex items-center gap-0.5 text-amber-600 font-normal">
                <Star size={12} weight="fill" /> {rating.toFixed(1)}
              </span>
                <span>· {count} reviews</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} weight="regular" className="opacity-55" />
                Replies in 2h
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex py-4 border-b border-primary/8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex-1 text-center relative">
              <span className="text-[22px] font-medium text-primary leading-none block mb-1">{capacityStr}</span>
              <span className="text-[9px] font-normal uppercase tracking-wider text-[#a0888d]">Capacity</span>
            </div>
            <div className="flex-1 text-center border-l border-primary/10">
              <span className="text-[22px] font-medium text-primary leading-none block mb-1">{vendor.businessType || "Catering"}</span>
              <span className="text-[9px] font-normal uppercase tracking-wider text-[#a0888d]">Category</span>
            </div>
            <div className="flex-1 text-center border-l border-primary/10">
              <span className="text-[22px] font-medium text-primary leading-none block mb-1">{minPrice != null ? `${minPrice} BD` : "—"}</span>
              <span className="text-[9px] font-normal uppercase tracking-wider text-[#a0888d]">From</span>
            </div>
          </div>

          {/* About */}
          {vendor.description && (
            <div className="py-5 border-b border-primary/8 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
              <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-primary block mb-2">About</span>
              <p className="text-sm font-light text-[#5c3d47] leading-relaxed">{vendor.description}</p>
            </div>
          )}

          {/* Packages */}
          <div className="pt-6 animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
            <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-primary block mb-3">Service Packages</span>
            {packages.length === 0 ? (
              <p className="text-sm font-light text-[#a0888d] py-8 text-center">No packages available</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {sorted.map((pkg, idx) => {
                  const priceSuffix = pkg.priceType === "per_person" ? "/ guest" : "/ event";
                  const pkgFits = fits(pkg);
                  const capParts: string[] = [];
                  if (pkg.minGuests != null) capParts.push(`Min ${pkg.minGuests}`);
                  if (pkg.maxGuests != null) capParts.push(`Max ${pkg.maxGuests}`);
                  const capLabel = capParts.length ? capParts.join(" · ") : null;
                  const href = `/vendor/${id}/package/${pkg.id}${eventId ? `?eventId=${eventId}` : ""}${eventGuests != null ? `${eventId ? "&" : "?"}guestCount=${eventGuests}` : ""}`;

                  return (
                    <Link
                      key={pkg.id}
                      href={href}
                      className="block rounded-[18px] border border-primary/10 p-4 transition-all hover:border-primary/20 hover:bg-cream/50"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="relative w-[42px] h-[42px] rounded-[13px] overflow-hidden shrink-0" style={{ background: "#ede4da" }}>
                          <RemoteImage
                            src={pkg.imageUrl}
                            alt={pkg.name}
                            fill
                            className="object-cover"
                            sizes="42px"
                            fallback={
                              <div className="w-full h-full flex items-center justify-center text-primary/70">
                                <ForkKnife size={20} weight="regular" />
                              </div>
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-[18px] font-normal text-[#1e0f14] tracking-[-0.2px] mb-0.5">{pkg.name}</h3>
                          <p className="text-[11.5px] font-light text-[#a0888d]">{capLabel || "—"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-[22px] font-normal text-primary leading-none">{Number(pkg.basePrice).toFixed(0)} BD</div>
                          <div className="text-[10px] font-light text-[#a0888d]">{priceSuffix}</div>
                        </div>
                      </div>
                      {pkg.packageItems.length > 0 && (
                        <div className="pt-2.5 border-t border-primary/8 flex flex-col gap-1">
                          {pkg.packageItems.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[13px] font-light text-[#5c3d47]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                              {item.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {pkgFits && eventGuests != null && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-normal text-primary">
                          <Check size={12} weight="bold" /> Fits your event ({eventGuests} guests)
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
