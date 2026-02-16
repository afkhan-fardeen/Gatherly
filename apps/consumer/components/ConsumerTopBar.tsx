"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, User, SignOut, CaretRight } from "@phosphor-icons/react";

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

const RECENT_DAYS = 7;

export function ConsumerTopBar() {
  const [user, setUser] = useState<{ name: string; profilePictureUrl?: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {});
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
  }, []);

  useEffect(() => {
    if (!notificationOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setNotifications(d.items ?? []))
      .catch(() => setNotifications([]));
  }, [notificationOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        profileRef.current && !profileRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

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
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const recent = notifications.filter((n) => new Date(n.createdAt) >= cutoff);
  const earlier = notifications.filter((n) => new Date(n.createdAt) < cutoff);

  return (
    <div className="sticky top-0 z-40 bg-white/90 ios-blur border-b border-slate-100 shrink-0">
      <div className="flex justify-end items-center gap-2 px-4 py-2">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Bell size={22} weight="regular" className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 flex justify-between items-center border-b border-slate-100">
                <span className="font-semibold text-slate-900">Notifications</span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    href="/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-500 text-center">
                  No notifications
                </p>
              ) : (
                <div className="py-2">
                  {recent.length > 0 && (
                    <div className="px-4 py-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Recent
                      </p>
                      <div className="space-y-0">
                        {recent.map((n) => (
                          <div
                            key={n.id}
                            className={`py-2 px-2 rounded-md -mx-2 ${!n.isRead ? "bg-primary/5" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-500 truncate">{n.message}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {!n.isRead && (
                                  <button
                                    type="button"
                                    onClick={() => markAsRead(n.id)}
                                    className="text-[10px] font-semibold text-primary"
                                  >
                                    Mark read
                                  </button>
                                )}
                                {n.link && (
                                  <Link
                                    href={n.link}
                                    onClick={() => setNotificationOpen(false)}
                                    className="p-1 rounded hover:bg-slate-100"
                                  >
                                    <CaretRight size={14} className="text-slate-400" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {earlier.length > 0 && (
                    <div className="px-4 py-1 mt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Earlier
                      </p>
                      <div className="space-y-0">
                        {earlier.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`py-2 px-2 rounded-md -mx-2 ${!n.isRead ? "bg-primary/5" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-500 truncate">{n.message}</p>
                              </div>
                              {n.link && (
                                <Link
                                  href={n.link}
                                  onClick={() => setNotificationOpen(false)}
                                  className="p-1 rounded hover:bg-slate-100 shrink-0"
                                >
                                  <CaretRight size={14} className="text-slate-400" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                        {earlier.length > 5 && (
                          <Link
                            href="/notifications"
                            onClick={() => setNotificationOpen(false)}
                            className="block py-2 text-xs font-medium text-primary hover:underline"
                          >
                            View {earlier.length - 5} more
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationOpen(false);
            }}
            className="w-9 h-9 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border-2 border-transparent hover:border-primary/30 transition-colors"
          >
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-semibold text-primary text-sm">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?"}
              </span>
            )}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-md shadow-lg border border-slate-100 z-50">
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <User size={18} weight="regular" />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <SignOut size={18} weight="regular" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
