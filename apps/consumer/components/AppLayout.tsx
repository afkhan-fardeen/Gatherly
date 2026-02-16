"use client";

import { BottomNav } from "./BottomNav";
import { ConsumerTopBar } from "./ConsumerTopBar";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center md:items-stretch min-w-0 overflow-hidden">
        <main className="w-full max-w-[430px] md:max-w-6xl md:flex-1 md:px-8 md:py-6 bg-white min-h-full relative shadow-2xl md:shadow-none flex flex-col overflow-y-auto overflow-x-hidden min-w-0">
          {showNav && <ConsumerTopBar />}
          {children}
          {showNav && (
            <>
              <div className="h-24 md:hidden shrink-0" aria-hidden />
              <BottomNav />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
