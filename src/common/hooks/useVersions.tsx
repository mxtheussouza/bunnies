import React from "react";

export const useVersions = () => {
  const [versions, setVersions] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const raw = document.getElementById("app")?.getAttribute("data-versions");
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return;
      setVersions(
        Object.fromEntries(
          Object.entries(parsed).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        ),
      );
    } catch {
      // Missing or malformed version metadata must not prevent rendering.
    }
  }, []);

  return { versions };
};
