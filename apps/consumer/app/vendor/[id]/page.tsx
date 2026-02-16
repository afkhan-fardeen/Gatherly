"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ForkKnife, CaretDown, CaretUp, Star, MapPin, Clock } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { Tag } from "@/components/ui/Tag";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Vendor {
  id: string;
  businessName: string;
  description: string | null;
  cuisineTypes: string[];
  ratingAvg: number;
  ratingCount: number;
  serviceAreas: string[];
  physicalAddress: string | null;
  operatingHours: Record<string, { open?: string; close?: string }> | null;
  logoUrl: string | null;
  featuredImageUrl: string | null;
}

interface Review {
  id: string;
  ratingOverall: number;
  reviewText: string | null;
  createdAt: string;
  user: { name: string };
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
  packageItems: { name: string; imageUrl: string | null }[];
}

export default function VendorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const eventId = searchParams.get("eventId");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
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

  useEffect(() => {
    if (reviewsOpen && id) {
      setReviewsLoading(true);
      fetch(`${API_URL}/api/vendors/${id}/reviews`)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((d) => setReviews(d.items ?? []))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [reviewsOpen, id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-slate-500 text-center">{error || "Vendor not found"}</p>
          <Link
            href="/services/catering"
            className="mt-4 text-primary font-semibold hover:underline"
          >
            Back to catering
          </Link>
        </div>
      </AppLayout>
    );
  }

  const hasHours = vendor.operatingHours && Object.keys(vendor.operatingHours).length > 0;

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/services/catering"
            className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} weight="regular" className="text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">
              {vendor.businessName}
            </h1>
            <p className="text-slate-500 text-xs truncate">
              {(vendor.cuisineTypes || []).join(", ") || "Catering"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 min-h-0">
        {/* Hero */}
        <div className="relative w-full min-w-0">
          <div className="h-48 md:h-56 overflow-hidden bg-slate-100 min-w-0">
            {(vendor.featuredImageUrl || vendor.logoUrl) ? (
              <img
                src={vendor.featuredImageUrl || vendor.logoUrl || ""}
                alt=""
                className="w-full h-full object-cover min-w-0 max-w-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ForkKnife size={48} weight="regular" className="text-slate-300" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-xl font-bold text-white drop-shadow">
              {vendor.businessName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Star size={18} weight="fill" className="text-amber-400" />
              <span className="text-white font-semibold text-sm">
                {Number(vendor.ratingAvg).toFixed(1)}
              </span>
              <span className="text-white/80 text-sm">
                ({vendor.ratingCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Cuisine tags */}
        {(vendor.cuisineTypes?.length ?? 0) > 0 && (
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
            {vendor.cuisineTypes.map((c) => (
              <Tag key={c} value={c} variant="cuisine" className="rounded-md">
                {c}
              </Tag>
            ))}
          </div>
        )}

        {/* Packages (primary) */}
        <section className="px-4 pt-4 pb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Choose a package
          </h3>
          {packages.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No packages available</p>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-slate-200 bg-white overflow-hidden rounded-md"
                >
                  <div className="p-4">
                    {pkg.imageUrl && (
                      <div className="w-full h-28 overflow-hidden bg-slate-100 mb-4 rounded-md">
                        <img src={pkg.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h4 className="font-bold text-lg text-slate-900">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-slate-500 text-sm mt-1">
                        {pkg.description}
                      </p>
                    )}
                    <p className="text-primary font-bold text-lg mt-2">
                      {pkg.priceType === "per_person"
                        ? `From ${Number(pkg.basePrice).toFixed(2)} BD per person`
                        : `${Number(pkg.basePrice).toFixed(2)} BD fixed`}
                    </p>
                    {(pkg.minGuests || pkg.maxGuests) && (
                      <p className="text-slate-500 text-xs mt-1">
                        {pkg.minGuests && `Min ${pkg.minGuests} guests`}
                        {pkg.minGuests && pkg.maxGuests && " · "}
                        {pkg.maxGuests && `Max ${pkg.maxGuests} guests`}
                      </p>
                    )}
                    {pkg.packageItems.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pkg.packageItems.slice(0, 4).map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
                          >
                            {item.name}
                          </span>
                        ))}
                        {pkg.packageItems.length > 4 && (
                          <span className="px-2 py-0.5 text-slate-500 text-xs">
                            +{pkg.packageItems.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    href={
                      eventId
                        ? `/vendor/${id}/package/${pkg.id}?eventId=${eventId}`
                        : `/vendor/${id}/package/${pkg.id}`
                    }
                    className="block w-full py-3 min-h-[44px] bg-primary/10 text-primary font-semibold text-center hover:bg-primary/20 transition-colors border-t border-slate-100"
                  >
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About (compact) */}
        <section className="px-4 pt-4 pb-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            About
          </h3>
          {vendor.description && (
            <p className="text-slate-600 text-sm mb-4">
              {vendor.description}
            </p>
          )}
          <div className="space-y-3">
            {vendor.serviceAreas?.length > 0 && (
              <div className="flex items-start gap-3">
                <MapPin size={18} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Service areas</p>
                  <p className="text-slate-600 text-sm">
                    {(vendor.serviceAreas || []).join(", ") || "—"}
                  </p>
                </div>
              </div>
            )}
            {vendor.physicalAddress && (
              <div className="flex items-start gap-3">
                <MapPin size={18} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Address</p>
                  <p className="text-slate-600 text-sm">{vendor.physicalAddress}</p>
                </div>
              </div>
            )}
            {hasHours && (
              <div>
                <button
                  type="button"
                  onClick={() => setHoursOpen((o) => !o)}
                  className="flex items-center gap-3 w-full py-2 text-left"
                >
                  <Clock size={18} weight="regular" className="text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    {hoursOpen ? "Hide hours" : "View hours"}
                  </span>
                  {hoursOpen ? (
                    <CaretUp size={18} weight="bold" className="text-slate-300 ml-auto" />
                  ) : (
                    <CaretDown size={18} weight="bold" className="text-slate-300 ml-auto" />
                  )}
                </button>
                {hoursOpen && (
                  <div className="ml-6 mt-1 text-slate-600 text-sm space-y-1">
                    {Object.entries(vendor.operatingHours!).map(([day, hours]) => (
                      <p key={day} className="capitalize">
                        {day}: {hours.open && hours.close ? `${hours.open} – ${hours.close}` : "Closed"}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section className="px-4 pt-4 pb-8 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setReviewsOpen((o) => !o)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Star size={18} weight="fill" className="text-amber-400" />
              <span className="font-semibold text-slate-900">
                {Number(vendor.ratingAvg).toFixed(1)} ({vendor.ratingCount} reviews)
              </span>
            </div>
            {reviewsOpen ? (
              <CaretUp size={18} weight="bold" className="text-slate-400" />
            ) : (
              <CaretDown size={18} weight="bold" className="text-slate-400" />
            )}
          </button>
          {reviewsOpen && (
            <div className="space-y-3 pt-2">
              {reviewsLoading ? (
                <p className="text-slate-500 text-sm">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews yet</p>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-md"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{r.user.name}</span>
                      <span className="text-amber-500 text-xs">★ {r.ratingOverall}</span>
                    </div>
                    {r.reviewText && (
                      <p className="text-slate-600 text-sm">{r.reviewText}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
