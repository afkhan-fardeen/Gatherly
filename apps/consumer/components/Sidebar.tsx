"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { House, Calendar, SquaresFour, Bell, User } from "@phosphor-icons/react";
import { Logo } from "./Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const navItems = [
  { href: "/dashboard", Icon: House, label: "Home" },
  { href: "/events", Icon: Calendar, label: "Events" },
  { href: "/services", Icon: SquaresFour, label: "Services" },
  { href: "/notifications", Icon: Bell, label: "Notifications" },
  { href: "/profile", Icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user?.name ?? null);
        setProfilePictureUrl(user?.profilePictureUrl ?? null);
      } catch {
        setUserName(null);
        setProfilePictureUrl(null);
      }
    }
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUserName(data.name ?? null);
            setProfilePictureUrl(data.profilePictureUrl ?? null);
            const prev = localStorage.getItem("user");
            const merged = prev ? { ...JSON.parse(prev), ...data } : data;
            localStorage.setItem("user", JSON.stringify(merged));
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-100 md:bg-white md:shrink-0">
      <div className="p-6 border-b border-slate-100">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/" &&
              pathname.startsWith(href) &&
              !pathname.startsWith("/events/create") &&
              !pathname.startsWith("/services/catering") &&
              !pathname.startsWith("/services/coming-soon"));
          const showBadge = href === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={22} weight={isActive ? "bold" : "regular"} />
              {label}
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {userName && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm overflow-hidden shrink-0">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 truncate">
              {userName}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
