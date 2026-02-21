"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EventImage } from "@/components/EventImage";
import { Plus, Calendar, CaretRight, ForkKnife, Clock, MapPin } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ROUND, TYPO } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

interface Event {
  id: string;
  name: string;
  date: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  eventType: string;
  guestCount: number;
  status?: string;
  location?: string;
  imageUrl?: string | null;
  _count?: { guests: number };
}

function formatEventDateTime(dateStr: string, timeStart?: string | null): string {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (timeStart) {
    try {
      const iso = timeStart.includes("T") ? timeStart : `1970-01-01T${timeStart}`;
      const t = new Date(iso);
      const timePart = t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${datePart} · ${timePart}`;
    } catch {
      return datePart;
    }
  }
  return datePart;
}

type Tab = "upcoming" | "past";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");

  const fetchEvents = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.ok ? await res.json() : [];
    setEvents(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/events"));
      return;
    }
    setLoading(true);
    fetchEvents().finally(() => setLoading(false));
  }, [fetchEvents, router]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filtered =
    tab === "upcoming"
      ? events.filter((e) => new Date(e.date) >= today)
      : events.filter((e) => new Date(e.date) < today);

  return (
    <AppLayout>
      <PullToRefresh onRefresh={fetchEvents}>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`${TYPO.H1_LARGE} text-primary`}>
                Events
              </h1>
              <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                {tab === "upcoming" ? "Upcoming" : "Past"} events
              </p>
            </div>
            <Link
              href="/events/create"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white rounded-full shrink-0 bg-primary"
            >
              <Plus size={18} weight="bold" />
            </Link>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-colors ${
                tab === "upcoming"
                  ? "text-white bg-primary"
                  : "bg-white border border-slate-200 text-text-tertiary"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTab("past")}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-colors ${
                tab === "past"
                  ? "text-white bg-primary"
                  : "bg-white border border-slate-200 text-text-tertiary"
              }`}
            >
              Past
            </button>
          </div>
        </header>

        <main className="p-6 pb-32">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-24 bg-slate-200/60 ${ROUND} animate-pulse`}
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Link
              href="/events/create"
              className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-slate-200 transition-colors hover:bg-slate-50"
            >
              <Calendar size={24} className="text-text-tertiary" />
              <span className={`${TYPO.LINK} text-text-secondary`}>Create your first event</span>
            </Link>
          ) : filtered.length === 0 ? (
            tab === "upcoming" ? (
              <Link
                href="/events/create"
                className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-slate-200 transition-colors hover:bg-slate-50"
              >
                <Calendar size={24} className="text-text-tertiary" />
                <span className={`${TYPO.LINK} text-text-secondary`}>Create your first event</span>
              </Link>
            ) : (
              <div className="text-center py-16">
                <Calendar size={40} weight="regular" className="text-slate-300 mx-auto" />
                <p className={`${TYPO.BODY} mt-4 font-medium`}>No past events</p>
                <p className={`${TYPO.SUBTEXT} mt-1`}>Past events will appear here</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filtered.map((event) => {
                const isPast = new Date(event.date) < today;
                const timeStart = event.timeStart
                  ? typeof event.timeStart === "string"
                    ? event.timeStart
                    : (event.timeStart as { toISOString?: () => string })?.toISOString?.()
                  : null;
                return (
                  <div
                    key={event.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevation-1"
                  >
                    <Link
                      href={`/events/${event.id}`}
                      className="flex min-h-[88px] hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="w-24 min-h-full shrink-0 bg-slate-100 relative self-stretch">
                        <EventImage
                          src={event.imageUrl}
                          alt={event.name}
                          className="object-cover"
                          sizes="96px"
                          fallbackIcon={<Calendar size={28} className="text-primary" />}
                        />
                      </div>
                      <div className="flex-1 min-w-0 p-4 flex justify-between items-start">
                        <div>
                          <h3 className={TYPO.CARD_TITLE}>{event.name}</h3>
                          <div className="mt-1">
                            <StatusBadge status={(event.status || "draft") as "draft" | "in_progress" | "completed" | "cancelled"} />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-text-tertiary">
                            <Clock size={12} weight="regular" className="shrink-0" />
                            <span className="text-[11px]">
                              {formatEventDateTime(event.date, timeStart)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-text-tertiary">
                              <MapPin size={12} weight="regular" className="shrink-0" />
                              <span className="text-[11px] truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        <CaretRight size={22} weight="regular" className="text-text-tertiary shrink-0" />
                      </div>
                    </Link>
                    {!isPast && (
                      <Link
                        href={`/services/catering?eventId=${event.id}`}
                        className={`flex items-center justify-center gap-2 py-3 border-t border-slate-100 bg-primary/5 text-primary hover:bg-primary/10 transition-colors ${TYPO.LINK}`}
                      >
                        <ForkKnife size={18} weight="regular" />
                        Book catering
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      </PullToRefresh>
    </AppLayout>
  );
}
