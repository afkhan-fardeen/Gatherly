"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Bell, CreditCard, SignOut, PencilSimple, Phone, Receipt } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          const stored = localStorage.getItem("user");
          const merged = stored ? { ...JSON.parse(stored), ...data } : data;
          localStorage.setItem("user", JSON.stringify(merged));
        } else {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        }
      })
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">{loading ? "Loading..." : "Please log in"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
      </header>

      <main className="p-6 pb-32 space-y-6">
        {/* User block */}
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-md border-2 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-semibold text-lg text-slate-600">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold tracking-tight mt-3">{user.name}</h2>
          <p className="text-slate-500 text-sm">{user.email}</p>
          {user.phone ? (
            <p className="text-slate-600 text-sm mt-1 flex items-center gap-1.5">
              <Phone size={14} weight="regular" />
              {user.phone}
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">No phone number</p>
          )}
          <Link
            href="/profile/edit"
            className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm"
          >
            <PencilSimple size={16} weight="regular" />
            Edit profile
          </Link>
        </div>

        {/* Links */}
        <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
          <Link
            href="/bookings"
            className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                <CalendarCheck size={18} weight="regular" className="text-primary" />
              </div>
              <span className="font-medium text-sm">My Bookings</span>
            </div>
            <span className="text-slate-400 text-xs">View and manage</span>
          </Link>
          <Link
            href="/profile/payment-history"
            className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                <Receipt size={18} weight="regular" className="text-primary" />
              </div>
              <span className="font-medium text-sm">Payment history</span>
            </div>
            <span className="text-slate-400 text-xs">What you paid for</span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                <Bell size={18} weight="regular" className="text-primary" />
              </div>
              <span className="font-medium text-sm">Notifications</span>
            </div>
            <span className="text-slate-400 text-xs">Settings</span>
          </Link>
          <Link
            href="/profile/payment-methods"
            className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                <CreditCard size={18} weight="regular" className="text-primary" />
              </div>
              <span className="font-medium text-sm">Payment methods</span>
            </div>
            <span className="text-slate-400 text-xs">Add cards</span>
          </Link>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-500 font-semibold text-sm text-center flex items-center justify-center gap-2 hover:bg-red-50 rounded-md transition-colors"
        >
          <SignOut size={18} weight="regular" />
          Sign Out
        </button>
      </main>
    </AppLayout>
  );
}
