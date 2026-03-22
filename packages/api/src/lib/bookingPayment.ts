import { prisma } from "./prisma.js";
import { httpError } from "./httpError.js";

/** Blocks checkout while any non-cancelled booking for the event is still pending vendor acceptance. */
export async function assertNoPendingBookingsForEvent(eventId: string, userId: string): Promise<void> {
  const rows = await prisma.booking.findMany({
    where: { eventId, userId, status: { not: "cancelled" } },
    select: { status: true },
  });
  if (rows.some((b) => b.status === "pending")) {
    throw httpError(400, "All vendors must accept before payment. Some bookings are still pending.");
  }
}

/** Initial dummy payment: only **confirmed** + **unpaid** (same rule for single-booking pay and event cart pay). */
export function assertBookingEligibleForInitialPayment(booking: {
  status: string;
  paymentStatus: string | null;
}): void {
  if (booking.paymentStatus === "paid") {
    throw httpError(400, "Booking is already paid");
  }
  if (booking.status !== "confirmed") {
    throw httpError(400, "Only confirmed unpaid bookings can be paid");
  }
}
