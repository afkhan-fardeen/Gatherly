import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        logo: ["Bright", "serif"],
        "playfair-display": ["var(--font-playfair)", "serif"],
      },
      colors: {
        /** Text hierarchy – guideline */
        "text-primary": "#1A1A1A",
        "text-body": "#2D2D2D",
        "text-secondary": "#6B6B6B",
        "text-tertiary": "#9E9E9E",
        primary: {
          DEFAULT: "#3F0810",
          50: "#f5ecee",
          100: "#e8d4d8",
          200: "#d4a8b0",
          300: "#b87a86",
          400: "#9a4d5c",
          500: "#7a3040",
          600: "#3F0810",
          700: "#2D0610",
          800: "#1A0408",
          900: "#0a0204",
        },
        confirmed: "#34C759",
        pending: "#FF9500",
        declined: "#8E8E93",
        cancelled: "#EF4444",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2.5rem",
        item: "8px",
        card: "12px",
        pill: "18px",
        "radius-xs": "6px",
        "radius-sm": "10px",
        "radius-md": "14px",
        "radius-lg": "20px",
        "radius-xl": "28px",
      },
      fontSize: {
        /* Guideline: Micro 10px, Caption 11px, Label 12px, Small 13px, Body 14px, H3 15px, H2 17px, H1 20px */
        micro: ["10px", { lineHeight: "1.5" }],
        "caption-sm": ["11px", { lineHeight: "1.36" }],
        caption: ["12px", { lineHeight: "1.33" }],
        "body-sm": ["13px", { lineHeight: "1.38" }],
        body: ["14px", { lineHeight: "1.43" }],
        "body-lg": ["16px", { lineHeight: "1.5" }],
        "typo-h3": ["15px", { lineHeight: "1.4" }],
        "typo-h2": ["17px", { lineHeight: "1.41" }],
        "typo-h1": ["20px", { lineHeight: "1.3" }],
        /* Legacy aliases */
        "h3-g": ["15px", { lineHeight: "1.4" }],
        "h2-g": ["17px", { lineHeight: "1.41" }],
        "h1-g": ["20px", { lineHeight: "1.3" }],
      },
      spacing: {
        "4pt": "4px",
        "8pt": "8px",
        "12pt": "12px",
        "16pt": "16px",
        "20pt": "20px",
        "24pt": "24px",
        "32pt": "32px",
        "40pt": "40px",
        "48pt": "48px",
        "64pt": "64px",
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0,0,0,0.06)",
        "elevation-2": "0 2px 8px rgba(0,0,0,0.08)",
        "elevation-3": "0 4px 16px rgba(0,0,0,0.10)",
        "elevation-4": "0 8px 24px rgba(0,0,0,0.12)",
        "elevation-5": "0 16px 40px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
