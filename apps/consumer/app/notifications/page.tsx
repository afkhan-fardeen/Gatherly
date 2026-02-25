"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CaretRight,
  CalendarBlank,
  CheckCircle,
  ChatCircle,
  CreditCard,
  CalendarCheck,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL, fetchAuth } from "@/lib/api";
import { getToken } from "@/lib/session";
import { CHERRY, ROUND, TYPO } from "@/lib/events-ui";
import { formatRelativeTime } from "@/lib/date-utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, { Icon: typeof CalendarBlank; bg: string; color: string }> = {
  event: { Icon: CalendarBlank, bg: "bg-primary/10", color: "text-primary" },
  booking: { Icon: CheckCircle, bg: "bg-emerald-500/10", color: "text-emerald-700" },
  message: { Icon: ChatCircle, bg: "bg-blue-500/10", color: "text-blue-700" },
  payment: { Icon: CreditCard, bg: "bg-amber-500/10", color: "text-amber-700" },
  reminder: { Icon: CalendarCheck, bg: "bg-primary/10", color: "text-primary" },
};

function getTypeConfig(type: string) {
  return TYPE_ICONS[type] ?? TYPE_ICONS.event;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login?redirect=" + encodeURIComponent("/notifications"));
      return;
    }
    function fetchNotifications(isInitial = false) {
      fetchAuth(`${API_URL}/api/notifications`)
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data) => setNotifications(data.items ?? []))
        .catch(() => setNotifications([]))
        .finally(() => {
          if (isInitial) setLoading(false);
        });
    }
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
  }, [router]);

  async function markAsRead(id: string) {
    await fetchAuth(`${API_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function markAllRead() {
    await fetchAuth(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
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
        <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-3">
          {title}
        </h3>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {items.map((notification) => {
            const { Icon, bg, color } = getTypeConfig(notification.type);
            const isUnread = !notification.isRead;
            const cardClass = `flex items-center gap-2.5 py-2.5 px-3 rounded-[16px] border transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] ${
              isUnread
                ? "bg-[#fdfaf7] border-l-4 border-l-primary border-primary/10"
                : "bg-white border border-primary/10"
            }`;
            const borderStyle = isUnread
              ? { borderLeftColor: CHERRY }
              : { borderColor: "rgba(0,0,0,0.06)" };

            const inner = (
              <>
                <div
                  className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${bg} ${color}`}
                >
                  <Icon size={18} weight="regular" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[14px] font-semibold text-[#1e0f14]">
                    {notification.title}
                  </p>
                  <p className="text-[12px] font-normal text-[#a0888d] mt-0.5 line-clamp-1">
                    {notification.message}
                  </p>
                  <p className="text-[10px] font-light text-[#9e8085] mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {notification.link && (
                  <CaretRight
                    size={16}
                    weight="regular"
                    className="text-slate-400 shrink-0"
                  />
                )}
              </>
            );

            const onClick = () => isUnread && markAsRead(notification.id);

            return notification.link ? (
              <Link
                key={notification.id}
                href={notification.link}
                onClick={onClick}
                className={cardClass}
                style={borderStyle}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={notification.id}
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onClick()}
                className={`${cardClass} cursor-pointer`}
                style={borderStyle}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="px-5 md:px-8 pt-6 pb-40"
        style={{
          background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)",
        }}
      >
        {/* Header - My Events style */}
        <header
          className="sticky top-0 z-20 mb-6"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
                style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
              >
                <ArrowLeft size={20} weight="regular" />
              </Link>
              <div>
                <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                  My <span className="italic font-normal text-primary">Notifications</span>
                </h1>
                <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                  Alerts and updates
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[13px] font-semibold text-primary hover:opacity-80 transition-opacity shrink-0"
            >
              Mark all read
            </button>
          )}
          </div>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-24 bg-slate-200/50 animate-pulse ${ROUND}`}
                style={{ borderRadius: 18 }}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-6 rounded-[20px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center"
            style={{ minHeight: 280 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bell size={32} weight="regular" className="text-primary" />
            </div>
            <p className="font-serif text-[18px] font-medium text-[#1e0f14]">
              No notifications
            </p>
            <p className="text-[14px] font-light text-[#a0888d] mt-1">
              You&apos;re all caught up
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <NotificationSection title="Recent" items={recent} />
            <NotificationSection title="Earlier" items={earlier} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
