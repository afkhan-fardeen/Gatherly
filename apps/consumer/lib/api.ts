// Trim quotes/spaces – Vercel env vars with quotes cause malformed URLs and 405
const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const API_URL = typeof raw === "string" ? raw.replace(/^["'\s]+|["'\s]+$/g, "") : "http://localhost:3001";

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
