"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "@phosphor-icons/react";

import { API_URL } from "@/lib/api";

export function ConsumerTopBar() {
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center md:hidden">
      <div
          className="w-full max-w-[430px] flex justify-between items-center px-6 py-4 min-h-[56px]"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
        <Link href="/dashboard" className="flex items-center shrink-0">
          <Image
            src="/logo/logo1.png"
            alt="Gatherlii"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/notifications"
          className="relative flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 transition-colors hover:opacity-80"
          aria-label="Notifications"
        >
          <Bell size={24} weight="regular" className="text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
