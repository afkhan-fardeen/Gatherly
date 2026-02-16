"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CalendarCheck, ForkKnife, CreditCard } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { getBookingStatusStyle } from "@/components/ui/Tag";
import { getBookingStatusLine } from "@/lib/bookingStatus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const statusMap: Record<Tab, string> = {
      active: "pending,confirmed,in_preparation,delivered",
      past: "completed",
      cancelled: "cancelled",
    };
    const status = statusMap[tab];
    fetch(`${API_URL}/api/bookings?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [tab]);

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
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
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
      if (!res.ok) throw new Error(data.error || "Payment failed");
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
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">My Bookings</h1>
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

      <main className="p-6 pb-32">
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
            <CalendarCheck size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No {tab} bookings</p>
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
          <div className="rounded-md border border-slate-100 bg-white overflow-hidden divide-y divide-slate-100">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-4"
              >
                <Link
                  href={`/bookings/${booking.id}`}
                  className="flex items-start gap-4 flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {booking.package.imageUrl ? (
                      <img
                        src={booking.package.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : booking.vendor.logoUrl ? (
                      <img
                        src={booking.vendor.logoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ForkKnife size={20} weight="regular" className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-2">
                      {booking.event.name} · {booking.vendor.businessName} · {booking.package.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {booking.bookingReference} · {new Date(booking.event.date).toLocaleDateString()} · {Number(booking.totalAmount).toFixed(2)} BD
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {getBookingStatusLine(booking.status, booking.paymentStatus)}
                    </p>
                  </div>
                </Link>
                <div
                  className={`flex shrink-0 gap-1.5 ${
                    (booking.status === "completed" || booking.status === "delivered")
                      ? "flex-col items-end"
                      : "flex-row items-center gap-2"
                  }`}
                >
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
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
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
                      className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                    >
                      Leave review
                    </button>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${getBookingStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Pay {Number(payModal.totalAmount).toFixed(2)} BD</h3>
            <p className="text-slate-500 text-sm mb-4">
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
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Leave a review</h3>
            <p className="text-slate-500 text-sm mb-4">
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
    </AppLayout>
  );
}
