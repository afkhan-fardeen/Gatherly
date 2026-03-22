"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Bell, CaretRight } from "@phosphor-icons/react";
import { VendorLayout } from "@/components/VendorLayout";
import { SkeletonListRow } from "@/components/VendorSkeleton";

import { API_URL, getNetworkErrorMessage, parseApiError, vendorFetch } from "@/lib/api";

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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    vendorFetch(`${API_URL}/api/notifications`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLoadError(parseApiError(data) || "Could not load notifications");
          setNotifications([]);
          return;
        }
        setLoadError(null);
        setNotifications((data as { items?: Notification[] }).items ?? []);
      })
      .catch((err) => {
        setLoadError(getNetworkErrorMessage(err, "Could not load notifications"));
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markAsRead(id: string) {
    try {
      const res = await vendorFetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(parseApiError(data) || "Could not update notification");
        return;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error(getNetworkErrorMessage(err, "Could not update notification"));
    }
  }

  async function markAllRead() {
    try {
      const res = await vendorFetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(parseApiError(data) || "Could not mark all as read");
        return;
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      toast.error(getNetworkErrorMessage(err, "Could not mark all as read"));
    }
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
            <SkeletonListRow key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-16 rounded-xl border border-red-100 bg-red-50/50 px-6">
          <p className="text-red-700 font-medium">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-semibold text-primary hover:underline"
          >
            Refresh page
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
          <Bell size={64} weight="regular" className="text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4 font-medium">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            When customers book or your bookings change, updates will appear here.
          </p>
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
