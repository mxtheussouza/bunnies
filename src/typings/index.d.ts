declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";

declare module "*.scss";
declare module "*.less";

interface Window {
  bunnies: import("../shared/desktop").DesktopApi;
}

declare module "electron-squirrel-startup" {
  const handled: boolean;
  export default handled;
}
