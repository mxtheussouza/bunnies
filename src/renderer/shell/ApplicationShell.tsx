import React from "react";
import NavigationSidebar, { type LocalPage } from "./NavigationSidebar";
import SessionContextBar from "./SessionContextBar";
import IconButton from "../components/IconButton";
import Connections from "../pages/Connections";
import Help from "../pages/Help";
import About from "../pages/About";
import "./shell.scss";
import SessionProvider, { useSession, sessionLabels } from "./SessionProvider";

function Shell({ feedback }: { feedback?: React.ReactNode }) {
  const { state: session } = useSession();
  const [page, setPage] = React.useState<LocalPage>("connections");
  const [panelOpen, setPanelOpen] = React.useState(false);
  const panel = React.useRef<HTMLDialogElement>(null);
  const panelTrigger = React.useRef<HTMLButtonElement>(null);
  const panelReturnFocus = React.useRef<HTMLElement | null>(null);
  const main = React.useRef<HTMLElement>(null);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const previousPage = React.useRef(page);

  React.useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const editing =
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
        );
      if (
        document.querySelector(".profile-dialog[open]") ||
        event.repeat ||
        editing ||
        event.altKey ||
        event.shiftKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.key !== "5"
      )
        return;
      event.preventDefault();
      if (panel.current?.open) panel.current.close();
      setPanelOpen(false);
      setPage("connections");
      heading.current?.focus();
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  React.useEffect(() => {
    if (previousPage.current !== page) heading.current?.focus();
    previousPage.current = page;
  }, [page]);

  React.useEffect(() => {
    const dialog = panel.current;
    if (!panelOpen || !dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [panelOpen]);

  function closePanel() {
    panel.current?.close();
    setPanelOpen(false);
    (panelReturnFocus.current ?? panelTrigger.current)?.focus();
  }
  function openPanel() {
    panelReturnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : panelTrigger.current;
    setPanelOpen(true);
  }
  function navigate(destination: LocalPage) {
    if (panelOpen) closePanel();
    setPage(destination);
  }

  return (
    <>
      <button
        type="button"
        className="skip-link"
        onClick={() => main.current?.focus()}
      >
        Pular para o conteúdo
      </button>
      <div className="application-shell">
        <aside className="sidebar" aria-label="Barra lateral">
          <button
            ref={panelTrigger}
            className="sidebar-expand"
            type="button"
            aria-label="Expandir navegação"
            aria-haspopup="dialog"
            aria-expanded={panelOpen}
            onClick={openPanel}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <NavigationSidebar
            page={page}
            onNavigate={navigate}
            onExpand={openPanel}
            id="sidebar"
          />
        </aside>
        <div className="workspace">
          <SessionContextBar />
          <main id="main-content" tabIndex={-1} ref={main}>
            {feedback}
            <div className="page-heading">
              <p className="eyebrow">SEU WORKSPACE RABBITMQ</p>
              <h1 tabIndex={-1} ref={heading}>
                {page === "connections"
                  ? "Conexões"
                  : page === "help"
                    ? "Ajuda"
                    : "Sobre o Bunnies"}
              </h1>
              <p>
                {page === "connections"
                  ? "Um contexto claro para cada ambiente."
                  : page === "help"
                    ? "Orientações para cada função, disponíveis offline."
                    : "Uma experiência desktop para trabalhar com RabbitMQ."}
              </p>
            </div>
            {page === "connections" ? (
              <Connections />
            ) : page === "help" ? (
              <Help />
            ) : (
              <About />
            )}
          </main>
          <footer className="workspace-footer">
            <span className="offline-dot" aria-hidden="true" />
            {session.stopping
              ? "Encerrando sessão…"
              : session.desired
                ? sessionLabels[session.state]
                : "Sem sessão ativa"}
            <span className="footer-detail">
              {" "}
              ·{" "}
              {session.desired
                ? "Ativada por você"
                : "Nenhuma conexão iniciada automaticamente"}
            </span>
          </footer>
        </div>
      </div>
      <dialog
        ref={panel}
        className="navigation-panel"
        aria-labelledby="navigation-panel-title"
        onCancel={event => {
          event.preventDefault();
          closePanel();
        }}
      >
        <div className="navigation-panel-heading">
          <strong id="navigation-panel-title">Navegação</strong>
          <IconButton
            icon="close"
            label="Fechar navegação"
            onClick={closePanel}
            autoFocus
          />
        </div>
        <NavigationSidebar
          expanded
          page={page}
          onNavigate={navigate}
          id="panel"
        />
      </dialog>
    </>
  );
}

export default function ApplicationShell(props: {
  feedback?: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Shell {...props} />
    </SessionProvider>
  );
}
