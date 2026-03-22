"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  CalendarCheck,
  CurrencyCircleDollar,
  Storefront,
  Users,
  ClipboardText,
  SignOut,
} from "@phosphor-icons/react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/payouts", label: "Payouts", icon: CurrencyCircleDollar },
  { href: "/vendors", label: "Vendors", icon: Storefront },
  { href: "/users", label: "Users", icon: Users },
  { href: "/audit", label: "Audit log", icon: ClipboardText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <span className="font-bold text-primary text-lg">Gatherly Admin</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-slate-200">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <SignOut size={20} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
