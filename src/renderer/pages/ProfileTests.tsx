import React from "react";
import ConnectionTest from "./ConnectionTest";
export default function ProfileTests(props: {
  profileId: string;
  revision: string;
  hasPassword: boolean;
  blocked?: boolean;
  onRunningChange?: (running: boolean) => void;
}) {
  const [active, setActive] = React.useState<"https" | "amqps" | null>(null);
  const { onRunningChange } = props;
  React.useEffect(() => () => onRunningChange?.(false), [onRunningChange]);
  return (
    <>
      <ConnectionTest
        {...props}
        blocked={props.blocked || active === "amqps"}
        onRunningChange={running => {
          setActive(running ? "https" : null);
          props.onRunningChange?.(running);
        }}
      />
      <ConnectionTest
        {...props}
        transport="amqps"
        blocked={props.blocked || active === "https"}
        onRunningChange={running => {
          setActive(running ? "amqps" : null);
          props.onRunningChange?.(running);
        }}
      />
    </>
  );
}
