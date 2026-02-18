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
      className="w-full py-4 text-white font-semibold rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-base disabled:opacity-50 disabled:active:scale-100"
      style={{
        backgroundColor: "#6D0D35",
        boxShadow: "0 10px 15px -3px rgba(109, 13, 53, 0.2)",
      }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
