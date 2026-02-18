"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Pencil,
  Trash,
  ForkKnife,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, MINTY_LIME, MINTY_LIME_DARK, WARM_PEACH_DARK, SOFT_LILAC_DARK, TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Event {
  id: string;
  name: string;
  date: string;
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
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) router.push("/events");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAFAFA]">
          <p className={`${TYPO.SUBTEXT} text-center`}>Event not found</p>
          <Link
            href="/events"
            className={`mt-4 ${TYPO.LINK} hover:underline`}
            style={{ color: CHERRY }}
          >
            Back to events
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full"
            >
              <ArrowLeft size={18} weight="regular" className="text-slate-600" />
            </Link>
            <h1 className={`${TYPO.H1} truncate flex-1`} style={{ color: CHERRY }}>
              {event.name}
            </h1>
          </div>
        </header>

        <main className="p-6 pb-32 space-y-6">
          <div className="space-y-4">
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${ROUND}`}
              style={{ backgroundColor: MINTY_LIME, color: MINTY_LIME_DARK }}
            >
              {event.eventType.replace(/_/g, " ")}
            </span>

            <div className={`flex items-start gap-3 p-4 bg-white border border-slate-200 ${ROUND}`}>
              <Calendar size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: WARM_PEACH_DARK }}>Date</p>
                <p className={`${TYPO.CARD_TITLE} mt-0.5`}>{dateStr}</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 bg-white border border-slate-200 ${ROUND}`}>
              <Users size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: WARM_PEACH_DARK }}>Guests</p>
                <p className={`${TYPO.CARD_TITLE} mt-0.5`}>{event.guestCount} guests</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 bg-white border border-slate-200 ${ROUND}`}>
              <MapPin size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: SOFT_LILAC_DARK }}>Location</p>
                <p className={`${TYPO.CARD_TITLE} mt-0.5`}>{event.location}</p>
                {event.venueName && (
                  <p className={`${TYPO.SUBTEXT} mt-0.5`}>{event.venueName}</p>
                )}
              </div>
            </div>

            {(event.budgetMin != null || event.budgetMax != null) && (
              <div className={`p-4 bg-white border border-slate-200 ${ROUND}`}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: MINTY_LIME_DARK }}>Budget</p>
                <p className={`${TYPO.CARD_TITLE} mt-0.5`}>
                  {event.budgetMin != null && event.budgetMax != null
                    ? `${Number(event.budgetMin).toFixed(0)} – ${Number(event.budgetMax).toFixed(0)} BD`
                    : event.budgetMin != null
                      ? `From ${Number(event.budgetMin).toFixed(0)} BD`
                      : `Up to ${Number(event.budgetMax).toFixed(0)} BD`}
                </p>
              </div>
            )}

            {event.dietaryRequirements?.length > 0 && (
              <div className={`p-4 bg-white border border-slate-200 ${ROUND}`}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: SOFT_LILAC_DARK }}>
                  Dietary requirements
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {event.dietaryRequirements.map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 ${ROUND}`}
                      style={{ backgroundColor: `${CHERRY}10`, color: CHERRY }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.specialRequirements && (
              <div className={`p-4 bg-white border border-slate-200 ${ROUND}`}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: WARM_PEACH_DARK }}>
                  Special requirements
                </p>
                <p className={`${TYPO.BODY} mt-0.5`}>{event.specialRequirements}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/events/${eventId}/guests`}
              className={`flex items-center justify-between p-4 border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors ${ROUND}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: `${CHERRY}15` }}
                >
                  <Users size={20} weight="regular" style={{ color: CHERRY }} />
                </div>
                <div>
                  <p className={TYPO.CARD_TITLE}>Manage guests</p>
                  <p className={TYPO.SUBTEXT}>{event.guests?.length ?? 0} guests added</p>
                </div>
              </div>
              <CaretRight size={20} weight="regular" className="text-slate-400" />
            </Link>

            {!isPast && (
              <Link
                href={`/services/catering?eventId=${eventId}`}
                className={`flex items-center justify-between p-4 border transition-colors ${ROUND}`}
                style={{
                  borderColor: CHERRY,
                  backgroundColor: `${CHERRY}08`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: CHERRY }}
                  >
                    <ForkKnife size={20} weight="regular" className="text-white" />
                  </div>
                  <div>
                    <p className={TYPO.CARD_TITLE}>Book catering</p>
                    <p className={TYPO.SUBTEXT}>Find caterers for this event</p>
                  </div>
                </div>
                <CaretRight size={20} weight="regular" style={{ color: CHERRY }} />
              </Link>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/events/${eventId}/edit`}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 font-semibold text-slate-700 hover:bg-white transition-colors rounded-full"
            >
              <Pencil size={18} weight="regular" />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 border font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 rounded-full"
              style={{ borderColor: "rgb(254 202 202)" }}
            >
              <Trash size={18} weight="regular" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
