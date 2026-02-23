/**
 * Persistent session management.
 * Token is stored in localStorage (survives browser close).
 * Validate session by calling /api/auth/me - clears stale tokens on 401.
 */

import { API_URL } from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setSession(token: string, user: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

const VALIDATE_TIMEOUT_MS = 5000;

/**
 * Validates token via /api/auth/me.
 * Returns user if valid, null if invalid/expired.
 * Clears session automatically on 401.
 * Times out after 5s if API is unreachable to avoid infinite loading.
 */
export async function validateSession(): Promise<{ valid: true; user: unknown } | { valid: false }> {
  const token = getToken();
  if (!token) return { valid: false };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VALIDATE_TIMEOUT_MS);
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.status === 401) {
      clearSession();
      return { valid: false };
    }
    if (!res.ok) return { valid: false };
    const user = await res.json();
    const stored = localStorage.getItem(USER_KEY);
    const merged = stored ? { ...JSON.parse(stored), ...user } : user;
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    return { valid: true, user: merged };
  } catch {
    return { valid: false };
  }
}
