import React from "react";

import "./styles.scss";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "secondary",
  loading = false,
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`button button--${variant} ${className}`}
    >
      {loading && <span className="button-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
