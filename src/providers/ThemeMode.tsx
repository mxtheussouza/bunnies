import React from "react";

export type ThemePreference = "system" | "light" | "dark";
export const THEME_KEY = "bunnies.theme-preference";

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "system" || saved === "light" || saved === "dark")
      return saved;
    const legacy = localStorage.getItem("dark-mode");
    return legacy === "0" ? "light" : legacy === "1" ? "dark" : "system";
  } catch {
    return "system";
  }
}

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: "light" | "dark";
  setPreference(preference: ThemePreference): void;
}

export const ThemeModeContext = React.createContext<ThemeContextValue>({
  preference: "system",
  resolvedTheme: "light",
  setPreference: () => undefined,
});

export default function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreference] = React.useState(readPreference);
  const [systemDark, setSystemDark] = React.useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );
  const resolvedTheme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  React.useEffect(() => {
    if (preference !== "system" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preference]);

  React.useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = preference;
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      // An unavailable preference store must not prevent using the interface.
    }
  }, [preference, resolvedTheme]);

  return (
    <ThemeModeContext.Provider
      value={{ preference, resolvedTheme, setPreference }}
    >
      {children}
    </ThemeModeContext.Provider>
  );
}
