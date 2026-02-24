"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Calendar, Plus, Compass, User } from "@phosphor-icons/react";
import { Logo } from "./Logo";


const navItems = [
  { href: "/dashboard", Icon: House, label: "Home" },
  { href: "/events", Icon: Calendar, label: "Events" },
  { href: "/events/create", Icon: Plus, label: "Create" },
  { href: "/services", Icon: Compass, label: "Discover" },
  { href: "/profile", Icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-100 md:bg-white md:shrink-0">
      <div className="p-6 border-b border-slate-100">
        <Logo href="/dashboard" className="text-primary text-2xl md:text-3xl lg:text-4xl" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, Icon, label }) => {
          const isActive =
            href === "/events/create"
              ? pathname === "/events/create"
              : href === "/events"
                ? pathname.startsWith("/events") && pathname !== "/events/create"
                : href === "/services"
                  ? pathname === "/services" || pathname.startsWith("/services/catering") || pathname.startsWith("/services/coming-soon")
                  : pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={22} weight={isActive ? "bold" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
