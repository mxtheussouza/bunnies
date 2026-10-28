import React from "react";
import classNames from "classnames";
import { runDesktop } from "@src/common/desktop";

import ControlButton from "./ControlButton";

type Props = {
  platform: string;
  tooltips?: boolean;
};

const closePath =
  "M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z";
const maximizePath = "M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z";
const minimizePath = "M 0,5 10,5 10,6 0,6 Z";

const WindowControls: React.FC<Props> = props => {
  return (
    <section
      className={classNames(
        "window-titlebar-controls",
        `type-${props.platform === "darwin" ? "mac" : "windows"}`,
      )}
    >
      <ControlButton
        name="minimize"
        onClick={() => runDesktop(() => window.bunnies.minimize())}
        path={minimizePath}
        title={props.tooltips ? "Minimize" : undefined}
      />
      <ControlButton
        name="maximize"
        onClick={() => runDesktop(() => window.bunnies.toggleMaximize())}
        path={maximizePath}
        title={props.tooltips ? "Maximize" : undefined}
      />
      <ControlButton
        name="close"
        onClick={() => runDesktop(() => window.bunnies.close())}
        path={closePath}
        title={props.tooltips ? "Close" : undefined}
      />
    </section>
  );
};

export default WindowControls;
