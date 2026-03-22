"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface U {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<U[]>([]);

  function load() {
    const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}&limit=50` : "?limit=50";
    adminFetch(`${API_URL}/api/admin/users${query}`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: U[] }>(res);
        if (!res.ok) throw new Error("Failed");
        setItems(data.items);
      })
      .catch(() => toast.error("Could not load users"));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: "active" | "suspended") {
    const res = await adminFetch(`${API_URL}/api/admin/users/${id}`, {
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
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm flex-1 max-w-md"
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm"
        >
          Search
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3">
                  {u.status === "active" ? (
                    <button
                      type="button"
                      className="text-rose-600 font-medium"
                      onClick={() => setStatus(u.id, "suspended")}
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-emerald-600 font-medium"
                      onClick={() => setStatus(u.id, "active")}
                    >
                      Activate
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
