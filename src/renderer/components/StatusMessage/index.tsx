import React from "react";
import Icon from "../Icon";

type Props = {
  tone?: "info" | "warning" | "danger";
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
};
export default function StatusMessage({
  tone = "info",
  title,
  children,
  action,
}: Props) {
  return (
    <div
      className={`status-message status-message--${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon name={tone === "info" ? "info" : "warning"} />
      <div className="status-message-content">
        <strong>{title}</strong>
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  );
}
