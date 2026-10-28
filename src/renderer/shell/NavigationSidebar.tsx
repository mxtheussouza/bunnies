import React from "react";
import { icons } from "@src/common/icons";
import { useThemeContext } from "@src/common/hooks";
import type { ThemePreference } from "@src/providers/ThemeMode";
import Icon from "../components/Icon";

export type LocalPage = "connections" | "about";
type Props = {
  page: LocalPage;
  onNavigate(page: LocalPage): void;
  expanded?: boolean;
  onExpand?(): void;
  id: string;
};
const destinations = [
  { label: "Visão geral", icon: "overview" },
  { label: "Filas", icon: "queues" },
  { label: "Exchanges", icon: "exchanges" },
  { label: "Publicar", icon: "publish" },
  { label: "Conexões", icon: "connection" },
] as const;

export default function NavigationSidebar({
  page,
  onNavigate,
  expanded = false,
  onExpand,
  id,
}: Props) {
  const { preference, setPreference } = useThemeContext();
  return (
    <div
      className={`sidebar-content ${expanded ? "sidebar-content--expanded" : ""}`}
    >
      <div className="brand">
        <img className="brand-symbol" src={icons.bunnies} alt="" />
        <span className="sidebar-label">Bunnies</span>
      </div>
      <p className="sidebar-eyebrow sidebar-label">RABBITMQ GUI</p>
      <nav aria-label="Navegação principal">
        {destinations.map(({ label, icon }) => {
          const unavailable = icon !== "connection";
          return (
            <button
              key={icon}
              type="button"
              className={`nav-button ${!unavailable && page === "connections" ? "nav-button--active" : ""}`}
              aria-label={label}
              aria-current={
                !unavailable && page === "connections" ? "page" : undefined
              }
              aria-disabled={unavailable || undefined}
              aria-describedby={unavailable ? `${id}-unavailable` : undefined}
              onClick={() => {
                if (!unavailable) onNavigate("connections");
              }}
            >
              <Icon name={icon} />
              <span className="nav-label">{label}</span>
              {unavailable && <Icon name="lock" className="nav-lock" />}
              <span className="nav-tooltip" aria-hidden="true">
                {label}
                {unavailable ? " · Requer conexão ativa" : ""}
              </span>
            </button>
          );
        })}
      </nav>
      <p id={`${id}-unavailable`} className="navigation-reason">
        Ative uma conexão para acessar os recursos do broker.
      </p>
      <div className="sidebar-preferences">
        <div className="theme-picker">
          <Icon name="theme" />
          <label className="sidebar-label" htmlFor={`${id}-theme`}>
            Tema
          </label>
          <select
            className="sidebar-label"
            id={`${id}-theme`}
            value={preference}
            onChange={event =>
              setPreference(event.target.value as ThemePreference)
            }
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        {onExpand && (
          <button
            type="button"
            className="nav-button compact-theme"
            aria-label="Abrir preferências de tema"
            onClick={onExpand}
          >
            <Icon name="theme" />
            <span className="nav-tooltip" aria-hidden="true">
              Tema e preferências
            </span>
          </button>
        )}
        <button
          type="button"
          className={`nav-button ${page === "about" ? "nav-button--active" : ""}`}
          aria-label="Sobre o Bunnies"
          aria-current={page === "about" ? "page" : undefined}
          onClick={() => onNavigate("about")}
        >
          <Icon name="info" />
          <span className="nav-label">Sobre o Bunnies</span>
          <span className="nav-tooltip" aria-hidden="true">
            Sobre o Bunnies
          </span>
        </button>
      </div>
    </div>
  );
}
