"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface Stats {
  bookingsByStatus: Record<string, number>;
  refundedBookings: number;
  pendingPayoutBookings: number;
  pendingPayoutTotal: number;
  vendorsPendingApproval: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/dashboard/stats`)
      .then(async (res) => {
        const data = await parseJsonResponse<Stats>(res);
        if (!res.ok) throw new Error("Failed to load");
        setStats(data);
      })
      .catch(() => toast.error("Could not load dashboard"));
  }, []);

  if (!stats) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pending payout (bookings)</p>
          <p className="text-2xl font-bold mt-1">{stats.pendingPayoutBookings}</p>
          <p className="text-xs text-slate-400 mt-1">{stats.pendingPayoutTotal.toFixed(2)} BHD est.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Refunded bookings</p>
          <p className="text-2xl font-bold mt-1">{stats.refundedBookings}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Vendors pending approval</p>
          <p className="text-2xl font-bold mt-1">{stats.vendorsPendingApproval}</p>
          {stats.vendorsPendingApproval > 0 && (
            <Link href="/vendors" className="text-sm text-primary mt-2 inline-block">
              Review →
            </Link>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Bookings by status</p>
          <ul className="text-sm mt-2 space-y-1">
            {Object.entries(stats.bookingsByStatus).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
