interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  /** Native tooltip on the label (e.g. metric definition). */
  labelHint?: string;
  /** One line of helper copy under the label (visible; use with labelHint for redundancy). */
  labelSubtext?: string;
}

export function MetricCard({ label, value, icon, badge, labelHint, labelSubtext }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all group">
      <div className="flex items-start justify-between">
        <div className="shrink-0 [&>div]:group-hover:scale-110 [&>div]:transition-transform">{icon}</div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500" title={labelHint}>
          {label}
        </p>
        {labelSubtext && (
          <p className="text-xs text-slate-400 mt-1 leading-snug max-w-[15rem]">{labelSubtext}</p>
        )}
        <div className={`text-2xl font-bold text-slate-900 ${labelSubtext ? "mt-2" : "mt-1"}`}>{value}</div>
      </div>
    </div>
  );
}
