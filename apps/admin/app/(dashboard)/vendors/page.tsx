"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface VendorRow {
  id: string;
  businessName: string;
  status: string;
  user: { email: string; name: string; status: string };
}

export default function AdminVendorsPage() {
  const [items, setItems] = useState<VendorRow[]>([]);
  const [filter, setFilter] = useState<string>("");

  function load() {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    adminFetch(`${API_URL}/api/admin/vendors${q}`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: VendorRow[] }>(res);
        if (!res.ok) throw new Error("Failed");
        setItems(data.items);
      })
      .catch(() => toast.error("Could not load vendors"));
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function setStatus(id: string, status: string) {
    const res = await adminFetch(`${API_URL}/api/admin/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      toast.error((data as { error?: string }).error || "Failed");
      return;
    }
    toast.success("Updated");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="suspended">suspended</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Business</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-b border-slate-100">
                <td className="p-3">{v.businessName}</td>
                <td className="p-3">{v.user.email}</td>
                <td className="p-3">{v.status}</td>
                <td className="p-3 space-x-2">
                  {v.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="text-emerald-600 font-medium"
                        onClick={() => setStatus(v.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="text-rose-600 font-medium"
                        onClick={() => setStatus(v.id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {v.status === "approved" && (
                    <button
                      type="button"
                      className="text-amber-700 font-medium"
                      onClick={() => setStatus(v.id, "suspended")}
                    >
                      Suspend
                    </button>
                  )}
                  {v.status === "suspended" && (
                    <button
                      type="button"
                      className="text-emerald-600 font-medium"
                      onClick={() => setStatus(v.id, "approved")}
                    >
                      Unsuspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
