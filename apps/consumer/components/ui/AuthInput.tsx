"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const CHERRY_LIGHT = "#f0d4e0";
const CHERRY = "#6D0D35";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const inputId = `auth-${label.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <div className="space-y-1.5">
      <label
        className="text-[11px] font-normal uppercase tracking-wider block ml-1"
        htmlFor={inputId}
        style={{ color: "#4B5563" }}
      >
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:[&>svg]:opacity-100"
            style={{ color: CHERRY }}
          >
            <div className="[&>svg]:opacity-60 group-focus-within:[&>svg]:opacity-100 [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </div>
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`w-full rounded-[12px] py-4 text-sm font-normal outline-none focus:ring-2 focus:ring-[#6D0D3526] focus:border-[#6D0D35] transition-all placeholder:text-gray-500 ${
            icon ? "pl-12" : "pl-4"
          } ${isPassword ? "pr-12" : "pr-4"}`}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            border: "none",
            color: "#4B5563",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-100"
            style={{ color: CHERRY }}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlash size={22} weight="regular" />
            ) : (
              <Eye size={22} weight="regular" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-normal text-red-600 ml-1">{error}</p>}
    </div>
  );
}
