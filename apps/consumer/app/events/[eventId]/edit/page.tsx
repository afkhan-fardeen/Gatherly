"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Confetti,
  Briefcase,
  GraduationCap,
  DotsThree,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import {
  CHERRY,
  ROUND,
  INPUT_CLASS,
  BUTTON_CLASS,
  LABEL_CLASS,
  TYPO,
} from "@/lib/events-ui";
import { parseApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Social", subtitle: "Parties, Weddings", Icon: Confetti },
  { value: "corporate", label: "Corporate", subtitle: "Meetings, Gala", Icon: Briefcase },
  { value: "family_gathering", label: "Education", subtitle: "Workshops, Class", Icon: GraduationCap },
  { value: "other", label: "Other", subtitle: "Custom Category", Icon: DotsThree },
];

function formatDateForInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatTimeForInput(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((ev) => {
        if (ev) {
          setForm({
            name: ev.name || "",
            eventType: ev.eventType || "",
            date: formatDateForInput(new Date(ev.date)),
            timeStart: ev.timeStart ? formatTimeForInput(new Date(ev.timeStart)) : "",
            timeEnd: ev.timeEnd ? formatTimeForInput(new Date(ev.timeEnd)) : "",
            guestCount: ev.guestCount || 20,
            location: ev.location || "",
            venueType: ev.venueType || "",
            venueName: ev.venueName || "",
            specialRequirements: ev.specialRequirements || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "PUT",
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseApiError(data) || "Update failed");
      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <p className="text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${eventId}`}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full"
            >
              <ArrowLeft size={18} weight="regular" className="text-slate-600" />
            </Link>
            <h1 className={TYPO.H1} style={{ color: CHERRY }}>
              Edit Event
            </h1>
          </div>
        </header>

        <main className="p-6 pb-32">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className={`p-4 bg-red-50 border border-red-100 ${ROUND}`}
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="name">
                Event Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={INPUT_CLASS}
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
                      onClick={() => setForm((f) => ({ ...f, eventType: value }))}
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
              <label className={LABEL_CLASS} htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className={LABEL_CLASS} htmlFor="timeStart">
                  Start Time
                </label>
                <input
                  id="timeStart"
                  type="time"
                  value={form.timeStart}
                  onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-2">
                <label className={LABEL_CLASS} htmlFor="timeEnd">
                  End Time
                </label>
                <input
                  id="timeEnd"
                  type="time"
                  value={form.timeEnd}
                  onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="guestCount">
                Guest Count
              </label>
              <input
                id="guestCount"
                type="number"
                min={1}
                value={form.guestCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestCount: parseInt(e.target.value) || 1 }))
                }
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="location">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="venueName">
                Venue Name
              </label>
              <input
                id="venueName"
                type="text"
                value={form.venueName}
                onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
                className={INPUT_CLASS}
                placeholder="e.g. Grand Ballroom"
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS}>Special Requirements</label>
              <textarea
                value={form.specialRequirements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialRequirements: e.target.value }))
                }
                className={`${INPUT_CLASS} min-h-[100px] py-3 resize-none`}
                placeholder="Dietary needs, setup preferences..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={BUTTON_CLASS}
              style={{
                backgroundColor: CHERRY,
                boxShadow: `${CHERRY}33 0 8px 24px`,
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </main>
      </div>
    </AppLayout>
  );
}
