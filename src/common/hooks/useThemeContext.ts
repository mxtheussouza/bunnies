import React from "react";
import { ThemeModeContext } from "@src/providers/ThemeMode";

export const useThemeContext = () => {
  return React.useContext(ThemeModeContext);
};
