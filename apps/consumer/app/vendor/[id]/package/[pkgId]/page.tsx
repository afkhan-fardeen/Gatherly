"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ForkKnife,
  CaretRight,
  Calendar,
  X,
  CheckCircle,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Package {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  priceType: string;
  minGuests: number | null;
  maxGuests: number | null;
  setupFee?: number;
  packageItems: { name: string; imageUrl: string | null }[];
}

interface Vendor {
  id: string;
  businessName: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  eventType: string;
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const pkgId = params.pkgId as string;
  const [pkg, setPkg] = useState<Package | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    setError("");
    Promise.all([
      fetch(`${API_URL}/api/vendors/${id}`).then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      }),
      fetch(`${API_URL}/api/vendors/${id}/packages`).then(async (r) => {
        if (!r.ok) return [];
        const pkgs = await r.json();
        return pkgs;
      }),
    ])
      .then(([v, pkgs]) => {
        setVendor(v);
        const found = (pkgs ?? []).find((p: Package) => p.id === pkgId);
        setPkg(found ?? null);
        if (!found) setError("Package not found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, pkgId]);

  const handleBookClick = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    setShowEventPicker(true);
    setEventsLoading(true);
    fetch(`${API_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: Event[]) => setEvents(list.filter((e) => new Date(e.date) >= new Date())))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  };

  const selectEvent = (selectedEventId: string) => {
    setShowEventPicker(false);
    router.push(`/vendor/${id}/book?packageId=${pkgId}&eventId=${selectedEventId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!pkg || !vendor) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAFAFA]">
          <p className={`${TYPO.SUBTEXT} text-center`}>{error || "Package not found"}</p>
          <Link
            href={`/vendor/${id}`}
            className={`mt-4 ${TYPO.LINK} hover:underline`}
            style={{ color: CHERRY }}
          >
            Back to vendor
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <div className="bg-[#FAFAFA] min-h-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/vendor/${id}`}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={20} weight="regular" className="text-slate-600" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className={`${TYPO.H1} text-slate-900 truncate`}>{pkg.name}</h1>
              <p className={`${TYPO.SUBTEXT} truncate`}>{vendor.businessName}</p>
            </div>
          </div>
        </header>

        <main className="pb-32">
          <div className="p-6 space-y-6">
            {pkg.imageUrl && (
              <div className={`w-full h-52 overflow-hidden bg-slate-100 ${ROUND}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pkg.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h2 className={TYPO.H2}>{pkg.name}</h2>
              {pkg.description && (
                <p className={`${TYPO.BODY} mt-2 leading-relaxed`}>{pkg.description}</p>
              )}
            </div>

            <div className={`p-5 bg-white border border-slate-200 ${ROUND}`}>
              <p className="font-normal text-xl" style={{ color: CHERRY }}>
                {pkg.priceType === "per_person"
                  ? `From ${Number(pkg.basePrice).toFixed(2)} BD per person`
                  : `${Number(pkg.basePrice).toFixed(2)} BD fixed`}
              </p>
              {(pkg.minGuests || pkg.maxGuests) && (
                <p className={`${TYPO.BODY} mt-1`}>
                  {pkg.minGuests && `Min ${pkg.minGuests} guests`}
                  {pkg.minGuests && pkg.maxGuests && " · "}
                  {pkg.maxGuests && `Max ${pkg.maxGuests} guests`}
                </p>
              )}
              {pkg.setupFee != null && Number(pkg.setupFee) > 0 && (
                <p className={`${TYPO.BODY} mt-1`}>
                  Setup fee: {Number(pkg.setupFee).toFixed(2)} BD
                </p>
              )}
            </div>

            {pkg.packageItems.length > 0 && (
              <div>
                <h3 className={`${TYPO.H3} text-slate-500 mb-3`}>
                  Menu items
                </h3>
                <div className="space-y-2">
                  {pkg.packageItems.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-4 border border-slate-100 bg-white ${ROUND}`}
                    >
                      {item.imageUrl ? (
                        <div className={`w-12 h-12 overflow-hidden bg-slate-100 shrink-0 ${ROUND}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 bg-slate-100 flex items-center justify-center shrink-0 ${ROUND}`}
                        >
                          <ForkKnife size={20} weight="regular" className="text-slate-400" />
                        </div>
                      )}
                      <span className={TYPO.CARD_TITLE}>{item.name}</span>
                      <CheckCircle size={18} weight="fill" className="text-emerald-500 ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Fixed bottom bar - Book button */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={handleBookClick}
              className="w-full h-12 rounded-full font-normal text-sm flex items-center justify-center gap-2 text-white"
              style={{
                backgroundColor: CHERRY,
                boxShadow: `${CHERRY}33 0 8px 24px`,
              }}
            >
              <span>Book this package</span>
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Event picker modal */}
        {showEventPicker && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <button
              type="button"
              onClick={() => setShowEventPicker(false)}
              className="absolute inset-0 bg-black/50"
              aria-label="Close"
            />
            <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className={TYPO.H2}>Select event</h3>
                <button
                  type="button"
                  onClick={() => setShowEventPicker(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
              {eventsLoading ? (
                <p className={`${TYPO.SUBTEXT} py-8 text-center`}>Loading events...</p>
              ) : events.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className={`${TYPO.BODY} mb-4`}>No upcoming events</p>
                  <Link
                    href="/events/create"
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-full font-normal text-sm text-white"
                    style={{ backgroundColor: CHERRY }}
                  >
                    Create event
                    <CaretRight size={16} weight="bold" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {events.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => selectEvent(e.id)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-colors"
                      >
                        <div>
                          <p className={TYPO.CARD_TITLE}>{e.name}</p>
                          <p className={TYPO.SUBTEXT}>
                            {new Date(e.date).toLocaleDateString()} · {e.eventType}
                          </p>
                        </div>
                        <CaretRight size={20} weight="bold" className="text-slate-400 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div
          className="shrink-0"
          style={{ height: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
          aria-hidden
        />
      </div>
    </AppLayout>
  );
}
