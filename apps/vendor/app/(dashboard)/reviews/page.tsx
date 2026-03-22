"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, Star } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";
import { SkeletonReviewsPage } from "@/components/VendorSkeleton";

import { API_URL, getNetworkErrorMessage, parseApiError, vendorFetch } from "@/lib/api";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewsData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadPage = useCallback(async (page: number, append: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const res = await vendorFetch(`${API_URL}/api/vendor/reviews?page=${page}&limit=20`);
      const body = (await res.json().catch(() => ({}))) as ReviewsData & Parameters<typeof parseApiError>[0];
      if (!res.ok) {
        const msg = parseApiError(body) || "Could not load reviews";
        if (append) {
          toast.error(msg);
        } else {
          setLoadError(msg);
        }
        return false;
      }
      setLoadError(null);
      setData(body);
      if (append) {
        setReviews((prev) => [...prev, ...body.reviews]);
      } else {
        setReviews(body.reviews);
      }
      return true;
    } catch (err) {
      const msg = getNetworkErrorMessage(err, "Could not load reviews");
      if (append) {
        toast.error(msg);
      } else {
        setLoadError(msg);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      await loadPage(1, false);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  async function handleLoadMore() {
    if (!data || data.pagination.page >= data.pagination.totalPages) return;
    setLoadingMore(true);
    try {
      await loadPage(data.pagination.page + 1, true);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div>
          <SkeletonReviewsPage />
        </div>
      </VendorLayout>
    );
  }

  if (loadError && !data) {
    return (
      <VendorLayout>
        <div>
          <PageHeader
            title="Reviews"
            subtitle="See what customers say about your service."
          />
          <div className="p-6 rounded-xl border border-red-100 bg-red-50 text-red-800 text-sm">
            <p className="font-medium">{loadError}</p>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setLoadError(null);
                await loadPage(1, false);
                setLoading(false);
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-white border border-red-200 font-semibold text-red-900 hover:bg-red-100/50"
            >
              Try again
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  const { overall, pagination } = data ?? {
    overall: { rating: 0, count: 0 },
    reviews: [],
    pagination: { page: 1, totalPages: 0, total: 0, limit: 20 },
  };

  const showLoadMore = pagination.totalPages > 0 && pagination.page < pagination.totalPages;

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
            <>
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
              {showLoadMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
