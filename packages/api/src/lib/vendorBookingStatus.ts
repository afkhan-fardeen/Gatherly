import { httpError } from "./httpError.js";

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_preparation", "cancelled"],
  in_preparation: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

/**
 * Validates vendor-driven booking status changes.
 * `in_preparation` requires the customer to have paid (matches vendor dashboard UI).
 */
export function assertVendorBookingStatusTransition(
  current: string,
  next: string,
  paymentStatus: string | null
): void {
  const allowed = TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw httpError(400, `Cannot change status from "${current}" to "${next}"`);
  }
  if (next === "in_preparation" && paymentStatus !== "paid") {
    throw httpError(400, "Customer must pay before you can start preparation.");
  }
}
