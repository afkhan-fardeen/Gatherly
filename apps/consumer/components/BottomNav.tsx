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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 ios-blur border-t border-slate-100 px-10 py-4 pb-8 flex justify-between items-center rounded-md z-50 md:hidden">
      {navItems.map(({ href, Icon, label }) => {
        const isActive =
          pathname === href ||
          (href !== "/" &&
            pathname.startsWith(href) &&
            !pathname.startsWith("/events/create") &&
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
