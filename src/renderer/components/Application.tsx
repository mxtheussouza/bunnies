import React from "react";
import { icons } from "./Icons";

import "./Application.scss";

const Application: React.FC = () => {
  const [darkTheme, setDarkTheme] = React.useState<boolean>(true);
  const [versions, setVersions] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem("dark-mode"));

    if (isNaN(useDarkTheme)) {
      setDarkTheme(true);
    } else if (useDarkTheme === 1) {
      setDarkTheme(true);
    } else if (useDarkTheme === 0) {
      setDarkTheme(false);
    }

    // Apply verisons
    const app = document.getElementById("app");
    const versions = JSON.parse(app.getAttribute("data-versions"));

    setVersions(versions);
  }, []);

  /**
   * On Dark theme change
   */
  React.useEffect(() => {
    if (darkTheme) {
      localStorage.setItem("dark-mode", "1");
      document.body.classList.add("dark-mode");
    } else {
      localStorage.setItem("dark-mode", "0");
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  function toggleTheme() {
    setDarkTheme(!darkTheme);
  }

  return (
    <div id="app-container">
      <div className="header">
        <div className="main-heading">
          <h1 className="themed">Bunnies</h1>
        </div>
        <div className="main-teaser">
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
        </div>
        <div className="versions">
          <div className="item">
            <div>
              <img className="item-icon" src={icons.bunnies} /> Bunnies
            </div>
            <span>{versions?.bunnies}</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="center">
          <button onClick={toggleTheme}>
            {darkTheme ? "Light Theme" : "Dark Theme"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Application;
