"use client";

import * as React from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
}

function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function ThemeToggle() {
  // Initialize from storage (so the button label matches immediately)
  const [theme, setTheme] = React.useState<Theme>(() => "light");

  // Apply on mount (and keep in sync with stored value)
  React.useEffect(() => {
    const initial = getStoredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        "inline-flex items-center gap-2",
        "rounded-full border px-3 py-2 text-sm font-medium",
        "transition-colors hover:opacity-90 active:opacity-80",
        "min-h-11 min-w-11",
        "border-gray-200 bg-white text-gray-900",
        "dark:border-white/15 dark:bg-slate-900/40 dark:text-slate-100",
      ].join(" ")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {isDark ? "🌙" : "☀️"}
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
