import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Light/dark theme. Three states, not two:
 *
 *   "system" (default) -> follow the OS, and keep following it if it changes
 *   "light" / "dark"   -> the visitor overrode it, so stop following the OS
 *
 * The resolved theme is written to <html data-theme>, which is what the
 * stylesheet's token overrides key off. The initial value is also applied by a
 * tiny inline script in index.html, before React mounts, so a dark-mode
 * visitor never sees a frame of cream page first.
 */

const STORAGE_KEY = "quad_theme";
const ThemeContext = createContext(null);

function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readStored);
  const [resolved, setResolved] = useState(() =>
    readStored() === "system" ? systemTheme() : readStored()
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const next = preference === "system" ? (media.matches ? "dark" : "light") : preference;
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
      // Keeps the mobile browser chrome in step with the page.
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0A1416" : "#0d3b36");
    };

    apply();

    if (preference !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  const setTheme = useCallback((value) => {
    setPreference(value);
    try {
      if (value === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch { /* storage unavailable */ }
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ preference, theme: resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
