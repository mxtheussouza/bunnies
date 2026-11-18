import React from "react";
import Button, { type ButtonProps } from "../Button";
import Icon, { type IconName } from "../Icon";

type Props = Omit<ButtonProps, "children" | "aria-label"> & {
  label: string;
  icon: IconName;
};
export default function IconButton({
  label,
  icon,
  className = "",
  ...props
}: Props) {
  return (
    <Button
      {...props}
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} />
    </Button>
  );
}
