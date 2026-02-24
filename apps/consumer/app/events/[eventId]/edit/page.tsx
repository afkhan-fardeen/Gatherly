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
  Camera,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import {
  ROUND,
  INPUT,
  BUTTON,
  TYPO,
} from "@/lib/events-ui";
import { parseApiError, API_URL } from "@/lib/api";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/compress-image";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Social", subtitle: "Parties, Weddings", Icon: Confetti },
  { value: "corporate", label: "Corporate", subtitle: "Meetings, Gala", Icon: Briefcase },
  { value: "family_gathering", label: "Education", subtitle: "Workshops, Class", Icon: GraduationCap },
  { value: "other", label: "Other", subtitle: "Custom Category", Icon: DotsThree },
];

import { formatDateForInput, formatTimeForInput } from "@/lib/date-utils";

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
    imageUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

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
            imageUrl: ev.imageUrl || "",
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
          imageUrl: form.imageUrl || undefined,
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
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
          <p className={TYPO.SUBTEXT}>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-[var(--bg-app)] min-h-full pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${eventId}`}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-slate-200 rounded-full text-text-primary"
            >
              <ArrowLeft size={22} weight="regular" />
            </Link>
            <h1 className={`${TYPO.H1} text-text-primary`}>
              Edit event
            </h1>
          </div>
        </header>

        <main className="p-6">
          <form onSubmit={handleSubmit} className="form-no-zoom space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Event image <span className="text-text-tertiary font-normal">(optional)</span></label>
              <div className="relative">
                <div
                  className={`w-full h-32 ${ROUND} border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50`}
                >
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="Event" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-sm">No image</span>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-primary cursor-pointer transition-opacity hover:opacity-90">
                  <Camera size={14} weight="regular" className="inline mr-1" />
                  {uploadingImage ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const token = (localStorage.getItem("token") || "").trim();
                      if (!token) {
                        toast.error("Please sign in to upload images");
                        router.push(`/login?redirect=/events/${eventId}/edit`);
                        return;
                      }
                      setUploadingImage(true);
                      try {
                        const compressed = await compressImage(file).catch(() => file);
                        const fd = new FormData();
                        fd.append("file", compressed);
                        const res = await fetch(`${API_URL}/api/upload/image?folder=events`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                          body: fd,
                        });
                        const data = await res.json().catch(() => ({}));
                        if (res.ok && data.url) {
                          setForm((f) => ({ ...f, imageUrl: data.url }));
                          const patchRes = await fetch(`${API_URL}/api/events/${eventId}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ imageUrl: data.url }),
                          });
                          if (patchRes.ok) {
                            toast.success("Image saved");
                          } else {
                            toast.error("Image uploaded but save failed");
                          }
                        } else if (res.status === 401) {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          toast.error("Session expired. Please sign in again.");
                          router.push(`/login?redirect=/events/${eventId}/edit`);
                        } else {
                          toast.error(data?.error || "Upload failed");
                        }
                      } finally {
                        setUploadingImage(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="name">Event name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={INPUT.PRIMARY}
                required
              />
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Event type</label>
              <div className="grid grid-cols-2 gap-3">
                {EVENT_TYPE_OPTIONS.map(({ value, label, subtitle, Icon }) => {
                  const isSelected = form.eventType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, eventType: value }))}
                      className={`flex items-center p-3 text-left transition-all border-2 rounded-2xl ${
                        isSelected ? "border-primary bg-primary/10" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center mr-3 rounded-xl ${
                          isSelected ? "bg-primary text-white" : "bg-slate-100 text-text-tertiary"
                        }`}
                      >
                        <Icon size={18} weight="regular" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`block font-bold text-sm truncate ${isSelected ? "text-primary" : "text-text-primary"}`}
                        >
                          {label}
                        </span>
                        <span className={`block text-[10px] truncate ${TYPO.CAPTION}`}>
                          {subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="timeStart">Start time</label>
                <input
                  id="timeStart"
                  type="time"
                  value={form.timeStart}
                  onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))}
                  className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="timeEnd">End time</label>
                <input
                  id="timeEnd"
                  type="time"
                  value={form.timeEnd}
                  onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))}
                  className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="guestCount">Guests</label>
              <input
                id="guestCount"
                type="number"
                min={1}
                max={9999}
                value={form.guestCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!e.target.value) setForm((f) => ({ ...f, guestCount: 1 }));
                  else if (!isNaN(val)) setForm((f) => ({ ...f, guestCount: Math.max(1, Math.min(9999, val)) }));
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 1) setForm((f) => ({ ...f, guestCount: 1 }));
                  else if (val > 9999) setForm((f) => ({ ...f, guestCount: 9999 }));
                }}
                className={INPUT.PRIMARY}
                required
              />
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={INPUT.PRIMARY}
                required
              />
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`} htmlFor="venueName">Venue name <span className="text-text-tertiary font-normal">(optional)</span></label>
              <input
                id="venueName"
                type="text"
                value={form.venueName}
                onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
                className={INPUT.PRIMARY}
                placeholder="e.g. Grand Ballroom"
              />
            </div>

            <div>
              <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Special requirements <span className="text-text-tertiary font-normal">(optional)</span></label>
              <textarea
                value={form.specialRequirements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialRequirements: e.target.value }))
                }
                className={INPUT.TEXTAREA}
                placeholder="Dietary needs, setup preferences..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`${BUTTON.PRIMARY} mb-4`}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </main>
      </div>
    </AppLayout>
  );
}
