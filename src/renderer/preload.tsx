import "@misc/window/windowPreload";

console.log("[Bunnies] : Preload execution started");

// Get versions
window.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const versions: Record<string, unknown> = {};

  // Bunnies Package version
  versions["bunnies"] = BUNNIES_APP_VERSION;

  // Set versions to app data
  app?.setAttribute("data-versions", JSON.stringify(versions));
});
