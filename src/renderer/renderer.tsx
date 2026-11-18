import React from "react";
import { createRoot } from "react-dom/client";
import WindowFrame from "@misc/window/components/WindowFrame";
import Providers from "@src/providers";
import App from "./App";

async function bootstrap() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Application root is missing");
  const result = await window.bunnies.getInfo();
  if (!result.ok) throw new Error("Desktop bridge is unavailable");
  createRoot(root).render(
    <WindowFrame
      title="Bunnies"
      platform={result.value.platform}
      development={result.value.development}
    >
      <Providers>
        <App />
      </Providers>
    </WindowFrame>,
  );
}
void bootstrap().catch(() => {
  const root = document.getElementById("app") ?? document.body;
  root.textContent =
    "Não foi possível iniciar a interface do Bunnies. Reinicie o aplicativo.";
  root.setAttribute("role", "alert");
});
