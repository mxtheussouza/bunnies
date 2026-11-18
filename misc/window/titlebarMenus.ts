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
    name: "Arquivo",
    items: [
      {
        name: "Sair",
        action: () => runDesktop(() => window.bunnies.quit()),
      },
    ],
  },
  {
    name: "Editar",
    action: () => runDesktop(() => window.bunnies.showEditMenu()),
    items: [],
  },
  {
    name: "Visualizar",
    items: [
      {
        name: "Recarregar",
        action: () => runDesktop(() => window.bunnies.view("reload")),
        shortcut: "Ctrl+R",
      },
      {
        name: "Forçar recarga",
        action: () => runDesktop(() => window.bunnies.view("forceReload")),
        shortcut: "Ctrl+Shift+R",
      },
      {
        name: "Ferramentas de desenvolvimento",
        developmentOnly: true,
        action: () => runDesktop(() => window.bunnies.view("toggleDevTools")),
        shortcut: "Ctrl+Shift+I",
      },
      {
        name: "__",
      },
      {
        name: "Tamanho real",
        action: () => runDesktop(() => window.bunnies.view("resetZoom")),
        shortcut: "Ctrl+0",
      },
      {
        name: "Aumentar zoom",
        action: () => runDesktop(() => window.bunnies.view("zoomIn")),
        shortcut: "Ctrl++",
      },
      {
        name: "Diminuir zoom",
        action: () => runDesktop(() => window.bunnies.view("zoomOut")),
        shortcut: "Ctrl+-",
      },
      {
        name: "__",
      },
      {
        name: "Alternar tela cheia",
        action: () => runDesktop(() => window.bunnies.view("toggleFullscreen")),
        shortcut: "F11",
      },
    ],
  },
  {
    name: "Janela",
    items: [
      {
        name: "Minimizar",
        action: () => runDesktop(() => window.bunnies.minimize()),
        shortcut: "Ctrl+M",
      },
      {
        name: "Fechar janela",
        action: () => runDesktop(() => window.bunnies.close()),
        shortcut: "Ctrl+W",
      },
    ],
  },
  {
    name: "Autor",
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
