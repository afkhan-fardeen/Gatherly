/** Shared booking status labels and badge styles for list + detail views. */

const LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_preparation: "In preparation",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatBookingStatus(status: string): string {
  return LABELS[status] ?? status.replace(/_/g, " ");
}

/** Badge classes for list/dashboard cards (uppercase text via `uppercase` in UI). */
export function bookingStatusBadgeClass(status: string): string {
  const base = "inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase";
  switch (status) {
    case "confirmed":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "pending":
      return `${base} bg-amber-100 text-amber-700`;
    case "in_preparation":
    case "delivered":
      return `${base} bg-blue-100 text-blue-700`;
    case "completed":
      return `${base} bg-slate-200 text-slate-600`;
    case "cancelled":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-slate-100 text-slate-500`;
  }
}
