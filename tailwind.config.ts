import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", sm: "1.5rem" }, screens: { xl: "1200px" } },
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        elevated: v("elevated"),
        fg: v("fg"),
        muted: v("muted"),
        subtle: v("subtle"),
        accent: v("accent"),
        "accent-fg": v("accent-fg"),
        highlight: v("highlight"),
        success: v("success"),
        warning: v("warning"),
        danger: v("danger"),
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
      },
      fontFamily: {
        sans: ["Inter", "Inter Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["24px", { lineHeight: "32px", letterSpacing: "-0.015em" }],
        "2xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "3xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.03em" }],
        "4xl": ["64px", { lineHeight: "68px", letterSpacing: "-0.035em" }],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
      maxWidth: { content: "1200px" },
      boxShadow: {
        card: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 1px 2px 0 rgb(0 0 0 / 0.12)",
        pop: "0 16px 48px -12px rgb(0 0 0 / 0.45), 0 0 0 1px var(--line)",
        glow: "0 0 0 1px rgb(var(--accent) / 0.4), 0 8px 32px -8px rgb(var(--accent) / 0.5)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        scan: { "0%": { top: "0%" }, "100%": { top: "100%" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        scan: "scan 1.4s cubic-bezier(.45,0,.55,1) infinite alternate",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
