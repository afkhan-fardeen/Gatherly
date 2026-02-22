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
  DotsThree,
  Camera,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { parseApiError, API_URL, getNetworkErrorMessage } from "@/lib/api";
import { compressImage } from "@/lib/compress-image";
import toast from "react-hot-toast";
import { INPUT, BUTTON, TYPO } from "@/lib/events-ui";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Social", Icon: Confetti },
  { value: "corporate", label: "Corporate", Icon: Briefcase },
  { value: "family_gathering", label: "Education", Icon: GraduationCap },
  { value: "other", label: "Other", Icon: DotsThree },
];

function CreateEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [expanded, setExpanded] = useState<string | null>("details");
  const [authChecked, setAuthChecked] = useState(false);

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
    imageUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
  }

  function toggleSection(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
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
          guestCount: form.guestCount,
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
      if (redirectTo?.startsWith("/vendor/") && redirectTo.includes("/book?")) {
        const sep = redirectTo.includes("?") ? "&" : "?";
        router.push(`${redirectTo}${sep}eventId=${data.id}`);
      } else {
        router.push(`/events/${data.id}`);
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
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
          <p className={TYPO.SUBTEXT}>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav showTopBar={false} fullHeight>
      <div className="flex flex-col flex-1 min-h-0 bg-[var(--bg-app)]">
        <header className="shrink-0 px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className={`${BUTTON.ICON} bg-white border border-slate-200 text-text-secondary hover:bg-slate-50`}
            >
              <X size={22} weight="bold" />
            </Link>
            <h1 className={`${TYPO.H1} text-text-primary`}>New event</h1>
            <div className="w-11" />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pb-6">
          <form onSubmit={handleSubmit} id="create-event-form" className="form-no-zoom space-y-2 pb-6">
            {/* Accordion: Event details */}
            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("details")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className={TYPO.H3}>Event details</span>
                {expanded === "details" ? (
                  <CaretUp size={20} weight="bold" className="text-text-tertiary" />
                ) : (
                  <CaretDown size={20} weight="bold" className="text-text-tertiary" />
                )}
              </button>
              {expanded === "details" && (
                <div className="pb-4 space-y-4 animate-fade-in">
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Event name</label>
                    <div className="flex gap-4 items-center">
                      <label className="relative shrink-0 cursor-pointer">
                        <div
                          className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                            form.imageUrl ? "border-transparent" : "border-slate-300 bg-slate-50"
                          }`}
                        >
                          {form.imageUrl ? (
                            <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={20} weight="regular" className="text-text-tertiary" />
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
                        className={`${INPUT.PRIMARY} flex-1 min-w-0`}
                        placeholder="e.g. Sarah's Birthday"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Event type</label>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {EVENT_TYPE_OPTIONS.map(({ value, label, Icon }) => {
                        const isSelected = form.eventType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update({ eventType: value })}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0 transition-all ${
                              isSelected ? "bg-primary text-white" : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                            }`}
                          >
                            <Icon size={18} weight={isSelected ? "fill" : "regular"} />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Date & time */}
            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("datetime")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className={TYPO.H3}>Date & time</span>
                {expanded === "datetime" ? (
                  <CaretUp size={20} weight="bold" className="text-text-tertiary" />
                ) : (
                  <CaretDown size={20} weight="bold" className="text-text-tertiary" />
                )}
              </button>
              {expanded === "datetime" && (
                <div className="pb-4 space-y-4 animate-fade-in">
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Date</label>
                    <label className="block relative">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update({ date: e.target.value })}
                        className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white text-text-primary text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                        required
                      />
                      {!form.date && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                          Select date
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Start time</label>
                      <label className="block relative">
                        <input
                          type="time"
                          value={form.timeStart}
                          onChange={(e) => update({ timeStart: e.target.value })}
                          className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white text-text-primary text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                        />
                        {!form.timeStart && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                            e.g. 6:00 PM
                          </span>
                        )}
                      </label>
                    </div>
                    <div>
                      <label className={`${TYPO.FORM_LABEL} mb-2 block`}>End time</label>
                      <label className="block relative">
                        <input
                          type="time"
                          value={form.timeEnd}
                          onChange={(e) => update({ timeEnd: e.target.value })}
                          className="input-date-time w-full h-12 rounded-xl border border-slate-200 bg-white text-text-primary text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                        />
                        {!form.timeEnd && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                            e.g. 10:00 PM
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Location */}
            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("location")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className={TYPO.H3}>Location</span>
                {expanded === "location" ? (
                  <CaretUp size={20} weight="bold" className="text-text-tertiary" />
                ) : (
                  <CaretDown size={20} weight="bold" className="text-text-tertiary" />
                )}
              </button>
              {expanded === "location" && (
                <div className="pb-4 space-y-4 animate-fade-in">
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Address or venue</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => update({ location: e.target.value })}
                      className={INPUT.PRIMARY}
                      placeholder="e.g. 123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Venue type</label>
                    <select
                      value={form.venueType}
                      onChange={(e) => update({ venueType: e.target.value })}
                      className={INPUT.PRIMARY}
                    >
                      <option value="">Select</option>
                      <option value="home">Home</option>
                      <option value="external">External Venue</option>
                    </select>
                  </div>
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Venue name <span className="text-text-tertiary font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={form.venueName}
                      onChange={(e) => update({ venueName: e.target.value })}
                      className={INPUT.PRIMARY}
                      placeholder="e.g. Hilton Downtown"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Guests & notes */}
            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleSection("guests")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className={TYPO.H3}>Guests & notes</span>
                {expanded === "guests" ? (
                  <CaretUp size={20} weight="bold" className="text-text-tertiary" />
                ) : (
                  <CaretDown size={20} weight="bold" className="text-text-tertiary" />
                )}
              </button>
              {expanded === "guests" && (
                <div className="pb-4 space-y-4 animate-fade-in">
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Number of guests</label>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={form.guestCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!e.target.value) update({ guestCount: 1 });
                        else if (!isNaN(val)) update({ guestCount: Math.max(1, Math.min(9999, val)) });
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) update({ guestCount: 1 });
                        else if (val > 9999) update({ guestCount: 9999 });
                      }}
                      className={INPUT.PRIMARY}
                      required
                    />
                    <p className={`${TYPO.CAPTION} mt-1 text-text-tertiary`}>
                      Vendors have min/max capacity. This helps match you with suitable caterers.
                    </p>
                  </div>
                  <div>
                    <label className={`${TYPO.FORM_LABEL} mb-2 block`}>Special notes <span className="text-text-tertiary font-normal">(optional)</span></label>
                    <textarea
                      value={form.specialRequirements}
                      onChange={(e) => update({ specialRequirements: e.target.value })}
                      className={INPUT.TEXTAREA}
                      placeholder="Dietary needs, setup preferences..."
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600 animate-fade-in">{error}</p>}

            {/* Create event button — just after Guests & notes */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-6 px-6 rounded-full font-medium text-white bg-primary shadow-elevation-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <span>{loading ? "Creating..." : "Create event"}</span>
              <ArrowRight size={22} weight="bold" />
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
          <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
            <p className={TYPO.SUBTEXT}>Loading...</p>
          </div>
        </AppLayout>
      }
    >
      <CreateEventContent />
    </Suspense>
  );
}
