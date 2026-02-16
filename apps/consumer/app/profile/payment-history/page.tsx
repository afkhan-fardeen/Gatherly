"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PaidBooking {
  id: string;
  bookingReference: string;
  totalAmount: string;
  createdAt: string;
  vendor: { businessName: string };
  event: { name: string; date: string };
  package: { name: string };
}

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<PaidBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_URL}/api/bookings?paymentStatus=paid`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} weight="regular" className="text-slate-600" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Payment history</h1>
        </div>
      </header>

      <main className="p-6 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 rounded-md border border-slate-200 bg-white">
            <Receipt size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No payments yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Payments for your bookings will appear here.
            </p>
            <Link
              href="/bookings"
              className="inline-block mt-4 text-primary font-semibold text-sm"
            >
              View my bookings
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center gap-4 p-4 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Receipt size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    {b.event.name} · {b.vendor.businessName}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {b.bookingReference} · {b.package.name} · {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-slate-900 shrink-0">
                  {Number(b.totalAmount).toFixed(2)} BD
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
