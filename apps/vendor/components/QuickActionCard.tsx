import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
  disabled?: boolean;
}

export function QuickActionCard({ title, subtitle, icon, href, disabled }: QuickActionCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between [&>div]:group-hover:scale-110 [&>div]:transition-transform">
        {icon}
      </div>
      <div className="mt-4">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </>
  );

  const baseClass =
    "bg-white p-6 rounded-2xl border border-slate-200 transition-all block group " +
    (disabled
      ? "opacity-75 cursor-default"
      : "hover:shadow-lg hover:shadow-slate-200/40 hover:border-primary/50");

  if (disabled || !href) {
    return <div className={baseClass}>{content}</div>;
  }

  return (
    <Link href={href} className={baseClass}>
      {content}
    </Link>
  );
}
