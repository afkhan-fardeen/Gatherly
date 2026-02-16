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
import { Tag } from "@/components/ui/Tag";

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
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
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
      if (res.ok) {
        router.push("/events");
      }
    } finally {
      setDeleting(false);
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

  if (!event) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-slate-500 text-center">Event not found</p>
          <Link href="/events" className="mt-4 text-primary font-semibold hover:underline">
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
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} weight="regular" className="text-slate-600" />
          </Link>
          <h1 className="text-base font-bold tracking-tight truncate flex-1">
            {event.name}
          </h1>
        </div>
      </header>

      <main className="p-6 pb-32 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mt-1">
            <Tag value={event.eventType} variant="eventType" className="rounded-md">
              {event.eventType.replace(/_/g, " ")}
            </Tag>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Date</p>
              <p className="text-slate-900 font-medium">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Guests</p>
              <p className="text-slate-900 font-medium">{event.guestCount} guests</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={20} weight="regular" className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
              <p className="text-slate-900 font-medium">{event.location}</p>
              {event.venueName && (
                <p className="text-slate-500 text-sm mt-0.5">{event.venueName}</p>
              )}
            </div>
          </div>
          {(event.budgetMin != null || event.budgetMax != null) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Budget</p>
              <p className="text-slate-900 font-medium">
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
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Dietary requirements
              </p>
              <div className="flex flex-wrap gap-1.5">
                {event.dietaryRequirements.map((d) => (
                  <Tag key={d} value={d} variant="cuisine" className="rounded-md">
                    {d}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {event.specialRequirements && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Special requirements</p>
              <p className="text-slate-600 text-sm mt-0.5">{event.specialRequirements}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <Link
            href={`/events/${eventId}/guests`}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users size={24} weight="regular" className="text-primary" />
              <div>
                <p className="font-semibold text-slate-900">Manage guests</p>
                <p className="text-slate-500 text-sm">{event.guests?.length ?? 0} guests added</p>
              </div>
            </div>
            <CaretRight size={20} weight="regular" className="text-slate-400" />
          </Link>

          {!isPast && (
            <Link
              href={`/services/catering?eventId=${eventId}`}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ForkKnife size={24} weight="regular" className="text-primary" />
                <div>
                  <p className="font-semibold text-slate-900">Book catering</p>
                  <p className="text-slate-500 text-sm">Find caterers for this event</p>
                </div>
              </div>
              <CaretRight size={20} weight="regular" className="text-slate-400" />
            </Link>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Link
            href={`/events/${eventId}/edit`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-md font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil size={18} weight="regular" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 rounded-md font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash size={18} weight="regular" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </main>
    </AppLayout>
  );
}
