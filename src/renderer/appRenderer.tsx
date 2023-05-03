import React from "react";
import { createRoot } from "react-dom/client";
import WindowFrame from "@misc/window/components/WindowFrame";
import Application from "./components/Application";

console.log("[Bunnies] : Renderer execution started");

const app = (
  <WindowFrame title="Bunnies" platform="windows">
    <Application />
  </WindowFrame>
);

createRoot(document.getElementById("app")).render(app);
