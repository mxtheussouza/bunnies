import React from "react";
import { DESKTOP_ERROR_EVENT } from "@src/common/desktop";
import { icons } from "@src/common/icons";

import Card from "./components/Card";
import Button from "./components/Button";

import { useThemeContext, useVersions } from "@src/common/hooks";

import "./App.scss";

const App: React.FC = () => {
  const { darkTheme, toggleTheme } = useThemeContext();
  const { versions } = useVersions();
  const [desktopError, setDesktopError] = React.useState(false);
  React.useEffect(() => {
    const report = () => setDesktopError(true);
    window.addEventListener(DESKTOP_ERROR_EVENT, report);
    return () => window.removeEventListener(DESKTOP_ERROR_EVENT, report);
  }, []);

  return (
    <div id="app-container">
      {desktopError && (
        <div role="alert">
          Não foi possível concluir a operação desktop.
          <Button onClick={() => setDesktopError(false)}>Fechar aviso</Button>
        </div>
      )}
      <div className="header">
        <div className="main-heading">
          <h1 className="themed">Bunnies</h1>
        </div>
        <Card>
          <div>
            Robust boilerplate for Desktop Applications with Electron and
            ReactJS.
            <br />
            Hot Reloading is used in this project for fast development
            experience.
            <br />
            If you think the project is useful enough, just spread the word
            around!
          </div>
        </Card>
      </div>

      <div className="footer">
        <div className="versions">
          <div className="item">
            <div>
              <img className="item-icon" src={icons.bunnies} /> Bunnies
            </div>
            <span>{versions?.bunnies}</span>
          </div>
        </div>
        <div className="center">
          <Button onClick={toggleTheme}>
            {darkTheme ? "Light Theme" : "Dark Theme"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
