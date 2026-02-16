"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    function fetchNotifications(isInitial = false) {
      fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data) => setNotifications(data.items ?? []))
        .catch(() => setNotifications([]))
        .finally(() => { if (isInitial) setLoading(false); });
    }
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function markAllRead() {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const RECENT_DAYS = 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const recent = notifications.filter((n) => new Date(n.createdAt) >= cutoff);
  const earlier = notifications.filter((n) => new Date(n.createdAt) < cutoff);

  function NotificationSection({
    title,
    items,
  }: {
    title: string;
    items: Notification[];
  }) {
    if (items.length === 0) return null;
    return (
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
          {title}
        </h3>
        <div className="space-y-0 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white overflow-hidden">
          {items.map((notification) => (
            <div
              key={notification.id}
              className={`py-4 px-4 flex items-start gap-4 ${
                !notification.isRead ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base text-slate-900">
                  {notification.title}
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
                {notification.link && (
                  <Link
                    href={notification.link}
                    className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <CaretRight size={20} weight="regular" className="text-slate-600" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm font-semibold text-primary"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="p-6 pb-32">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 rounded-md border border-slate-200 bg-white">
            <Bell size={64} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No notifications</p>
            <p className="text-slate-400 text-sm mt-1">
              You&apos;re all caught up
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <NotificationSection title="Recent" items={recent} />
            <NotificationSection title="Earlier" items={earlier} />
          </div>
        )}
      </main>
    </AppLayout>
  );
}
