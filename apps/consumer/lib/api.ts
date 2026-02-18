// Trim quotes/spaces – Vercel env vars with quotes cause malformed URLs and 405
const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const API_URL = typeof raw === "string" ? raw.replace(/^["'\s]+|["'\s]+$/g, "") : "http://localhost:3001";

/** Extract user-friendly error message from API error response (Zod validation details, etc.) */
export function parseApiError(data: { error?: string; details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }): string {
  const details = data.details;
  if (details?.fieldErrors) {
    const first = Object.values(details.fieldErrors).flat().find(Boolean);
    if (first) return first;
  }
  if (details?.formErrors?.length) return details.formErrors[0];
  if (data.error && data.error !== "Validation failed") return data.error;
  return "Please check your input and try again.";
}

/** Safely parse JSON from fetch response. Handles empty/invalid responses (e.g. Render cold start, 502). */
export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    if (!res.ok) {
      throw new Error("Server error. Please try again.");
    }
    throw new Error("Invalid response from server");
  }
}
