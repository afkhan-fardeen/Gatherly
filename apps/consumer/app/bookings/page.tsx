"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarCheck,
  ForkKnife,
  CreditCard,
  CaretRight,
  Star,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
import { getBookingStatusStyle } from "@/components/ui/Tag";
import { getBookingStatusLine } from "@/lib/bookingStatus";
import { API_URL, fetchAuth, parseApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import { CHERRY } from "@/lib/events-ui";
import { formatEventDate } from "@/lib/date-utils";
import { PARTNER_GRADIENTS } from "@/lib/gradients";

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

const TAB_CONFIG: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

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
    if (!getToken()) return;
    const statusMap: Record<Tab, string> = {
      active: "pending,confirmed,in_preparation,delivered",
      past: "completed",
      cancelled: "cancelled",
    };
    const res = await fetchAuth(`${API_URL}/api/bookings?status=${statusMap[tab]}`);
    const data = res.ok ? await res.json() : [];
    setBookings(Array.isArray(data) ? data : []);
  }, [tab]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login?redirect=" + encodeURIComponent("/bookings"));
      return;
    }
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings, router]);

  async function handleSubmitReview() {
    if (!reviewModal) return;
    setSubmittingReview(true);
    try {
      const res = await fetchAuth(`${API_URL}/api/bookings/${reviewModal.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    fetchAuth(`${API_URL}/api/payment-methods`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = data.items ?? [];
        setPaymentMethods(items);
        setSelectedPaymentId(items.length > 0 ? items[0].id : null);
        if (items.length === 0) setUseNewCard(true);
      })
      .catch(() => {
        setPaymentMethods([]);
        setUseNewCard(true);
      });
  }

  async function handlePay(bookingId: string) {
    setPayingId(bookingId);
    try {
      let paymentMethodId: string | undefined;
      if (useNewCard && newCardNumber.replace(/\D/g, "").length >= 13) {
        const addRes = await fetchAuth(`${API_URL}/api/payment-methods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: newCardNumber.replace(/\D/g, "") }),
        });
        const addData = await addRes.json();
        if (addRes.ok && addData.id) paymentMethodId = addData.id;
      } else if (selectedPaymentId) {
        paymentMethodId = selectedPaymentId;
      }
      const res = await fetchAuth(`${API_URL}/api/bookings/${bookingId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    <AppLayout contentBg="bg-[#f4ede5]">
      <PullToRefresh onRefresh={fetchBookings}>
        <div
          className="px-5 md:px-8 pt-6 pb-24"
          style={{
            background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)",
          }}
        >
          {/* Header - My Events style */}
          <header
            className="sticky top-0 z-20 mb-6"
            style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
                  style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
                >
                  <ArrowLeft size={20} weight="regular" />
                </Link>
                <div>
                  <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                    My <span className="italic font-normal text-primary">Bookings</span>
                  </h1>
                  <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                    Manage your catering orders
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1.5 mt-4 mb-0 rounded-full p-1.5 relative"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(109,13,53,0.09)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                className="absolute top-1.5 bottom-1.5 rounded-full bg-[#6D0D35] transition-all duration-300 ease-out"
                style={{
                  left: tab === "active" ? "6px" : tab === "past" ? "calc(33.33% + 2px)" : "calc(66.66% + 2px)",
                  width: "calc(33.33% - 4px)",
                  boxShadow: "0 4px 14px rgba(109,13,53,0.3)",
                }}
              />
              {TAB_CONFIG.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className="relative z-10 flex-1 py-2.5 rounded-full text-[13px] font-semibold transition-colors duration-300"
                  style={{ color: tab === key ? "white" : "#9e8085" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div key={tab} className="animate-fade-in-up">
          {loading ? (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-200/50 animate-pulse rounded-[20px]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 px-6 rounded-[20px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center"
              style={{ minHeight: 280 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <CalendarCheck size={32} weight="regular" className="text-primary" />
              </div>
              <p className="font-serif text-[18px] font-medium text-[#1e0f14]">
                No {tab} bookings
              </p>
              <p className="text-[14px] font-light text-[#a0888d] mt-1">
                {tab === "active"
                  ? "Browse catering to book for your next event"
                  : tab === "past"
                    ? "Completed orders will appear here"
                    : "Cancelled orders will appear here"}
              </p>
              {tab === "active" && (
                <Link
                  href="/services/catering"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ backgroundColor: CHERRY }}
                >
                  <ForkKnife size={18} weight="regular" />
                  Browse catering
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
              {filtered.map((booking, idx) => {
                const { month, day, weekday } = formatEventDate(booking.event.date);
                const statusLabel = getBookingStatusLine(
                  booking.status,
                  booking.paymentStatus
                ).split(" · ")[0];
                const needsPay =
                  booking.status === "confirmed" &&
                  (booking.paymentStatus || "unpaid") === "unpaid";
                const canReview =
                  (booking.status === "completed" || booking.status === "delivered") &&
                  (!booking.reviews || booking.reviews.length === 0);

                return (
                  <div
                    key={booking.id}
                    className="relative overflow-hidden rounded-[20px] border border-primary/10 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/20"
                  >
                    <Link href={`/bookings/${booking.id}`} className="flex group">
                      {/* Date badge */}
                    <div
                      className="w-[84px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-2 px-2 border-r border-primary/10"
                      style={{
                        background:
                          PARTNER_GRADIENTS[idx % PARTNER_GRADIENTS.length],
                      }}
                    >
                      <span className="font-serif text-[10px] font-semibold uppercase tracking-wider text-white/80">
                        {month}
                      </span>
                      <span className="font-serif text-[22px] font-semibold text-white leading-none">
                        {day}
                      </span>
                      <span className="font-serif text-[10px] font-semibold text-white/70">
                        {weekday}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-2.5 pl-3 relative">
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${getBookingStatusStyle(
                          booking.status
                        )}`}
                      >
                        {statusLabel}
                      </span>
                      <h3 className="font-serif text-[14px] font-semibold text-[#1e0f14] tracking-tight truncate pr-20">
                        {booking.event.name}
                      </h3>
                      <p className="text-[11px] font-normal text-[#a0888d] line-clamp-1 mt-0.5">
                        {booking.package.name} · {booking.vendor.businessName}
                      </p>
                      <p className="text-[10px] font-light text-[#9e8085] mt-1">
                        {Number(booking.totalAmount).toFixed(2)} BD
                      </p>
                    </div>

                    <div className="flex items-center pr-2.5 shrink-0">
                      <CaretRight
                        size={14}
                        weight="bold"
                        className="text-[#9e8085] transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>
                    </Link>

                    {/* Actions - like Book catering on Events */}
                    {(needsPay || canReview) && (
                      <div
                        className="flex items-center justify-center gap-2 py-2.5 border-t border-primary/5 bg-primary/5"
                        onClick={(e) => e.preventDefault()}
                      >
                        {needsPay && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPayModal(booking);
                            }}
                            disabled={payingId === booking.id}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: CHERRY }}
                          >
                            <CreditCard size={14} weight="bold" />
                            Pay
                          </button>
                        )}
                        {canReview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewModal(booking);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold bg-white text-[#5c3d47] border border-primary/10 hover:bg-white/90"
                          >
                            <Star size={14} weight="regular" />
                            Leave review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* Pay modal */}
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              className="form-no-zoom bg-white rounded-[20px] p-6 max-w-sm w-full shadow-xl"
              style={{ boxShadow: "0 20px 60px rgba(109,13,53,0.15)" }}
            >
              <h3 className="font-serif text-[18px] font-semibold text-[#1e0f14] mb-2">
                Pay {Number(payModal.totalAmount).toFixed(2)} BD
              </h3>
              <p className="text-[13px] font-normal text-[#a0888d] mb-4">
                {payModal.vendor.businessName} · {payModal.package.name}
              </p>
              {paymentMethods.length > 0 && !useNewCard ? (
                <div className="space-y-3 mb-4">
                  <label className="block text-[13px] font-medium text-[#1e0f14]">
                    Pay with
                  </label>
                  <select
                    value={selectedPaymentId ?? ""}
                    onChange={(e) => setSelectedPaymentId(e.target.value || null)}
                    className="w-full h-12 px-4 rounded-full border border-slate-200 text-[#1e0f14] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
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
                    className="text-[13px] font-semibold text-primary"
                  >
                    + Add new card
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <label className="block text-[13px] font-medium text-[#1e0f14]">
                    Card number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={newCardNumber}
                    onChange={(e) =>
                      setNewCardNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 19)
                      )
                    }
                    className="w-full h-12 px-4 rounded-full border border-slate-200 text-[#1e0f14] placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                  />
                  {paymentMethods.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewCard(false);
                        setSelectedPaymentId(paymentMethods[0]?.id ?? null);
                        setNewCardNumber("");
                      }}
                      className="text-[13px] font-semibold text-primary"
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
                  className="flex-1 h-12 rounded-full border border-slate-200 font-semibold text-[#5c3d47] hover:bg-slate-50 transition-colors"
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
                  className="flex-1 h-12 rounded-full font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: CHERRY }}
                >
                  {payingId === payModal.id ? "Paying…" : "Pay"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review modal */}
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              className="form-no-zoom bg-white rounded-[20px] p-6 max-w-sm w-full shadow-xl"
              style={{ boxShadow: "0 20px 60px rgba(109,13,53,0.15)" }}
            >
              <h3 className="font-serif text-[18px] font-semibold text-[#1e0f14] mb-2">
                Leave a review
              </h3>
              <p className="text-[13px] font-normal text-[#a0888d] mb-4">
                {reviewModal.vendor.businessName} · {reviewModal.package.name}
              </p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-2xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      weight={star <= reviewRating ? "fill" : "regular"}
                      className={
                        star <= reviewRating
                          ? "text-amber-400"
                          : "text-slate-200"
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Your review (optional)"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-[#1e0f14] placeholder:text-slate-400 mb-4 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReviewModal(null);
                    setReviewText("");
                    setReviewRating(5);
                  }}
                  className="flex-1 h-12 rounded-full border border-slate-200 font-semibold text-[#5c3d47] hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="flex-1 h-12 rounded-full font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: CHERRY }}
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
