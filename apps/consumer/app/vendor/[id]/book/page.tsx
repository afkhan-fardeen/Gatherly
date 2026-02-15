"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      router.push(`/login?redirect=/vendor/${vendorId}/book${packageId ? `?packageId=${packageId}` : ""}`);
      return;
    }
    if (!packageId) {
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
        if (found && evs?.length > 0) {
          const preferred = eventIdFromUrl
            ? evs.find((e: Event) => e.id === eventIdFromUrl)
            : null;
          const ev = preferred || evs[0];
          setEventId(ev.id);
          setGuestCount(String(ev.guestCount));
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [vendorId, packageId, eventIdFromUrl, router]);

  useEffect(() => {
    if (eventId && events.length > 0) {
      const ev = events.find((e) => e.id === eventId);
      if (ev) setGuestCount(String(ev.guestCount));
    }
  }, [eventId, events]);

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
      if (!res.ok) throw new Error(data.error || "Booking failed");
      toast.success("Booking request sent!");
      router.push("/bookings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!packageId || !pkg || !vendor) {
    return (
      <AppLayout>
        <div className="p-6">
          <Link
            href={vendor ? `/vendor/${vendorId}` : "/services/catering"}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary"
          >
            <ArrowLeft size={18} />
            {vendor ? "Back to vendor" : "Back to catering"}
          </Link>
          <p className="mt-4 text-red-600">{error || "Package not found"}</p>
          {error?.includes("Vendor not found") && (
            <p className="mt-2 text-sm text-slate-500">
              This vendor may no longer be available. Try browsing other caterers.
            </p>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/vendor/${vendorId}`}
            className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} weight="regular" className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Request Booking</h1>
            <p className="text-slate-500 text-xs">{vendor.businessName} · {pkg.name}</p>
          </div>
        </div>
      </header>

      <main className="p-6 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-none bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          {events.length === 0 ? (
            <div className="p-6 rounded-none border border-slate-200 bg-slate-50 text-center">
              <p className="text-slate-600 font-medium">Create an event first</p>
              <p className="text-slate-500 text-sm mt-1">You need an event to book catering for.</p>
              <Link
                href="/events/create"
                className="inline-block mt-4 px-5 py-2.5 bg-primary text-white font-semibold rounded-none"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full h-12 px-4 rounded-none border border-slate-200 bg-white text-slate-900"
                  required
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} · {new Date(ev.date).toLocaleDateString()} · {ev.guestCount} guests
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Guest count</label>
                <input
                  type="number"
                  min={pkg.minGuests ?? 1}
                  max={pkg.maxGuests ?? undefined}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full h-12 px-4 rounded-none border border-slate-200 bg-white text-slate-900"
                  required
                />
                {(pkg.minGuests || pkg.maxGuests) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {pkg.minGuests && `Min ${pkg.minGuests}`}
                    {pkg.minGuests && pkg.maxGuests && " · "}
                    {pkg.maxGuests && `Max ${pkg.maxGuests} guests`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special requirements (optional)
                </label>
                <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-slate-900 resize-none"
                  placeholder="Dietary needs, allergies, setup preferences..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-none bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Request Booking"}
              </button>
            </>
          )}
        </form>
      </main>
    </AppLayout>
  );
}
