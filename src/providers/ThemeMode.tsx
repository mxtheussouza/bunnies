import React from "react";

interface ThemeModeInterface {
  darkTheme: boolean;
  toggleTheme(): void;
}

interface ThemeModeProviderProps {
  children: JSX.Element[] | JSX.Element;
}

export const ThemeModeContext = React.createContext<ThemeModeInterface>({
  darkTheme: true,
  toggleTheme: () => null,
} as ThemeModeInterface);

const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
  const [darkTheme, setDarkTheme] = React.useState<boolean>(true);

  React.useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem("dark-mode"));

    if (isNaN(useDarkTheme) || useDarkTheme === 1) {
      setDarkTheme(true);
    } else {
      setDarkTheme(false);
    }
  }, []);

  /**
   * On Dark theme change
   */
  React.useEffect(() => {
    if (darkTheme) {
      localStorage.setItem("dark-mode", "1");
      document.body.classList.add("dark-mode");
    } else {
      localStorage.setItem("dark-mode", "0");
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  function toggleTheme() {
    setDarkTheme(!darkTheme);
  }

  return (
    <ThemeModeContext.Provider value={{ darkTheme, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
