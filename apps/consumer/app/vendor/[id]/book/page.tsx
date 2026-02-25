"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY } from "@/lib/events-ui";
import { getBookingDraft, clearBookingDraft, saveBookingDraft } from "@/lib/booking-draft";

import { API_URL, parseApiError, getNetworkErrorMessage } from "@/lib/api";

interface Event {
  id: string;
  name: string;
  date: string;
  guestCount: number;
}

interface Package {
  id: string;
  name: string;
  basePrice: number;
  priceType: string;
  minGuests: number | null;
  maxGuests: number | null;
  setupFee?: number;
  serviceChargePercent?: number;
}

interface Vendor {
  id: string;
  businessName: string;
}

export default function BookVendorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorId = params.id as string;
  const packageId = searchParams.get("packageId");
  const eventIdFromUrl = searchParams.get("eventId");
  const guestCountFromUrl = searchParams.get("guestCount");

  const [events, setEvents] = useState<Event[]>([]);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const params = new URLSearchParams();
      if (packageId) params.set("packageId", packageId);
      if (eventIdFromUrl) params.set("eventId", eventIdFromUrl);
      if (guestCountFromUrl) params.set("guestCount", guestCountFromUrl);
      const q = params.toString();
      const redirectUrl = q ? `/vendor/${vendorId}/book?${q}` : `/vendor/${vendorId}/book`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    if (!packageId) {
      const draft = getBookingDraft();
      if (draft && draft.vendorId === vendorId && draft.packageId) {
        const params = new URLSearchParams();
        params.set("packageId", draft.packageId);
        if (draft.eventId) params.set("eventId", draft.eventId);
        if (draft.guestCount) params.set("guestCount", String(draft.guestCount));
        router.replace(`/vendor/${vendorId}/book?${params.toString()}`);
        return;
      }
      setLoading(false);
      setError("Please select a package first");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/events`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/api/vendors/${vendorId}/packages`, {}).then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          if (r.status === 404) setError(data.error || "Vendor not found");
          return [];
        }
        return r.json();
      }),
      fetch(`${API_URL}/api/vendors/${vendorId}`, {}).then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          if (r.status === 404) setError(data.error || "Vendor not found");
          return null;
        }
        return r.json();
      }),
    ])
      .then(([evs, pkgs, v]) => {
        setEvents(evs ?? []);
        const found = (pkgs ?? []).find((p: Package) => p.id === packageId);
        setPkg(found ?? null);
        setVendor(v);
        const draft = getBookingDraft();
        const draftForThis =
          draft?.vendorId === vendorId && draft?.packageId === packageId ? draft : null;
        if (draftForThis?.specialRequirements) {
          setSpecialRequirements(draftForThis.specialRequirements);
        }
        if (found && evs?.length > 0) {
          const preferred = eventIdFromUrl
            ? evs.find((e: Event) => e.id === eventIdFromUrl)
            : null;
          const ev = preferred || evs[0];
          setEventId(ev.id);
          const minG = found.minGuests ?? 1;
          const maxG = found.maxGuests ?? Infinity;
          const urlCount = guestCountFromUrl ? parseInt(guestCountFromUrl, 10) : NaN;
          const evCount = ev?.guestCount ?? minG;
          let initialCount = minG;
          if (!isNaN(urlCount) && urlCount >= 1) {
            initialCount = Math.max(minG, Math.min(urlCount, maxG === Infinity ? 9999 : maxG));
          } else {
            initialCount = Math.max(minG, Math.min(evCount, maxG === Infinity ? 9999 : maxG));
          }
          setGuestCount(String(initialCount));
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [vendorId, packageId, eventIdFromUrl, guestCountFromUrl, router]);

  useEffect(() => {
    if (eventId && events.length > 0 && !guestCountFromUrl && pkg) {
      const ev = events.find((e) => e.id === eventId);
      if (ev) {
        const minG = pkg.minGuests ?? 1;
        const maxG = pkg.maxGuests ?? Infinity;
        const clamped = Math.max(minG, Math.min(ev.guestCount, maxG === Infinity ? 9999 : maxG));
        setGuestCount(String(clamped));
      }
    }
  }, [eventId, events, guestCountFromUrl, pkg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token || !pkg || !eventId) return;

    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count < 1) {
      setError("Enter a valid guest count");
      setSubmitting(false);
      return;
    }
    if (pkg.minGuests != null && count < pkg.minGuests) {
      setError(`Minimum ${pkg.minGuests} guests required`);
      setSubmitting(false);
      return;
    }
    if (pkg.maxGuests != null && count > pkg.maxGuests) {
      setError(`Maximum ${pkg.maxGuests} guests allowed`);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          vendorId,
          packageId: pkg.id,
          guestCount: count,
          specialRequirements: specialRequirements.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data) || "Booking failed");
      clearBookingDraft();
      toast.success("Booking request sent!");
      router.push("/bookings");
      router.refresh();
    } catch (err) {
      setError(getNetworkErrorMessage(err, "Booking failed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="flex-1 flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}>
          <p className="text-[#a0888d]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!packageId || !pkg || !vendor) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="p-6 min-h-[50vh] flex flex-col items-center justify-center" style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}>
          <Link
            href={vendor ? `/vendor/${vendorId}` : "/services/catering"}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mb-4"
          >
            <ArrowLeft size={20} weight="regular" />
            {vendor ? "Back to vendor" : "Back to catering"}
          </Link>
          <p className="text-[14px] font-normal text-[#a0888d] text-center">{error || "Package not found"}</p>
          {error?.includes("Vendor not found") && (
            <p className="mt-2 text-[13px] font-light text-[#9e8085] text-center">
              This vendor may no longer be available. Try browsing other caterers.
            </p>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="min-h-full"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        <header
          className="sticky top-0 z-40 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href={`/vendor/${vendorId}/package/${pkg.id}`}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-[26px] sm:text-[32px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14] truncate">
                Request <span className="italic font-normal text-primary">Booking</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 truncate">
                {vendor.businessName} · {pkg.name}
              </p>
            </div>
          </div>
        </header>

      <main className="px-5 pb-40">
        <form onSubmit={handleSubmit} className="form-no-zoom space-y-6">
          {error && (
            <div className="p-4 rounded-[20px] bg-red-50 text-red-700 text-[14px] font-medium border border-red-200">
              {error}
            </div>
          )}

          {events.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 px-6 rounded-[20px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center"
              style={{ minHeight: 240 }}
            >
              <p className="font-serif text-[18px] font-medium text-[#1e0f14]">Create an event first</p>
              <p className="text-[14px] font-light text-[#a0888d] mt-1">
                You need an event to book catering for.
              </p>
              <Link
                href={`/events/create?redirect=${encodeURIComponent(`/vendor/${vendorId}/book?packageId=${pkg.id}`)}`}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: CHERRY, boxShadow: "0 4px 16px rgba(109,13,53,0.28)" }}
              >
                Create Event
              </Link>
            </div>
          ) : (
            <>
              <div
                className="p-4 rounded-[20px] border border-primary/10 backdrop-blur-xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.75)", boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
              >
                <label className="block font-serif text-[14px] font-semibold text-[#5c3d47] mb-2">Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-[#fdfaf7] text-[#1e0f14] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  required
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} · {new Date(ev.date).toLocaleDateString()} · {ev.guestCount} guests
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="p-4 rounded-[20px] border border-primary/10 backdrop-blur-xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.75)", boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
              >
                <label className="block font-serif text-[14px] font-semibold text-[#5c3d47] mb-2">Guest count</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={pkg.minGuests ?? 1}
                  max={pkg.maxGuests ?? undefined}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  onBlur={() => {
                    const n = parseInt(guestCount, 10);
                    const minG = pkg.minGuests ?? 1;
                    const maxG = pkg.maxGuests ?? Infinity;
                    if (!isNaN(n)) {
                      if (n < minG) setGuestCount(String(minG));
                      else if (maxG !== Infinity && n > maxG) setGuestCount(String(maxG));
                    } else setGuestCount(String(minG));
                  }}
                  placeholder="e.g. 25"
                  className="w-full h-12 px-4 rounded-xl border border-primary/10 bg-[#fdfaf7] text-[15px] font-medium text-[#1e0f14] placeholder:text-[#9e8085] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                {(pkg.minGuests || pkg.maxGuests) && (
                  <p className="mt-1.5 text-[12px] font-normal text-[#9e8085]">
                    Min {pkg.minGuests ?? 1}
                    {pkg.maxGuests && ` · Max ${pkg.maxGuests} guests`}
                  </p>
                )}
              </div>

              {(() => {
                const count = parseInt(guestCount, 10);
                if (isNaN(count) || count < 1) return null;
                const basePrice = Number(pkg.basePrice);
                const setupFee = Number(pkg.setupFee ?? 0);
                const serviceChargePercent = Number(pkg.serviceChargePercent ?? 0);
                const subtotal = pkg.priceType === "per_person" ? basePrice * count : basePrice;
                const serviceCharges = (subtotal * serviceChargePercent) / 100;
                const totalAmount = subtotal + serviceCharges + setupFee;
                return (
                  <div
                    className="p-4 rounded-[20px] border border-primary/10 backdrop-blur-xl"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.75)", boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
                  >
                    <p className="text-[12px] font-normal text-[#a0888d] mb-3">Estimated total</p>
                    <p className="font-serif text-[22px] font-semibold text-primary">
                      {totalAmount.toFixed(2)} BD
                    </p>
                  </div>
                );
              })()}

              <div
                className="p-4 rounded-[20px] border border-primary/10 backdrop-blur-xl"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.75)", boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
              >
                <label className="block font-serif text-[14px] font-semibold text-[#5c3d47] mb-2">
                  Special requirements (optional)
                </label>
                <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  onBlur={() =>
                    saveBookingDraft({
                      vendorId,
                      packageId: pkg.id,
                      guestCount: parseInt(guestCount, 10) || 1,
                      eventId,
                      specialRequirements,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-primary/10 bg-[#fdfaf7] text-[14px] font-normal text-[#1e0f14] placeholder:text-[#9e8085] resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  placeholder="Dietary needs, allergies, setup preferences..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: CHERRY, boxShadow: "0 4px 16px rgba(109,13,53,0.28)" }}
              >
                {submitting ? "Submitting..." : "Request Booking"}
              </button>
            </>
          )}
        </form>
      </main>
      </div>
    </AppLayout>
  );
}
