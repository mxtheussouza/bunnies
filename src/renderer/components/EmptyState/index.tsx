import React from "react";
import Icon, { type IconName } from "../Icon";

export default function EmptyState({
  title,
  children,
  icon = "connection",
}: {
  title: string;
  children: React.ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-symbol">
        <Icon name={icon} />
      </div>
      <h2>{title}</h2>
      <div className="empty-state-description">{children}</div>
    </div>
  );
}
