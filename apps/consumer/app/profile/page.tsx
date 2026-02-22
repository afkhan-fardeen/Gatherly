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

const ACCOUNT_ITEMS = [
  { href: "/profile/payment-methods", icon: CreditCard, label: "Payment Methods", sublabel: "Cards and billing" },
  { href: "/profile/payment-history", icon: Receipt, label: "Payment History", sublabel: "Past transactions" },
] as const;

const QUICK_LINKS = [
  { href: "/services/catering", icon: ForkKnife, label: "Browse Catering" },
] as const;

const SETTINGS_ITEMS = [
  { href: "/notifications", icon: Bell, label: "Notifications", sublabel: "Alerts and preferences" },
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
      <div className="min-h-full bg-[#FAFAFA]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-6 py-4">
            <Link
              href="/dashboard"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 flex items-center justify-center shrink-0 text-text-primary hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={22} weight="regular" />
            </Link>
            <h1 className="text-typo-h2 font-medium tracking-tight text-text-primary">Profile</h1>
          </div>
        </header>

        <main className="px-6 pb-40 space-y-6">
          {/* Profile hero card */}
          <section className="pt-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation-1 overflow-hidden">
              <div
                className="h-20 w-full"
                style={{ background: "linear-gradient(135deg, #3F0810 0%, #5A0E18 50%, #3F0810 100%)" }}
                aria-hidden
              />
              <div className="px-6 pb-6 -mt-12 relative">
                <Link href="/profile/edit" className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-elevation-2 ring-2 ring-primary/20">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <span className="text-base font-semibold text-text-secondary">{initials}</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-sm">
                    <Camera size={14} weight="regular" className="text-white" />
                  </span>
                </Link>
                <h2 className="mt-4 text-typo-h2 font-medium text-text-primary">{user.name}</h2>
                <p className="text-body-sm font-normal text-text-secondary mt-0.5">{user.email}</p>
                <Link
                  href="/profile/edit"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Edit Profile
                  <CaretRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </section>

          {/* Quick links */}
          <section>
            <h3 className="text-caption-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">Quick access</h3>
            <div className="space-y-2">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-elevation-1 hover:border-slate-300 hover:shadow-elevation-2 transition-all active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={22} weight="regular" className="text-primary" />
                  </div>
                  <span className="text-body font-medium text-text-primary flex-1">{item.label}</span>
                  <CaretRight size={20} weight="bold" className="text-text-tertiary shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Account */}
          <section>
            <h3 className="text-caption-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">Account</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation-1 overflow-hidden divide-y divide-slate-100">
              {ACCOUNT_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <item.icon size={20} weight="regular" className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body font-medium text-text-primary block">{item.label}</span>
                    <span className="text-caption-sm font-light text-text-tertiary block mt-0.5">{item.sublabel}</span>
                  </div>
                  <CaretRight size={18} weight="bold" className="text-text-tertiary shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Settings */}
          <section>
            <h3 className="text-caption-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">Settings</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation-1 overflow-hidden">
              {SETTINGS_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <item.icon size={20} weight="regular" className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body font-medium text-text-primary block">{item.label}</span>
                    <span className="text-caption-sm font-light text-text-tertiary block mt-0.5">{item.sublabel}</span>
                  </div>
                  <CaretRight size={18} weight="bold" className="text-text-tertiary shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Sign out */}
          <section className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white text-red-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-colors active:scale-[0.99]"
            >
              <SignOut size={18} weight="regular" />
              Sign Out
            </button>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
