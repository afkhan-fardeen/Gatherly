"use client";

const SOFT_LILAC = "#CFD7F2";
const PRIMARY = "#3F0810";

interface AuthScreenWrapperProps {
  children: React.ReactNode;
  showPill?: boolean;
  centered?: boolean;
}

export function AuthScreenWrapper({ children, showPill = true, centered = true }: AuthScreenWrapperProps) {
  return (
    <div
      className={`fixed inset-0 min-h-[100dvh] h-[100dvh] flex p-6 overflow-y-auto overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${centered ? "items-center justify-center" : "flex-col items-center pt-8"}`}
      style={{ backgroundColor: "#F9F2E7" }}
    >
      {/* Organic blur shapes - signin.html positions */}
      <div
        className="absolute rounded-full blur-[60px] pointer-events-none w-[300px] h-[300px] -top-[50px] -right-[100px] z-0"
        style={{ backgroundColor: SOFT_LILAC, opacity: 0.15 }}
      />
      <div
        className="absolute rounded-full blur-[50px] pointer-events-none w-[250px] h-[250px] bottom-[50px] -left-[80px] z-0"
        style={{ backgroundColor: SOFT_LILAC, opacity: 0.12 }}
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
