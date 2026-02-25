"use client";

import { MINTY_LIME, MINTY_LIME_DARK } from "@/lib/events-ui";

export type EventStatus = "draft" | "in_progress" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; bg: string; color: string }
> = {
  draft: { label: "Planning", bg: MINTY_LIME, color: MINTY_LIME_DARK },
  in_progress: { label: "In Progress", bg: "#fef3c7", color: "#b45309" },
  completed: { label: "Completed", bg: "#d1fae5", color: "#047857" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c" },
};

interface StatusBadgeProps {
  status: EventStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = (status || "draft") as EventStatus;
  const config = STATUS_CONFIG[normalized] ?? STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
