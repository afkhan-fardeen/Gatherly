"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Calendar, Plus, Compass, User } from "@phosphor-icons/react";

const CHERRY = "#6D0D35";

const navItems = [
  { href: "/dashboard", Icon: House, label: "Home" },
  { href: "/events", Icon: Calendar, label: "Events" },
  { href: "/events/create", Icon: Plus, label: "Create", isCenter: true },
  { href: "/services", Icon: Compass, label: "Discover" },
  { href: "/profile", Icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t rounded-t-lg shadow-sm px-4 py-3 flex justify-between items-center z-50 md:hidden"
      style={{
        borderColor: "rgba(0,0,0,0.06)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map(({ href, Icon, label, isCenter }) => {
        let isActive = false;
        if (href === "/events/create") {
          isActive = pathname === "/events/create";
        } else if (href === "/events") {
          isActive = pathname.startsWith("/events") && pathname !== "/events/create";
        } else if (href === "/services") {
          isActive = pathname === "/services" || pathname.startsWith("/services/catering") || pathname.startsWith("/services/coming-soon");
        } else {
          isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        }
        const iconSize = isCenter ? 32 : 26;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 ${
              isCenter ? "flex-1 max-w-[72px]" : "flex-1"
            }`}
          >
            <div
              className={`flex items-center justify-center ${isCenter ? "-mt-4" : ""}`}
            >
              <Icon
                size={iconSize}
                weight={isActive ? "bold" : "regular"}
                style={{
                  color: isActive ? CHERRY : "#9CA3AF",
                }}
              />
            </div>
            <span
              className="text-[9px] font-extrabold uppercase tracking-widest"
              style={{ color: isActive && !isCenter ? CHERRY : "#9CA3AF" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
