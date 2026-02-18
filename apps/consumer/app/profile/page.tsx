"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gear,
  Camera,
  Heart,
  CreditCard,
  Bell,
  Question,
  FileText,
  SignOut,
  CaretRight,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, MINTY_LIME, MINTY_LIME_DARK, WARM_PEACH, WARM_PEACH_DARK, SOFT_LILAC, SOFT_LILAC_DARK, TYPO } from "@/lib/events-ui";

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
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
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
    <AppLayout showTopBar={false}>
      <div className="bg-[#FAFAFA] min-h-full">
        {/* Fixed header spacer */}
        <div className="h-14 shrink-0" aria-hidden />
        {/* Fixed header */}
        <header className="fixed top-0 left-0 right-0 z-40 flex justify-center bg-[#FAFAFA]/90 backdrop-blur-md">
          <div className="w-full max-w-[430px] px-6 py-4 flex justify-between items-center">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} weight="regular" className="text-slate-600" />
            </Link>
            <h1 className={`${TYPO.H1} text-slate-900`}>Profile</h1>
            <Link
              href="/profile/edit"
              className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Gear size={24} weight="regular" className="text-slate-600" />
            </Link>
          </div>
        </header>

        <main>
          {/* Profile section */}
          <section className="flex flex-col items-center px-6 py-8">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 bg-slate-100"
                style={{ boxShadow: `0 0 0 2px ${CHERRY}20` }}
              >
                {user.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePictureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-600">{initials}</span>
                  </div>
                )}
              </div>
              <Link
                href="/profile/edit"
                className="absolute bottom-1 right-1 p-2 rounded-full shadow-lg border-2 border-white text-white transition-transform active:scale-90"
                style={{ backgroundColor: CHERRY }}
              >
                <Camera size={16} weight="regular" />
              </Link>
            </div>
            <h2 className={`mt-6 ${TYPO.H1_LARGE} text-slate-900`}>{user.name}</h2>
            <p className={`${TYPO.SUBTEXT} mb-6`}>{user.email}</p>
            <Link
              href="/profile/edit"
              className="px-8 py-2.5 rounded-full font-semibold text-sm text-white shadow-md transition-transform active:scale-95"
              style={{ backgroundColor: CHERRY, boxShadow: `${CHERRY}33 0 4px 12px` }}
            >
              Edit Profile
            </Link>
          </section>

          {/* General Settings */}
          <section className="px-6 space-y-2">
            <h3 className={`px-2 ${TYPO.H3} mb-3`} style={{ color: SOFT_LILAC_DARK }}>
              General Settings
            </h3>

            <Link
              href="/services/catering"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: MINTY_LIME, color: MINTY_LIME_DARK }}>
                  <Heart size={20} weight="regular" />
                </div>
                <span className={TYPO.CARD_TITLE}>My Favorites</span>
              </div>
              <CaretRight size={20} weight="bold" className="text-slate-300" />
            </Link>

            <Link
              href="/profile/payment-methods"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: WARM_PEACH, color: WARM_PEACH_DARK }}>
                  <CreditCard size={20} weight="regular" />
                </div>
                <span className={TYPO.CARD_TITLE}>Payment Methods</span>
              </div>
              <CaretRight size={20} weight="bold" className="text-slate-300" />
            </Link>

            <Link
              href="/notifications"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: SOFT_LILAC, color: SOFT_LILAC_DARK }}>
                  <Bell size={20} weight="regular" />
                </div>
                <div className="text-left">
                  <span className={`${TYPO.CARD_TITLE} block leading-tight`}>
                    Notification Settings
                  </span>
                  <span className={TYPO.CAPTION}>Manage alerts and sounds</span>
                </div>
              </div>
              <CaretRight size={20} weight="bold" className="text-slate-300" />
            </Link>

            <a
              href="#"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: MINTY_LIME, color: MINTY_LIME_DARK }}>
                  <Question size={20} weight="regular" />
                </div>
                <span className={TYPO.CARD_TITLE}>Help Center</span>
              </div>
              <CaretRight size={20} weight="bold" className="text-slate-300" />
            </a>

            <a
              href="#"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: WARM_PEACH, color: WARM_PEACH_DARK }}>
                  <FileText size={20} weight="regular" />
                </div>
                <span className={TYPO.CARD_TITLE}>Terms & Privacy</span>
              </div>
              <CaretRight size={20} weight="bold" className="text-slate-300" />
            </a>

            <div className="pt-6 pb-32">
              <button
                onClick={handleLogout}
                className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 active:bg-red-50 rounded-xl transition-colors"
              >
                <SignOut size={20} weight="regular" />
                Sign Out
              </button>
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
