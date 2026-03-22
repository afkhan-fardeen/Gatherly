"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ForkKnife, Sparkle, MusicNote, Camera, Wine, Flower, ShoppingCart } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL, fetchAuth } from "@/lib/api";
import { CHERRY } from "@/lib/events-ui";

const SERVICES = [
  { id: "catering", name: "Catering", desc: "Food & drinks", Icon: ForkKnife, href: "/services/catering", available: true },
  { id: "decor", name: "Decor", desc: "Coming soon", Icon: Sparkle, href: "/services/coming-soon/decor", available: false },
  { id: "entertainment", name: "Entertainment", desc: "Coming soon", Icon: MusicNote, href: "/services/coming-soon/entertainment", available: false },
  { id: "photography", name: "Photography", desc: "Coming soon", Icon: Camera, href: "/services/coming-soon/photography", available: false },
  { id: "rentals", name: "Rentals", desc: "Coming soon", Icon: Wine, href: "/services/coming-soon/rentals", available: false },
  { id: "florals", name: "Florals", desc: "Coming soon", Icon: Flower, href: "/services/coming-soon/florals", available: false },
];

export default function EventServicesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<{ id: string; name: string; guestCount: number } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/events/" + eventId + "/services");
      return;
    }
    Promise.all([
      fetchAuth(`${API_URL}/api/events/${eventId}`),
      fetchAuth(`${API_URL}/api/bookings?eventId=${eventId}`),
    ])
      .then(async ([eventRes, bookingsRes]) => {
        const ev = eventRes.ok ? await eventRes.json() : null;
        const bks = bookingsRes.ok ? await bookingsRes.json() : [];
        return { ev, bks };
      })
      .then(({ ev, bks }) => {
        setEvent(ev);
        if (!ev) router.replace("/events");
        setCartCount(Array.isArray(bks) ? bks.length : 0);
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
      <div
        className="min-h-full px-5 md:px-8 pt-6 pb-40"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        {/* Fixed header */}
        <header
          className="sticky top-0 z-40 -mx-5 px-5 md:-mx-8 md:px-8 pt-[max(0.5rem,env(safe-area-inset-top))] pb-4 bg-[#f4ede5]"
          style={{
            boxShadow: "0 1px 0 rgba(109,13,53,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${eventId}`}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                Add <span className="italic font-normal text-primary">Services</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide break-words">
                {event.name}
              </p>
            </div>
            <Link
              href={`/events/${eventId}/cart`}
              className="relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
              aria-label="View cart"
            >
              <ShoppingCart size={22} weight="regular" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: CHERRY }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="pt-2">
          <p className="text-[13px] text-[#a0888d] mb-4">Tap to browse and add to cart</p>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((svc) => {
              const href = svc.id === "catering" ? cateringHref : svc.href;
              const linkHref = svc.available ? href : "#";

              return (
                <Link
                  key={svc.id}
                  href={linkHref}
                  className={`block p-4 rounded-[20px] border border-primary/10 bg-white transition-all ${
                    svc.available
                      ? "hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
                  onClick={(e) => !svc.available && e.preventDefault()}
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        svc.available ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <svc.Icon size={24} weight="regular" />
                    </div>
                    <div>
                      <span
                        className={`text-[14px] font-semibold block ${
                          svc.available ? "text-[#1e0f14]" : "text-[#a0888d]"
                        }`}
                      >
                        {svc.name}
                      </span>
                      <span className={`text-[12px] block mt-0.5 ${svc.available ? "text-[#a0888d]" : "text-[#9e8085]"}`}>
                        {svc.desc}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
