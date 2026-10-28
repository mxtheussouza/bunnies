// Forge Configuration
const path = require("path");
const rootDir = path.resolve(__dirname, "../..");

module.exports = {
  // Packager Config
  packagerConfig: {
    // Create asar archive for main, renderer process files
    asar: true,
    // Set executable name
    name: "Bunnies",
    executableName: "bunnies",
    // Set application copyright
    appCopyright: "Copyright (C) 2023 Matheus Souza, @mxtheussouza",
    // Set application icon
    ...(process.platform === "win32"
      ? { icon: path.join(rootDir, "assets/images/appIcon.ico") }
      : {}),
  },
  // Forge Makers
  makers: [
    {
      // Squirrel.Windows is a no-prompt, no-hassle, no-admin method of installing
      // Windows applications and is therefore the most user friendly you can get.
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Bunnies",
      },
    },
    {
      // The Zip target builds basic .zip files containing your packaged application.
      // There are no platform specific dependencies for using this maker and it will run on any platform.
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      // The deb target builds .deb packages, which are the standard package format for Debian-based
      // Linux distributions such as Ubuntu.
      name: "@electron-forge/maker-deb",
      config: {},
    },
  ],
  // Forge Plugins
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        // Development-only style injection/HMR; production CSP is served by the local protocol.
        devContentSecurityPolicy:
          "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src http://localhost:3000 ws://localhost:3000; object-src 'none'; base-uri 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'",
        // Ports
        port: 3000, // Webpack Dev Server port
        loggerPort: 9000, // Logger port
        // Main process webpack configuration
        mainConfig: path.join(rootDir, "tools/webpack/webpack.main.js"),
        // Renderer process webpack configuration
        renderer: {
          // Configuration file path
          config: path.join(rootDir, "tools/webpack/webpack.renderer.js"),
          // Entrypoints of the application
          entryPoints: [
            {
              // Window process name
              name: "app_window",
              // HTML index file template
              html: path.join(rootDir, "src/renderer/index.html"),
              // Renderer
              js: path.join(rootDir, "src/renderer/renderer.tsx"),
              // Main Window
              // Preload
              preload: {
                js: path.join(rootDir, "src/preload/index.ts"),
                config: path.join(rootDir, "tools/webpack/webpack.preload.js"),
              },
            },
          ],
        },
        devServer: {
          host: "localhost",
          liveReload: true,
        },
      },
    },
  ],
};
