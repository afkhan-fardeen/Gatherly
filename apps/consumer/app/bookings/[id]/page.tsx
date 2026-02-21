"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ForkKnife,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  Star,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { OrderProgress } from "@/components/OrderProgress";
import { TYPO } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

interface BookingDetail {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string | null;
  guestCount: number;
  totalAmount: number;
  specialRequirements: string | null;
  vendor: { id: string; businessName: string; logoUrl: string | null };
  event: {
    id: string;
    name: string;
    date: string;
    timeStart: string | null;
    timeEnd: string | null;
    guestCount: number;
    location: string;
    venueType: string | null;
    venueName: string | null;
    specialRequirements: string | null;
  };
  package: {
    name: string;
    packageItems: { name: string; description: string | null; category: string | null }[];
  };
  reviews: { id: string }[];
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; last4: string; brand: string }[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [useNewCard, setUseNewCard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_URL}/api/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBooking(data);
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function openPayModal() {
    setPayModal(true);
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

  async function handlePay() {
    if (!booking) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setPayingId(booking.id);
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
      const res = await fetch(`${API_URL}/api/bookings/${booking.id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId: paymentMethodId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      toast.success("Payment successful!");
      setBooking((b) => (b ? { ...b, paymentStatus: "paid" } : null));
      setPayModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayingId(null);
    }
  }

  async function handleSubmitReview() {
    if (!booking) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${booking.id}/review`, {
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
      setBooking((b) => (b ? { ...b, reviews: [{ id: data.id }] } : null));
      setReviewModal(false);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !booking) {
    return (
      <AppLayout>
        <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
          <Link
            href="/bookings"
            className="flex items-center gap-3 text-slate-600 font-medium"
          >
            <ArrowLeft size={22} weight="regular" />
            Back to bookings
          </Link>
        </header>
        <main className="p-6">
          <p className="text-slate-500 text-center">{error || "Booking not found"}</p>
        </main>
      </AppLayout>
    );
  }

  const canPay =
    booking.status === "confirmed" &&
    (booking.paymentStatus || "unpaid") !== "paid";
  const canReview =
    (booking.status === "completed" || booking.status === "delivered") &&
    (!booking.reviews || booking.reviews.length === 0);

  const dateStr = new Date(booking.event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStart = formatTime(booking.event.timeStart);
  const timeEnd = formatTime(booking.event.timeEnd);
  const timeStr = timeStart && timeEnd ? `${timeStart} – ${timeEnd}` : timeStart || timeEnd || null;

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-radius-sm bg-slate-100 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={22} weight="regular" className="text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className={`${TYPO.H1_SM} truncate`}>
              {booking.bookingReference}
            </h1>
            <p className={`${TYPO.CAPTION} truncate`}>
              {booking.vendor.businessName} · {booking.package.name}
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 pb-32 space-y-6">
        {/* Cancelled banner */}
        {booking.status === "cancelled" && (
          <div className="p-4 rounded-md bg-cancelled/10 border border-cancelled/20">
            <p className="text-sm font-semibold text-cancelled">This booking was cancelled</p>
          </div>
        )}

        {/* Order progress (hidden when cancelled) */}
        {booking.status !== "cancelled" && (
          <OrderProgress status={booking.status} paymentStatus={booking.paymentStatus} />
        )}

        {/* Vendor */}
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-md">
          <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            {booking.vendor.logoUrl ? (
              <img
                src={booking.vendor.logoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <ForkKnife size={24} weight="regular" className="text-slate-400" />
            )}
          </div>
          <div>
            <h2 className={TYPO.CARD_TITLE}>{booking.vendor.businessName}</h2>
            <p className={TYPO.BODY}>{booking.package.name}</p>
          </div>
        </div>

        {/* Event */}
        <div className="space-y-3">
          <h3 className={`${TYPO.H3} text-slate-500`}>
            Event details
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Calendar size={18} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className={TYPO.CARD_TITLE}>{booking.event.name}</p>
                <p className={TYPO.BODY}>{dateStr}</p>
                {timeStr && (
                  <p className={TYPO.BODY}>{timeStr}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className={TYPO.BODY}>{booking.event.location}</p>
                {booking.event.venueName && (
                  <p className={TYPO.SUBTEXT}>{booking.event.venueName}</p>
                )}
              </div>
            </div>
            <p className={TYPO.BODY}>
              {booking.guestCount} guests
            </p>
          </div>
        </div>

        {/* Package items */}
        {booking.package.packageItems?.length > 0 && (
          <div className="space-y-3">
            <h3 className={`${TYPO.H3} text-slate-500`}>
              Menu
            </h3>
            <ul className="space-y-2">
              {booking.package.packageItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 border border-slate-100 rounded-md"
                >
                  <Package size={18} weight="regular" className="text-slate-400 shrink-0" />
                  <div>
                    <p className={TYPO.CARD_TITLE}>{item.name}</p>
                    {item.description && (
                      <p className={TYPO.CAPTION}>{item.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Special requirements */}
        {(booking.specialRequirements || booking.event.specialRequirements) && (
          <div className="space-y-2">
            <h3 className={`${TYPO.H3} text-slate-500`}>
              Special requirements
            </h3>
            <p className={TYPO.BODY}>
              {booking.specialRequirements || booking.event.specialRequirements}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-md">
          <p className={TYPO.BODY}>Total</p>
          <p className="text-primary font-bold text-xl">
            {Number(booking.totalAmount).toFixed(2)} BD
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {canPay && (
            <button
              type="button"
              onClick={openPayModal}
              className="w-full py-3 rounded-md bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90"
            >
              <CreditCard size={18} weight="bold" />
              Pay {Number(booking.totalAmount).toFixed(2)} BD
            </button>
          )}
          {canReview && (
            <button
              type="button"
              onClick={() => setReviewModal(true)}
              className="w-full py-3 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-200"
            >
              <Star size={18} weight="bold" />
              Leave a review
            </button>
          )}
        </div>
      </main>

      {/* Pay modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-xl">
            <h3 className={`${TYPO.H2} mb-4`}>Pay {Number(booking.totalAmount).toFixed(2)} BD</h3>
            <p className={`${TYPO.SUBTEXT} mb-4`}>
              {booking.vendor.businessName} · {booking.package.name}
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
                onClick={() => setPayModal(false)}
                className="flex-1 py-3 rounded-md border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={
                  payingId === booking.id ||
                  (!useNewCard && !selectedPaymentId) ||
                  (useNewCard && newCardNumber.replace(/\D/g, "").length < 13)
                }
                className="flex-1 py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {payingId === booking.id ? "Paying…" : "Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-xl">
            <h3 className={`${TYPO.H2} mb-4`}>Leave a review</h3>
            <p className={`${TYPO.SUBTEXT} mb-4`}>
              {booking.vendor.businessName} · {booking.package.name}
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
                  setReviewModal(false);
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
