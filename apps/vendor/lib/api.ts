const raw = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "";
export const API_URL = (raw || "http://localhost:3001").trim().replace(/^["'\s]+|["'\s]+$/g, "");

/** Safely parse JSON from fetch response. */
export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    if (!res.ok) throw new Error("Server error. Please try again.");
    throw new Error("Invalid response from server");
  }
}
