"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EventImage } from "@/components/EventImage";
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Trash,
  ForkKnife,
  CaretDown,
  CaretRight,
  Warning,
  X,
  Sparkle,
  ShoppingCart,
  MusicNote,
  Flower,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL, fetchAuth, parseApiError } from "@/lib/api";
import { logInfo, logError } from "@/lib/logger";
import { getToken } from "@/lib/session";
import { formatDateLong, formatTime } from "@/lib/date-utils";
import toast from "react-hot-toast";
import { CHERRY } from "@/lib/events-ui";
import { PARTNER_GRADIENTS } from "@/lib/gradients";
import { getBookingStatusStyle } from "@/components/ui/Tag";
import { getStatusBadgeLabel } from "@/lib/bookingStatus";

interface Event {
  id: string;
  name: string;
  date: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  eventType: string;
  guestCount: number;
  location: string;
  venueType: string | null;
  venueName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  specialRequirements: string | null;
  dietaryRequirements: string[];
  guests: { id: string }[];
  status?: string;
  imageUrl?: string | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("details");

  interface EventBooking {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    vendor: { businessName: string; logoUrl: string | null };
    package: { name: string; imageUrl: string | null };
  }

  const fetchBookings = useCallback(async () => {
    if (!eventId) return;
    const res = await fetchAuth(`${API_URL}/api/bookings?eventId=${eventId}`);
    const data = res.ok ? await res.json() : [];
    setBookings(Array.isArray(data) ? data : []);
  }, [eventId]);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    fetchAuth(`${API_URL}/api/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((e) => {
        setEvent(e);
        if (e) fetchBookings();
      })
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId, fetchBookings]);

  async function handleMarkComplete() {
    if (!event) return;
    setMarkingComplete(true);
    try {
      const res = await fetchAuth(`${API_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) setEvent({ ...event, status: "completed" });
    } finally {
      setMarkingComplete(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    logInfo("EventDetail", "delete initiated", { eventId });
    try {
      const res = await fetchAuth(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        logInfo("EventDetail", "delete success", { eventId });
        setShowDeleteModal(false);
        router.push("/events");
      } else {
        const data = await res.json().catch(() => ({}));
        logError("EventDetail", "delete failed", res.status, data);
        toast.error(parseApiError(data) || "Failed to delete event");
      }
    } catch (err) {
      logError("EventDetail", "delete error", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setDeleting(false);
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
          <p className="text-[14px] font-normal text-[#a0888d] text-center">
            Event not found
          </p>
          <Link
            href="/events"
            className="mt-4 text-primary font-medium hover:underline"
          >
            Back to events
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const dateStr = formatDateLong(event.date);
  const timeStr = event.timeStart
    ? event.timeEnd
      ? `${formatTime(event.timeStart)} – ${formatTime(event.timeEnd)}`
      : formatTime(event.timeStart)
    : null;
  const totalCart = bookings.reduce((s, b) => s + Number(b.totalAmount), 0);
  const nonCancelled = bookings.filter((b) => b.status !== "cancelled");
  const allVendorsAccepted = nonCancelled.length === 0 || nonCancelled.every((b) => b.status !== "pending");
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedUnpaid = bookings.filter(
    (b) =>
      ["confirmed", "in_preparation", "delivered"].includes(b.status) &&
      (b.paymentStatus || "unpaid") !== "paid"
  );
  const canPay = allVendorsAccepted && confirmedUnpaid.length > 0;

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="min-h-full px-5 md:px-8 pt-6 pb-40"
        style={{
          background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)",
        }}
      >
        {/* Header: back, title, cart */}
        <header
          className="sticky top-0 z-20 mb-6 -mx-5 px-5 md:-mx-8 md:px-8"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/events"
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
                {dateStr} · {event.guestCount} guests
              </p>
            </div>
            {!isPast && (
              <div className="shrink-0">
              <Link
                href={bookings.length > 0 ? `/events/${eventId}/cart` : `/events/${eventId}/services`}
                className="relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
                style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
                aria-label="View cart"
              >
                <ShoppingCart size={22} weight="regular" />
                {bookings.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: CHERRY }}
                  >
                    {bookings.length}
                  </span>
                )}
              </Link>
              </div>
            )}
          </div>
        </header>

