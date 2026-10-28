import React from "react";

const paths = {
  overview: "M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h6v6h-6z",
  queues: "M4 4h16v4H4z M4 10h16v4H4z M4 16h16v4H4z",
  exchanges: "M9 2h6v6H9z M2 16h6v6H2z M16 16h6v6h-6z M12 8v5H5v3 M12 13h7v3",
  publish: "m3 3 19 9-19 9 4-9-4-9 M7 12h15",
  connection: "M8 3v5 M16 3v5 M5 8h14v3a7 7 0 0 1-14 0z M12 18v4",
  lock: "M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v12H5z M12 14v4",
  help: "M9 9a3 3 0 1 1 4 2.83c-1 .34-1 1.17-1 2.17 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  info: "M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  close: "m6 6 12 12 M6 18 18 6",
  theme:
    "M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5l1.5 1.5 M5 19l1.5-1.5 M17.5 6.5l1.5-1.5 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  arrow: "M5 12h14 m-6-6 6 6-6 6",
  warning: "m12 3 10 18H2z M12 9v5 M12 17h.01",
  check: "m5 12 4 4L19 6",
} as const;

export type IconName = keyof typeof paths;
export default function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
