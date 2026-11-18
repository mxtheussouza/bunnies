import React from "react";
import { DESKTOP_ERROR_EVENT } from "@src/common/desktop";
import ApplicationShell from "./shell/ApplicationShell";
import Button from "./components/Button";
import StatusMessage from "./components/StatusMessage";
import "./App.scss";

export default function App() {
  const [desktopError, setDesktopError] = React.useState(false);
  React.useEffect(() => {
    const report = () => setDesktopError(true);
    window.addEventListener(DESKTOP_ERROR_EVENT, report);
    return () => window.removeEventListener(DESKTOP_ERROR_EVENT, report);
  }, []);
  return (
    <ApplicationShell
      feedback={
        desktopError && (
          <StatusMessage
            tone="danger"
            title="Não foi possível concluir a operação desktop."
            action={
              <Button onClick={() => setDesktopError(false)}>
                Fechar aviso
              </Button>
            }
          >
            Tente novamente. Se o problema persistir, reinicie o Bunnies.
          </StatusMessage>
        )
      }
    />
  );
}
