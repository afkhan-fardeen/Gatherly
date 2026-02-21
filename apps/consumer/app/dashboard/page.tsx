"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EventImage } from "@/components/EventImage";
import { CalendarPlus, Clock, MapPin, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { HorizontalSlider } from "@/components/HorizontalSlider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_URL } from "@/lib/api";
import { CHERRY, ROUND, TYPO } from "@/lib/events-ui";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatEventDateTime(dateStr: string, timeStart?: string | null): string {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (timeStart) {
    try {
      // API may return "HH:mm" or ISO string like "1970-01-01T14:00:00.000Z"
      const iso = timeStart.includes("T") ? timeStart : `1970-01-01T${timeStart}`;
      const t = new Date(iso);
      const timePart = t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${datePart} · ${timePart}`;
    } catch {
      return datePart;
    }
  }
  return datePart;
}

interface Event {
  id: string;
  name: string;
  date: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  eventType: string;
  guestCount: number;
  location?: string;
  imageUrl?: string | null;
  status?: string;
}

interface SpotlightItem {
  id: string;
  name: string;
  imageUrl: string | null;
  vendorId: string;
  basePrice: number;
  priceType: string;
}

interface Vendor {
  id: string;
  businessName: string;
  description: string | null;
  cuisineTypes: string[];
  ratingAvg: number;
  ratingCount: number;
  logoUrl: string | null;
  featuredImageUrl: string | null;
  packages: { basePrice: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [spotlight, setSpotlight] = useState<SpotlightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const params = new URLSearchParams();
    params.set("businessType", "catering");
    params.set("limit", "6");
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/events`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/api/vendors?${params}`).then((r) => (r.ok ? r.json() : [])),
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

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 pb-32 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-text-tertiary">
            Loading...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 pt-8 pb-32 space-y-8 bg-white">
        {/* Greeting */}
        <h1 className={`${TYPO.H1_LARGE} text-text-primary animate-fade-in-up`}>
          {getGreeting()}, {firstName}
        </h1>

        {/* Upcoming Events */}
        <section className="animate-fade-in-up animate-delay-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-caption font-medium text-text-primary uppercase tracking-wider">Upcoming Events</h2>
            <Link href="/events" className={`${TYPO.LINK} text-primary`}>
              View all
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((e) => {
                const timeStart = e.timeStart
                  ? typeof e.timeStart === "string"
                    ? e.timeStart
                    : (e.timeStart as { toISOString?: () => string })?.toISOString?.()
                  : null;
                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevation-1 transition-all hover:border-slate-300 active:scale-[0.99]"
                  >
                    <div className="flex min-h-[88px]">
                      <div className="relative w-24 min-h-full shrink-0 bg-slate-100 self-stretch">
                        <EventImage
                          src={e.imageUrl}
                          alt={e.name}
                          className="object-cover"
                          sizes="96px"
                          fallbackIcon={<CalendarPlus size={22} className="text-primary" />}
                        />
                      </div>
                      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`${TYPO.CARD_TITLE} line-clamp-1`}>{e.name}</h3>
                          <StatusBadge status={(e.status || "draft") as "draft" | "in_progress" | "completed" | "cancelled"} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-text-tertiary">
                          <Clock size={12} weight="regular" className="shrink-0" />
                          <span className="text-[11px] truncate">
                            {formatEventDateTime(e.date, timeStart)}
                          </span>
                        </div>
                        {e.location && (
                          <div className="flex items-center gap-2 mt-0.5 text-text-tertiary">
                            <MapPin size={12} weight="regular" className="shrink-0" />
                            <span className="text-[11px] truncate">{e.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center pr-3">
                        <CaretRight size={20} weight="bold" className="text-text-tertiary" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link
              href="/events/create"
              className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-slate-200 transition-colors hover:bg-slate-50"
            >
              <CalendarPlus size={24} className="text-text-tertiary" />
              <span className={`${TYPO.LINK} text-text-secondary`}>Create your first event</span>
            </Link>
          )}
        </section>

        {/* Featured Partners */}
        <section className="animate-fade-in-up animate-delay-2 ">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-caption font-medium text-text-primary uppercase tracking-wider">
              Featured Partners
            </h2>
            <Link
              href="/services/catering"
              className={`${TYPO.LINK} text-primary hover:underline`}
            >
              Discover all
            </Link>
          </div>
          {vendors.length > 0 ? (
            <div className={`overflow-hidden ${ROUND}`}>
              <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
              {vendors.slice(0, 6).map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendor/${vendor.id}`}
                  className={`shrink-0 w-[100px] h-[100px] rounded-2xl overflow-hidden border border-slate-200 shadow-elevation-1 transition-all hover:border-slate-300 hover:shadow-elevation-2`}
                >
                  <div className="relative w-full h-full bg-slate-100">
                    {(vendor.featuredImageUrl || vendor.logoUrl) ? (
                      <Image
                        src={vendor.featuredImageUrl || vendor.logoUrl || ""}
                        alt={vendor.businessName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F9F2E7" }}>
                        <span className="text-xl font-normal text-primary">
                          {vendor.businessName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-slate-200 text-center bg-white shadow-elevation-1">
              <p className={`${TYPO.SUBTEXT} text-text-secondary`}>No partners yet</p>
              <Link href="/services/catering" className={`${TYPO.LINK} mt-2 inline-block text-primary`}>
                Browse services
              </Link>
            </div>
          )}
        </section>

        {/* What's New - spotlight paid vendor placement (taller images) */}
        {spotlight.length > 0 && (
          <section className="animate-fade-in-up animate-delay-3 ">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-caption font-medium text-text-primary uppercase tracking-wider">
                  What&apos;s New
                </h2>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-text-secondary"
                >
                  Spotlight
                </span>
              </div>
              <Link
                href="/services/catering"
                className={`${TYPO.LINK} text-primary hover:underline`}
              >
                Explore all
              </Link>
            </div>
            <HorizontalSlider>
              {spotlight.map((item) => (
                <Link
                  key={item.id}
                  href={`/vendor/${item.vendorId}/package/${item.id}`}
                  className="shrink-0 w-[280px] h-[220px] snap-start overflow-hidden border border-slate-200 rounded-2xl shadow-elevation-1 transition-all hover:border-slate-300 hover:shadow-elevation-2 active:scale-[0.99]"
                >
                  <div className="relative w-full h-full">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: "#F9F2E7" }}
                      >
                        <span className="text-4xl font-normal text-primary">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className={`${TYPO.CARD_TITLE} text-white text-sm`}>{item.name}</h3>
                      <span
                        className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide text-white bg-primary"
                      >
                        Explore now
                        <CaretRight size={12} weight="bold" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </HorizontalSlider>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
