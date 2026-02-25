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
import { formatTime } from "@/lib/date-utils";
import { PARTNER_GRADIENTS } from "@/lib/gradients";

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

type Tab = "upcoming" | "past" | "draft";

function getStatusDisplay(status: string | undefined, isPast: boolean): { label: string; className: string } {
  const s = status || "draft";
  const completeStyle = "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "cancelled") return { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" };
  if (s === "completed") return { label: "Complete", className: completeStyle };
  if (isPast) return { label: "Past", className: "bg-slate-100 text-slate-600 border-slate-200" };
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
  const drafts = events.filter((e) => (e.status || "draft") === "draft");
  const filtered =
    tab === "upcoming" ? upcoming
    : tab === "past" ? past
    : drafts;

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <PullToRefresh onRefresh={fetchEvents}>
        <div className="min-h-full" style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}>
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
                  {tab === "upcoming" ? "Planning events" : tab === "past" ? "Past events" : "Draft events"}
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
              className="flex gap-1.5 mt-6 mb-6 rounded-full p-1.5 relative"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(109,13,53,0.09)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                className="absolute top-1.5 bottom-1.5 rounded-full bg-[#6D0D35] transition-all duration-300 ease-out"
                style={{
                  left: tab === "upcoming" ? "6px" : tab === "past" ? "calc(33.33% + 2px)" : "calc(66.66% + 2px)",
                  width: "calc(33.33% - 4px)",
                  boxShadow: "0 4px 14px rgba(109,13,53,0.3)",
                }}
              />
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className="relative z-10 flex-1 py-2.5 rounded-full text-[12px] font-normal transition-colors duration-300"
                style={{ color: tab === "upcoming" ? "white" : "#9e8085" }}
              >
                Planning
              </button>
              <button
                type="button"
                onClick={() => setTab("past")}
                className="relative z-10 flex-1 py-2.5 rounded-full text-[12px] font-normal transition-colors duration-300"
                style={{ color: tab === "past" ? "white" : "#9e8085" }}
              >
                Past
              </button>
              <button
                type="button"
                onClick={() => setTab("draft")}
                className="relative z-10 flex-1 py-2.5 rounded-full text-[12px] font-normal transition-colors duration-300"
                style={{ color: tab === "draft" ? "white" : "#9e8085" }}
              >
                Draft
              </button>
            </div>
          </header>

          <main className="px-4 md:px-8 pb-32 animate-fade-in-up" key={tab}>
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
                <h3 className="font-serif text-[20px] font-semibold text-[#1e0f14] mb-1.5">
                  {tab === "upcoming" ? "No planning events" : tab === "past" ? "No past events" : "No drafts"}
                </h3>
                <p className="text-[13px] font-light text-[#9e8085]">
                  {tab === "upcoming"
                    ? "Tap the + button to plan your next gathering."
                    : tab === "past"
                      ? "Past events will appear here."
                      : "Draft events will appear here."}
                </p>
                {(tab === "upcoming" || tab === "draft") && (
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
                <p className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-3 pl-0.5">
                  {tab === "upcoming" ? "Planning Events" : tab === "past" ? "Past Events" : "Draft Events"}
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
                            className="w-[84px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-2 px-2 border-r border-primary/10"
                            style={{
                              background: PARTNER_GRADIENTS[i % PARTNER_GRADIENTS.length],
                            }}
                          >
                            <span className="font-serif text-[10px] font-semibold uppercase tracking-wider text-white/80">
                              {d.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="font-serif text-[22px] font-semibold leading-none text-white">
                              {d.getDate()}
                            </span>
                            <span className="font-serif text-[10px] font-semibold text-white/70">
                              {d.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                          </div>

                          {/* Event body */}
                          <div className="flex-1 min-w-0 py-2.5 px-3 flex flex-col gap-1">
                            {/* Title row: title, guests (past: tag before arrow), arrow */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-serif text-[14px] font-semibold text-[#1e0f14] tracking-[-0.2px] truncate">
                                  {event.name}
                                </h3>
                                <span className="flex items-center gap-1 text-[11px] font-light text-[#9e8085] mt-0.5">
                                  <Users size={10} weight="regular" className="shrink-0 opacity-60" />
                                  {event.guestCount ?? 0} guests
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {tab === "upcoming" && !isPast && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    Planning
                                  </span>
                                )}
                                {isPast && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border ${statusDisplay.className}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {statusDisplay.label}
                                  </span>
                                )}
                                <CaretRight size={14} weight="bold" className="text-[#9e8085] transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                              </div>
                            </div>
                            {/* Status for upcoming (below title) - hide when Planning label is on right */}
                            {!isPast && tab !== "upcoming" && (
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border w-fit ${statusDisplay.className}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {statusDisplay.label}
                              </div>
                            )}
                            {/* Time and location in one line */}
                            <div className="flex items-center gap-2 text-[11px] font-light text-[#9e8085] truncate">
                              {timeStr && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Clock size={11} weight="regular" className="opacity-60" />
                                  {timeStr}
                                </span>
                              )}
                              {timeStr && event.location && <span className="opacity-50">·</span>}
                              {event.location && (
                                <span className="flex items-center gap-1 min-w-0 truncate">
                                  <MapPin size={11} weight="regular" className="shrink-0 opacity-60" />
                                  <span className="truncate">{event.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        {!isPast && (
                          <Link
                            href={`/services/catering?eventId=${event.id}`}
                            className="flex items-center justify-center gap-2 py-2.5 border-t border-primary/5 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-[13px] font-normal"
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
