"use client";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { BottomNav } from "./BottomNav";
import { ConsumerTopBar } from "./ConsumerTopBar";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  showTopBar?: boolean;
  /** When true, main does not scroll - child handles its own scroll (e.g. create event) */
  fullHeight?: boolean;
}

function shouldShowMinimalTopBar(pathname: string): boolean {
  if (pathname === "/dashboard") return true;
  if (pathname === "/events") return true;
  if (/^\/events\/[^/]+$/.test(pathname)) return true; // event detail only
  if (pathname.startsWith("/services")) return true;
  return false;
}

export function AppLayout({ children, showNav = true, showTopBar = true, fullHeight = false }: AppLayoutProps) {
  const pathname = usePathname();
  const showMinimalTopBar = showNav && showTopBar && shouldShowMinimalTopBar(pathname ?? "");

  return (
    <>
      <div className="min-h-screen h-[100dvh] flex flex-col md:flex-row bg-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center md:items-stretch min-w-0 overflow-hidden">
          <main
            className={`w-full max-w-[430px] md:max-w-6xl flex-1 min-h-0 md:px-8 md:py-6 bg-white relative shadow-2xl md:shadow-none flex flex-col min-w-0 ${
              fullHeight ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
            }`}
          >
            {showMinimalTopBar && <div className="shrink-0 h-16 min-h-[64px]" aria-hidden />}
            {showMinimalTopBar &&
              typeof document !== "undefined" &&
              createPortal(<ConsumerTopBar />, document.body)}
            {children}
            {showNav && (
              <div
                className="md:hidden shrink-0"
                style={{ height: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
                aria-hidden
              />
            )}
          </main>
        </div>
      </div>
      {showNav &&
        typeof document !== "undefined" &&
        createPortal(<BottomNav />, document.body)}
    </>
  );
}
