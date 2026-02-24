"use client";

import { ROUND } from "@/lib/events-ui";
import { MINTY_LIME, MINTY_LIME_DARK, WARM_PEACH, WARM_PEACH_DARK, CHERRY_LIGHT, CHERRY_DARK } from "@/lib/events-ui";

export type EventStatus = "draft" | "in_progress" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; bg: string; color: string }
> = {
  draft: { label: "Planning", bg: MINTY_LIME, color: MINTY_LIME_DARK },
  in_progress: { label: "In Progress", bg: WARM_PEACH, color: WARM_PEACH_DARK },
  completed: { label: "Completed", bg: CHERRY_LIGHT, color: CHERRY_DARK },
  cancelled: { label: "Cancelled", bg: "#f1f5f9", color: "#64748b" },
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
      className={`inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 ${ROUND} ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
