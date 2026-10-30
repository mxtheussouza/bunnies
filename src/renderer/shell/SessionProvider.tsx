import React from "react";
import {
  emptySession,
  type SessionSnapshot,
  type ConnectSessionInput,
} from "../../shared/session";
import { profileErrorMessages } from "../../shared/profiles";
type Value = {
  state: SessionSnapshot;
  error: string;
  busy: boolean;
  connect(input: ConnectSessionInput): Promise<void>;
  disconnect(): Promise<void>;
};
const Context = React.createContext<Value>({
  state: emptySession(),
  error: "",
  busy: false,
  connect: async () => undefined,
  disconnect: async () => undefined,
});
export const useSession = () => React.useContext(Context);
export const sessionLabels = {
  idle: "Sem sessão ativa",
  connecting: "Conectando",
  ready: "Conectado",
  degraded: "Conexão parcial",
  reconnecting: "Reconectando",
  closed: "Sem sessão ativa",
};
export const endpointLabels = {
  idle: "Sem sessão",
  connecting: "Conectando",
  available: "Verificado",
  blocked: "Fluxo bloqueado",
  failed: "Indisponível",
  closed: "Encerrado",
};
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState(emptySession);
  const [error, setError] = React.useState(""),
    [busy, setBusy] = React.useState(false);
  const current = React.useRef(state),
    mounted = React.useRef(false),
    pending = React.useRef(false);
  const accept = React.useCallback((next: SessionSnapshot) => {
    if (mounted.current && next.sequence >= current.current.sequence) {
      current.current = next;
      setState(next);
    }
  }, []);
  React.useEffect(() => {
    mounted.current = true;
    const unsubscribe = window.bunnies.onSessionState(accept);
    void window.bunnies
      .getSessionState()
      .then(result => {
        if (result.ok) accept(result.value);
        else if (mounted.current)
          setError(profileErrorMessages[result.error.code]);
      })
      .catch(() => {
        if (mounted.current) setError(profileErrorMessages.UNAVAILABLE);
      });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [accept]);
  async function command(
    operation: () => ReturnType<typeof window.bunnies.getSessionState>,
  ) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await operation();
      if (mounted.current) {
        if (result.ok) accept(result.value);
        else setError(profileErrorMessages[result.error.code]);
      }
    } catch {
      if (mounted.current) setError(profileErrorMessages.UNAVAILABLE);
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        state,
        error,
        busy,
        connect: input => command(() => window.bunnies.connectSession(input)),
        disconnect: () =>
          command(() => {
            const s = current.current;
            return window.bunnies.disconnectSession({
              sessionId: s.sessionId!,
              generation: s.generation,
            });
          }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
