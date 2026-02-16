"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Calendar, CalendarCheck, SquaresFour, User } from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", Icon: House, label: "Home" },
  { href: "/events", Icon: Calendar, label: "Events" },
  { href: "/bookings", Icon: CalendarCheck, label: "Bookings" },
  { href: "/services", Icon: SquaresFour, label: "Services" },
  { href: "/profile", Icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] bg-white/95 ios-blur border border-slate-100 rounded-2xl shadow-lg px-6 py-3 flex justify-between items-center z-50 md:hidden">
      {navItems.map(({ href, Icon, label }) => {
        const isActive =
          pathname === href ||
          (href !== "/" &&
            pathname.startsWith(href) &&
            !pathname.startsWith("/services/catering") &&
            !pathname.startsWith("/services/coming-soon"));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1.5 ${
              isActive ? "text-primary" : "text-slate-400"
            }`}
          >
            <Icon
              size={22}
              weight={isActive ? "bold" : "regular"}
              className={isActive ? "text-primary" : ""}
            />
            <span className="text-[9px] font-extrabold uppercase tracking-widest">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
