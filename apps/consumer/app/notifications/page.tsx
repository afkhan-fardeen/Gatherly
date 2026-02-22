"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CaretRight } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { CHERRY, ROUND, TYPO } from "@/lib/events-ui";

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
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/notifications"));
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
        <h3 className={`${TYPO.H3} mb-3 text-text-primary`}>
          {title}
        </h3>
        <div className="space-y-2">
          {items.map((notification) => {
            const inner = (
              <>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHERRY }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`${TYPO.CARD_TITLE} text-sm truncate`}>
                    {notification.title}
                  </p>
                  <p className={`${TYPO.CAPTION} mt-0.5`}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {notification.link && (
                  <CaretRight size={18} weight="regular" className="text-slate-400 shrink-0" />
                )}
              </>
            );
            const baseClass = `flex items-center gap-4 py-3 px-4 rounded-[10px] border transition-colors hover:border-slate-200 ${
              !notification.isRead ? "bg-white" : "bg-white/80"
            }`;
            const borderStyle = { borderColor: "rgba(0,0,0,0.06)" };
            const onClick = () => !notification.isRead && markAsRead(notification.id);
            return notification.link ? (
              <Link key={notification.id} href={notification.link} onClick={onClick} className={`${baseClass} border`} style={borderStyle}>
                {inner}
              </Link>
            ) : (
              <div key={notification.id} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()} className={`${baseClass} border`} style={borderStyle}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className={`${TYPO.H1} text-text-primary`}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm font-semibold"
              style={{ color: CHERRY }}
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="p-6 pb-40">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-20 bg-slate-200/60 animate-pulse ${ROUND}`}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="text-center py-16 rounded-[10px] border bg-white"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <Bell size={40} weight="regular" className="text-slate-300 mx-auto" />
            <p className={`${TYPO.SUBTEXT} mt-4 font-medium`}>No notifications</p>
            <p className={`${TYPO.SUBTEXT} mt-1`}>
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
