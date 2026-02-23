"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ForkKnife, Sparkle, MusicNote, Camera, Wine, Flower } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL } from "@/lib/api";

const SERVICES = [
  { id: "catering", name: "Catering", Icon: ForkKnife, href: "/services/catering", available: true },
  { id: "decor", name: "Decor", Icon: Sparkle, href: "/services/coming-soon/decor", available: false },
  { id: "entertainment", name: "Entertainment", Icon: MusicNote, href: "/services/coming-soon/entertainment", available: false },
  { id: "photography", name: "Photography", Icon: Camera, href: "/services/coming-soon/photography", available: false },
  { id: "rentals", name: "Rentals", Icon: Wine, href: "/services/coming-soon/rentals", available: false },
  { id: "florals", name: "Florals", Icon: Flower, href: "/services/coming-soon/florals", available: false },
];

export default function EventServicesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<{ id: string; name: string; guestCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/events/" + eventId + "/services");
      return;
    }
    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => {
        setEvent(e);
        if (!e) router.replace("/events");
      })
      .catch(() => router.replace("/events"))
      .finally(() => setLoading(false));
  }, [eventId, router]);

  if (loading || !event) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="flex-1 flex items-center justify-center min-h-[40vh]">
          <p className="text-sm font-normal text-[#a0888d]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  const cateringHref = `/services/catering?eventId=${eventId}&guestCount=${event.guestCount || 1}`;

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div className="min-h-full bg-[#f4ede5]">
        <header
          className="sticky top-0 z-20 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
          style={{ background: "linear-gradient(to bottom, #f4ede5 85%, transparent)" }}
        >
          <div className="flex items-center gap-3.5 mb-4">
            <Link
              href={`/events/${eventId}`}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fdfaf7] border border-primary/10 text-[#5c3d47] shadow-sm shrink-0"
            >
              <ArrowLeft size={15} weight="regular" />
            </Link>
            <div>
              <h1 className="font-serif text-[22px] font-normal text-[#1e0f14] tracking-[-0.3px]">
                Select services for <span className="italic font-normal text-primary">{event.name}</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#a0888d] mt-0.5">
                Choose what you need for your event
              </p>
            </div>
          </div>
        </header>

        <main className="px-5 pb-32">
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((svc) => {
              const href = svc.id === "catering" ? cateringHref : svc.href;
              const linkHref = svc.available ? href : "#";

              return (
                <Link
                  key={svc.id}
                  href={linkHref}
                  className={`flex flex-col items-center gap-3 p-5 rounded-[20px] border-2 transition-all ${
                    svc.available
                      ? "bg-white border-primary/15 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg"
                      : "bg-white/60 border-primary/5 opacity-70 cursor-not-allowed"
                  }`}
                  onClick={(e) => !svc.available && e.preventDefault()}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      svc.available ? "bg-primary/10 text-primary" : "bg-primary/5 text-primary/50"
                    }`}
                  >
                    <svc.Icon size={28} weight="regular" />
                  </div>
                  <span
                    className={`text-[15px] font-medium text-center ${
                      svc.available ? "text-[#1e0f14]" : "text-[#a0888d]"
                    }`}
                  >
                    {svc.name}
                  </span>
                  {!svc.available && (
                    <span className="text-[10px] font-normal text-[#a0888d]">Coming soon</span>
                  )}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
