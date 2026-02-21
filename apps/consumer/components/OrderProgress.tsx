"use client";

import { getBookingStatusLine } from "@/lib/bookingStatus";
import { getBookingStatusStyle } from "@/components/ui/Tag";

interface OrderProgressProps {
  status: string;
  paymentStatus: string | null;
}

function getProgressStyle(status: string, paymentStatus: string | null): string {
  if (status === "confirmed" && (paymentStatus || "unpaid") !== "paid") {
    return "bg-amber-100 text-amber-800";
  }
  return getBookingStatusStyle(status);
}

export function OrderProgress({ status, paymentStatus }: OrderProgressProps) {
  if (status === "cancelled") return null;

  const label = getBookingStatusLine(status, paymentStatus);
  const style = getProgressStyle(status, paymentStatus);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Current status
      </h3>
      <span
        className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wide ${style}`}
      >
        {label}
      </span>
    </div>
  );
}
