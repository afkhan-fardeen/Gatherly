"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ForkKnife,
  CaretRight,
  Calendar,
  X,
  CheckCircle,
  Minus,
  Plus,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, TYPO } from "@/lib/events-ui";
import {
  getBookingDraft,
  saveBookingDraft,
  draftMatchesVendorPackage,
} from "@/lib/booking-draft";

import { API_URL, fetchAuth } from "@/lib/api";
import { getToken } from "@/lib/session";

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
  serviceChargePercent?: number;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const pkgId = params.pkgId as string;
  const eventIdFromUrl = searchParams.get("eventId");
  const guestCountFromUrl = searchParams.get("guestCount");
  const [pkg, setPkg] = useState<Package | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [guestCount, setGuestCount] = useState("1");
  const [guestError, setGuestError] = useState("");

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
        if (found) {
          const min = found.minGuests ?? 1;
          const max = found.maxGuests ?? Infinity;
          let initial = min;
          const urlCount = guestCountFromUrl ? parseInt(guestCountFromUrl, 10) : NaN;
          if (!isNaN(urlCount) && urlCount >= 1) {
            initial = Math.max(min, Math.min(urlCount, max === Infinity ? 9999 : max));
          } else {
            const draft = draftMatchesVendorPackage(id, pkgId) ? getBookingDraft() : null;
            initial =
              draft && draft.guestCount >= min
                ? Math.min(draft.guestCount, max === Infinity ? 9999 : max)
                : min;
          }
          setGuestCount(String(initial));
        } else {
          setError("Package not found");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, pkgId, guestCountFromUrl]);

  const minG = pkg?.minGuests ?? 1;
  const maxG = pkg?.maxGuests ?? Infinity;

  const adjustGuests = (delta: number) => {
    const n = parseInt(guestCount, 10) || minG;
    const next = Math.max(minG, Math.min(n + delta, maxG));
    setGuestCount(String(next));
    setGuestError("");
    saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: next });
  };

  const handleBookClick = () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const n = parseInt(guestCount, 10);
    if (isNaN(n) || n < minG) {
      setGuestError(`Minimum ${minG} guests`);
      return;
    }
    if (maxG !== Infinity && n > maxG) {
      setGuestError(`Maximum ${maxG} guests`);
      return;
    }
    setGuestError("");
    setShowBookModal(false);

    // If we have eventId from URL (e.g. from event services flow), go straight to book page
    if (eventIdFromUrl) {
      const clamped = Math.max(minG, Math.min(n, maxG === Infinity ? 9999 : maxG));
      saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: clamped, eventId: eventIdFromUrl });
      router.push(`/vendor/${id}/book?packageId=${pkgId}&eventId=${eventIdFromUrl}&guestCount=${clamped}`);
      return;
    }

    setShowEventPicker(true);
    setEventsLoading(true);
    fetchAuth(`${API_URL}/api/events`)
      .then((res) => (res.ok ? res.json() : Promise.resolve([])))
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = list.filter((e: Event) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        });
        setEvents(upcoming);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  };

  const selectEvent = (selectedEventId: string) => {
    setShowEventPicker(false);
    const n = parseInt(guestCount, 10);
    const clamped = !isNaN(n)
      ? Math.max(1, Math.min(Math.max(n, minG), maxG))
      : minG;
    if (!isNaN(n) && clamped !== n) setGuestCount(String(clamped));
    saveBookingDraft({
      vendorId: id,
      packageId: pkgId,
      guestCount: clamped,
      eventId: selectedEventId,
    });
    router.push(`/vendor/${id}/book?packageId=${pkgId}&eventId=${selectedEventId}&guestCount=${clamped}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-text-tertiary">Loading...</p>
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
            className={`mt-4 ${TYPO.LINK} text-primary hover:underline`}
          >
            Back to vendor
          </Link>
        </div>
      </AppLayout>
    );
  }

  const count = Math.max(
    1,
    Math.min(
      Math.max(parseInt(guestCount, 10) || 1, pkg.minGuests ?? 1),
      pkg.maxGuests ?? Infinity
    )
  );
  const basePrice = Number(pkg.basePrice);
  const setupFee = Number(pkg.setupFee ?? 0);
  const serviceChargePercent = Number(pkg.serviceChargePercent ?? 0);
  const subtotal = pkg.priceType === "per_person" ? basePrice * count : basePrice;
  const serviceCharges = (subtotal * serviceChargePercent) / 100;
  const totalAmount = subtotal + serviceCharges + setupFee;

  return (
    <AppLayout showNav={false}>
      <div className="bg-[#FAFAFA] min-h-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-slate-200 shrink-0 shadow-elevation-1">
          <div className="flex items-center gap-3">
            <Link
              href={
                eventIdFromUrl && guestCountFromUrl
                  ? `/vendor/${id}?eventId=${eventIdFromUrl}&guestCount=${guestCountFromUrl}`
                  : `/vendor/${id}`
              }
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={22} weight="regular" className="text-text-secondary" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className={`${TYPO.H1} text-text-primary truncate`}>{pkg.name}</h1>
              <p className={`${TYPO.SUBTEXT} truncate`}>{vendor.businessName}</p>
            </div>
          </div>
        </header>

        <main className="pb-24">
          <div className="p-6 space-y-6">
            {pkg.imageUrl && (
              <div className={`w-full h-52 overflow-hidden bg-slate-100 ${ROUND}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pkg.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h2 className="font-serif text-typo-h2 font-medium text-text-primary">{pkg.name}</h2>
              {pkg.description && (
                <p className="text-body font-normal text-text-body mt-2 leading-relaxed">{pkg.description}</p>
              )}
            </div>

            <div className={`p-5 bg-white border border-slate-200 ${ROUND} shadow-elevation-2`}>
              <p className="text-body font-medium text-primary">
                {pkg.priceType === "per_person"
                  ? `From ${Number(pkg.basePrice).toFixed(2)} BD per person`
                  : `${Number(pkg.basePrice).toFixed(2)} BD fixed`}
              </p>
              {(pkg.minGuests || pkg.maxGuests) && (
                <p className="text-body-sm font-normal text-text-secondary mt-1">
                  {pkg.minGuests && `Min ${pkg.minGuests} guests`}
                  {pkg.minGuests && pkg.maxGuests && " · "}
                  {pkg.maxGuests && `Max ${pkg.maxGuests} guests`}
                </p>
              )}
              {pkg.setupFee != null && Number(pkg.setupFee) > 0 && (
                <p className="text-body-sm font-normal text-text-secondary mt-1">
                  Setup fee: {Number(pkg.setupFee).toFixed(2)} BD
                </p>
              )}
            </div>

            {pkg.packageItems.length > 0 && (
              <div>
                <h3 className="text-caption font-medium text-text-tertiary uppercase tracking-wider mb-2">
                  Menu items
                </h3>
                <div className="space-y-2">
                  {pkg.packageItems.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 border border-slate-100 bg-white ${ROUND}`}
                    >
                      {item.imageUrl ? (
                        <div className={`w-10 h-10 overflow-hidden bg-slate-100 shrink-0 ${ROUND}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 bg-slate-100 flex items-center justify-center shrink-0 ${ROUND}`}
                        >
                          <ForkKnife size={18} weight="regular" className="text-text-tertiary" />
                        </div>
                      )}
                      <span className="text-body font-normal text-text-body flex-1 min-w-0">{item.name}</span>
                      <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Floating Request booking button */}
        <button
          type="button"
          onClick={() => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
              router.push("/login");
              return;
            }
            setShowBookModal(true);
          }}
          className="fixed right-5 z-50 h-11 px-5 rounded-full font-medium text-sm text-white flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-transform"
          style={{
            bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
            backgroundColor: "#6D0D35",
            boxShadow: "0 2px 12px rgba(63, 8, 16, 0.25)",
          }}
        >
          Request booking
          <CaretRight size={18} weight="bold" />
        </button>

        {/* Book modal - guest count + price */}
        {showBookModal && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="absolute inset-0 bg-black/50 animate-modal-backdrop"
              aria-label="Close"
            />
            <div
              className="form-no-zoom relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto animate-modal-slide-up sm:animate-modal-scale-in flex flex-col"
              style={{
                maxHeight: "min(calc(100vh - 2rem - env(safe-area-inset-bottom, 0px)), 500px)",
                paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className={TYPO.H2}>Book this package</h3>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-tertiary hover:bg-slate-100"
                >
                  <X size={22} weight="bold" />
                </button>
              </div>

              {/* Guest count */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-text-primary mb-2">Number of guests</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => adjustGuests(-1)}
                      className="w-11 h-11 flex items-center justify-center text-text-secondary hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                      disabled={count <= minG}
                      aria-label="Decrease guests"
                    >
                      <Minus size={18} weight="bold" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={minG}
                      max={maxG === Infinity ? undefined : maxG}
                      value={guestCount}
                      onChange={(e) => {
                        setGuestCount(e.target.value);
                        setGuestError("");
                      }}
                      onBlur={() => {
                        const n = parseInt(guestCount, 10);
                        if (!isNaN(n)) {
                          if (n < minG) {
                            setGuestError(`Minimum ${minG} guests`);
                            setGuestCount(String(minG));
                            saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: minG });
                          } else if (maxG !== Infinity && n > maxG) {
                            setGuestError(`Maximum ${maxG} guests`);
                            setGuestCount(String(maxG));
                            saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: maxG });
                          } else {
                            setGuestError("");
                            saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: n });
                          }
                        } else {
                          setGuestCount(String(minG));
                          setGuestError("");
                          saveBookingDraft({ vendorId: id, packageId: pkgId, guestCount: minG });
                        }
                      }}
                      className="w-14 h-11 text-center text-base font-medium text-text-primary bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => adjustGuests(1)}
                      className="w-11 h-11 flex items-center justify-center text-text-secondary hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                      disabled={count >= maxG}
                      aria-label="Increase guests"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </div>
                  {(pkg.minGuests || pkg.maxGuests) && (
                    <span className="text-sm text-text-tertiary">
                      Min {pkg.minGuests ?? 1}
                      {pkg.maxGuests && ` · Max ${pkg.maxGuests}`}
                    </span>
                  )}
                </div>
                {guestError && (
                  <p className="mt-1.5 text-sm text-red-600">{guestError}</p>
                )}
              </div>

              {/* Estimated total */}
              <div className="flex items-center justify-between py-3 mb-5 border-t border-b border-slate-100">
                <span className="text-sm text-text-secondary">Estimated total</span>
                <span className={`${TYPO.BODY_MEDIUM} text-typo-h1 text-primary`}>
                  {totalAmount.toFixed(2)} BD
                </span>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={handleBookClick}
                className="w-full h-12 rounded-full font-semibold text-base text-white flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ backgroundColor: "#6D0D35" }}
              >
                Continue to select event
                <CaretRight size={22} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Event picker modal */}
        {showEventPicker && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <button
              type="button"
              onClick={() => setShowEventPicker(false)}
              className="absolute inset-0 bg-black/50 animate-modal-backdrop"
              aria-label="Close"
            />
            <div
              className="form-no-zoom relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto animate-modal-slide-up sm:animate-modal-scale-in flex flex-col"
              style={{
                maxHeight: "min(calc(100vh - 2rem - env(safe-area-inset-bottom, 0px)), 500px)",
                paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className={TYPO.H2}>Select event</h3>
                <button
                  type="button"
                  onClick={() => setShowEventPicker(false)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-tertiary hover:bg-slate-100"
                >
                  <X size={22} weight="bold" />
                </button>
              </div>
              {eventsLoading ? (
                <p className={`${TYPO.SUBTEXT} py-8 text-center`}>Loading events...</p>
              ) : events.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className={`${TYPO.BODY} mb-4`}>No upcoming events</p>
                  <Link
                    href="/events/create"
                    className="inline-flex items-center gap-2 py-3 px-5 rounded-full font-medium text-sm text-white"
                    style={{ backgroundColor: "#6D0D35" }}
                  >
                    Create event
                    <CaretRight size={18} weight="bold" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {events.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => selectEvent(e.id)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-colors"
                      >
                        <div>
                          <p className={TYPO.CARD_TITLE}>{e.name}</p>
                          <p className={TYPO.SUBTEXT}>
                            {new Date(e.date).toLocaleDateString()} · {e.eventType}
                          </p>
                        </div>
                        <CaretRight size={22} weight="bold" className="text-text-tertiary shrink-0" />
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
