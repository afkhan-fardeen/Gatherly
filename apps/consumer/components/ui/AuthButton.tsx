interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
}

export function AuthButton({
  children,
  loading,
  disabled,
  type = "submit",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="w-full h-12 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold rounded-md shadow-sm transition-all text-lg disabled:opacity-50 disabled:active:scale-100"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
