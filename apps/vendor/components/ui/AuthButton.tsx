interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
  className?: string;
  onClick?: () => void;
}

export function AuthButton({
  children,
  loading,
  disabled,
  type = "submit",
  className = "",
  onClick,
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:active:scale-100 px-10 py-3 w-full ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
