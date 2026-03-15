/** Simple request logger for API debugging */
const DEBUG = process.env.DEBUG === "true" || process.env.NODE_ENV !== "production";

export function logRequest(method: string, path: string, statusCode: number, durationMs: number) {
  if (!DEBUG) return;
  const status = statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
  console.log(
    `[API] ${method} ${path} ${status}${statusCode}\x1b[0m ${durationMs}ms`
  );
}

export function logError(context: string, err: unknown) {
  console.error(`[API] ${context}`, err);
}

export function logInfo(msg: string, meta?: Record<string, unknown>) {
  if (!DEBUG) return;
  console.log(`[API] ${msg}`, meta ?? "");
}
