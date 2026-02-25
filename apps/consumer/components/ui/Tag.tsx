"use client";

const TAG_PALETTE = [
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-blue-100 text-blue-800",
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
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-700",
  in_preparation: "bg-amber-100 text-amber-800",
  delivered: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function getBookingStatusStyle(status: string): string {
  return BOOKING_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
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
      className={`inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style} ${className}`}
    >
      {children}
    </span>
  );
}
