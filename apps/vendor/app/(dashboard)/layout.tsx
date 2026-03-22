"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, vendorFetch } from "@/lib/api";
import { VendorProfileProvider, type VendorProfileMe } from "@/contexts/VendorProfileContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfileMe | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(stored) as User;
    if (parsed.role !== "vendor") {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    vendorFetch(`${API_URL}/api/vendor/me`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return;
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        const v = (await res.json()) as VendorProfileMe;
        if (cancelled) return;
        setVendorProfile(v);
        setUser(parsed);
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) {
          setVendorProfile(null);
          setUser(parsed);
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <VendorProfileProvider value={vendorProfile}>{children}</VendorProfileProvider>
  );
}
