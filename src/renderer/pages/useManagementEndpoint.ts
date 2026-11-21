import React from "react";

export function useManagementEndpoint(profileId: string) {
  const [endpoint, setEndpoint] = React.useState<string>();
  React.useEffect(() => {
    let current = true;
    void window.bunnies
      .listProfiles()
      .then(result => {
        if (current)
          setEndpoint(
            result.ok
              ? (result.value.profiles.find(p => p.id === profileId)
                  ?.httpsUrl ?? "")
              : "",
          );
      })
      .catch(() => {
        if (current) setEndpoint("");
      });
    return () => {
      current = false;
    };
  }, [profileId]);
  return endpoint;
}
