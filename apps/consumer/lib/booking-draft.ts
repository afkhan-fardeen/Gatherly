const STORAGE_KEY = "gatherly_booking_draft";

export interface BookingDraft {
  vendorId: string;
  packageId: string;
  guestCount: number;
  eventId?: string;
  specialRequirements?: string;
  updatedAt: string;
}

export function getBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    return parsed.vendorId && parsed.packageId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBookingDraft(
  draft: Partial<BookingDraft> & { vendorId: string; packageId: string }
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getBookingDraft();
    const merged: BookingDraft = {
      vendorId: draft.vendorId,
      packageId: draft.packageId,
      guestCount: draft.guestCount ?? existing?.guestCount ?? 1,
      eventId: draft.eventId ?? existing?.eventId,
      specialRequirements: draft.specialRequirements ?? existing?.specialRequirements,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function draftMatchesVendorPackage(
  vendorId: string,
  packageId: string
): boolean {
  const draft = getBookingDraft();
  return draft !== null && draft.vendorId === vendorId && draft.packageId === packageId;
}
