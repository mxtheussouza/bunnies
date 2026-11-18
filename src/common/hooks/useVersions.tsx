import React from "react";

export const useVersions = () => {
  const [versions, setVersions] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    let active = true;
    void window.bunnies
      .getInfo()
      .then(result => {
        if (active && result.ok) setVersions({ bunnies: result.value.version });
      })
      .catch(() => {
        /* Metadata absence must not prevent rendering. */
      });
    return () => {
      active = false;
    };
  }, []);
  return { versions };
};
