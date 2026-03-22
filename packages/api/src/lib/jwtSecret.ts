/** Used for sign/verify; in production JWT_SECRET must be set (see server.ts startup check). */
export function getJwtSecret(): string {
  if (process.env.NODE_ENV === "production") {
    const s = process.env.JWT_SECRET?.trim();
    if (!s) throw new Error("JWT_SECRET is required in production");
    return s;
  }
  return process.env.JWT_SECRET || "dev-secret-change-me";
}
