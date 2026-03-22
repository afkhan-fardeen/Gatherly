const raw = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "";
export const API_URL = (raw || "http://localhost:3001").trim().replace(/^["'\s]+|["'\s]+$/g, "");

export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    if (!res.ok) throw new Error("Server error. Please try again.");
    throw new Error("Invalid response from server");
  }
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof window === "undefined") {
    return fetch(input, init);
  }
  const token = localStorage.getItem("token");
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  return res;
}
