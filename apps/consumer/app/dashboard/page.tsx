"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarPlus, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL } from "@/lib/api";
import { CHERRY, MINTY_LIME_DARK, WARM_PEACH_DARK, TYPO } from "@/lib/events-ui";

const BODY_COLOR = "#4B5563";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  return "Good Evening";
}

interface Event {
  id: string;
  name: string;
  date: string;
  eventType: string;
  guestCount: number;
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
    ])
      .then(([u, evts, v]) => {
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
          <div className="animate-pulse" style={{ color: BODY_COLOR }}>
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
        <h1 className={TYPO.H1_LARGE} style={{ color: CHERRY }}>
          {getGreeting()}, {firstName}
        </h1>

        {/* Upcoming Events */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className={TYPO.H3} style={{ color: MINTY_LIME_DARK }}>
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className={`${TYPO.LINK} hover:underline`}
              style={{ color: CHERRY }}
            >
              View all
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-slate-50"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${CHERRY}15` }}
                    >
                      <CalendarPlus size={20} style={{ color: CHERRY }} />
                    </div>
                    <div>
                      <span className={TYPO.CARD_TITLE} style={{ color: "#171717" }}>
                        {e.name}
                      </span>
                      <p className={TYPO.SUBTEXT} style={{ color: BODY_COLOR }}>
                        {new Date(e.date).toLocaleDateString()} · {e.guestCount} guests
                      </p>
                    </div>
                  </div>
                  <CaretRight size={18} style={{ color: BODY_COLOR }} />
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href="/events/create"
              className="flex items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-colors hover:bg-slate-50"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: BODY_COLOR }}
            >
              <CalendarPlus size={24} />
              <span className={TYPO.LINK}>Create your first event</span>
            </Link>
          )}
        </section>

        {/* Featured Partners */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className={TYPO.H3} style={{ color: WARM_PEACH_DARK }}>
              Featured Partners
            </h2>
            <Link
              href="/services/catering"
              className={`${TYPO.LINK} hover:underline`}
              style={{ color: CHERRY }}
            >
              Discover all
            </Link>
          </div>
          {vendors.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {vendors.slice(0, 6).map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendor/${vendor.id}`}
                  className="shrink-0 w-24 h-24 rounded-[10px] overflow-hidden border transition-colors hover:border-slate-200"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
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
                        <span className="text-xl font-normal" style={{ color: CHERRY }}>
                          {vendor.businessName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="p-8 rounded-xl border text-center"
              style={{ borderColor: "rgba(0,0,0,0.06)", color: BODY_COLOR }}
            >
              <p className={TYPO.SUBTEXT}>No partners yet</p>
              <Link href="/services/catering" className={`${TYPO.LINK} mt-2 inline-block`} style={{ color: CHERRY }}>
                Browse services
              </Link>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
