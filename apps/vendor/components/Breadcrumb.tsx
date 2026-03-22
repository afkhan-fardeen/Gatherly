"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "Profile",
  packages: "Packages",
  bookings: "Bookings",
  new: "New",
  edit: "Edit",
  spotlight: "Spotlight",
  notifications: "Notifications",
  availability: "Unavailable dates",
  reviews: "Reviews",
};

function isUuid(seg: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(seg);
}

export function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ href: "/dashboard", label: "Dashboard" }];

  const crumbs: { href: string; label: string }[] = [];
  let href = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;
    const prev = segments[i - 1];

    let label: string;
    if (isUuid(seg)) {
      if (prev === "bookings") label = "Booking";
      else if (prev === "packages") label = "Package";
      else label = "Details";
    } else {
      label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    }
    crumbs.push({ href, label });
  }

  return crumbs;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2 min-w-0">
          {i > 0 && <CaretRight size={14} weight="bold" className="text-slate-300 shrink-0" aria-hidden />}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-slate-900 truncate">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-500 hover:text-slate-700 truncate">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
