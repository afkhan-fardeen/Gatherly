"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Event {
  id: string;
  name: string;
  date: string;
  _count?: { guests: number };
}

export default function GuestsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <h1 className={TYPO.H1}>Guests</h1>
        <p className={`${TYPO.CAPTION} font-medium mt-0.5`}>
          Select an event to manage guests
        </p>
      </header>

      <main className="p-6 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Users size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className={`${TYPO.SUBTEXT} mt-4 font-medium`}>No events yet</p>
            <Link
              href="/events/create"
              className={`inline-block mt-4 text-primary ${TYPO.LINK}`}
            >
              Create an event first
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}/guests`}
                className="block p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={TYPO.CARD_TITLE}>{event.name}</h3>
                    <p className={`${TYPO.SUBTEXT} mt-0.5`}>
                      {new Date(event.date).toLocaleDateString()} ·{" "}
                      {event._count?.guests ?? 0} guests
                    </p>
                  </div>
                  <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
