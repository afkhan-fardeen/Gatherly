"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MagnifyingGlass, UserPlus, Users, DotsThree, Bell } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, INPUT_CLASS, TYPO } from "@/lib/events-ui";

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
    confirmed: "bg-confirmed/10 text-confirmed border border-confirmed/20",
    pending: "bg-pending/10 text-pending border border-pending/20",
    declined: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span
      className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
        styles[status] ?? styles.pending
      } ${ROUND}`}
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
      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white ${
        colors[status] ?? "bg-pending"
      } ${ROUND}`}
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
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className={TYPO.H1} style={{ color: CHERRY }}>
                Manage Guests
              </h1>
              <p className={`${TYPO.SUBTEXT} mt-0.5`}>{event.name}</p>
            </div>
            <Link
              href="/notifications"
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full"
            >
              <Bell size={20} weight="regular" className="text-slate-600" />
            </Link>
          </div>
          <div
            className={`flex items-center gap-4 p-4 bg-white border border-slate-200 ${ROUND}`}
          >
            <div className="relative w-16 h-16 shrink-0">
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(${CHERRY} ${progressPercent}%, #e2e8f0 0%)`,
                  borderRadius: 10,
                }}
              >
                <div className="text-center">
                  <span className="text-xl font-extrabold block leading-none text-slate-900">
                    {guests.length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    Guests
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Confirmed
                </span>
                <span className="text-sm font-extrabold text-confirmed">
                  {confirmedCount}/{total}
                </span>
              </div>
              <div className={`w-full h-1.5 bg-slate-200 overflow-hidden mt-1 ${ROUND}`}>
                <div
                  className="h-full bg-confirmed transition-all"
                  style={{ width: `${progressPercent}%`, borderRadius: 10 }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {Math.max(0, total - confirmedCount)} spots available for catering
              </p>
            </div>
          </div>
        </header>

        <section className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-grow">
              <MagnifyingGlass
                size={20}
                weight="regular"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                className={`${INPUT_CLASS} pl-11`}
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              href={`/events/${eventId}/guests/add`}
              className="w-12 h-12 flex items-center justify-center text-white rounded-full"
              style={{ backgroundColor: CHERRY }}
            >
              <UserPlus size={22} weight="regular" />
            </Link>
          </div>
        </section>

        <section className="px-6 pb-32 mt-4">
          <div className="space-y-0 divide-y divide-slate-200">
            {filteredGuests.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} weight="regular" className="text-slate-400 mx-auto" />
                <p className={`mt-2 ${TYPO.BODY} font-medium`}>No guests yet</p>
                <Link
                  href={`/events/${eventId}/guests/add`}
                  className={`inline-block mt-4 ${TYPO.LINK}`}
                  style={{ color: CHERRY }}
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
                      <div
                        className={`w-12 h-12 flex items-center justify-center font-bold text-slate-600 ${ROUND}`}
                        style={{ backgroundColor: `${CHERRY}10` }}
                      >
                        {getInitials(guest.name)}
                      </div>
                      <StatusDot status={guest.rsvpStatus} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`${TYPO.CARD_TITLE} truncate ${
                            guest.rsvpStatus === "declined" ? "line-through" : ""
                          }`}
                        >
                          {guest.name}
                        </h4>
                        {guest.plusOneAllowed && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 uppercase ${ROUND}`}
                            style={{ backgroundColor: `${CHERRY}15`, color: CHERRY }}
                          >
                            +1
                          </span>
                        )}
                      </div>
                      <p className={`${TYPO.CAPTION} font-medium truncate`}>
                        {guest.phone || guest.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={guest.rsvpStatus} />
                    <button className="text-slate-400 p-1">
                      <DotsThree size={20} weight="regular" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
