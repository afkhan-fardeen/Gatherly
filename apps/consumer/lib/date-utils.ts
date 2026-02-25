/** Shared date/time formatting utilities */

/** Format ISO or time-only string (e.g. "14:30") to "2:30 PM" */
export function formatTime(
  iso: string | { toISOString?: () => string } | null | undefined
): string {
  if (iso == null) return "";
  const str = typeof iso === "string" ? iso : iso?.toISOString?.();
  if (!str) return "";
  try {
    const normalized = str.includes("T") ? str : `1970-01-01T${str}`;
    const d = new Date(normalized);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

/** Format "HH:mm" string (from time input) to "h:mm AM/PM" for display */
export function formatTimeFromHHMM(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":");
  const hr = parseInt(h || "0", 10);
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
}

/** Current date in long format: "Sunday, February 15, 2025" */
export function formatDateFull(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Date for display: "Sunday, February 15, 2025" */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Date for display: "Feb 15" (short) */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Date parts for event cards */
export function formatEventDate(dateStr: string): {
  month: string;
  day: string;
  weekday: string;
} {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

/** For input type="date" value: "YYYY-MM-DD" */
export function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** For input type="time" value: "HH:mm" */
export function formatTimeForInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Relative time: "2 hours ago", "1 day ago", "Mar 15" */
export function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return formatDateShort(dateStr);
}
