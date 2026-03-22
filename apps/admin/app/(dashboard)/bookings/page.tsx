"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface Row {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  user: { name: string; email: string };
  vendor: { businessName: string };
  event: { name: string; date: string };
}

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminFetch(`${API_URL}/api/admin/bookings?page=${page}&limit=25`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: Row[]; total: number }>(res);
        if (!res.ok) throw new Error("Failed");
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => toast.error("Could not load bookings"))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total</p>
        </div>
        <a
          href={`${API_URL}/api/admin/export/bookings.csv`}
          className="text-sm font-medium text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault();
            const t = localStorage.getItem("token");
            if (!t) return;
            fetch(`${API_URL}/api/admin/export/bookings.csv`, {
              headers: { Authorization: `Bearer ${t}` },
            })
              .then((r) => r.blob())
              .then((b) => {
                const url = URL.createObjectURL(b);
                const a = document.createElement("a");
                a.href = url;
                a.download = "bookings-export.csv";
                a.click();
                URL.revokeObjectURL(url);
              })
              .catch(() => toast.error("Export failed"));
          }}
        >
          Export CSV
        </a>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-semibold">Ref</th>
                <th className="text-left p-3 font-semibold">Event</th>
                <th className="text-left p-3 font-semibold">Vendor</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Payment</th>
                <th className="text-right p-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <Link href={`/bookings/${b.id}`} className="text-primary font-medium hover:underline">
                      {b.bookingReference}
                    </Link>
                  </td>
                  <td className="p-3">{b.event.name}</td>
                  <td className="p-3">{b.vendor.businessName}</td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3">{b.paymentStatus}</td>
                  <td className="p-3 text-right">{parseFloat(b.totalAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < 25}
          className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
