"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Calendar, Plus, MagnifyingGlass, User } from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", Icon: House, label: "Home" },
  { href: "/events", Icon: Calendar, label: "Events" },
  { href: "/events/create", Icon: Plus, label: "Create", isCenter: true },
  { href: "/services", Icon: MagnifyingGlass, label: "Discover" },
  { href: "/profile", Icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 min-h-[56px] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-around items-start z-50 md:hidden backdrop-blur-xl"
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        borderTop: "1px solid var(--border-subtle)",
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
        const color = isActive ? "var(--primary)" : "var(--text-tertiary)";

        if (isCenter) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 flex-1 max-w-[72px] -mt-6 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200"
                style={{
                  background: "var(--primary)",
                  color: "var(--text-inverse)",
                  boxShadow: "var(--shadow-cherry)",
                }}
              >
                <Icon size={26} weight="bold" />
              </div>
              <span
                className="text-[10px] font-medium transition-colors duration-200"
                style={{ color: isActive ? "var(--primary)" : "var(--text-tertiary)" }}
              >
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[48px] flex-1 transition-all duration-200 active:scale-95"
          >
            <Icon size={24} weight={isActive ? "fill" : "regular"} style={{ color }} />
            <span className="text-[10px] font-normal transition-colors duration-200" style={{ color }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
