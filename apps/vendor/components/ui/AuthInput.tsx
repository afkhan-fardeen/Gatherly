interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  minLength?: number;
}

export function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  minLength,
}: AuthInputProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium text-slate-600 mb-2 ml-1"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full h-[58px] px-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all outline-none"
      />
      {error && <p className="mt-1 text-sm text-red-600 ml-1">{error}</p>}
    </div>
  );
}
