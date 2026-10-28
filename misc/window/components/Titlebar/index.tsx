import React from "react";
import titlebarMenus from "../../titlebarMenus";
import WindowControls from "../WindowControls";
import type { DesktopInfo } from "@src/shared/desktop";
import "./styles.less";

type Props = {
  title: string;
  platform: DesktopInfo["platform"];
  development: boolean;
  mode: "centered-title";
  icon?: string;
};
export default function Titlebar({
  title,
  platform,
  development,
  icon,
}: Props) {
  const [open, setOpen] = React.useState<number | null>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const triggers = React.useRef<(HTMLButtonElement | null)[]>([]);
  const menus = titlebarMenus.map(menu => ({
    ...menu,
    items: menu.items.filter(item => !item.developmentOnly || development),
  }));

  React.useEffect(() => {
    if (open === null) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(null);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(null);
      triggers.current[open!]?.focus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="window-titlebar" ref={root}>
      {platform !== "darwin" && (
        <>
          <div className="titlebar-actions">
            {icon && <img src={icon} alt="" className="titlebar-symbol" />}
            <nav aria-label="Ações do aplicativo" className="titlebar-menus">
              {menus.map((menu, index) => (
                <div className="titlebar-menu" key={menu.name}>
                  <button
                    type="button"
                    ref={node => {
                      triggers.current[index] = node;
                    }}
                    aria-expanded={menu.action ? undefined : open === index}
                    aria-controls={
                      menu.action ? undefined : `titlebar-menu-${index}`
                    }
                    onMouseDown={event => {
                      if (menu.action) event.preventDefault();
                    }}
                    onClick={() => {
                      if (menu.action) {
                        setOpen(null);
                        menu.action();
                      } else setOpen(open === index ? null : index);
                    }}
                  >
                    {menu.name}
                  </button>
                  {!menu.action && open === index && (
                    <div
                      id={`titlebar-menu-${index}`}
                      className="titlebar-popup"
                      role="group"
                      aria-label={menu.name}
                      onBlur={event => {
                        if (
                          !event.currentTarget.parentElement?.contains(
                            event.relatedTarget as Node | null,
                          )
                        )
                          setOpen(null);
                      }}
                    >
                      {menu.items.map((item, itemIndex) =>
                        item.name === "__" ? (
                          <hr key={itemIndex} />
                        ) : (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setOpen(null);
                              triggers.current[index]?.focus();
                              item.action?.();
                            }}
                          >
                            <span>{item.name}</span>
                            <span className="titlebar-shortcut">
                              {item.shortcut}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <span className="window-title">{title}</span>
          <WindowControls platform={platform} tooltips />
        </>
      )}
    </div>
  );
}
