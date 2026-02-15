"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  User,
  Package,
  CalendarCheck,
  CalendarBlank,
  Star,
  SignOut,
  MagnifyingGlass,
  Gear,
  Bell,
} from "@phosphor-icons/react";
import { Logo } from "./Logo";

interface VendorLayoutProps {
  children: React.ReactNode;
  businessName?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/availability", label: "Availability", icon: CalendarBlank },
  { href: "/reviews", label: "Reviews", icon: Star },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function VendorLayout({ children, businessName }: VendorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v) {
          setProfilePictureUrl(v.user?.profilePictureUrl ?? null);
          setUserName(v.user?.name ?? null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => setUnreadCount(0));
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar - desktop only (hidden md:flex) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-white border-r border-slate-200">
        <div className="p-6">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} weight="regular" />
              {label}
            </Link>
          ))}
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Settings
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Gear size={20} weight="regular" />
            Account
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-50 transition-colors rounded-lg font-medium"
          >
            <SignOut size={20} weight="regular" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content - hidden on mobile when overlay is shown */}
      <main className="hidden md:flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-10 shrink-0">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-md hidden sm:block">
              <MagnifyingGlass
                size={20}
                weight="regular"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search bookings, clients..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell size={22} weight="regular" className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 pl-2 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none mb-1">
                {businessName || "Vendor Portal"}
              </p>
              <p className="text-xs text-slate-500">Premium Vendor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden group-hover:border-primary transition-all shrink-0">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : userName ? (
                <span className="font-semibold text-slate-600 text-sm">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              ) : (
                <User size={20} weight="regular" className="text-slate-500" />
              )}
            </div>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:py-12 pb-12 bg-slate-50">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile: Use desktop message */}
      <div className="md:hidden fixed inset-0 bg-white flex flex-col items-center justify-center p-8 text-center z-50">
        <div className="mb-6">
          <Logo className="text-2xl" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-slate-900">Use desktop to manage</h2>
        <p className="text-slate-500 max-w-sm">
          The vendor dashboard is designed for desktop. Please open this page on a larger screen.
        </p>
      </div>
    </div>
  );
}
