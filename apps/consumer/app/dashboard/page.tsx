"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Clock,
  MapPin,
  CaretRight,
  CalendarBlank,
  ForkKnife,
  CreditCard,
  Users,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { RemoteImage } from "@/components/RemoteImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_URL, fetchAuth } from "@/lib/api";
import { getToken } from "@/lib/session";
import { CHERRY } from "@/lib/events-ui";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDateFull(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeStart(timeStart?: string | null): string {
  if (!timeStart) return "";
  try {
    const iso = timeStart.includes("T") ? timeStart : `1970-01-01T${timeStart}`;
    const t = new Date(iso);
    return t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

function formatEventDate(dateStr: string): { month: string; day: string; weekday: string } {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

const PARTNER_GRADIENTS = [
  "linear-gradient(135deg, #d4a574 0%, #8a5020 100%)",
  "linear-gradient(135deg, #1a1010 0%, #4a2010 100%)",
  "linear-gradient(135deg, #2a3a5a 0%, #4a6a9a 100%)",
  "linear-gradient(135deg, #2a3a2a 0%, #4a7a4a 100%)",
];

const SPOTLIGHT_GRADIENTS = [
  "linear-gradient(160deg, #2a1510 0%, #7a3510 100%)",
  "linear-gradient(160deg, #102030 0%, #204060 100%)",
  "linear-gradient(160deg, #1a2a1a 0%, #305030 100%)",
];

interface Event {
  id: string;
  name: string;
  date: string;
  timeStart?: string | null;
  eventType: string;
  guestCount: number;
  location?: string;
  status?: string;
}

interface SpotlightItem {
  id: string;
  name: string;
  imageUrl: string | null;
  vendorId: string;
  vendor?: { businessName?: string };
}

interface Vendor {
  id: string;
  businessName: string;
  businessType?: string | null;
  cuisineTypes?: string[];
  ratingAvg: number;
  ratingCount: number;
  logoUrl: string | null;
  featuredImageUrl: string | null;
}

const STACK_OFFSET = 8;
const STACK_SCALE = 0.96;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [spotlight, setSpotlight] = useState<SpotlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stackIndex, setStackIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const justSwiped = useRef(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    params.set("limit", "6");
    Promise.all([
      fetchAuth(`${API_URL}/api/auth/me`).then((r) => (r.ok ? r.json() : null)),
      fetchAuth(`${API_URL}/api/events`).then((r) => (r.ok ? r.json() : [])),
      fetchAuth(`${API_URL}/api/vendors?${params}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/api/spotlight`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([u, evts, v, sp]) => {
        if (u) {
          setUser(u);
          const stored = localStorage.getItem("user");
          const merged = stored ? { ...JSON.parse(stored), ...u } : u;
          localStorage.setItem("user", JSON.stringify(merged));
        } else {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        }
        setEvents(evts || []);
        setVendors(v || []);
        setSpotlight(sp || []);
      })
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const firstName = user?.name?.trim()?.split(" ")[0] || "there";
  const visibleCount = Math.min(3, upcomingEvents.length);

  const handleSwipeStart = useCallback((clientX: number) => {
    setTouchStart(clientX);
    setSwipeOffset(0);
  }, []);

  const handleSwipeMove = useCallback((clientX: number) => {
    if (touchStart === null) return;
    setSwipeOffset(clientX - touchStart);
  }, [touchStart]);

  const handleSwipeEnd = useCallback(() => {
    if (touchStart === null) return;
    const threshold = 80;
    if (swipeOffset < -threshold && stackIndex < upcomingEvents.length - 1) {
      justSwiped.current = true;
      setStackIndex((i) => i + 1);
      setTimeout(() => { justSwiped.current = false; }, 300);
    } else if (swipeOffset > threshold && stackIndex > 0) {
      justSwiped.current = true;
      setStackIndex((i) => i - 1);
      setTimeout(() => { justSwiped.current = false; }, 300);
    }
    setTouchStart(null);
    setSwipeOffset(0);
  }, [touchStart, swipeOffset, stackIndex, upcomingEvents.length]);

  useEffect(() => {
    setStackIndex(0);
  }, [upcomingEvents.length]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 pb-32 flex items-center justify-center min-h-[50vh] bg-[#f4ede5]">
          <div className="animate-pulse text-[#a0888d]">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div
        className="px-5 pt-6 pb-40 space-y-7"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        {/* Greeting */}
        <div className="animate-fade-in-up">
          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-primary mb-1">
            {getGreeting()}
          </p>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-medium leading-tight text-[#1e0f14] tracking-[-0.5px]">
            Welcome back, <em className="italic font-normal text-primary">{firstName}</em>
          </h1>
          <p className="text-[12.5px] font-light text-[#a0888d] mt-1">{formatDateFull()}</p>
        </div>

        {/* Upcoming Events */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-[#5c3d47]">
              Upcoming Events
            </span>
            <Link
              href="/events"
              className="text-[12px] text-primary font-normal opacity-75 hover:opacity-100 border-b border-primary/20 pb-px transition-opacity"
            >
              View all
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="relative h-[130px] -mx-1">
              {/* Stacked cards - render from back to front, top card = stackIndex */}
              {[...Array(visibleCount)].map((_, i) => {
                const idx = stackIndex + i;
                const e = upcomingEvents[idx];
                if (!e) return null;
                const depth = visibleCount - 1 - i;
                const isTop = i === visibleCount - 1;
                const { month, day, weekday } = formatEventDate(e.date);
                const timeStr = formatTimeStart(e.timeStart);
                const scale = Math.pow(STACK_SCALE, depth);
                const translateY = depth * STACK_OFFSET;
                const zIndex = i;
                const dragX = isTop ? swipeOffset : 0;

                return (
                  <div
                    key={e.id}
                    className="absolute inset-x-0 top-0 transition-transform duration-200 ease-out"
                    style={{
                      transform: `translateY(${translateY}px) scale(${scale}) translateX(${dragX}px)`,
                      transformOrigin: "top center",
                      zIndex,
                    }}
                  >
                    <Link
                      href={`/events/${e.id}`}
                      className="flex overflow-hidden rounded-[18px] border border-primary/10 bg-[#fdfaf7] shadow-[0_4px_20px_rgba(109,13,53,0.08)] block active:scale-[0.99] touch-pan-y"
                      onTouchStart={(ev) => handleSwipeStart(ev.touches[0].clientX)}
                      onTouchMove={(ev) => handleSwipeMove(ev.touches[0].clientX)}
                      onTouchEnd={handleSwipeEnd}
                      onTouchCancel={handleSwipeEnd}
                      onMouseDown={(ev) => handleSwipeStart(ev.clientX)}
                      onMouseMove={(ev) => ev.buttons === 1 && handleSwipeMove(ev.clientX)}
                      onMouseUp={handleSwipeEnd}
                      onMouseLeave={handleSwipeEnd}
                      onClick={(ev) => {
                        if (justSwiped.current) {
                          ev.preventDefault();
                          justSwiped.current = false;
                        }
                      }}
                    >
                      <div
                        className="w-[68px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-3 px-2 border-r border-primary/10"
                        style={{ backgroundColor: "#CFD7F2" }}
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-[1.5px] text-primary">
                          {month}
                        </span>
                        <span className="font-serif text-[28px] font-medium text-[#1e0f14] leading-none">
                          {day}
                        </span>
                        <span className="text-[9px] font-light text-[#a0888d]">{weekday}</span>
                      </div>
                      <div className="flex-1 min-w-0 p-3.5 pl-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-serif text-[18px] font-medium text-[#1e0f14] tracking-[-0.2px] truncate">
                            {e.name}
                          </h3>
                          <StatusBadge
                            status={(e.status || "draft") as "draft" | "in_progress" | "completed" | "cancelled"}
                            className="shrink-0"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {timeStr && (
                            <div className="flex items-center gap-1.5 text-[12px] font-light text-[#a0888d]">
                              <Clock size={11} weight="regular" className="opacity-50 shrink-0" />
                              {timeStr}
                            </div>
                          )}
                          {e.location && (
                            <div className="flex items-center gap-1.5 text-[12px] font-light text-[#a0888d]">
                              <MapPin size={11} weight="regular" className="opacity-50 shrink-0" />
                              <span className="truncate">{e.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <CaretRight size={22} weight="bold" className="text-[#a0888d] shrink-0" />
                      </div>
                    </Link>
                  </div>
                );
              })}
              {/* Dots indicator */}
              {upcomingEvents.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pt-2">
                  {upcomingEvents.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStackIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === stackIndex ? "bg-primary" : "bg-primary/25"
                      }`}
                      aria-label={`Go to event ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/events/create"
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-[18px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center transition-colors hover:border-primary/25"
            >
              <CalendarPlus size={28} className="text-primary" />
              <p className="text-[13px] font-light text-[#a0888d]">No upcoming events</p>
              <span className="text-primary font-medium text-sm">Create your first event</span>
            </Link>
          )}
        </section>

        {/* Featured Partners */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-[#5c3d47]">
              Featured Partners
            </span>
            <Link
              href="/services/catering"
              className="text-[12px] text-primary font-normal opacity-75 hover:opacity-100 border-b border-primary/20 pb-px transition-opacity"
            >
              Discover all
            </Link>
          </div>
          {vendors.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto py-4 -mx-5 px-5 scrollbar-hide">
              {vendors.slice(0, 6).map((vendor, i) => (
                <Link
                  key={vendor.id}
                  href={`/vendor/${vendor.id}`}
                  className="shrink-0 w-[110px] rounded-2xl border border-primary/10 bg-[#fdfaf7] p-4 text-center transition-all hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div
                    className="relative w-12 h-12 rounded-xl mx-auto mb-2 overflow-hidden"
                    style={{ background: PARTNER_GRADIENTS[i % PARTNER_GRADIENTS.length] }}
                  >
                    {vendor.logoUrl || vendor.featuredImageUrl ? (
                      <RemoteImage
                        src={vendor.logoUrl || vendor.featuredImageUrl}
                        alt={vendor.businessName}
                        fill
                        className="object-cover"
                        sizes="48px"
                        fallback={
                          <span className="absolute inset-0 flex items-center justify-center font-serif text-[22px] font-medium text-white/70">
                            {vendor.businessName.charAt(0)}
                          </span>
                        }
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-[22px] font-medium text-white/70">
                        {vendor.businessName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-[11.5px] font-medium text-[#1e0f14] truncate">{vendor.businessName}</p>
                  <p className="text-[10px] font-light text-[#a0888d]">
                    {vendor.businessType || vendor.cuisineTypes?.[0] || "Catering"}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span className="text-[10px] text-amber-600">★</span>
                    <span className="text-[10px] font-medium text-[#5c3d47]">
                      {Number(vendor.ratingAvg || 0).toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href="/services/catering"
              className="block p-6 rounded-[18px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center transition-colors hover:border-primary/25"
            >
              <p className="text-[13px] font-light text-[#a0888d]">No partners yet</p>
              <span className="text-primary font-medium text-sm">Browse catering</span>
            </Link>
          )}
        </section>

        {/* What's New / Spotlight */}
        {spotlight.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-[#5c3d47]">
                What&apos;s New · <span className="text-primary font-medium tracking-wide">Spotlight</span>
              </span>
              <Link
                href="/services/catering"
                className="text-[12px] text-primary font-normal opacity-75 hover:opacity-100 border-b border-primary/20 pb-px transition-opacity"
              >
                Explore all
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto py-4 -mx-5 px-5 scrollbar-hide">
              {spotlight.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/vendor/${item.vendorId}/package/${item.id}`}
                  className="shrink-0 w-[200px] rounded-[18px] overflow-hidden relative transition-transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  <div
                    className="w-full h-[240px] relative flex items-center justify-center"
                    style={{
                      background: item.imageUrl
                        ? undefined
                        : SPOTLIGHT_GRADIENTS[i % SPOTLIGHT_GRADIENTS.length],
                    }}
                  >
                    {item.imageUrl ? (
                      <>
                        <RemoteImage
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
                          }}
                        />
                      </>
                    ) : (
                      <span className="text-4xl">{["🍽️", "✨", "📸"][i % 3]}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-white/60 mb-1">
                      Catering
                    </p>
                    <h3 className="font-serif text-[17px] font-medium text-white leading-tight mb-2">
                      {item.name}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: CHERRY }}
                    >
                      Explore <CaretRight size={10} weight="bold" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="mb-3">
            <span className="font-serif text-[10px] font-semibold uppercase tracking-[2px] text-[#5c3d47]">
              Quick Actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/events/create"
              className="flex flex-col gap-2.5 p-4 rounded-2xl border border-primary/10 bg-[#fdfaf7] transition-all hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-primary"
                style={{ backgroundColor: "rgba(109,13,53,0.07)" }}
              >
                <CalendarBlank size={17} weight="regular" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#1e0f14]">New Event</p>
                <p className="text-[11px] font-light text-[#a0888d] -mt-1">Start planning</p>
              </div>
            </Link>
            <Link
              href="/services/catering"
              className="flex flex-col gap-2.5 p-4 rounded-2xl border border-primary/10 bg-[#fdfaf7] transition-all hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-primary"
                style={{ backgroundColor: "rgba(109,13,53,0.07)" }}
              >
                <ForkKnife size={17} weight="regular" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#1e0f14]">Browse Catering</p>
                <p className="text-[11px] font-light text-[#a0888d] -mt-1">Find vendors</p>
              </div>
            </Link>
            <Link
              href="/profile/payment-methods"
              className="flex flex-col gap-2.5 p-4 rounded-2xl border border-primary/10 bg-[#fdfaf7] transition-all hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-primary"
                style={{ backgroundColor: "rgba(109,13,53,0.07)" }}
              >
                <CreditCard size={17} weight="regular" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#1e0f14]">Payments</p>
                <p className="text-[11px] font-light text-[#a0888d] -mt-1">History & cards</p>
              </div>
            </Link>
            <Link
              href="/events"
              className="flex flex-col gap-2.5 p-4 rounded-2xl border border-primary/10 bg-[#fdfaf7] transition-all hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-primary"
                style={{ backgroundColor: "rgba(109,13,53,0.07)" }}
              >
                <Users size={17} weight="regular" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#1e0f14]">Guest Lists</p>
                <p className="text-[11px] font-light text-[#a0888d] -mt-1">Manage invites</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
