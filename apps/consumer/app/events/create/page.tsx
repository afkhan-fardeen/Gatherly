"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  ArrowRight,
  Confetti,
  Briefcase,
  GraduationCap,
  Heart,
  Cake,
  Camera,
  CaretDown,
  Calendar,
  MapPin,
  Users,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { parseApiError, API_URL, getNetworkErrorMessage } from "@/lib/api";
import { compressImage } from "@/lib/compress-image";
import { getEventCreateDraft, saveEventCreateDraft, clearEventCreateDraft } from "@/lib/event-create-draft";
import toast from "react-hot-toast";

const EVENT_TYPE_OPTIONS = [
  { value: "social", label: "Social", Icon: Confetti },
  { value: "corporate", label: "Corporate", Icon: Briefcase },
  { value: "family_gathering", label: "Education", Icon: GraduationCap },
  { value: "wedding", label: "Wedding", Icon: Heart },
  { value: "birthday", label: "Birthday", Icon: Cake },
];

function CreateEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [expanded, setExpanded] = useState<string | null>("details");
  const [authChecked, setAuthChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    eventType: "social",
    date: "",
    timeStart: "",
    timeEnd: "",
    guestCount: 0,
    location: "",
    venueType: "",
    venueName: "",
    specialRequirements: "",
    dietaryRequirements: [] as string[],
    imageUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const token = (localStorage.getItem("token") || "").trim();
    if (!token) {
      router.replace("/login?redirect=/events/create");
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login?redirect=/events/create");
      }
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, [router]);

  useEffect(() => {
    const draft = getEventCreateDraft();
    if (draft) {
      setForm({
        name: draft.name,
        eventType: draft.eventType || "social",
        date: draft.date,
        timeStart: draft.timeStart,
        timeEnd: draft.timeEnd,
        guestCount: draft.guestCount,
        location: draft.location,
        venueType: draft.venueType,
        venueName: draft.venueName,
        specialRequirements: draft.specialRequirements,
        dietaryRequirements: [],
        imageUrl: draft.imageUrl,
      });
    }
  }, []);

  function update(f: Partial<typeof form>) {
    setForm((prev) => {
      const next = { ...prev, ...f };
      saveEventCreateDraft({
        name: next.name,
        eventType: next.eventType,
        date: next.date,
        timeStart: next.timeStart,
        timeEnd: next.timeEnd,
        guestCount: next.guestCount,
        location: next.location,
        venueType: next.venueType,
        venueName: next.venueName,
        specialRequirements: next.specialRequirements,
        imageUrl: next.imageUrl,
      });
      return next;
    });
  }

  function handleSaveDraft() {
    saveEventCreateDraft({
      name: form.name,
      eventType: form.eventType,
      date: form.date,
      timeStart: form.timeStart,
      timeEnd: form.timeEnd,
      guestCount: form.guestCount,
      location: form.location,
      venueType: form.venueType,
      venueName: form.venueName,
      specialRequirements: form.specialRequirements,
      imageUrl: form.imageUrl,
    });
    toast.success("Draft saved");
  }

  function toggleSection(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  const progressSteps = [
    !!form.name.trim(),
    !!form.date,
    !!form.location.trim(),
    form.guestCount > 0,
  ];
  const progressPct = Math.max(10, (progressSteps.filter(Boolean).length / 4) * 100);

  const datePreview = form.date
    ? new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      (form.timeStart ? " · " + formatTime(form.timeStart) : "")
    : "— — —";

  const locationPreview = form.location || "—";
  const guestPreview = form.guestCount > 0 ? `${form.guestCount} guests` : "—";

  function formatTime(t: string) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h || "0", 10) % 12 || 12;
    return `${hr}:${m || "00"} ${parseInt(h || "0", 10) < 12 ? "AM" : "PM"}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          guestCount: form.guestCount || 1,
          location: form.location,
          venueType: form.venueType || undefined,
          venueName: form.venueName || undefined,
          specialRequirements: form.specialRequirements || undefined,
          dietaryRequirements: form.dietaryRequirements,
          ...(form.imageUrl?.trim() && { imageUrl: form.imageUrl.trim() }),
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
      clearEventCreateDraft();
      if (redirectTo?.startsWith("/vendor/") && redirectTo.includes("/book?")) {
        const sep = redirectTo.includes("?") ? "&" : "?";
        router.push(`${redirectTo}${sep}eventId=${data.id}`);
      } else {
        router.push(`/events/${data.id}/services`);
      }
      router.refresh();
    } catch (err) {
      setError(getNetworkErrorMessage(err, "Failed to create event"));
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[#f4ede5] min-h-[40vh]">
          <p className="text-sm font-normal text-[#a0888d]">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav showTopBar={false} fullHeight contentBg="bg-[#f4ede5]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 bg-gradient-to-b from-[#f4ede5] via-[#f4ede5]/95 to-transparent">
          <Link
            href="/events"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fdfaf7] border border-primary/10 text-[#5c3d47] shadow-sm"
          >
            <X size={14} weight="bold" />
          </Link>
          <h1 className="font-serif text-[22px] font-medium text-[#1e0f14] tracking-[-0.3px]">
            New Event
          </h1>
          <button type="button" onClick={handleSaveDraft} className="text-[13px] font-medium text-primary opacity-60 hover:opacity-100 transition-opacity">
            Save draft
          </button>
        </header>

        {/* Progress */}
        <div className="h-0.5 bg-[#ede4da] mx-5 mb-6 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-[#c4435a] rounded-full transition-all duration-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <main
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5"
          style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px) + 2rem)" }}
        >
          <form onSubmit={handleSubmit} id="create-event-form" className="form-no-zoom space-y-6 animate-fade-in-up">
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[2.5px] text-primary mb-1">
                Step 1 of 4
              </div>
              <h2 className="text-[22px] font-medium text-[#1e0f14] tracking-[-0.4px] leading-tight mb-6">
                Tell us about
                <br />
                your <span className="font-normal italic">event</span>
              </h2>
            </div>

            {/* Event name + photo */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block">
                Event Name
              </label>
              <div className="flex gap-2.5 items-center">
                <label className="relative shrink-0 cursor-pointer">
                  <div
                    className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center overflow-hidden transition-colors border-2 border-dashed ${
                      form.imageUrl ? "border-transparent" : "border-primary/15 bg-[#fdfaf7]"
                    }`}
                  >
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={18} weight="regular" className="text-[#a0888d]" />
                    )}
                  </div>
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
                        toast.error("Please sign in");
                        router.push("/login?redirect=/events/create");
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
                          update({ imageUrl: data.url });
                          toast.success("Image added");
                        } else if (res.status === 401) {
                          localStorage.removeItem("token");
                          router.push("/login?redirect=/events/create");
                        } else {
                          toast.error(data?.error || "Upload failed");
                        }
                      } catch {
                        toast.error("Upload failed");
                      } finally {
                        setUploadingImage(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="flex-1 min-w-0 px-4 py-3.5 bg-white border border-primary/20 rounded-2xl text-sm font-normal text-[#1e0f14] placeholder:text-[#a0888d] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Sarah's Birthday"
                  required
                />
              </div>
            </div>

            {/* Event type chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block">
                Event Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPE_OPTIONS.map(({ value, label, Icon }) => {
                  const isSelected = form.eventType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update({ eventType: value })}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-normal transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-primary/7 text-primary shadow-[0_0_0_3px_rgba(109,13,53,0.07)]"
                          : "border-2 border-transparent bg-[#fdfaf7] text-[#5c3d47] hover:border-primary/15 shadow-sm"
                      }`}
                    >
                      <Icon size={15} weight={isSelected ? "fill" : "regular"} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion: Date & Time - Step 2 */}
            <div
              className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden shadow-sm transition-shadow ${
                expanded === "datetime" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
              }`}
            >
              <div className="px-4 pt-3 pb-0">
                <span className="text-[9.5px] font-semibold uppercase tracking-[2.5px] text-primary">Step 2 of 4</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSection("datetime")}
                className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                      expanded === "datetime" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                    }`}
                  >
                    <Calendar size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Date & Time</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">{datePreview}</div>
                  </div>
                </div>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-[#a0888d] transition-transform ${expanded === "datetime" ? "rotate-180" : ""}`}
                />
              </button>
              {expanded === "datetime" && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-primary/10 pt-4">
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update({ date: e.target.value })}
                      placeholder="—"
                      className="w-full h-12 px-4 rounded-2xl text-sm font-normal text-[#1e0f14] bg-white border border-primary/20 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={form.timeStart}
                        onChange={(e) => update({ timeStart: e.target.value })}
                        placeholder="—"
                        className="w-full h-12 px-4 rounded-2xl text-sm font-normal text-[#1e0f14] bg-white border border-primary/20 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={form.timeEnd}
                        onChange={(e) => update({ timeEnd: e.target.value })}
                        placeholder="—"
                        className="w-full h-12 px-4 rounded-2xl text-sm font-normal text-[#1e0f14] bg-white border border-primary/20 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Location - Step 3 */}
            <div
              className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden shadow-sm transition-shadow ${
                expanded === "location" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
              }`}
            >
              <div className="px-4 pt-3 pb-0">
                <span className="text-[9.5px] font-semibold uppercase tracking-[2.5px] text-primary">Step 3 of 4</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSection("location")}
                className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                      expanded === "location" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                    }`}
                  >
                    <MapPin size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Location</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">{locationPreview}</div>
                  </div>
                </div>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-[#a0888d] transition-transform ${expanded === "location" ? "rotate-180" : ""}`}
                />
              </button>
              {expanded === "location" && (
                <div className="px-4 pb-4 animate-fade-in border-t border-primary/10 pt-4">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update({ location: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl text-sm font-normal text-[#1e0f14] bg-white border border-primary/20 placeholder:text-[#a0888d] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 123 Main St"
                    required
                  />
                </div>
              )}
            </div>

            {/* Accordion: Guests & Notes - Step 4 */}
            <div
              className={`bg-[#fdfaf7] border border-primary/10 rounded-[18px] overflow-hidden shadow-sm transition-shadow ${
                expanded === "guests" ? "shadow-[0_4px_20px_rgba(109,13,53,0.08)]" : ""
              }`}
            >
              <div className="px-4 pt-3 pb-0">
                <span className="text-[9.5px] font-semibold uppercase tracking-[2.5px] text-primary">Step 4 of 4</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSection("guests")}
                className="w-full flex items-center justify-between py-4 px-4 hover:bg-primary/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                      expanded === "guests" ? "bg-primary text-white" : "bg-primary/7 text-primary"
                    }`}
                  >
                    <Users size={16} weight="regular" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14.5px] font-medium text-[#1e0f14]">Guests & Notes</div>
                    <div className="text-[11.5px] font-light text-[#a0888d] mt-0.5">{guestPreview}</div>
                  </div>
                </div>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-[#a0888d] transition-transform ${expanded === "guests" ? "rotate-180" : ""}`}
                />
              </button>
              {expanded === "guests" && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-primary/10 pt-4">
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block mb-2">
                      Expected Guests
                    </label>
                    <div className="flex items-center justify-between bg-[#f4ede5] rounded-xl py-2.5 px-3.5">
                      <span className="text-[13px] font-normal text-[#5c3d47]">Number of guests</span>
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => update({ guestCount: Math.max(0, form.guestCount - 5) })}
                          className="w-[30px] h-[30px] rounded-full border border-primary/10 bg-[#fdfaf7] flex items-center justify-center text-primary text-lg font-light hover:bg-primary/7 hover:border-primary/20 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-[22px] font-medium text-[#1e0f14] min-w-[28px] text-center">
                          {form.guestCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => update({ guestCount: form.guestCount + 5 })}
                          className="w-[30px] h-[30px] rounded-full border border-primary/10 bg-[#fdfaf7] flex items-center justify-center text-primary text-lg font-light hover:bg-primary/7 hover:border-primary/20 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#a0888d] block mb-2">
                      Notes
                    </label>
                    <textarea
                      value={form.specialRequirements}
                      onChange={(e) => update({ specialRequirements: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/20 rounded-2xl text-sm font-normal text-[#1e0f14] placeholder:text-[#a0888d] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none h-20 leading-relaxed"
                      placeholder="Any additional details or special requests…"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600 animate-fade-in">{error}</p>}

            {/* Create Event button - below Guests & Notes, above bottom nav */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 rounded-2xl bg-primary text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(109,13,53,0.3)] hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Create Event
              <ArrowRight size={16} weight="bold" />
            </button>
          </form>
        </main>
      </div>
    </AppLayout>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex-1 flex items-center justify-center bg-[#f4ede5] min-h-[40vh]">
            <p className="text-sm font-normal text-[#a0888d]">Loading...</p>
          </div>
        </AppLayout>
      }
    >
      <CreateEventContent />
    </Suspense>
  );
}
