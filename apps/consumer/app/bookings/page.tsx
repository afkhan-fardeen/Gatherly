"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { CalendarCheck, ForkKnife, CreditCard, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
import { getBookingStatusStyle } from "@/components/ui/Tag";
import { getBookingStatusLine } from "@/lib/bookingStatus";
import { TYPO } from "@/lib/events-ui";

import { API_URL, parseApiError } from "@/lib/api";

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string | null;
  totalAmount: number;
  vendor: { businessName: string; logoUrl: string | null };
  event: { name: string; date: string };
  package: { name: string; imageUrl: string | null };
  reviews: { id: string }[];
}

type Tab = "active" | "past" | "cancelled";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [payModal, setPayModal] = useState<Booking | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; last4: string; brand: string }[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [useNewCard, setUseNewCard] = useState(false);

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const statusMap: Record<Tab, string> = {
      active: "pending,confirmed,in_preparation,delivered",
      past: "completed",
      cancelled: "cancelled",
    };
    const status = statusMap[tab];
    const res = await fetch(`${API_URL}/api/bookings?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.ok ? await res.json() : [];
    setBookings(Array.isArray(data) ? data : []);
  }, [tab]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/bookings"));
      return;
    }
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings, router]);

  async function handleSubmitReview() {
    if (!reviewModal) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${reviewModal.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ratingOverall: reviewRating,
          reviewText: reviewText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data) || "Failed to submit review");
      toast.success("Thanks for your review!");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewModal.id ? { ...b, reviews: [{ id: data.id }] } : b
        )
      );
      setReviewModal(null);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  function openPayModal(booking: Booking) {
    setPayModal(booking);
    setUseNewCard(false);
    setSelectedPaymentId(null);
    setNewCardNumber("");
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/payment-methods`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data) => {
          const items = data.items ?? [];
          setPaymentMethods(items);
          if (items.length > 0) {
            setSelectedPaymentId(items[0].id);
            setUseNewCard(false);
          } else {
            setUseNewCard(true);
          }
        })
        .catch(() => {
          setPaymentMethods([]);
          setUseNewCard(true);
        });
    }
  }

  async function handlePay(bookingId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setPayingId(bookingId);
    try {
      let paymentMethodId: string | undefined;
      if (useNewCard && newCardNumber.replace(/\D/g, "").length >= 13) {
        const num = newCardNumber.replace(/\D/g, "");
        const addRes = await fetch(`${API_URL}/api/payment-methods`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ number: num }),
        });
        const addData = await addRes.json();
        if (addRes.ok && addData.id) paymentMethodId = addData.id;
      } else if (selectedPaymentId) {
        paymentMethodId = selectedPaymentId;
      }
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId: paymentMethodId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data) || "Payment failed");
      toast.success("Payment successful!");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, paymentStatus: "paid" } : b
        )
      );
      setPayModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayingId(null);
    }
  }

  const activeStatuses = ["pending", "confirmed", "in_preparation", "delivered"];
  const filtered =
    tab === "active"
      ? bookings.filter((b) => activeStatuses.includes(b.status))
      : tab === "past"
      ? bookings.filter((b) => b.status === "completed")
      : bookings.filter((b) => b.status === "cancelled");

  return (
    <AppLayout>
      <PullToRefresh onRefresh={fetchBookings}>
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <h1 className={TYPO.H1}>My Bookings</h1>
        <div className="flex gap-2 mt-4">
          {(["active", "past", "cancelled"] as Tab[]).map((t) => {
            const activeStyles: Record<Tab, string> = {
              active: "bg-emerald-100 text-emerald-800",
              past: "bg-slate-200 text-slate-700",
              cancelled: "bg-red-100 text-red-800",
            };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize ${
                  tab === t ? activeStyles[t] : "bg-slate-100 text-slate-500"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </header>

      <main className="p-6 pb-40">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck size={40} weight="regular" className="text-slate-300 mx-auto" />
            <p className={`${TYPO.SUBTEXT} mt-4 font-medium`}>No {tab} bookings</p>
            {tab === "active" && (
              <Link
                href="/services/catering"
                className="inline-block mt-4 text-primary font-semibold"
              >
                Browse catering
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevation-1 transition-all hover:border-slate-300 active:scale-[0.99]"
              >
                <div className="flex min-h-[88px]">
                  <div className="relative w-24 min-h-full shrink-0 bg-slate-100 self-stretch">
                    {booking.package.imageUrl ? (
                      <Image
                        src={booking.package.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                    ) : booking.vendor.logoUrl ? (
                      <Image
                        src={booking.vendor.logoUrl}
                        alt=""
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ForkKnife size={24} weight="regular" className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-center relative">
                    <span
                      className={`absolute top-3 right-4 px-2 py-0.5 rounded-radius-xs text-[9px] font-semibold uppercase tracking-wide ${getBookingStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace(/_/g, " ")}
                    </span>
                    <h3 className={`${TYPO.CARD_TITLE} line-clamp-1 pr-16`}>
                      {booking.event.name}
                    </h3>
                    <p className={`${TYPO.SUBTEXT} line-clamp-1 mt-0.5`}>
                      {booking.package.name} · {booking.vendor.businessName}
                    </p>
                    <p className={`${TYPO.CAPTION} mt-1`}>
                      {new Date(booking.event.date).toLocaleDateString()} · {Number(booking.totalAmount).toFixed(2)} BD
                    </p>
                    <div className="flex gap-2 mt-2" onClick={(e) => e.preventDefault()}>
                      {booking.status === "confirmed" &&
                        (booking.paymentStatus || "unpaid") === "unpaid" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openPayModal(booking);
                          }}
                          disabled={payingId === booking.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                        >
                          <CreditCard size={14} weight="bold" />
                          Pay
                        </button>
                      )}
                      {(booking.status === "completed" || booking.status === "delivered") &&
                        (!booking.reviews || booking.reviews.length === 0) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setReviewModal(booking);
                          }}
                          className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                        >
                          Leave review
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pr-3">
                    <CaretRight size={20} weight="bold" className="text-text-tertiary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="form-no-zoom bg-white rounded-radius-md p-6 max-w-sm w-full shadow-elevation-4">
            <h3 className={`${TYPO.H2} mb-4`}>Pay {Number(payModal.totalAmount).toFixed(2)} BD</h3>
            <p className={`${TYPO.SUBTEXT} mb-4`}>
              {payModal.vendor.businessName} · {payModal.package.name}
            </p>
            {paymentMethods.length > 0 && !useNewCard ? (
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-slate-700">Pay with</label>
                <select
                  value={selectedPaymentId ?? ""}
                  onChange={(e) => setSelectedPaymentId(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 text-slate-900"
                >
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} •••• {m.last4}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewCard(true);
                    setSelectedPaymentId(null);
                  }}
                  className="text-sm text-primary font-semibold"
                >
                  + Add new card
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-slate-700">Card number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
                {paymentMethods.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewCard(false);
                      setSelectedPaymentId(paymentMethods[0]?.id ?? null);
                      setNewCardNumber("");
                    }}
                    className="text-sm text-primary font-semibold"
                  >
                    Use saved card
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="flex-1 py-3 rounded-md border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePay(payModal.id)}
                disabled={
                  payingId === payModal.id ||
                  (!useNewCard && !selectedPaymentId) ||
                  (useNewCard && newCardNumber.replace(/\D/g, "").length < 13)
                }
                className="flex-1 py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {payingId === payModal.id ? "Paying…" : "Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="form-no-zoom bg-white rounded-radius-md p-6 max-w-sm w-full shadow-elevation-4">
            <h3 className={`${TYPO.H2} mb-4`}>Leave a review</h3>
            <p className={`${TYPO.SUBTEXT} mb-4`}>
              {reviewModal.vendor.businessName} · {reviewModal.package.name}
            </p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= reviewRating ? "text-amber-400" : "text-slate-200"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Your review (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-slate-200 text-slate-900 placeholder:text-slate-400 mb-4 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setReviewModal(null);
                  setReviewText("");
                  setReviewRating(5);
                }}
                className="flex-1 py-3 rounded-md border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingReview ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      </PullToRefresh>
    </AppLayout>
  );
}
