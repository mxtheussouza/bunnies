import React from "react";
import classNames from "classnames";
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

const Titlebar: React.FC<Props> = props => {
  const menus = React.useMemo(
    () =>
      titlebarMenus.map(menu => ({
        ...menu,
        items: menu.items
          .filter(item => !item.developmentOnly || props.development)
          .map(item => ({
            ...item,
            shortcut:
              props.platform === "darwin"
                ? item.shortcut?.replaceAll("Ctrl", "Cmd")
                : item.shortcut,
          })),
      })),
    [props.development, props.platform],
  );
  const activeMenuIndex = React.useRef<number | null>(null);
  const menusRef = React.useMemo(
    () => menus.map(() => React.createRef<HTMLDivElement>()),
    [menus],
  );

  const [menusVisible, setMenusVisible] = React.useState<boolean>(true);

  const closeActiveMenu = React.useCallback(() => {
    if (activeMenuIndex.current != null) {
      menusRef[activeMenuIndex.current].current?.classList.remove("active");
      menusRef[
        activeMenuIndex.current
      ]?.current?.parentElement?.classList.remove("active");
      activeMenuIndex.current = null;
    }
  }, [menusRef]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return; // Prevent repeatation of toggle when key holding

      if (event.altKey) {
        // Hiding menus? close active menu popup
        if (menusVisible) {
          closeActiveMenu();
        }

        setMenusVisible(!menusVisible);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menusVisible, menusRef, closeActiveMenu]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeMenuIndex.current !== null) {
        if (
          menusRef[activeMenuIndex.current].current &&
          !menusRef[activeMenuIndex.current].current?.contains(
            event.target as Node,
          )
        ) {
          closeActiveMenu();
        }
      }
    }

    if (activeMenuIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuIndex, menusRef, closeActiveMenu]);

  function showMenu(
    index: number,
    event: React.SyntheticEvent<HTMLDivElement>,
  ) {
    event.stopPropagation();
    event.preventDefault();

    if (menusRef[index].current?.classList.contains("active")) {
      // close..
      closeActiveMenu();
    } else {
      // open..
      menusRef[index].current?.classList.add("active");
      activeMenuIndex.current = index;
      menusRef[index].current?.parentElement?.classList.add("active");
    }
  }

  function onMenuHover(index: number) {
    if (activeMenuIndex.current != null) {
      menusRef[activeMenuIndex.current].current?.classList.toggle("active");
      menusRef[index].current?.classList.toggle("active");
      menusRef[index].current?.parentElement?.classList.toggle("active");
      menusRef[
        activeMenuIndex.current
      ].current?.parentElement?.classList.toggle("active");

      activeMenuIndex.current = index;
    }
  }

  function handleAction(action?: () => void) {
    closeActiveMenu();
    action?.();
  }

  return (
    <div className="window-titlebar">
      {props.icon ? (
        <section className="window-titlebar-icon">
          <img src={props.icon} alt="titlebar icon" />
        </section>
      ) : (
        ""
      )}

      <section
        className={classNames("window-titlebar-content", {
          centered: props.mode === "centered-title",
        })}
      >
        {menusVisible ? "" : <div className="window-title">{props.title}</div>}
      </section>

      <section
        className={classNames("window-titlebar-menu", {
          hidden: !menusVisible,
        })}
      >
        {menus.map((item, menuIndex) => {
          return (
            <div className="menu-item" key={`menu_${menuIndex}`}>
              <div
                className="menu-title"
                role="button"
                tabIndex={0}
                onClick={e => {
                  if (item.action) {
                    closeActiveMenu();
                    item.action();
                  } else showMenu(menuIndex, e);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (item.action) {
                      closeActiveMenu();
                      item.action();
                    } else showMenu(menuIndex, e);
                  }
                }}
                onMouseEnter={() => {
                  if (!item.action) onMenuHover(menuIndex);
                  else closeActiveMenu();
                }}
                onMouseDown={e => e.preventDefault()}
              >
                {item.name}
              </div>
              <div className="menu-popup" ref={menusRef[menuIndex]}>
                {item.items?.map((menuItem, menuItemIndex) => {
                  if (menuItem.name === "__") {
                    return (
                      <div
                        key={`menu_${menuIndex}_popup_item_${menuItemIndex}`}
                        className="popup-item-separator"
                      ></div>
                    );
                  }

                  return (
                    <div
                      key={`menu_${menuIndex}_popup_item_${menuItemIndex}`}
                      className="menu-popup-item"
                      onClick={() => handleAction(menuItem.action)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <div className="popup-item-name">{menuItem.name}</div>
                      <div className="popup-item-shortcut">
                        {menuItem.shortcut}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <WindowControls platform={props.platform} tooltips={true} />
    </div>
  );
};

export default Titlebar;
