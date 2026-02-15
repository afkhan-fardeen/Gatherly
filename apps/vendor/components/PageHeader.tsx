import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backLink, action }: PageHeaderProps) {
  return (
    <div className="mb-10">
      {backLink && (
        <nav className="mb-6">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft size={18} weight="regular" className="transition-transform group-hover:-translate-x-0.5" />
            {backLink.label}
          </Link>
        </nav>
      )}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${backLink ? "" : ""}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
