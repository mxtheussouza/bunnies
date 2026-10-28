declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";

declare module "*.scss";
declare module "*.less";

interface Window {
  electron_window: {
    titlebar: import("../../misc/window/titlebarContext").TitlebarContextApi;
  };
}

declare module "electron-squirrel-startup" {
  const handled: boolean;
  export default handled;
}

declare const BUNNIES_APP_VERSION: string;
