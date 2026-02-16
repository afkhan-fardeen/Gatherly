"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, CaretRight, ForkKnife } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { Tag } from "@/components/ui/Tag";

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
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Events</h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              {tab === "upcoming" ? "Upcoming" : "Past"} events
            </p>
          </div>
          <Link
            href="/events/create"
            className="w-10 h-10 rounded-md bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Plus size={20} weight="regular" />
          </Link>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold ${
              tab === "upcoming" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold ${
              tab === "past" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
            }`}
          >
            Past
          </button>
        </div>
      </header>

      <main className="p-6 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No events yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Create your first event to get started
            </p>
            <Link
              href="/events/create"
              className="inline-block mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-md"
            >
              Create Event
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No {tab} events</p>
            <p className="text-slate-400 text-sm mt-1">
              {tab === "upcoming"
                ? "Create an event to get started"
                : "Past events will appear here"}
            </p>
            {tab === "upcoming" && (
              <Link
                href="/events/create"
                className="inline-block mt-4 text-primary font-semibold"
              >
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((event) => {
              const isPast = new Date(event.date) < today;
              return (
                <div
                  key={event.id}
                  className="border border-slate-100 rounded-md overflow-hidden"
                >
                  <Link
                    href={`/events/${event.id}`}
                    className="block p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[15px]">{event.name}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-slate-400 text-xs">
                            {event._count?.guests ?? 0} guests
                          </span>
                          <Tag value={event.eventType} variant="eventType" className="rounded-md">
                            {event.eventType.replace(/_/g, " ")}
                          </Tag>
                        </div>
                      </div>
                      <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
                    </div>
                  </Link>
                  {!isPast && (
                    <Link
                      href={`/services/catering?eventId=${event.id}`}
                      className="flex items-center justify-center gap-2 py-3 border-t border-slate-100 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm transition-colors"
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
    </AppLayout>
  );
}
