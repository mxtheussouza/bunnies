import React from "react";
import { ThemeModeContext } from "@src/providers/ThemeMode";

export const useThemeContext = () => {
  const { darkTheme, toggleTheme } = React.useContext(ThemeModeContext);

  return { darkTheme, toggleTheme };
};
