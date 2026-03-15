/** Client-side logger for debugging. Logs in dev or when DEBUG=true. */
const DEBUG =
  typeof window !== "undefined" &&
  (process.env.NODE_ENV !== "production" ||
    (typeof localStorage !== "undefined" && localStorage.getItem("DEBUG") === "true"));

export function logInfo(tag: string, ...args: unknown[]) {
  if (!DEBUG) return;
  console.log(`[Consumer:${tag}]`, ...args);
}

export function logError(tag: string, ...args: unknown[]) {
  console.error(`[Consumer:${tag}]`, ...args);
}

export function logApiCall(method: string, url: string, status?: number, err?: unknown) {
  if (!DEBUG && !err) return;
  const prefix = `[Consumer:API] ${method} ${url}`;
  if (err) {
    console.error(prefix, "error:", err);
  } else if (status !== undefined) {
    const color = status >= 400 ? "color: #dc2626" : "color: #16a34a";
    console.log(`%c${prefix} ${status}`, color);
  }
}
