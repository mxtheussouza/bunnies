import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  path: string;
  label: string;
};
export default function ControlButton({ name, path, label, ...props }: Props) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      className={`control ${name}`}
    >
      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10">
        <path fill="currentColor" d={path} />
      </svg>
    </button>
  );
}
