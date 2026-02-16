"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, CalendarCheck, CalendarPlus, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SERVICES = [
  { slug: "catering", name: "Catering", image: "/images/services/catering.jpg", available: true },
  { slug: "decor", name: "Decor", image: "/images/services/decor.jpg", available: false },
  { slug: "rentals", name: "Rentals", image: "/images/services/rentals.jpg", available: false },
  { slug: "entertainment", name: "Entertainment", image: "/images/services/entertainment.jpg", available: false },
  { slug: "photography", name: "Photography", image: "/images/services/photography.jpg", available: false },
  { slug: "misc", name: "Miscellaneous", image: "/images/services/pexels-gcman105-916416.jpg", available: false },
];

interface Event {
  id: string;
  name: string;
  date: string;
  eventType: string;
  guestCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/events`, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([u, evts]) => {
        setUser(u);
        setEvents(evts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <AppLayout>
        <main className="p-6 pb-32 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="px-6 py-3 shrink-0">
        <h1 className="text-lg font-bold tracking-tight">
          Hello, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
      </header>

      <main className="p-6 pb-32 space-y-8">
        {/* Services quick access */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Services
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SERVICES.map((s) =>
              s.available ? (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group flex flex-col overflow-hidden border border-slate-100 rounded-md hover:border-slate-200 transition-colors min-w-0 p-0"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white drop-shadow-sm">
                      {s.name}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-confirmed/90 text-white">
                      Available
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  key={s.slug}
                  href={`/services/coming-soon/${s.slug}`}
                  className="group flex flex-col overflow-hidden border border-slate-100 rounded-md opacity-90 hover:opacity-100 transition-opacity min-w-0 p-0"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-900/40" />
                    <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white drop-shadow-sm">
                      {s.name}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-700/90 text-white">
                      Soon
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick links
          </h3>
          <div className="space-y-2">
            <Link
              href="/events/create"
              className="flex items-center justify-between gap-4 p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <CalendarPlus size={20} className="text-primary" />
                </div>
                <div>
                  <span className="font-semibold">Create Event</span>
                  <p className="text-sm text-slate-500">Plan a new event</p>
                </div>
              </div>
              <CaretRight size={18} className="text-slate-300" />
            </Link>
            <Link
              href="/bookings"
              className="flex items-center justify-between gap-4 p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <CalendarCheck size={20} className="text-primary" />
                </div>
                <div>
                  <span className="font-semibold">My Bookings</span>
                  <p className="text-sm text-slate-500">View and manage</p>
                </div>
              </div>
              <CaretRight size={18} className="text-slate-300" />
            </Link>
            <Link
              href="/events"
              className="flex items-center justify-between gap-4 p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <span className="font-semibold">My Events</span>
                  <p className="text-sm text-slate-500">All your events</p>
                </div>
              </div>
              <CaretRight size={18} className="text-slate-300" />
            </Link>
          </div>
        </section>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Upcoming events
              </h3>
              <Link
                href="/events"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <CalendarPlus size={20} className="text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold">{e.name}</span>
                      <p className="text-sm text-slate-500">
                        {new Date(e.date).toLocaleDateString()} · {e.guestCount} guests
                      </p>
                    </div>
                  </div>
                  <CaretRight size={18} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
}
