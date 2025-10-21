// src/contexts/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // default to system preference if available, otherwise light
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored; // can be "light" | "dark" | "system"
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (e) {
      // localStorage access may fail in private browsing mode or due to browser restrictions
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [systemPref, setSystemPref] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  // Watch for system preference changes and update when theme is set to "system"
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPref(e.matches ? "dark" : "light");
    try {
      media.addEventListener("change", handler);
    } catch {
      // Safari < 14 fallback
      media.addListener(handler);
    }
    return () => {
      try {
        media.removeEventListener("change", handler);
      } catch {
        media.removeListener(handler);
      }
    };
  }, []);

  const effectiveTheme = theme === "system" ? systemPref : theme;

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage may not be available in some environments (e.g., SSR, private mode)
      // Silently ignore errors as theme persistence is non-critical
    }
    // attach data-theme attribute to html element for css selectors
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [theme, effectiveTheme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isDark = effectiveTheme === "dark";
  const value = { theme, setTheme, toggleTheme, isDark };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
