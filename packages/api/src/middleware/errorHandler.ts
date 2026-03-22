import type { ErrorRequestHandler } from "express";

/** Catches errors from async route handlers (requires `express-async-errors` loaded before routes). */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  console.error(err);

  const isProd = process.env.NODE_ENV === "production";
  const message = err instanceof Error ? err.message : "Internal server error";

  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;

  const clientStatus = status >= 400 && status < 600 ? status : 500;

  res.status(clientStatus).json({
    error: clientStatus >= 500 && isProd ? "Internal server error" : message,
  });
};
