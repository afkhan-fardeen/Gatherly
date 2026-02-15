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
};

function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ href: "/dashboard", label: "Dashboard" }];

  const crumbs: { href: string; label: string }[] = [];
  let href = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;
    const isUuid = /^[0-9a-f-]{36}$/i.test(seg);
    const label = ROUTE_LABELS[seg] || (isUuid ? "Package" : seg.charAt(0).toUpperCase() + seg.slice(1));
    crumbs.push({ href, label });
  }

  return crumbs;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <nav className="flex items-center gap-2 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {i > 0 && <CaretRight size={14} weight="bold" className="text-slate-300" />}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-slate-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-500 hover:text-slate-700">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
