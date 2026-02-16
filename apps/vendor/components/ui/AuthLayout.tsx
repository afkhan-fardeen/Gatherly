import { Logo } from "../Logo";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
}

export function AuthLayout({ title, children, footer, wide }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-10 bg-slate-50 overflow-y-auto">
      <div className={`w-full flex flex-col ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex flex-col items-center mb-10">
          <Logo href="/" className="mb-6 text-2xl" />
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight text-center">
            {title}
          </h1>
        </div>
        {children}
        <div className="pt-10 text-center">{footer}</div>
      </div>
    </div>
  );
}
