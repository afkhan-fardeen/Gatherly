"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="page-transition"
      style={{
        animation: "pageTransitionIn 0.3s ease-out forwards",
      }}
    >
      {children}
    </div>
  );
}
