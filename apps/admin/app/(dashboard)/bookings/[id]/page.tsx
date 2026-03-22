"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [reason, setReason] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  function load() {
    adminFetch(`${API_URL}/api/admin/bookings/${id}`)
      .then(async (res) => {
        const data = await parseJsonResponse(res);
        if (!res.ok) throw new Error("Not found");
        setBooking(data as Record<string, unknown>);
      })
      .catch(() => toast.error("Could not load booking"));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function refund() {
    if (!reason.trim()) {
      toast.error("Enter a reason");
      return;
    }
    const res = await adminFetch(`${API_URL}/api/admin/bookings/${id}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error((data as { error?: string }).error || "Refund failed");
      return;
    }
    toast.success("Refunded");
    setReason("");
    load();
  }

  async function statusOverride() {
    if (!overrideStatus || !overrideReason.trim()) {
      toast.error("Status and reason required");
      return;
    }
    const res = await adminFetch(`${API_URL}/api/admin/bookings/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: overrideStatus, reason: overrideReason.trim() }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error((data as { error?: string }).error || "Update failed");
      return;
    }
    toast.success("Updated");
    load();
  }

  if (!booking) return <p className="text-slate-500">Loading…</p>;

  const b = booking as {
    bookingReference: string;
    status: string;
    paymentStatus: string;
    totalAmount: string;
    user: { name: string; email: string };
    vendor: { businessName: string };
    event: { name: string };
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/bookings" className="text-sm text-primary hover:underline">
        ← Bookings
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{b.bookingReference}</h1>
        <p className="text-slate-500 mt-1">
          {b.event.name} · {b.vendor.businessName}
        </p>
        <p className="text-sm mt-2">
          Status: <strong>{b.status}</strong> · Payment: <strong>{b.paymentStatus}</strong> · Amount:{" "}
          <strong>{parseFloat(b.totalAmount).toFixed(2)}</strong>
        </p>
      </div>

      {b.paymentStatus === "paid" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Refund</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (required)"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm min-h-[80px]"
          />
          <button
            type="button"
            onClick={refund}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
          >
            Issue full refund
          </button>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-amber-900">Break-glass status override</h2>
        <select
          value={overrideStatus}
          onChange={(e) => setOverrideStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
        >
          <option value="">Select status…</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="in_preparation">in_preparation</option>
          <option value="delivered">delivered</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <textarea
          value={overrideReason}
          onChange={(e) => setOverrideReason(e.target.value)}
          placeholder="Reason (required)"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm min-h-[60px]"
        />
        <button
          type="button"
          onClick={statusOverride}
          className="px-4 py-2 rounded-lg bg-amber-700 text-white text-sm font-medium"
        >
          Apply override
        </button>
      </div>
    </div>
  );
}
