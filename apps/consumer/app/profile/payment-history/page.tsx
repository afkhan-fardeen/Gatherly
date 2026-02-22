"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

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
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 bg-white flex items-center justify-center shrink-0 text-text-primary hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={22} weight="regular" />
          </Link>
          <h1 className={`${TYPO.H1} text-text-primary`}>Payment history</h1>
        </div>
      </header>

      <main className="p-6 pb-40 bg-[var(--bg-app)]">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white shadow-elevation-1">
            <Receipt size={40} weight="regular" className="text-text-tertiary mx-auto" />
            <p className={`${TYPO.SUBTEXT} mt-4 font-medium text-text-secondary`}>No payments yet</p>
            <p className={TYPO.CAPTION}>
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
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-elevation-1 hover:border-slate-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Receipt size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${TYPO.CARD_TITLE} truncate`}>
                    {b.event.name} · {b.vendor.businessName}
                  </p>
                  <p className={TYPO.CAPTION}>
                    {b.bookingReference} · {b.package.name} · {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`${TYPO.BODY_MEDIUM} shrink-0`}>
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
