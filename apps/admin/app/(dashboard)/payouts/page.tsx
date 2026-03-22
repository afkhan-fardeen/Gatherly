"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface Eligible {
  id: string;
  bookingReference: string;
  vendorNet: string;
  vendor: { businessName: string };
  event: { name: string };
}

interface Batch {
  id: string;
  status: string;
  paidAt: string | null;
  reference: string | null;
  createdAt: string;
  lines: { amount: string; booking: { bookingReference: string } }[];
}

export default function AdminPayoutsPage() {
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batches, setBatches] = useState<Batch[]>([]);
  const [notes, setNotes] = useState("");

  function loadEligible() {
    adminFetch(`${API_URL}/api/admin/payouts/eligible`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: Eligible[] }>(res);
        if (!res.ok) throw new Error("Failed");
        setEligible(data.items);
      })
      .catch(() => toast.error("Could not load eligible bookings"));
  }

  function loadBatches() {
    adminFetch(`${API_URL}/api/admin/payouts/batches?limit=20`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: Batch[] }>(res);
        if (!res.ok) throw new Error("Failed");
        setBatches(data.items);
      })
      .catch(() => toast.error("Could not load batches"));
  }

  useEffect(() => {
    loadEligible();
    loadBatches();
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createBatch() {
    if (selected.size === 0) {
      toast.error("Select at least one booking");
      return;
    }
    const res = await adminFetch(`${API_URL}/api/admin/payouts/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingIds: [...selected], notes: notes || undefined }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error((data as { error?: string }).error || "Failed");
      return;
    }
    toast.success("Batch created");
    setSelected(new Set());
    setNotes("");
    loadEligible();
    loadBatches();
  }

  async function markPaid(batchId: string) {
    const ref = window.prompt("Bank / payment reference (optional)") || "";
    const res = await adminFetch(`${API_URL}/api/admin/payouts/batches/${batchId}/mark-paid`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref || undefined }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error((data as { error?: string }).error || "Failed");
      return;
    }
    toast.success("Marked paid");
    loadBatches();
    loadEligible();
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
        <p className="text-slate-500 text-sm mt-1">Eligible = delivered/completed, paid, not yet in a payout</p>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Eligible bookings</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 w-10"></th>
                <th className="text-left p-2">Ref</th>
                <th className="text-left p-2">Vendor</th>
                <th className="text-left p-2">Event</th>
                <th className="text-right p-2">Vendor net (BHD)</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggle(e.id)}
                    />
                  </td>
                  <td className="p-2">{e.bookingReference}</td>
                  <td className="p-2">{e.vendor.businessName}</td>
                  <td className="p-2">{e.event.name}</td>
                  <td className="p-2 text-right">{parseFloat(e.vendorNet).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 items-end">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Batch notes (optional)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <button
            type="button"
            onClick={createBatch}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
          >
            Create batch from selection
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recent batches</h2>
        <div className="space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-slate-500">{batch.id}</p>
                  <p className="font-medium">
                    Status: {batch.status}
                    {batch.paidAt && ` · Paid ${new Date(batch.paidAt).toLocaleString()}`}
                    {batch.reference && ` · Ref: ${batch.reference}`}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {batch.lines?.length ?? 0} line(s)
                  </p>
                </div>
                {batch.status !== "paid" && (
                  <button
                    type="button"
                    onClick={() => markPaid(batch.id)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
                  >
                    Mark paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
