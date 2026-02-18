"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, CaretRight, ForkKnife } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, MINTY_LIME, MINTY_LIME_DARK, TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Event {
  id: string;
  name: string;
  date: string;
  eventType: string;
  guestCount: number;
  status: string;
  _count?: { guests: number };
}

type Tab = "upcoming" | "past";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filtered =
    tab === "upcoming"
      ? events.filter((e) => new Date(e.date) >= today)
      : events.filter((e) => new Date(e.date) < today);

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={TYPO.H1_LARGE} style={{ color: CHERRY }}>
                Events
              </h1>
              <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                {tab === "upcoming" ? "Upcoming" : "Past"} events
              </p>
            </div>
            <Link
              href="/events/create"
              className="w-8 h-8 flex items-center justify-center text-white rounded-full shrink-0"
              style={{ backgroundColor: CHERRY }}
            >
              <Plus size={16} weight="bold" />
            </Link>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
                tab === "upcoming"
                  ? "text-white"
                  : "bg-white border border-slate-200 text-slate-500"
              }`}
              style={tab === "upcoming" ? { backgroundColor: CHERRY } : undefined}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTab("past")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors ${
                tab === "past"
                  ? "text-white"
                  : "bg-white border border-slate-200 text-slate-500"
              }`}
              style={tab === "past" ? { backgroundColor: CHERRY } : undefined}
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
              className="flex items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-colors hover:bg-slate-50"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: "#4B5563" }}
            >
              <Calendar size={24} />
              <span className={TYPO.LINK}>Create your first event</span>
            </Link>
          ) : filtered.length === 0 ? (
            tab === "upcoming" ? (
              <Link
                href="/events/create"
                className="flex items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-colors hover:bg-slate-50"
                style={{ borderColor: "rgba(0,0,0,0.12)", color: "#4B5563" }}
              >
                <Calendar size={24} />
                <span className={TYPO.LINK}>Create your first event</span>
              </Link>
            ) : (
              <div className="text-center py-16">
                <Calendar size={64} weight="regular" className="text-slate-300 mx-auto" />
                <p className={`${TYPO.BODY} mt-4 font-medium`}>No past events</p>
                <p className={`${TYPO.SUBTEXT} mt-1`}>Past events will appear here</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {filtered.map((event) => {
                const isPast = new Date(event.date) < today;
                return (
                  <div
                    key={event.id}
                    className={`${ROUND} overflow-hidden border border-slate-200 bg-white`}
                  >
                    <Link
                      href={`/events/${event.id}`}
                      className="block p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={TYPO.CARD_TITLE}>
                            {event.name}
                          </h3>
                          <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={TYPO.CAPTION}>
                              {event._count?.guests ?? 0} guests
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${ROUND}`}
                              style={{
                                backgroundColor: MINTY_LIME,
                                color: MINTY_LIME_DARK,
                              }}
                            >
                              {event.eventType.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
                      </div>
                    </Link>
                    {!isPast && (
                      <Link
                        href={`/services/catering?eventId=${event.id}`}
                        className={`flex items-center justify-center gap-2 py-3 border-t border-slate-100 ${TYPO.LINK} transition-colors`}
                        style={{
                          color: CHERRY,
                          backgroundColor: `${CHERRY}08`,
                        }}
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
    </AppLayout>
  );
}
