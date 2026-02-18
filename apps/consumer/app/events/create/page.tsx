"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ArrowRight,
  Confetti,
  Briefcase,
  GraduationCap,
  DotsThree,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { parseApiError } from "@/lib/api";
import {
  CHERRY,
  ROUND,
  INPUT_CLASS,
  BUTTON_CLASS,
  LABEL_CLASS,
  TYPO,
} from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Social", subtitle: "Parties, Weddings", Icon: Confetti },
  { value: "corporate", label: "Corporate", subtitle: "Meetings, Gala", Icon: Briefcase },
  { value: "family_gathering", label: "Education", subtitle: "Workshops, Class", Icon: GraduationCap },
  { value: "other", label: "Other", subtitle: "Custom Category", Icon: DotsThree },
];

const STEPS = ["Basic", "Location", "Guests", "Review"];

export default function CreateEventPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
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
      (e.target as HTMLButtonElement)?.blur();
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
        throw new Error(parseApiError(data) || "Failed to create event");
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
    <AppLayout showNav={true} showTopBar={false} fullHeight>
      <div className="flex flex-col flex-1 min-h-0 bg-[#FAFAFA]">
        {/* Header - fixed, no scroll */}
        <header
          className="shrink-0 px-6 pb-4 bg-[#FAFAFA]"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/events"
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-full"
            >
              <X size={20} weight="bold" className="text-slate-600" />
            </Link>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Step {step + 1} of {STEPS.length}
            </h2>
            <div className="w-10" />
          </div>
          <div className={`w-full h-1.5 bg-slate-200 overflow-hidden ${ROUND}`}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                backgroundColor: CHERRY,
              }}
            />
          </div>
        </header>

        {/* Main - single scroll area */}
        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pt-6"
        >
          <div className="mb-8">
            <h1 className={`${TYPO.H1_LARGE} text-slate-900 mb-1`}>
              Create New Event
            </h1>
            <p className={TYPO.SUBTEXT}>
              {step === 0
                ? "Let's start with the basics. What are you planning?"
                : step === 1
                  ? "Where will your event take place?"
                  : step === 2
                    ? "How many guests are you expecting?"
                    : "Review your event details before creating."}
            </p>
          </div>

          <form onSubmit={handleSubmit} id="create-event-form" className="space-y-6 pb-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <label className={LABEL_CLASS} htmlFor="event-title">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className={INPUT_CLASS}
                    placeholder="e.g. Summer Gala 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={LABEL_CLASS}>Event Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EVENT_TYPE_OPTIONS.map(({ value, label, subtitle, Icon }) => {
                      const isSelected = form.eventType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update({ eventType: value })}
                          className={`flex items-center p-3 text-left transition-all border-2 ${ROUND} ${
                            isSelected ? "bg-white" : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                          style={{
                            borderColor: isSelected ? CHERRY : undefined,
                            backgroundColor: isSelected ? `${CHERRY}0D` : undefined,
                          }}
                        >
                          <div
                            className={`w-9 h-9 shrink-0 flex items-center justify-center mr-3 ${ROUND} ${
                              isSelected ? "text-white" : "bg-slate-100 text-slate-500"
                            }`}
                            style={isSelected ? { backgroundColor: CHERRY } : undefined}
                          >
                            <Icon size={18} weight="regular" />
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`block font-bold text-sm truncate ${isSelected ? "" : "text-slate-700"}`}
                              style={isSelected ? { color: CHERRY } : undefined}
                            >
                              {label}
                            </span>
                            <span className="block text-[10px] text-slate-500 truncate">
                              {subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={LABEL_CLASS} htmlFor="event-date">
                    Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => update({ date: e.target.value })}
                    className={INPUT_CLASS}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className={LABEL_CLASS} htmlFor="start-time">
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      value={form.timeStart}
                      onChange={(e) => update({ timeStart: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={LABEL_CLASS} htmlFor="end-time">
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      value={form.timeEnd}
                      onChange={(e) => update({ timeEnd: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className={LABEL_CLASS} htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(e) => update({ location: e.target.value })}
                    className={INPUT_CLASS}
                    placeholder="Address or venue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={LABEL_CLASS}>Venue Type</label>
                  <select
                    value={form.venueType}
                    onChange={(e) => update({ venueType: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="">Select</option>
                    <option value="home">Home</option>
                    <option value="external">External Venue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={LABEL_CLASS} htmlFor="venue-name">
                    Venue Name
                  </label>
                  <input
                    id="venue-name"
                    type="text"
                    value={form.venueName}
                    onChange={(e) => update({ venueName: e.target.value })}
                    className={INPUT_CLASS}
                    placeholder="e.g. Grand Ballroom"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label className={LABEL_CLASS} htmlFor="guest-count">
                    Guest Count
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    min={1}
                    value={form.guestCount}
                    onChange={(e) =>
                      update({ guestCount: parseInt(e.target.value) || 1 })
                    }
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={LABEL_CLASS}>Special Requirements</label>
                  <textarea
                    value={form.specialRequirements}
                    onChange={(e) =>
                      update({ specialRequirements: e.target.value })
                    }
                    className={`${INPUT_CLASS} min-h-[100px] py-3 resize-none`}
                    placeholder="Dietary needs, setup preferences..."
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div
                className={`space-y-3 text-sm bg-white border border-slate-200 p-5 ${ROUND}`}
              >
                <p><span className="text-slate-500">Event:</span> {form.name}</p>
                <p>
                  <span className="text-slate-500">Type:</span>{" "}
                  {EVENT_TYPE_OPTIONS.find((o) => o.value === form.eventType)?.label ??
                    form.eventType.replace(/_/g, " ")}
                </p>
                <p>
                  <span className="text-slate-500">Date:</span>{" "}
                  {form.date ? new Date(form.date).toLocaleDateString() : "—"}
                </p>
                <p>
                  <span className="text-slate-500">Location:</span>{" "}
                  {form.location || "—"}
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

            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </main>

        {/* Footer - fixed, no scroll */}
        <footer
          className="shrink-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-100"
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
          }}
        >
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
              className={BUTTON_CLASS}
              style={{
                backgroundColor: CHERRY,
                boxShadow: `${CHERRY}33 0 8px 24px`,
              }}
            >
              <span>
                {loading
                  ? "Creating..."
                  : step < STEPS.length - 1
                    ? "Continue"
                    : "Create Event"}
              </span>
              <ArrowRight size={20} weight="bold" />
            </button>
          </form>
          <p className={`${TYPO.CAPTION} text-center mt-3`}>
            You can edit these details later in the event settings.
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
