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

/** Logo + Notifications header only on home (dashboard). Other pages use their own contextual headers. */
function shouldShowLogoHeader(pathname: string): boolean {
  return pathname === "/dashboard";
}

export function AppLayout({ children, showNav = true, showTopBar = true, fullHeight = false }: AppLayoutProps) {
  const pathname = usePathname();
  const showLogoHeader = showNav && showTopBar && shouldShowLogoHeader(pathname ?? "");

  return (
    <>
      <div className="min-h-screen h-[100dvh] flex flex-col md:flex-row bg-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center md:items-stretch min-w-0 overflow-hidden">
          <main
            className={`w-full max-w-[430px] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl flex-1 min-h-0 md:px-8 md:py-6 md:mx-auto bg-white relative shadow-elevation-3 md:shadow-none flex flex-col min-w-0 ${
              fullHeight ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden scroll-touch"
            }`}
          >
            {showLogoHeader && <div className="shrink-0 h-16 min-h-[64px] md:hidden" aria-hidden />}
            {showLogoHeader &&
              typeof document !== "undefined" &&
              createPortal(<ConsumerTopBar />, document.body)}
            {children}
            {showNav && (
              <div
                className="md:hidden shrink-0"
                style={{ height: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
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
