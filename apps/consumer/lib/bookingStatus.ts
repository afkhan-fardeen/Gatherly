export const ORDER_STEPS = [
  { status: "pending", label: "Request sent" },
  { status: "confirmed", label: "Confirmed" },
  { payment: true, label: "Paid" },
  { status: "in_preparation", label: "In preparation" },
  { status: "delivered", label: "Delivered" },
  { status: "completed", label: "Completed" },
] as const;

export function getCurrentStepIndex(status: string, paymentStatus: string | null): number {
  if (status === "cancelled") return -1;
  const paid = (paymentStatus || "unpaid") === "paid";
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return paid ? 2 : 1;
    case "in_preparation":
      return 3;
    case "delivered":
      return 4;
    case "completed":
      return 5;
    default:
      return 0;
  }
}

export function getBookingStatusLine(status: string, paymentStatus: string | null): string {
  if (status === "cancelled") return "Cancelled";
  if (status === "pending") return "Request sent";
  if (status === "confirmed") {
    return (paymentStatus || "unpaid") === "paid" ? "Confirmed · Paid" : "Confirmed · Awaiting payment";
  }
  if (status === "in_preparation") return "In preparation";
  if (status === "delivered") return "Delivered";
  if (status === "completed") return "Completed";
  return status.replace(/_/g, " ");
}
