"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL, adminFetch, parseJsonResponse } from "@/lib/api";

interface LogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata: unknown;
  actor: { email: string; name: string };
}

export default function AdminAuditPage() {
  const [items, setItems] = useState<LogRow[]>([]);

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/audit-log?limit=100`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ items: LogRow[] }>(res);
        if (!res.ok) throw new Error("Failed");
        setItems(data.items);
      })
      .catch(() => toast.error("Could not load audit log"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="p-3 whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="p-3">{row.actor.email}</td>
                <td className="p-3">{row.action}</td>
                <td className="p-3">
                  {row.entityType} / {row.entityId.slice(0, 8)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
