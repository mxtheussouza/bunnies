import React from "react";
import ThemeModeProvider from "./ThemeMode";

interface ProviderProps {
  children: JSX.Element[] | JSX.Element;
}

const Providers = ({ children }: ProviderProps) => {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
};

export default Providers;
