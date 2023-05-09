import React from "react";

export const useVersions = () => {
  const [versions, setVersions] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // Apply versions
    const app = document.getElementById("app");
    const versions = JSON.parse(app.getAttribute("data-versions"));

    setVersions(versions);
  }, []);

  return {
    versions,
  };
};
