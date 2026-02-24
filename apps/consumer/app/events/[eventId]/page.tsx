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
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_URL } from "@/lib/api";
import { formatDateLong, formatTime } from "@/lib/date-utils";
import { ROUND, TYPO } from "@/lib/events-ui";

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
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleMarkComplete() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setMarkingComplete(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok && event) setEvent({ ...event, status: "completed" });
    } finally {
      setMarkingComplete(false);
    }
  }

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
          <p className={TYPO.SUBTEXT}>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg-app)]">
          <p className={`${TYPO.SUBTEXT} text-center`}>Event not found</p>
          <Link
            href="/events"
            className={`mt-4 ${TYPO.LINK} text-primary hover:underline`}
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

  return (
    <AppLayout>
      <div className="bg-[var(--bg-app)] min-h-full pb-24">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-slate-200 rounded-full text-text-primary"
            >
              <ArrowLeft size={22} weight="regular" />
            </Link>
            <h1 className={`${TYPO.H1} truncate flex-1 text-text-primary`}>
              {event.name}
            </h1>
          </div>
        </header>

        <main className="px-6 space-y-6">
          {event.imageUrl && (
            <div className="-mx-6 h-48 relative overflow-hidden rounded-2xl bg-slate-100">
              <EventImage
                src={event.imageUrl}
                alt={event.name}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={(event.status || "draft") as "draft" | "in_progress" | "completed" | "cancelled"} />
            <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {event.eventType.replace(/_/g, " ")}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar size={20} weight="regular" className="text-text-tertiary shrink-0 mt-0.5" />
              <div>
                <p className={TYPO.CAPTION}>Date</p>
                <p className={`${TYPO.BODY} mt-0.5`}>
                  {dateStr}
                  {timeStr && <span className="text-text-secondary"> · {timeStr}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users size={20} weight="regular" className="text-text-tertiary shrink-0 mt-0.5" />
              <div>
                <p className={TYPO.CAPTION}>Guests</p>
                <p className={`${TYPO.BODY} mt-0.5`}>{event.guestCount} guests</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} weight="regular" className="text-text-tertiary shrink-0 mt-0.5" />
              <div>
                <p className={TYPO.CAPTION}>Location</p>
                <p className={`${TYPO.BODY} mt-0.5`}>{event.location}</p>
                {event.venueName && (
                  <p className={`${TYPO.SUBTEXT} mt-0.5`}>{event.venueName}</p>
                )}
              </div>
            </div>

            {(event.budgetMin != null || event.budgetMax != null) && (
              <div>
                <p className={TYPO.CAPTION}>Budget</p>
                <p className={`${TYPO.BODY} mt-0.5`}>
                  {event.budgetMin != null && event.budgetMax != null
                    ? `${Number(event.budgetMin).toFixed(0)} – ${Number(event.budgetMax).toFixed(0)} BD`
                    : event.budgetMin != null
                      ? `From ${Number(event.budgetMin).toFixed(0)} BD`
                      : `Up to ${Number(event.budgetMax).toFixed(0)} BD`}
                </p>
              </div>
            )}

            {event.dietaryRequirements?.length > 0 && (
              <div>
                <p className={TYPO.CAPTION}>Dietary requirements</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.dietaryRequirements.map((d) => (
                    <span key={d} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.specialRequirements && (
              <div>
                <p className={TYPO.CAPTION}>Special requirements</p>
                <p className={`${TYPO.BODY} mt-0.5`}>{event.specialRequirements}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {isPast && event.status !== "completed" && event.status !== "cancelled" && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="w-full py-3 border border-slate-200 rounded-full font-medium text-text-primary bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {markingComplete ? "Updating…" : "Mark complete"}
              </button>
            )}

            {!isPast && (
              <Link
                href={`/services/catering?eventId=${eventId}&guestCount=${event.guestCount}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-primary">
                    <ForkKnife size={22} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <p className={TYPO.CARD_TITLE}>Book catering</p>
                    <p className={TYPO.SUBTEXT}>Find caterers for this event</p>
                  </div>
                </div>
                <CaretRight size={22} weight="regular" className="text-primary" />
              </Link>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/events/${eventId}/edit`}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-full font-medium text-text-primary bg-white hover:bg-slate-50 transition-colors"
            >
              <Pencil size={18} weight="regular" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 rounded-full font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
            >
              <Trash size={18} weight="regular" />
              Delete
            </button>
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => !deleting && setShowDeleteModal(false)}
            className="absolute inset-0 bg-black/50 animate-modal-backdrop"
            aria-label="Close"
          />
          <div
            className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-modal-scale-in flex flex-col"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-full shrink-0"
                  style={{ backgroundColor: "rgb(254 202 202)" }}
                >
                  <Warning size={24} weight="fill" className="text-red-600" />
                </div>
                <div>
                  <h3 className={TYPO.H2}>Delete event?</h3>
                  <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                    This cannot be undone. All event details and linked data will be permanently removed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 shrink-0"
              >
                <X size={22} weight="bold" />
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 font-semibold text-white rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
