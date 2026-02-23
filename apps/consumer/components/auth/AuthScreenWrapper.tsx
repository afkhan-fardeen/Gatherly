"use client";

import { useEffect } from "react";

const CHERRY_TINT = "#f0d4e0";
const PRIMARY = "#6D0D35";

interface AuthScreenWrapperProps {
  children: React.ReactNode;
  showPill?: boolean;
  centered?: boolean;
  backgroundColor?: string;
}

export function AuthScreenWrapper({ children, showPill = true, centered = true, backgroundColor = "#FFFFFF" }: AuthScreenWrapperProps) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.backgroundColor;
    const prevBody = body.style.backgroundColor;
    html.style.backgroundColor = backgroundColor;
    body.style.backgroundColor = backgroundColor;
    return () => {
      html.style.backgroundColor = prevHtml;
      body.style.backgroundColor = prevBody;
    };
  }, [backgroundColor]);

  return (
    <div
      className={`fixed inset-0 top-0 left-0 right-0 bottom-0 w-full min-h-[100dvh] h-[100dvh] flex p-6 overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${centered ? "items-center justify-center" : "flex-col items-center pt-8"}`}
      style={{ backgroundColor, minHeight: "100dvh", height: "100dvh" }}
    >
      {/* Organic blur shapes - signin.html positions */}
      <div
        className="absolute rounded-full blur-[60px] pointer-events-none w-[300px] h-[300px] -top-[50px] -right-[100px] z-0"
        style={{ backgroundColor: CHERRY_TINT, opacity: 0.15 }}
      />
      <div
        className="absolute rounded-full blur-[50px] pointer-events-none w-[250px] h-[250px] bottom-[50px] -left-[80px] z-0"
        style={{ backgroundColor: CHERRY_TINT, opacity: 0.12 }}
      />
      <div className="w-full max-w-[400px] z-10 flex flex-col gap-8">
        {children}
      </div>
      {showPill && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full z-20"
          style={{ backgroundColor: `${PRIMARY}1A` }}
        />
      )}
    </div>
  );
}
