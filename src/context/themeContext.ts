import { createContext, useContext } from "react";

export type Theme = "dark" | "light";
export const DEFAULT_ACCENT = "#7C5CFF";

export interface ThemeValue {
  theme: Theme;
  toggleTheme: () => void;
  accent: string;
  setAccent: (hex: string) => void;
}

export const ThemeContext = createContext<ThemeValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
