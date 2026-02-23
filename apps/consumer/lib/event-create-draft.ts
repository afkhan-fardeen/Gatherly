const STORAGE_KEY = "gatherly_event_create_draft";

export interface EventCreateDraft {
  name: string;
  eventType: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  guestCount: number;
  location: string;
  venueType: string;
  venueName: string;
  specialRequirements: string;
  imageUrl: string;
  updatedAt: string;
}

const DEFAULT: Omit<EventCreateDraft, "updatedAt"> = {
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
  imageUrl: "",
};

export function getEventCreateDraft(): EventCreateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EventCreateDraft;
    return parsed.updatedAt ? parsed : null;
  } catch {
    return null;
  }
}

export function saveEventCreateDraft(draft: Partial<EventCreateDraft>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getEventCreateDraft();
    const merged: EventCreateDraft = {
      ...DEFAULT,
      ...existing,
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearEventCreateDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
