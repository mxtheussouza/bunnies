import { runDesktop } from "@src/common/desktop";

export type TitlebarMenuItem = {
  name: string;
  action?: () => void;
  shortcut?: string;
  developmentOnly?: boolean;
  items?: TitlebarMenuItem[];
};

export type TitlebarMenu = {
  name: string;
  action?: () => void;
  items: TitlebarMenuItem[];
};

const titlebarMenus: TitlebarMenu[] = [
  {
    name: "File",
    items: [
      {
        name: "Exit",
        action: () => runDesktop(() => window.bunnies.quit()),
      },
    ],
  },
  {
    name: "Edit",
    action: () => runDesktop(() => window.bunnies.showEditMenu()),
    items: [],
  },
  {
    name: "View",
    items: [
      {
        name: "Reload",
        action: () => runDesktop(() => window.bunnies.view("reload")),
        shortcut: "Ctrl+R",
      },
      {
        name: "Force Reload",
        action: () => runDesktop(() => window.bunnies.view("forceReload")),
        shortcut: "Ctrl+Shift+R",
      },
      {
        name: "Toggle Developer Tools",
        developmentOnly: true,
        action: () => runDesktop(() => window.bunnies.view("toggleDevTools")),
        shortcut: "Ctrl+Shift+I",
      },
      {
        name: "__",
      },
      {
        name: "Actual Size",
        action: () => runDesktop(() => window.bunnies.view("resetZoom")),
        shortcut: "Ctrl+0",
      },
      {
        name: "Zoom In",
        action: () => runDesktop(() => window.bunnies.view("zoomIn")),
        shortcut: "Ctrl++",
      },
      {
        name: "Zoom Out",
        action: () => runDesktop(() => window.bunnies.view("zoomOut")),
        shortcut: "Ctrl+-",
      },
      {
        name: "__",
      },
      {
        name: "Toggle Fullscreen",
        action: () => runDesktop(() => window.bunnies.view("toggleFullscreen")),
        shortcut: "F11",
      },
    ],
  },
  {
    name: "Window",
    items: [
      {
        name: "Minimize",
        action: () => runDesktop(() => window.bunnies.minimize()),
        shortcut: "Ctrl+M",
      },
      {
        name: "Close",
        action: () => runDesktop(() => window.bunnies.close()),
        shortcut: "Ctrl+W",
      },
    ],
  },
  {
    name: "Author",
    items: [
      {
        name: "Matheus Souza",
        action: () => runDesktop(() => window.bunnies.openLink("author")),
        shortcut: "@mxtheussouza",
      },
    ],
  },
];

export default titlebarMenus;
