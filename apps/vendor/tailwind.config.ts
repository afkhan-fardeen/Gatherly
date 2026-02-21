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
        display: ["Inter", "sans-serif"],
        logo: ["Bright", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6D0D35",
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4a9b9",
          400: "#ec7494",
          500: "#e04d73",
          600: "#6D0D35",
          700: "#5c0b2d",
          800: "#4d0925",
          900: "#3f0720",
        },
        confirmed: "#34C759",
        pending: "#FF9500",
        declined: "#8E8E93",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
