import React from "react";
import ConnectionTest from "./ConnectionTest";
export default function ProfileTests(props: {
  profileId: string;
  revision: string;
  hasPassword: boolean;
}) {
  const [active, setActive] = React.useState<"https" | "amqps" | null>(null);
  return (
    <>
      <ConnectionTest
        {...props}
        blocked={active === "amqps"}
        onRunningChange={running => setActive(running ? "https" : null)}
      />
      <ConnectionTest
        {...props}
        transport="amqps"
        blocked={active === "https"}
        onRunningChange={running => setActive(running ? "amqps" : null)}
      />
    </>
  );
}
