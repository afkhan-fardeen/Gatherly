"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MagnifyingGlass, UserPlus, Users, DotsThree, Bell } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  plusOneAllowed: boolean;
}

interface Event {
  id: string;
  name: string;
  guestCount: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:
      "bg-confirmed/10 text-confirmed border border-confirmed/20",
    pending: "bg-pending/10 text-pending border border-pending/20",
    declined:
      "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
        styles[status] ?? styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-confirmed",
    pending: "bg-pending",
    declined: "bg-declined",
  };
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md border-2 border-white ${
        colors[status] ?? "bg-pending"
      }`}
    />
  );
}

export default function GuestsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    Promise.all([
      fetch(`${API_URL}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_URL}/api/events/${eventId}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([ev, gs]) => {
        setEvent(ev);
        setGuests(gs ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  const confirmedCount = guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const total = event?.guestCount ?? guests.length;
  const progressPercent = total > 0 ? Math.min(100, (confirmedCount / total) * 100) : 0;

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || !event) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Manage Your Guests
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">
              {event.name}
            </p>
          </div>
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center shrink-0"
          >
            <Bell size={20} weight="regular" className="text-slate-600" />
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6 bg-slate-50 p-4 rounded-md border border-slate-100 min-w-0">
          <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
            <div
              className="circular-progress w-full h-full rounded-md flex items-center justify-center"
              style={{
                background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(var(--primary) ${progressPercent}%, #e2e8f0 0%)`,
              }}
            >
              <div className="text-center">
                <span className="text-xl font-extrabold block leading-none">
                  {guests.length}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  Guests
                </span>
              </div>
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Confirmed
                </span>
                <span className="text-sm font-extrabold text-confirmed">
                  {confirmedCount}/{total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-md overflow-hidden">
                <div
                  className="h-full bg-confirmed rounded-md transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {Math.max(0, total - confirmedCount)} spots available for catering
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <MagnifyingGlass size={20} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full bg-slate-100 border-none rounded-md py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/20 outline-none"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            href={`/events/${eventId}/guests/add`}
            className="bg-primary text-white p-3 rounded-md shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            <UserPlus size={20} weight="regular" />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-32 mt-4">
        <div className="space-y-0 divide-y divide-slate-100">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users size={48} weight="regular" className="text-slate-400 mx-auto" />
              <p className="mt-2 font-medium">No guests yet</p>
              <Link
                href={`/events/${eventId}/guests/add`}
                className="inline-block mt-4 text-primary font-semibold"
              >
                Add your first guest
              </Link>
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`py-4 flex items-center justify-between ${
                  guest.rsvpStatus === "declined" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {getInitials(guest.name)}
                    </div>
                    <StatusDot status={guest.rsvpStatus} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-semibold text-base truncate ${
                          guest.rsvpStatus === "declined" ? "line-through" : ""
                        }`}
                      >
                        {guest.name}
                      </h4>
                      {guest.plusOneAllowed && (
                        <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase">
                          +1 Guest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {guest.phone || guest.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={guest.rsvpStatus} />
                  <button className="text-slate-400">
                    <DotsThree size={20} weight="regular" className="text-slate-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppLayout>
  );
}
