import React from "react";
import Titlebar from "./Titlebar";
import logo from "@assets/images/logo.png";

type Props = {
  title?: string;
  development: boolean;
  borderColor?: string;
  platform: import("@src/shared/desktop").DesktopInfo["platform"];
  children: React.ReactNode;
};

const WindowFrame: React.FC<Props> = props => {
  const itsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const parentElement = itsRef.current?.parentElement;
    if (!parentElement) return;

    parentElement.classList.add("has-electron-window");
    parentElement.classList.add("has-border");

    // Apply border color if prop given
    if (props.borderColor) {
      parentElement.style.borderColor = props.borderColor;
    }
  }, [props.borderColor]);

  return (
    <>
      {/* Reference creator */}
      <div className="start-electron-window" ref={itsRef}></div>
      {/* Window Titlebar */}
      <Titlebar
        title={props.title ?? "Electron Window"}
        development={props.development}
        platform={props.platform}
        mode="centered-title"
        icon={logo}
      />
      {/* Window Content (Application to render) */}
      <div className="window-content">{props.children}</div>
    </>
  );
};

export default WindowFrame;
