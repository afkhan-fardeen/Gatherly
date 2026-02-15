"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.details?.fieldErrors?.name?.[0] || data.error || "Failed to add guest");
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
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventId}/guests`}
            className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} weight="regular" className="text-slate-600" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Add Guest</h1>
        </div>
      </header>

      <main className="p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-none focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Guest name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-none focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+1 555-0123"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-none focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="guest@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              RSVP Status
            </label>
            <div className="flex gap-2">
              {["pending", "confirmed", "declined"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setRsvpStatus(status)}
                  className={`flex-1 py-2 rounded-none text-sm font-semibold capitalize ${
                    rsvpStatus === status
                      ? status === "confirmed"
                        ? "bg-confirmed/20 text-confirmed"
                        : status === "declined"
                        ? "bg-declined/20 text-declined"
                        : "bg-pending/20 text-pending"
                      : "bg-slate-100 text-slate-500"
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
              className="w-5 h-5 rounded-none border-slate-300 text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-medium text-slate-700">
              Plus one allowed
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-none hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Guest"}
          </button>
        </form>
      </main>
    </AppLayout>
  );
}
