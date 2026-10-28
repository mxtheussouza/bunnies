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
    <div
      aria-label="Controles da janela"
      className={classNames(
        "window-titlebar-controls",
        `type-${props.platform === "darwin" ? "mac" : "windows"}`,
      )}
    >
      <ControlButton
        name="minimize"
        label="Minimizar"
        onClick={() => runDesktop(() => window.bunnies.minimize())}
        path={minimizePath}
        title={props.tooltips ? "Minimizar" : undefined}
      />
      <ControlButton
        name="maximize"
        label="Maximizar ou restaurar"
        onClick={() => runDesktop(() => window.bunnies.toggleMaximize())}
        path={maximizePath}
        title={props.tooltips ? "Maximizar ou restaurar" : undefined}
      />
      <ControlButton
        name="close"
        label="Fechar janela"
        onClick={() => runDesktop(() => window.bunnies.close())}
        path={closePath}
        title={props.tooltips ? "Fechar janela" : undefined}
      />
    </div>
  );
};

export default WindowControls;
