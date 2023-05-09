import React from "react";
import { createRoot } from "react-dom/client";
import WindowFrame from "@misc/window/components/WindowFrame";
import Providers from "@src/providers";
import App from "./App";

console.log("[Bunnies] : Renderer execution started");

const app = (
  <WindowFrame title="Bunnies" platform="windows">
    <Providers>
      <App />
    </Providers>
  </WindowFrame>
);

createRoot(document.getElementById("app")).render(app);
