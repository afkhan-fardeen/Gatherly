"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, SignOut } from "@phosphor-icons/react";
import { Logo } from "./Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function ConsumerTopBar() {
  const [user, setUser] = useState<{ name: string; profilePictureUrl?: string | null } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
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
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
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

  return (
    <div className="sticky top-0 z-40 bg-white/90 ios-blur border-b border-slate-100 shrink-0">
      <div className="flex justify-between items-center px-4 py-2">
        <Logo href="/dashboard" compact />
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
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
            <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-md shadow-lg border border-slate-100 z-[9999]">
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
