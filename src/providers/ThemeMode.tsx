import React from "react";

interface ThemeModeInterface {
  darkTheme: boolean;
  toggleTheme(): void;
}

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeContext = React.createContext<ThemeModeInterface>({
  darkTheme: true,
  toggleTheme: () => null,
} as ThemeModeInterface);

const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
  const [darkTheme, setDarkTheme] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("dark-mode") !== "0";
    } catch {
      return true;
    }
  });

  /**
   * On Dark theme change
   */
  React.useEffect(() => {
    try {
      localStorage.setItem("dark-mode", darkTheme ? "1" : "0");
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
    if (darkTheme) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  function toggleTheme() {
    setDarkTheme(current => !current);
  }

  return (
    <ThemeModeContext.Provider value={{ darkTheme, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
