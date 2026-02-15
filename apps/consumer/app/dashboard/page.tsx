"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ForkKnife,
  Confetti,
  Armchair,
  MusicNotes,
  Camera,
  DotsThree,
  Calendar,
  CalendarCheck,
  CaretRight,
  Bell,
  User,
  SignOut,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { Logo } from "@/components/Logo";
import { Tag, getBookingStatusStyle } from "@/components/ui/Tag";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl?: string | null;
}

interface Event {
  id: string;
  name: string;
  date: string;
  eventType: string;
  status: string;
}

interface Booking {
  id: string;
  status: string;
  vendor: { businessName: string };
  event: { name: string };
  package: { name: string };
}

const SERVICES = [
  { slug: "catering", name: "Catering", Icon: ForkKnife, available: true },
  { slug: "decor", name: "Decor", Icon: Confetti, available: false },
  { slug: "rentals", name: "Rentals", Icon: Armchair, available: false },
  { slug: "entertainment", name: "Entertainment", Icon: MusicNotes, available: false },
  { slug: "photography", name: "Photography", Icon: Camera, available: false },
  { slug: "misc", name: "Miscellaneous", Icon: DotsThree, available: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRefMobile = useRef<HTMLDivElement>(null);
  const profileRefDesktop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inside = profileRefMobile.current?.contains(target) || profileRefDesktop.current?.contains(target);
      if (!inside) setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileOpen]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser((prev) => (prev ? { ...prev, ...data } : data));
          const merged = stored ? { ...JSON.parse(stored), ...data } : data;
          localStorage.setItem("user", JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/events`, { headers }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${API_URL}/api/bookings`, { headers }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${API_URL}/api/notifications`, { headers }).then((r) =>
        r.ok ? r.json() : { items: [] }
      ),
    ])
      .then(([evts, bks, notifs]) => {
        setEvents(evts);
        setBookings(bks);
        const unread = (notifs?.items ?? []).filter((n: { isRead: boolean }) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date() && e.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const latestBooking = bookings[0];

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex justify-between items-center md:items-start">
          <div className="md:hidden flex justify-between items-center w-full">
            <Logo href="/dashboard" />
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
              >
                <Bell size={20} weight="regular" className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={profileRefMobile}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-primary text-sm">
                      {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  )}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-none shadow-lg border border-slate-100 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User size={18} weight="regular" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <SignOut size={18} weight="regular" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:flex-1 md:justify-between md:items-start">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Hello, {user.name.split(" ")[0]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
              >
                <Bell size={20} weight="regular" className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={profileRefDesktop}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-primary text-sm">
                      {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  )}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-none shadow-lg border border-slate-100 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User size={18} weight="regular" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <SignOut size={18} weight="regular" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 pb-32 space-y-8">
        <section>
          <h2 className="text-lg font-bold tracking-tight mb-6 md:hidden">
            Hello, {user.name.split(" ")[0]}
          </h2>

          {/* Services quick access */}
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Services
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {SERVICES.map((s) =>
              s.available ? (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="flex flex-col items-center p-3 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center mb-2">
                    <s.Icon size={20} weight="regular" className="text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-center truncate w-full">
                    {s.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-confirmed">
                    Available
                  </span>
                </Link>
              ) : (
                <Link
                  key={s.slug}
                  href={`/services/coming-soon/${s.slug}`}
                  className="flex flex-col items-center p-3 border border-slate-100 rounded-none opacity-75"
                >
                  <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center mb-2">
                    <s.Icon size={20} weight="regular" className="text-slate-400" />
                  </div>
                  <span className="text-xs font-semibold text-center truncate w-full">
                    {s.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-slate-400">
                    Soon
                  </span>
                </Link>
              )
            )}
          </div>

          {/* Quick actions */}
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/events/create"
              className="block p-4 border border-slate-100 rounded-none bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="font-semibold">Create Event</span>
              <p className="text-sm text-slate-500 mt-1">
                Set up your event and find services
              </p>
            </Link>
            <Link
              href="/events"
              className="block p-4 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold">My Events</span>
              <p className="text-sm text-slate-500 mt-1">
                View and manage your events
              </p>
            </Link>
            <Link
              href="/bookings"
              className="block p-4 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold">My Bookings</span>
              <p className="text-sm text-slate-500 mt-1">
                View and manage your bookings
              </p>
            </Link>
          </div>
        </section>

        {/* Upcoming events */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Upcoming events
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 rounded-none animate-pulse"
                />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="p-6 border border-slate-100 rounded-none text-center">
              <Calendar size={48} weight="regular" className="text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm mt-2">No upcoming events</p>
              <Link
                href="/events/create"
                className="inline-block mt-2 text-primary text-sm font-semibold"
              >
                Create one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}/guests`}
                  className="block p-4 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{event.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-slate-500">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <Tag value={event.eventType} variant="eventType" className="rounded-none">
                          {event.eventType.replace(/_/g, " ")}
                        </Tag>
                      </div>
                    </div>
                    <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Recent activity
          </h3>
          {loading ? (
            <div className="h-20 bg-slate-100 rounded-none animate-pulse" />
          ) : !latestBooking ? (
            <div className="p-6 border border-slate-100 rounded-none text-center">
              <CalendarCheck size={48} weight="regular" className="text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm mt-2">No recent bookings</p>
              <Link
                href="/services/catering"
                className="inline-block mt-2 text-primary text-sm font-semibold"
              >
                Browse catering
              </Link>
            </div>
          ) : (
            <Link
              href="/bookings"
              className="block p-4 border border-slate-100 rounded-none hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{latestBooking.vendor.businessName}</h4>
                  <p className="text-sm text-slate-500">
                    {latestBooking.package.name} · {latestBooking.event.name}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${getBookingStatusStyle(
                      latestBooking.status
                    )}`}
                  >
                    {latestBooking.status}
                  </span>
                </div>
                <CaretRight size={20} weight="regular" className="text-slate-400 shrink-0" />
              </div>
            </Link>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
