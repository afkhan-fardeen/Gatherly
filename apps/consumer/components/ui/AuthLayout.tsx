import { Logo } from "../Logo";

const BURGUNDY = "#3F0810";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div
        className="h-screen min-h-screen flex flex-col items-center justify-center px-8 py-10 overflow-hidden"
        style={{ backgroundColor: "#FFFFFF" }}
      >
      <div className="w-full max-w-md flex flex-col">
        <div className="flex flex-col items-center mb-10">
          <Logo href="/welcome" className="mb-6 text-3xl" />
          <h1
          className="text-[28px] font-bold tracking-tight leading-tight text-center"
          style={{ color: BURGUNDY }}
        >
            {title}
          </h1>
        </div>
        {children}
        <div className="pt-10 text-center">{footer}</div>
      </div>
    </div>
  );
}
