"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Star,
  CurrencyDollar,
  Plus,
  CalendarPlus,
} from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";

import { API_URL } from "@/lib/api";

interface Vendor {
  id: string;
  businessName: string;
  totalBookings: number;
  ratingAvg: number;
  ratingCount: number;
}

interface Booking {
  id: string;
  status: string;
  paymentStatus: string | null;
  totalAmount: string;
  guestCount: number;
  createdAt: string;
  user: { name: string };
  event: { name: string; date: string };
  package: { name: string };
}

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const recentBookings = bookings.slice(0, 5);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueThisMonth = bookings
    .filter(
      (b) =>
        (b.paymentStatus || "unpaid") === "paid" &&
        new Date(b.event.date) >= thisMonthStart
    )
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);

  return (
    <VendorLayout>
      <div className="space-y-12">
        <PageHeader
          title="Dashboard"
          subtitle="Good morning! Here's what's happening with your catering business today."
          action={
            <Link
              href="/packages/new"
              className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <Plus size={20} weight="bold" />
              New Package
            </Link>
          }
        />

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          <MetricCard
            label="Total Bookings"
            value={loading ? "—" : vendor?.totalBookings ?? 0}
            icon={
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CalendarCheck size={24} weight="regular" className="text-primary" />
              </div>
            }
            badge={
              <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                Total
              </span>
            }
          />
          <MetricCard
            label="Pending Requests"
            value={loading ? "—" : pendingCount}
            icon={
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Clock size={24} weight="regular" className="text-amber-500" />
              </div>
            }
            badge={
              <span className="text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                Active
              </span>
            }
          />
          <MetricCard
            label="Average Rating"
            value={
              loading ? "—" : vendor?.ratingCount ? (
                <span className="flex items-center gap-2">
                  {Number(vendor.ratingAvg).toFixed(1)}
                  <span className="text-amber-400">★</span>
                </span>
              ) : (
                "—"
              )
            }
            icon={
              <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center">
                <Star size={24} weight="fill" className="text-sky-500" />
              </div>
            }
          />
          <MetricCard
            label="Revenue (This Month)"
            value={loading ? "—" : `${revenueThisMonth.toLocaleString()} BD`}
            icon={
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <CurrencyDollar size={24} weight="regular" className="text-emerald-500" />
              </div>
            }
            badge={
              <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                Revenue
              </span>
            }
          />
        </div>

        {/* Quick Actions */}
        <section>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/packages"
              className="text-primary font-medium hover:underline"
            >
              Manage Packages
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/bookings"
              className="text-primary font-medium hover:underline"
            >
              View Bookings
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/reviews"
              className="text-primary font-medium hover:underline"
            >
              Reviews
            </Link>
          </div>
        </section>

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
            {recentBookings.length > 0 && (
              <Link href="/bookings" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            )}
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-14 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl" />
                <div className="w-20 h-20 bg-primary/20 text-primary rounded-2xl flex items-center justify-center relative">
                  <CalendarPlus size={40} weight="regular" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
              <p className="text-slate-500 mt-3 max-w-sm">
                Add packages to your profile so customers can discover and book your catering
                services for their next event.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/packages/new"
                  className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  Create your first package
                </Link>
                <button
                  type="button"
                  className="px-8 py-3.5 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Import Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {recentBookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="block p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900">{b.event.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {b.user.name} · {b.package.name} · {b.guestCount} guests
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(b.event.date).toLocaleDateString()} · {parseFloat(b.totalAmount).toLocaleString()} BD
                      </p>
                      <span
                        className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : b.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </VendorLayout>
  );
}
