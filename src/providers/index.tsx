import React from "react";
import ThemeModeProvider from "./ThemeMode";

interface ProviderProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProviderProps) => {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
};

export default Providers;
