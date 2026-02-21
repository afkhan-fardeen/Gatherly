"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  ForkKnife,
  CreditCard,
  Receipt,
  Bell,
  SignOut,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";
import { API_URL } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
}

const MENU_ITEMS = [
  { href: "/services/catering", icon: ForkKnife, label: "Browse Catering" },
  { href: "/profile/payment-methods", icon: CreditCard, label: "Payment Methods" },
  {
    href: "/notifications",
    icon: Bell,
    label: "Notification Settings",
    sublabel: "Manage alerts and sounds",
  },
  { href: "/profile/payment-history", icon: Receipt, label: "Payment History" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/profile"));
      return;
    }
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
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
    window.location.href = "/";
  }

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
          <p className={TYPO.SUBTEXT}>{loading ? "Loading..." : "Please log in"}</p>
        </div>
      </AppLayout>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 px-6 py-3">
          <Link
            href="/dashboard"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 flex items-center justify-center shrink-0 text-text-primary hover:bg-slate-50"
          >
            <ArrowLeft size={22} weight="regular" />
          </Link>
          <h1 className={`${TYPO.H1} text-text-primary`}>Profile</h1>
        </div>
      </header>

      <div className="flex flex-col bg-[var(--bg-app)]">
        {/* Profile block */}
        <div className="px-6 pt-8 pb-6 flex flex-col items-center">
          <Link href="/profile/edit" className="relative block">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-text-secondary">{initials}</span>
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center border-2 border-white">
              <Camera size={16} weight="regular" className="text-white" />
            </span>
          </Link>
          <h2 className={`mt-4 ${TYPO.H1_LARGE} text-text-primary`}>{user.name}</h2>
          <p className={`${TYPO.SUBTEXT} text-text-secondary`}>{user.email}</p>
          <Link
            href="/profile/edit"
            className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-primary"
          >
            Edit Profile
          </Link>
        </div>

        {/* Menu list */}
        <div className="px-6 space-y-2 pb-6">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <item.icon size={20} weight="regular" className="text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={TYPO.CARD_TITLE}>{item.label}</span>
                {"sublabel" in item && item.sublabel && (
                  <p className={TYPO.CAPTION}>{item.sublabel}</p>
                )}
              </div>
              <CaretRight size={18} weight="bold" className="text-text-tertiary shrink-0" />
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-6 pb-32">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border border-slate-200 bg-white text-red-600 font-semibold flex items-center justify-center gap-2"
          >
            <SignOut size={20} weight="regular" />
            Sign Out
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
