"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  User,
  Package,
  Calendar,
  CookingPot,
  CheckCircle,
} from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Tab = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

interface Booking {
  id: string;
  status: string;
  paymentStatus: string | null;
  totalAmount: string;
  guestCount: number;
  createdAt: string;
  user: { name: string; email: string };
  event: { name: string; date: string; guestCount: number };
  package: { name: string; imageUrl: string | null };
}

const TABS: { key: Tab; label: string; icon: typeof Clock; activeClass: string }[] = [
  { key: "pending", label: "Pending", icon: Clock, activeClass: "bg-amber-500 text-white border-amber-500" },
  { key: "confirmed", label: "Confirmed", icon: Check, activeClass: "bg-emerald-600 text-white border-emerald-600" },
  { key: "in_progress", label: "In progress", icon: CookingPot, activeClass: "bg-blue-600 text-white border-blue-600" },
  { key: "completed", label: "Completed", icon: CheckCircle, activeClass: "bg-slate-600 text-white border-slate-600" },
  { key: "cancelled", label: "Cancelled", icon: X, activeClass: "bg-red-600 text-white border-red-600" },
];

export default function BookingsPage() {
  const [vendor, setVendor] = useState<{ businessName: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/vendor/me`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API_URL}/api/vendor/bookings`, { headers }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([v, bks]) => {
        setVendor(v);
        setBookings(bks);
      })
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(bookingId: string, status: "confirmed" | "cancelled") {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdating(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/vendor/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          )
        );
        toast.success(status === "confirmed" ? "Booking confirmed" : "Booking declined");
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = bookings.filter((b) => {
    if (tab === "pending") return b.status === "pending";
    if (tab === "confirmed") return b.status === "confirmed";
    if (tab === "in_progress") return ["in_preparation", "delivered"].includes(b.status);
    if (tab === "completed") return b.status === "completed";
    if (tab === "cancelled") return b.status === "cancelled";
    return false;
  });

  return (
    <VendorLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings</h1>
        <p className="text-slate-500 mt-1">Manage booking requests</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {TABS.map(({ key, label, icon: Icon, activeClass }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
              tab === key
                ? `${activeClass} shadow-sm`
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} weight="regular" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <CalendarCheck size={32} weight="regular" className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mt-4">
            {tab === "pending"
              ? "No pending requests"
              : tab === "confirmed"
              ? "No confirmed bookings"
              : tab === "in_progress"
              ? "No bookings in progress"
              : tab === "completed"
              ? "No completed bookings"
              : "No cancelled bookings"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="block p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                  {b.package.imageUrl ? (
                    <img
                      src={b.package.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} weight="regular" className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{b.event.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={14} weight="regular" />
                      {b.user.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={14} weight="regular" />
                      {b.package.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} weight="regular" />
                      {new Date(b.event.date).toLocaleDateString()} · {b.guestCount} guests
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    ${parseFloat(b.totalAmount).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : ["in_preparation", "delivered"].includes(b.status)
                          ? "bg-blue-100 text-blue-700"
                          : b.status === "completed"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
                    {b.status === "confirmed" && (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          (b.paymentStatus || "unpaid") === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {(b.paymentStatus || "unpaid") === "paid" ? "Paid" : "Awaiting payment"}
                      </span>
                    )}
                  </div>
                </div>
                {tab === "pending" && b.status === "pending" && (
                  <div
                    className="flex gap-2 shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateStatus(b.id, "confirmed");
                      }}
                      disabled={updating === b.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 disabled:opacity-50"
                    >
                      <Check size={18} weight="bold" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateStatus(b.id, "cancelled");
                      }}
                      disabled={updating === b.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 disabled:opacity-50"
                    >
                      <X size={18} weight="bold" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </VendorLayout>
  );
}
