interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export function MetricCard({ label, value, icon, badge }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all group">
      <div className="flex items-start justify-between">
        <div className="shrink-0 [&>div]:group-hover:scale-110 [&>div]:transition-transform">{icon}</div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
