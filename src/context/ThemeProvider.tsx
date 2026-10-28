import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_ACCENT, ThemeContext, type Theme } from "./themeContext";
import { hexToRgbChannels } from "@/lib/utils";

const THEME_KEY = "fitcheck:theme";
const ACCENT_KEY = "fitcheck:accent";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains("light") ? "light" : "dark"));
  const [accent, setAccentState] = useState<string>(() => {
    const stored = localStorage.getItem(ACCENT_KEY);
    return stored && /^#[0-9a-f]{6}$/i.test(stored) ? stored : DEFAULT_ACCENT;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0A0A0B" : "#FAFAFB");
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", hexToRgbChannels(accent));
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const setAccent = useCallback((hex: string) => {
    if (/^#[0-9a-f]{6}$/i.test(hex)) setAccentState(hex);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, accent, setAccent }), [theme, toggleTheme, accent, setAccent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
