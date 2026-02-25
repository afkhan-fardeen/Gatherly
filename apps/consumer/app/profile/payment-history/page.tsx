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
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="min-h-full"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        <header
          className="sticky top-0 z-40 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div>
              <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                Payment <span className="italic font-normal text-primary">History</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                Past transactions
              </p>
            </div>
          </div>
        </header>

      <main className="px-5 pb-40">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/60 rounded-[20px] animate-pulse border border-primary/5" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-6 rounded-[20px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center"
            style={{ minHeight: 240 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Receipt size={32} weight="regular" className="text-primary" />
            </div>
            <p className="font-serif text-[18px] font-medium text-[#1e0f14]">No payments yet</p>
            <p className="text-[14px] font-light text-[#a0888d] mt-1">
              Payments for your bookings will appear here.
            </p>
            <Link
              href="/bookings"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: "#6D0D35" }}
            >
              View my bookings
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center gap-3.5 p-4 rounded-[20px] border border-primary/10 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/20"
                style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Receipt size={22} weight="regular" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[15px] font-semibold text-[#1e0f14] truncate">
                    {b.event.name} · {b.vendor.businessName}
                  </p>
                  <p className="text-[12px] font-normal text-[#a0888d] mt-0.5">
                    {b.bookingReference} · {b.package.name} · {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-serif text-[15px] font-semibold text-primary shrink-0">
                  {Number(b.totalAmount).toFixed(2)} BD
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      </div>
    </AppLayout>
  );
}
