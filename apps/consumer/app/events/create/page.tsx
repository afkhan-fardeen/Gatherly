"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const EVENT_TYPES = [
  "birthday",
  "anniversary",
  "corporate",
  "wedding",
  "engagement",
  "family_gathering",
  "other",
];

const STEPS = ["Basic", "Location", "Guests", "Review"];

export default function CreateEventPage() {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    eventType: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    guestCount: 20,
    location: "",
    venueType: "",
    venueName: "",
    specialRequirements: "",
    dietaryRequirements: [] as string[],
  });

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          eventType: form.eventType,
          date: form.date,
          timeStart: form.timeStart || undefined,
          timeEnd: form.timeEnd || undefined,
          guestCount: form.guestCount,
          location: form.location,
          venueType: form.venueType || undefined,
          venueName: form.venueName || undefined,
          specialRequirements: form.specialRequirements || undefined,
          dietaryRequirements: form.dietaryRequirements,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to create event");
      }
      router.push(`/events/${data.id}/guests`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout showNav={false}>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          {step === 0 ? (
            <Link
              href="/events"
              className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} weight="regular" className="text-slate-600" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} weight="regular" className="text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Create Event
            </h1>
            <p className="text-slate-500 text-xs">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-md ${
                i <= step ? "bg-primary" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="p-6 flex-1 overflow-y-auto">
        <div ref={formTopRef} />
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Smith Wedding Reception"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Event Type *
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) => update({ eventType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                >
                  <option value="">Select type</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update({ date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none min-h-[44px]"
                  required
                />
              </div>
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.timeStart}
                    onChange={(e) => update({ timeStart: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.timeEnd}
                    onChange={(e) => update({ timeEnd: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none min-h-[44px]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update({ location: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Address or venue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Venue Type
                </label>
                <select
                  value={form.venueType}
                  onChange={(e) => update({ venueType: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Select</option>
                  <option value="home">Home</option>
                  <option value="external">External Venue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={form.venueName}
                  onChange={(e) => update({ venueName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Grand Ballroom"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Guest Count *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.guestCount}
                  onChange={(e) =>
                    update({ guestCount: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4 text-sm">
              <p>
                <span className="text-slate-500">Event:</span> {form.name}
              </p>
              <p>
                <span className="text-slate-500">Type:</span>{" "}
                {form.eventType.replace(/_/g, " ")}
              </p>
              <p>
                <span className="text-slate-500">Date:</span>{" "}
                {form.date && new Date(form.date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-slate-500">Location:</span> {form.location}
              </p>
              <p>
                <span className="text-slate-500">Guests:</span> {form.guestCount}
              </p>
              {form.specialRequirements && (
                <p>
                  <span className="text-slate-500">Notes:</span>{" "}
                  {form.specialRequirements}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Special Requirements
              </label>
              <textarea
                value={form.specialRequirements}
                onChange={(e) =>
                  update({ specialRequirements: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                placeholder="Dietary needs, setup preferences..."
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : step < STEPS.length - 1
              ? "Next"
              : "Create Event"}
          </button>
        </form>
      </main>
    </AppLayout>
  );
}
