import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand core
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Slate palette for backgrounds
        surface: {
          950: "#020617",
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        },
        // Accent green
        accent: {
          50:  "#ecfdf5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(14,165,233,0.15), transparent)",
        "cta-gradient": "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.12), transparent)",
        "grid-pattern": "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "48px 48px",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(14,165,233,0.15)",
        "glow-md": "0 0 40px rgba(14,165,233,0.2)",
        "glow-lg": "0 0 80px rgba(14,165,233,0.25)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.08)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
