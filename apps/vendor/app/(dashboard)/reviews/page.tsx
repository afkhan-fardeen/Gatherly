"use client";

import { useEffect, useState } from "react";
import { Package, Star } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Review {
  id: string;
  ratingOverall: number;
  ratingFood: number | null;
  ratingService: number | null;
  ratingValue: number | null;
  reviewText: string | null;
  createdAt: string;
  user: { name: string };
  booking?: { package: { name: string; imageUrl?: string | null } };
}

interface ReviewsData {
  overall: { rating: number; count: number };
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewsData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <VendorLayout>
        <div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded-lg w-48" />
            <div className="h-32 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </VendorLayout>
    );
  }

  const { overall, reviews, pagination } = data ?? {
    overall: { rating: 0, count: 0 },
    reviews: [],
    pagination: { page: 1, totalPages: 0, total: 0, limit: 20 },
  };

  return (
    <VendorLayout>
      <div>
        <PageHeader
          title="Reviews"
          subtitle="See what customers say about your service."
        />

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Overall rating
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star size={28} weight="fill" className="text-amber-400" />
                <span className="text-2xl font-bold text-slate-900">
                  {overall.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-slate-500">
                {overall.count} {overall.count === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12 rounded-xl border border-slate-200 bg-white text-center">
              <Star size={40} weight="regular" className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No reviews yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Reviews from completed bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-6 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {r.booking?.package?.imageUrl ? (
                        <img
                          src={r.booking.package.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} weight="regular" className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={16}
                              weight={i <= r.ratingOverall ? "fill" : "regular"}
                              className={
                                i <= r.ratingOverall
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {r.ratingOverall}/5
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {r.user?.name ?? "Anonymous"}
                      </p>
                      {r.booking?.package?.name && (
                        <p className="text-xs text-primary font-medium mt-0.5">
                          For: {r.booking.package.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {r.reviewText && (
                    <p className="mt-3 text-slate-700 whitespace-pre-wrap">
                      {r.reviewText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
