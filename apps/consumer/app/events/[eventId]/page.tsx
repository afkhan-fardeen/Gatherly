"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EventImage } from "@/components/EventImage";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Pencil,
  Trash,
  ForkKnife,
  CaretRight,
  Warning,
  X,
  Clock,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_URL, fetchAuth } from "@/lib/api";
import { getToken } from "@/lib/session";
import { formatDateLong, formatTime, formatEventDate } from "@/lib/date-utils";
import { CHERRY } from "@/lib/events-ui";
import { PARTNER_GRADIENTS } from "@/lib/gradients";

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
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    fetchAuth(`${API_URL}/api/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

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
    try {
      const res = await fetchAuth(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowDeleteModal(false);
        router.push("/events");
      }
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
  const { month, day, weekday } = formatEventDate(event.date);

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="px-5 md:px-8 pt-6 pb-40"
        style={{
          background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)",
        }}
      >
        {/* Header - My Events style */}
        <header
          className="sticky top-0 z-20 mb-6"
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
              <h1 className="font-serif text-[26px] sm:text-[32px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14] truncate">
                {event.name}
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1">
                {dateStr}
                {timeStr && ` · ${timeStr}`}
              </p>
            </div>
          </div>
        </header>

        {/* Event image (optional) */}
        {event.imageUrl && (
          <div className="h-48 relative overflow-hidden rounded-[20px] border border-primary/10 bg-slate-100 mb-6">
            <EventImage
              src={event.imageUrl}
              alt={event.name}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}

        {/* Event hero card */}
        <div
          className="rounded-[20px] overflow-hidden border border-primary/10 bg-white mb-6"
          style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
        >
          <div className="flex">
            <div
              className="w-[84px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-2 px-2 border-r border-primary/10"
              style={{ background: PARTNER_GRADIENTS[0] }}
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
            <div className="flex-1 min-w-0 p-4 pl-3">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <StatusBadge
                  status={(event.status || "draft") as "draft" | "in_progress" | "completed" | "cancelled"}
                />
                <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {event.eventType.replace(/_/g, " ")}
                </span>
              </div>
              <p className="font-serif text-[14px] font-semibold text-[#1e0f14]">
                {event.guestCount} guests
              </p>
            </div>
          </div>
        </div>

        {/* Details sections */}
        <div className="space-y-4 mb-6">
          <div
            className="flex items-start gap-3 p-4 rounded-[20px] border border-primary/10 bg-white"
            style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
          >
            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <MapPin size={20} weight="regular" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#9e8085] mb-0.5">
                Location
              </p>
              <p className="font-serif text-[15px] font-medium text-[#1e0f14]">
                {event.location}
              </p>
              {event.venueName && (
                <p className="text-[13px] font-normal text-[#a0888d] mt-0.5">
                  {event.venueName}
                </p>
              )}
            </div>
          </div>

          {(event.budgetMin != null || event.budgetMax != null) && (
            <div
              className="p-4 rounded-[20px] border border-primary/10 bg-white"
              style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#9e8085] mb-1">
                Budget
              </p>
              <p className="font-serif text-[15px] font-medium text-[#1e0f14]">
                {event.budgetMin != null && event.budgetMax != null
                  ? `${Number(event.budgetMin).toFixed(0)} – ${Number(event.budgetMax).toFixed(0)} BD`
                  : event.budgetMin != null
                    ? `From ${Number(event.budgetMin).toFixed(0)} BD`
                    : `Up to ${Number(event.budgetMax).toFixed(0)} BD`}
              </p>
            </div>
          )}

          {event.dietaryRequirements?.length > 0 && (
            <div
              className="p-4 rounded-[20px] border border-primary/10 bg-white"
              style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#9e8085] mb-2">
                Dietary requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {event.dietaryRequirements.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.specialRequirements && (
            <div
              className="p-4 rounded-[20px] border border-primary/10 bg-white"
              style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#9e8085] mb-1">
                Special requirements
              </p>
              <p className="font-serif text-[14px] font-normal text-[#1e0f14]">
                {event.specialRequirements}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isPast &&
            event.status !== "completed" &&
            event.status !== "cancelled" && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="w-full py-3.5 rounded-full font-semibold text-[#1e0f14] bg-white border border-primary/10 hover:bg-[#fdfaf7] transition-colors disabled:opacity-50"
              >
                {markingComplete ? "Updating…" : "Mark complete"}
              </button>
            )}

          {!isPast && (
            <Link
              href={`/services/catering?eventId=${eventId}&guestCount=${event.guestCount}`}
              className="flex items-center justify-between p-4 rounded-[20px] border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: CHERRY }}
                >
                  <ForkKnife size={24} weight="regular" />
                </div>
                <div>
                  <p className="font-serif text-[15px] font-semibold text-[#1e0f14]">
                    Book catering
                  </p>
                  <p className="text-[13px] font-normal text-[#a0888d]">
                    Find caterers for this event
                  </p>
                </div>
              </div>
              <CaretRight size={22} weight="regular" className="text-primary" />
            </Link>
          )}

          <Link
            href="/bookings"
            className="flex items-center justify-between p-4 rounded-[20px] border border-primary/10 bg-white hover:bg-[#fdfaf7] transition-colors"
            style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ForkKnife size={24} weight="regular" />
              </div>
              <div>
                <p className="font-serif text-[15px] font-semibold text-[#1e0f14]">
                  My catering orders
                </p>
                <p className="text-[13px] font-normal text-[#a0888d]">
                  View and track your catering bookings
                </p>
              </div>
            </div>
            <CaretRight size={22} weight="regular" className="text-[#9e8085]" />
          </Link>
        </div>

        <div className="flex gap-3 mt-4">
          <Link
            href={`/events/${eventId}/edit`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-[#1e0f14] bg-white border border-primary/10 hover:bg-[#fdfaf7] transition-colors"
          >
            <Pencil size={18} weight="regular" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash size={18} weight="regular" />
            Delete
          </button>
        </div>
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
            className="relative bg-white w-full max-w-md rounded-[20px] p-6 shadow-xl"
            style={{ boxShadow: "0 20px 60px rgba(109,13,53,0.15)" }}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full shrink-0 bg-red-100">
                  <Warning size={24} weight="fill" className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif text-[18px] font-semibold text-[#1e0f14]">
                    Delete event?
                  </h3>
                  <p className="text-[13px] font-normal text-[#a0888d] mt-0.5">
                    This cannot be undone. All event details and linked data will
                    be permanently removed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 shrink-0"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 font-semibold text-[#5c3d47] border border-slate-200 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 font-semibold text-white rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: "#dc2626",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
                }}
              >
                {deleting ? "Deleting…" : "Delete event"}
                <Trash size={18} weight="regular" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
