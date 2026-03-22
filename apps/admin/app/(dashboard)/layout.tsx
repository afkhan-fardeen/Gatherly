"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, adminFetch } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(stored) as User;
    if (parsed.role !== "admin") {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    adminFetch(`${API_URL}/api/admin/me`)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        setOk(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
