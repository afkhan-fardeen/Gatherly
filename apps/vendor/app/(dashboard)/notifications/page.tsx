"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CaretRight } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";

import { API_URL } from "@/lib/api";

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
    if (!token) return;
    fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setNotifications(data.items ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
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

  return (
    <VendorLayout>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
          <Bell size={64} weight="regular" className="text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4 font-medium">No notifications</p>
          <p className="text-slate-400 text-sm mt-1">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
          {notifications.map((notification) => (
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
                <p className="text-sm text-slate-500 mt-0.5">{notification.message}</p>
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
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <CaretRight size={20} weight="regular" className="text-slate-600" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorLayout>
  );
}
