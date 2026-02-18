"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import {
  CHERRY,
  ROUND,
  INPUT_CLASS,
  BUTTON_CLASS,
  LABEL_CLASS,
  TYPO,
} from "@/lib/events-ui";
import { parseApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AddGuestPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("pending");
  const [plusOneAllowed, setPlusOneAllowed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          email: email || undefined,
          rsvpStatus,
          plusOneAllowed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseApiError(data) || "Failed to add guest");
      router.push(`/events/${eventId}/guests`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout showNav={false}>
      <div className="bg-[#FAFAFA] min-h-full">
        <header className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${eventId}/guests`}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full"
            >
              <ArrowLeft size={20} weight="regular" className="text-slate-600" />
            </Link>
            <h1 className={TYPO.H1} style={{ color: CHERRY }}>
              Add Guest
            </h1>
          </div>
        </header>

        <main className="p-6 pb-32">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 bg-red-50 border border-red-100 ${ROUND}`}>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Guest name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLASS}
                placeholder="+1 555-0123"
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                placeholder="guest@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS}>RSVP Status</label>
              <div className="flex gap-2">
                {["pending", "confirmed", "declined"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setRsvpStatus(status)}
                    className={`flex-1 py-2.5 text-sm font-semibold capitalize rounded-full transition-colors ${
                      rsvpStatus === status
                        ? status === "confirmed"
                          ? "bg-confirmed/20 text-confirmed border-2 border-confirmed/40"
                          : status === "declined"
                            ? "bg-declined/20 text-declined border-2 border-declined/40"
                            : "bg-pending/20 text-pending border-2 border-pending/40"
                        : "bg-white border border-slate-200 text-slate-500"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={plusOneAllowed}
                onChange={(e) => setPlusOneAllowed(e.target.checked)}
                className="w-5 h-5 rounded-full border-slate-300 text-[#6D0D35] focus:ring-[#6D0D35]/20"
              />
              <span className="text-sm font-medium text-slate-700">
                Plus one allowed
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={BUTTON_CLASS}
              style={{
                backgroundColor: CHERRY,
                boxShadow: `${CHERRY}33 0 8px 24px`,
              }}
            >
              {loading ? "Adding..." : "Add Guest"}
            </button>
          </form>
        </main>
      </div>
    </AppLayout>
  );
}
