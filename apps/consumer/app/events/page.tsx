"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Calendar,
  CaretRight,
  ForkKnife,
  Clock,
  MapPin,
  Users,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { PullToRefresh } from "@/components/PullToRefresh";
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

type Tab = "upcoming" | "past";

function formatTime(timeStart: string | { toISOString?: () => string } | null): string {
  if (!timeStart) return "";
  const str = typeof timeStart === "string" ? timeStart : (timeStart as { toISOString?: () => string })?.toISOString?.();
  if (!str) return "";
  try {
    const iso = str.includes("T") ? str : `1970-01-01T${str}`;
    const t = new Date(iso);
    return t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function getStatusDisplay(status: string | undefined, isPast: boolean): { label: string; className: string } {
  const s = status || "draft";
  const completeStyle = "bg-[rgba(100,100,120,0.07)] text-[#6b6080] border-[rgba(100,100,120,0.12)]";
  if (s === "cancelled") return { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200" };
  if (isPast) return { label: "Complete", className: completeStyle };
  if (s === "in_progress") return { label: "Catering", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" };
  if (s === "draft") return { label: "Planning", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
  return { label: "Upcoming", className: "bg-primary/10 text-primary border-primary/20" };
}

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
  const upcoming = events.filter((e) => new Date(e.date) >= today);
  const past = events.filter((e) => new Date(e.date) < today);
  const filtered = tab === "upcoming" ? upcoming : past;

  return (
    <AppLayout contentBg="bg-cream">
      <PullToRefresh onRefresh={fetchEvents}>
        <div className="min-h-full bg-cream">
          {/* Topbar - matches gatherlii-events */}
          <header
            className="sticky top-0 z-20 px-5 md:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
            style={{
              background: "linear-gradient(to bottom, #f4ede5 75%, transparent)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                  My <span className="italic font-normal text-primary">Events</span>
                </h1>
                <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                  {tab === "upcoming" ? "Showing upcoming events" : "Showing past events"}
                </p>
              </div>
              <Link
                href="/events/create"
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white shrink-0 mt-1 transition-transform hover:scale-105"
                style={{ background: "#6D0D35", boxShadow: "0 6px 20px rgba(109,13,53,0.32)" }}
                aria-label="Create event"
              >
                <Plus size={20} weight="bold" />
              </Link>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-2 mt-6 mb-6 rounded-full p-1.5"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(109,13,53,0.09)",
                backdropFilter: "blur(8px)",
              }}
            >
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={`flex-1 py-2.5 rounded-full text-[13.5px] font-normal transition-all ${
                  tab === "upcoming"
                    ? "text-white font-normal"
                    : "text-[#9e8085]"
                }`}
                style={tab === "upcoming" ? { background: "#6D0D35", boxShadow: "0 4px 14px rgba(109,13,53,0.3)" } : {}}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setTab("past")}
                className={`flex-1 py-2.5 rounded-full text-[13.5px] font-normal transition-all ${
                  tab === "past"
                    ? "text-white font-normal"
                    : "text-[#9e8085]"
                }`}
                style={tab === "past" ? { background: "#6D0D35", boxShadow: "0 4px 14px rgba(109,13,53,0.3)" } : {}}
              >
                Past
              </button>
            </div>
          </header>

          <main className="px-4 md:px-8 pb-32">
            {loading ? (
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white/60 rounded-[20px] border border-primary/5 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(109,13,53,0.07)", color: "#6D0D35" }}
                >
                  <Calendar size={26} weight="regular" />
                </div>
                <h3 className="font-serif text-[22px] font-medium text-[#1e0f14] mb-1.5">
                  {tab === "upcoming" ? "No upcoming events" : "No past events"}
                </h3>
                <p className="text-[13px] font-light text-[#9e8085]">
                  {tab === "upcoming"
                    ? "Tap the + button to plan your next gathering."
                    : "Past events will appear here."}
                </p>
                {tab === "upcoming" && (
                  <Link
                    href="/events/create"
                    className="inline-block mt-6 px-6 py-3 rounded-full text-sm font-normal text-white"
                    style={{ background: "#6D0D35", boxShadow: "0 4px 14px rgba(109,13,53,0.3)" }}
                  >
                    Create Event
                  </Link>
                )}
              </div>
            ) : (
              <>
                <p className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-3 pl-0.5">
                  {tab === "upcoming" ? "Upcoming Events" : "Past Events"}
                </p>
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                  {filtered.map((event, i) => {
                    const d = new Date(event.date);
                    const isPast = d < today;
                    const timeStr = formatTime(event.timeStart ?? null);
                    const statusDisplay = getStatusDisplay(event.status, isPast);

                    return (
                      <div
                        key={event.id}
                        className="events-card-hover animate-fade-in-up relative overflow-hidden rounded-[20px] border border-primary/10 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/20"
                        style={{ animationDelay: `${(i + 1) * 50}ms` }}
                      >
                        <Link
                          href={`/events/${event.id}`}
                          className="flex group"
                        >
                          {/* Date block */}
                          <div
                            className="w-[72px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 px-2 border-r border-primary/10"
                            style={{ background: i % 2 === 0 ? "#E5EDBF" : "#CFD7F2" }}
                          >
                            <span className="text-[9px] font-semibold uppercase tracking-[1.5px] text-primary">
                              {d.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="font-serif text-[28px] font-medium leading-none text-[#1e0f14]">
                              {d.getDate()}
                            </span>
                            <span className="text-[9px] font-light text-[#a0888d]">
                              {d.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                          </div>

                          {/* Event body */}
                          <div className="flex-1 min-w-0 py-3.5 px-4 flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-[18px] font-medium text-[#1e0f14] tracking-[-0.2px] truncate">
                                {event.name}
                              </h3>
                              <CaretRight size={14} weight="bold" className="text-[#9e8085] shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                            </div>
                            <div
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-medium uppercase tracking-wider border w-fit ${statusDisplay.className}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {statusDisplay.label}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-[12px] font-light text-[#9e8085]">
                                {timeStr ? (
                                  <>
                                    <Clock size={11} weight="regular" className="shrink-0 opacity-60" />
                                    {timeStr}
                                  </>
                                ) : null}
                                <span className="flex items-center gap-1 ml-auto text-[11px] bg-cream rounded-full px-2 py-0.5 text-[#9e8085]">
                                  <Users size={10} weight="regular" className="shrink-0 opacity-60" />
                                  {event.guestCount ?? 0} guests
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-[12px] font-light text-[#9e8085]">
                                  <MapPin size={11} weight="regular" className="shrink-0 opacity-60" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                        {!isPast && (
                          <Link
                            href={`/services/catering?eventId=${event.id}`}
                            className="flex items-center justify-center gap-2 py-3 border-t border-primary/5 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-normal"
                          >
                            <ForkKnife size={18} weight="regular" />
                            Book catering
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </PullToRefresh>
    </AppLayout>
  );
}
