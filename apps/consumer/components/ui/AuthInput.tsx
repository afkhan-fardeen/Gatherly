interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  minLength?: number;
  icon?: React.ReactNode;
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
  icon,
}: AuthInputProps) {
  const inputId = `auth-${label.replace(/\s/g, "-").toLowerCase()}`;
  return (
    <div>
      <label
        className="block text-sm font-medium text-slate-600 mb-2 ml-1"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="flex items-center h-12 bg-slate-50 rounded-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
        {icon && (
          <div className="pl-4 shrink-0 text-slate-400 [&>svg]:w-[18px] [&>svg]:h-[18px]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`flex-1 min-w-0 h-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none ${
            icon ? "pl-3 pr-5" : "px-5"
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 ml-1">{error}</p>}
    </div>
  );
}
