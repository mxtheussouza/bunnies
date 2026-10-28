import React from "react";
import Titlebar from "./Titlebar";
import logo from "@assets/images/logo.png";

type Props = {
  title?: string;
  development: boolean;
  platform: import("@src/shared/desktop").DesktopInfo["platform"];
  children: React.ReactNode;
};
export default function WindowFrame({
  title = "Bunnies",
  development,
  platform,
  children,
}: Props) {
  return (
    <>
      <Titlebar
        title={title}
        development={development}
        platform={platform}
        mode="centered-title"
        icon={logo}
      />
      <div className="window-content">{children}</div>
    </>
  );
}
