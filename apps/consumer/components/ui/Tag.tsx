"use client";

const TAG_PALETTE = [
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-teal-100 text-teal-800",
] as const;

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTagColor(value: string): string {
  const i = hashString(value) % TAG_PALETTE.length;
  return TAG_PALETTE[i];
}

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-pending/10 text-pending",
  confirmed: "bg-confirmed/10 text-confirmed",
  in_preparation: "bg-pending/10 text-pending",
  delivered: "bg-confirmed/10 text-confirmed",
  completed: "bg-confirmed/10 text-confirmed",
  cancelled: "bg-cancelled/10 text-cancelled",
};

export function getBookingStatusStyle(status: string): string {
  return BOOKING_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700";
}

interface TagProps {
  children: React.ReactNode;
  variant?: "cuisine" | "eventType" | "status";
  value?: string;
  status?: string;
  className?: string;
}

export function Tag({ children, variant = "cuisine", value, status, className = "" }: TagProps) {
  let style: string;
  if (variant === "status" && status) {
    style = getBookingStatusStyle(status);
  } else if (variant === "cuisine" || variant === "eventType") {
    style = getTagColor(value ?? String(children));
  } else {
    style = getTagColor(value ?? String(children));
  }
  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-medium ${style} ${className}`}
    >
      {children}
    </span>
  );
}
