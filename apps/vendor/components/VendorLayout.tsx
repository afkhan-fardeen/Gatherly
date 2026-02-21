"use client";

import { useEffect, useState, useRef } from "react";
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
  Bell,
  CaretRight,
} from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { API_URL } from "@/lib/api";

interface VendorLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/availability", label: "Unavailable dates", icon: CalendarBlank },
  { href: "/reviews", label: "Reviews", icon: Star },
];

export function VendorLayout({ children }: VendorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v) {
          setBusinessName(v.businessName ?? null);
          setProfilePictureUrl(v.user?.profilePictureUrl ?? null);
          setUserName(v.user?.name ?? null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!notificationOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/notifications?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setNotifications(d.items ?? []))
      .catch(() => setNotifications([]));
  }, [notificationOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    function fetchUnread() {
      fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) => setUnreadCount(d.count ?? 0))
        .catch(() => setUnreadCount(0));
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
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
            <User size={20} weight="regular" />
            Profile
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
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell size={22} weight="regular" className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 max-h-[280px] overflow-y-auto bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 text-center">No notifications</p>
                ) : (
                  <div className="py-1">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-2 hover:bg-slate-50 ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <p className="font-medium text-sm text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.message}</p>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setNotificationOpen(false)}
                            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:underline"
                          >
                            View <CaretRight size={12} weight="bold" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 border-t border-slate-100"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 pl-2 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none mb-1 text-slate-900">
                {businessName || "—"}
              </p>
              <p className="text-xs text-slate-500">{userName || "—"}</p>
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
          <div className="max-w-7xl mx-auto w-full">{children}</div>
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
