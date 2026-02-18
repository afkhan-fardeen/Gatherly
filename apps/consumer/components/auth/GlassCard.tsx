"use client";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-xl p-8 shadow-2xl ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 25px 50px -12px rgba(63, 8, 16, 0.05)",
      }}
    >
      {children}
    </div>
  );
}