        {/* Event image (optional) */}
        {event.imageUrl && (
          <div className="h-40 relative overflow-hidden rounded-2xl border border-primary/10 bg-slate-100 mb-5">
            <EventImage
              src={event.imageUrl}
              alt={event.name}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}

        {/* Accordion 1: Event details */}
        <div
          className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden mb-4 transition-shadow ${
            expanded === "details" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === "details" ? null : "details")}
            className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                  expanded === "details" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                }`}
              >
                <Calendar size={16} weight="regular" />
              </div>
              <div className="text-left">
                <div className="text-[14.5px] font-medium text-[#1e0f14]">Event details</div>
                <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">{dateStr} · {event.location}</div>
              </div>
            </div>
            <CaretDown
              size={16}
              weight="bold"
              className={`text-[#a0888d] transition-transform ${expanded === "details" ? "rotate-180" : ""}`}
            />
          </button>
          {expanded === "details" && (
            <div className="px-4 pb-4 space-y-2 text-[13px] border-t border-primary/10 pt-4 animate-fade-in">
              <div><span className="font-medium text-[#5c3d47]">Date: </span><span className="text-[#1e0f14]">{dateStr}</span></div>
              <div><span className="font-medium text-[#5c3d47]">Time: </span><span className="text-[#1e0f14]">{timeStr || "—"}</span></div>
              <div><span className="font-medium text-[#5c3d47]">Location: </span><span className="text-[#1e0f14]">{event.location}{event.venueName && ` · ${event.venueName}`}</span></div>
              <div><span className="font-medium text-[#5c3d47]">Total Guests: </span><span className="text-[#1e0f14]">{event.guestCount}</span></div>
              <div><span className="font-medium text-[#5c3d47]">Notes: </span><span className="text-[#1e0f14]">{event.specialRequirements ? (event.dietaryRequirements?.length ? `${event.specialRequirements} Dietary: ${event.dietaryRequirements.join(", ")}` : event.specialRequirements) : event.dietaryRequirements?.length ? `Dietary: ${event.dietaryRequirements.join(", ")}` : "—"}</span></div>
            </div>
          )}
        </div>

        {/* Accordion 2: Services */}
        {!isPast && (
          <div className="space-y-4 mb-5">
            {/* Catering accordion */}
            <div
              className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden transition-shadow ${
                expanded === "catering" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === "catering" ? null : "catering")}
                className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                      expanded === "catering" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                    }`}
                  >
                    <ForkKnife size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Catering</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">
                      {bookings.length === 0 ? "No services added" : `${bookings.length} vendor${bookings.length === 1 ? "" : "s"} · ${totalCart.toFixed(2)} BD`}
                    </div>
                  </div>
                </div>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-[#a0888d] transition-transform ${expanded === "catering" ? "rotate-180" : ""}`}
                />
              </button>
              {expanded === "catering" && (
                <div className="px-4 pb-4 border-t border-primary/10 pt-4 animate-fade-in">
                  {bookings.length === 0 ? (
                    <p className="text-[13px] text-[#a0888d]">Add catering for your event.</p>
                  ) : (
                    <div className="space-y-2">
                      {bookings.map((b) => (
                        <Link
                          key={b.id}
                          href={`/bookings/${b.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/5 bg-white hover:border-primary/15 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#1e0f14]">{b.vendor.businessName} · {b.package.name}</p>
                            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${getBookingStatusStyle(b.status)}`}>
                              {getStatusBadgeLabel(b.status, b.paymentStatus)}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[14px] font-semibold text-primary">{Number(b.totalAmount).toFixed(2)} BD</p>
                            <CaretRight size={14} weight="bold" className="text-[#9e8085] mt-0.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decor - coming soon */}
            <div className="bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden opacity-75">
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-primary/7 text-primary">
                    <Flower size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Decor</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">Coming soon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entertainment - coming soon */}
            <div className="bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden opacity-75">
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-primary/7 text-primary">
                    <MusicNote size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Entertainment</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">Coming soon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="pt-2">
              {bookings.length === 0 ? (
                <Link
                  href={`/events/${eventId}/services`}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-95"
                  style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
                >
                  <Sparkle size={20} weight="regular" />
                  Add services
                </Link>
              ) : !allVendorsAccepted && pendingCount > 0 ? (
                <div className="py-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-[13px] font-medium text-amber-800">Waiting for {pendingCount} vendor{pendingCount === 1 ? "" : "s"} to accept</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">You can pay once all have accepted</p>
                </div>
              ) : canPay ? (
                <Link
                  href={`/events/${eventId}/cart`}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-95"
                  style={{ backgroundColor: CHERRY, boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
                >
                  <ShoppingCart size={20} weight="bold" />
                  View cart & pay
                </Link>
              ) : (
                <Link
                  href={`/events/${eventId}/cart`}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[#5c3d47] bg-white border border-primary/10 hover:bg-[#fdfaf7] transition-colors"
                >
                  <ShoppingCart size={20} weight="regular" />
                  View cart
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Edit & Delete */}
        <section className="space-y-2">
          {isPast &&
            event.status !== "completed" &&
            event.status !== "cancelled" && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="w-full py-3 rounded-xl font-semibold text-[#1e0f14] bg-white border border-primary/10 hover:bg-[#fdfaf7] transition-colors disabled:opacity-50"
              >
                {markingComplete ? "Updating…" : "Mark complete"}
              </button>
            )}

          <div className="flex gap-2">
            <Link
              href={`/events/${eventId}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-medium text-[#5c3d47] bg-white/90 border border-slate-200 hover:bg-white hover:border-primary/20 transition-colors"
            >
              <Pencil size={16} weight="regular" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-medium text-red-600 bg-white/90 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <Trash size={16} weight="regular" />
              Delete
            </button>
          </div>
        </section>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => !deleting && setShowDeleteModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close"
          />
          <div
            className="relative bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl flex flex-col gap-4"
            style={{ boxShadow: "0 20px 60px rgba(109,13,53,0.15)" }}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-red-100">
                <Warning size={18} weight="fill" className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#1e0f14]">
                  Delete event?
                </h3>
                <p className="text-[12px] font-normal text-[#a0888d] mt-0.5">
                  Cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 text-[13px] font-semibold text-[#5c3d47] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-[13px] font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{
                  backgroundColor: "#dc2626",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
                <Trash size={16} weight="regular" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
