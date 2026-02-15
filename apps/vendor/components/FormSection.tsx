interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold border-b border-slate-100 pb-3 text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
