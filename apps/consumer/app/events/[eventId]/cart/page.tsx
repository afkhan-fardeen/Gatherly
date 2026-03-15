"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  CreditCard,
  ForkKnife,
  Sparkle,
  ShoppingCart,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
import toast from "react-hot-toast";
import { API_URL, fetchAuth, parseApiError } from "@/lib/api";
import { getToken } from "@/lib/session";
import { CHERRY } from "@/lib/events-ui";

interface EventBooking {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  vendor: { businessName: string; logoUrl: string | null };
  package: { name: string; imageUrl: string | null };
}

interface Event {
  id: string;
  name: string;
  date: string;
  guestCount: number;
  location: string;
}

export default function EventCartPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayAllModal, setShowPayAllModal] = useState(false);
  const [payingAll, setPayingAll] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; last4: string; brand: string }[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>("catering");

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    const [eventRes, bookingsRes] = await Promise.all([
      fetchAuth(`${API_URL}/api/events/${eventId}`),
      fetchAuth(`${API_URL}/api/bookings?eventId=${eventId}`),
    ]);
    const e = eventRes.ok ? await eventRes.json() : null;
    const data = bookingsRes.ok ? await bookingsRes.json() : [];
    setEvent(e);
    setBookings(Array.isArray(data) ? data : []);
  }, [eventId]);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [eventId, fetchData]);

  async function handlePayAll() {
    if (!eventId) return;
    setPayingAll(true);
    try {
      const res = await fetchAuth(`${API_URL}/api/bookings/pay-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          paymentMethodId: selectedPaymentId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data) || data.error || "Payment failed");
      toast.success(`Paid ${data.totalAmount?.toFixed(2) ?? ""} BD for ${data.paid} booking(s)`);
      setShowPayAllModal(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayingAll(false);
    }
  }

  if (loading) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <p className="text-[14px] font-normal text-[#a0888d]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh]">
          <p className="text-[14px] font-normal text-[#a0888d] text-center">Event not found</p>
          <Link href="/events" className="mt-4 text-primary font-medium hover:underline">
            Back to events
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const nonCancelled = bookings.filter((b) => b.status !== "cancelled");
  const allVendorsAccepted = nonCancelled.length === 0 || nonCancelled.every((b) => b.status !== "pending");
  const confirmedUnpaid = bookings.filter(
    (b) =>
      ["confirmed", "in_preparation", "delivered"].includes(b.status) &&
      b.paymentStatus !== "paid"
  );
  const totalUnpaid = confirmedUnpaid.reduce((s, b) => s + Number(b.totalAmount), 0);
  const totalAll = bookings.reduce((s, b) => s + Number(b.totalAmount), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <PullToRefresh onRefresh={fetchData}>
      <div
        className="min-h-full px-5 md:px-8 pt-6 pb-40"
        style={{
          background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-20 mb-6 -mx-5 px-5 md:-mx-8 md:px-8"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${eventId}`}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14] break-words">
                {event.name}
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide break-words">
                Review & pay · {event.guestCount} guests · {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        {isPast ? (
          <div
            className="p-6 rounded-[20px] border border-primary/10 bg-white text-center"
            style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
          >
            <ShoppingCart size={40} weight="regular" className="mx-auto text-[#9e8085] mb-3" />
            <p className="font-serif text-[16px] font-medium text-[#1e0f14]">This event has passed</p>
            <p className="text-[13px] font-normal text-[#a0888d] mt-1">
              Cart is for upcoming events only.
            </p>
            <Link
              href={`/events/${eventId}`}
              className="mt-4 inline-block text-primary font-semibold hover:underline"
            >
              Back to event
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="p-8 rounded-[20px] border border-dashed border-primary/15 bg-white text-center"
            style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.04)" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={32} weight="regular" className="text-primary" />
            </div>
            <h2 className="font-serif text-[18px] font-semibold text-[#1e0f14]">Cart is empty</h2>
            <p className="text-[14px] font-normal text-[#a0888d] mt-1">
              Add services for your event.
            </p>
            <Link
              href={`/events/${eventId}/services`}
              className="mt-6 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-[14px] font-semibold text-white transition-all hover:opacity-95"
              style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
            >
              <Sparkle size={20} weight="regular" />
              Add services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Catering accordion */}
            <section>
              <div
                className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden transition-shadow ${
                  expandedService === "catering" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedService(expandedService === "catering" ? null : "catering")}
                  className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                        expandedService === "catering" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                      }`}
                    >
                      <ForkKnife size={16} weight="regular" />
                    </div>
                    <div className="text-left">
                      <div className="text-[14.5px] font-medium text-[#1e0f14]">Catering</div>
                      <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">
                        {bookings.length} vendor{bookings.length === 1 ? "" : "s"} · {totalAll.toFixed(2)} BD
                      </div>
                    </div>
                  </div>
                  <CaretDown
                    size={16}
                    weight="bold"
                    className={`text-[#a0888d] transition-transform ${expandedService === "catering" ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedService === "catering" && (
                  <div className="px-4 pb-4 border-t border-primary/10 pt-4 space-y-3 animate-fade-in">
                    {bookings.map((b) => {
                const isPending = b.status === "pending";
                const isConfirmed = ["confirmed", "in_preparation", "delivered"].includes(b.status);
                const isDeclined = b.status === "cancelled";
                const isPaid = b.paymentStatus === "paid";
                const canPay = allVendorsAccepted && isConfirmed && !isPaid;

                return (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.id}`}
                    className="block p-4 rounded-[20px] border border-primary/10 bg-white transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
                    style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-[#1e0f14]">
                          {b.vendor.businessName}
                        </p>
                        <p className="text-[13px] text-[#a0888d] mt-0.5">{b.package.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isPending
                                ? "bg-amber-500/10 text-amber-700"
                                : isDeclined
                                  ? "bg-red-100 text-red-700"
                                  : isPaid
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-emerald-500/10 text-emerald-700"
                            }`}
                          >
                            {isPending ? "Pending" : isDeclined ? "Declined" : isPaid ? "Paid" : "Confirmed"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-serif text-[16px] font-semibold text-primary">
                          {Number(b.totalAmount).toFixed(2)} BD
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          {isDeclined && (
                            <Link
                              href={`/events/${eventId}/services`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Replace
                            </Link>
                          )}
                          {canPay && (
                            <Link
                              href={`/bookings/${b.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-lg inline-block"
                              style={{ backgroundColor: CHERRY }}
                            >
                              Pay
                            </Link>
                          )}
                          {!isDeclined && (
                            <CaretRight size={16} weight="bold" className="text-[#9e8085]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="space-y-2">
              {!allVendorsAccepted && pendingCount > 0 && (
                <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  Waiting for all vendors to accept before you can pay.
                </p>
              )}
              <Link
                href={`/events/${eventId}/services`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/20 text-primary font-medium text-[13px] hover:bg-primary/5 transition-colors"
              >
                <Sparkle size={18} weight="regular" />
                Add more services
              </Link>

              {allVendorsAccepted && confirmedUnpaid.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPayAllModal(true);
                    fetchAuth(`${API_URL}/api/payment-methods`)
                      .then((r) => (r.ok ? r.json() : { items: [] }))
                      .then((d) => {
                        const items = d.items ?? [];
                        setPaymentMethods(items);
                        setSelectedPaymentId(items[0]?.id ?? null);
                      })
                      .catch(() => setPaymentMethods([]));
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-95"
                  style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
                >
                  <CreditCard size={20} weight="bold" />
                  Pay all ({totalUnpaid.toFixed(2)} BD)
                </button>
              )}

              <div className="flex justify-end items-baseline gap-2 pt-2">
                <span className="text-[13px] font-medium text-[#5c3d47]">Total:</span>
                <span className="font-serif text-[20px] font-semibold text-primary">{totalAll.toFixed(2)} BD</span>
              </div>
            </div>
          </div>
        )}

        {/* Pay all modal */}
      {showPayAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => !payingAll && setShowPayAllModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close"
          />
          <div
            className="relative bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl"
            style={{ boxShadow: "0 20px 60px rgba(109,13,53,0.15)" }}
          >
            <h3 className="text-[14px] font-semibold text-[#1e0f14] mb-1">Pay all</h3>
            <p className="text-[12px] text-[#a0888d] mb-3">{totalUnpaid.toFixed(2)} BD total</p>
            {paymentMethods.length > 0 ? (
              <div className="space-y-2 mb-4">
                <label className="block text-[12px] font-medium text-[#1e0f14]">Pay with</label>
                <select
                  value={selectedPaymentId ?? ""}
                  onChange={(e) => setSelectedPaymentId(e.target.value || null)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] text-[#1e0f14] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                >
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} •••• {m.last4}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-[12px] text-[#a0888d] mb-4">Card on file will be used</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !payingAll && setShowPayAllModal(false)}
                disabled={payingAll}
                className="flex-1 py-2.5 text-[13px] font-semibold text-[#5c3d47] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayAll}
                disabled={payingAll}
                className="flex-1 py-2.5 text-[13px] font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
              >
                {payingAll ? "Paying…" : "Pay all"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </PullToRefresh>
    </AppLayout>
  );
}
