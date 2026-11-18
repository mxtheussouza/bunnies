import React from "react";
import {
  managementErrors,
  type ManagementInput,
  type ManagementSnapshot,
} from "../../shared/management";
import { profileErrorMessages } from "../../shared/profiles";
import { useSession } from "../shell/SessionProvider";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
type Kind = "broker" | "vhosts";
type Entry = { data?: ManagementSnapshot; error?: string; failedAt?: string };
export default function ManagementInfo() {
  const { state, selectVhost, busy } = useSession();
  const eligible =
    state.desired &&
    !state.stopping &&
    !state.paused &&
    state.https.phase === "available";
  const context = state.sessionId + ":" + state.generation;
  const [entries, setEntries] = React.useState<Record<Kind, Entry>>({
    broker: {},
    vhosts: {},
  });
  const [running, setRunning] = React.useState<Kind | null>(null);
  const active = React.useRef<(ManagementInput & { kind: Kind }) | null>(null);
  const mounted = React.useRef(false);
  const brokerButton = React.useRef<HTMLButtonElement>(null),
    vhostsButton = React.useRef<HTMLButtonElement>(null);
  const returnFocus = React.useRef<Kind | null>(null);
  const selectionHint = React.useId();
  const switchStatus = React.useRef<HTMLParagraphElement>(null);
  const focusSwitch = React.useRef(false);
  React.useLayoutEffect(() => {
    if (focusSwitch.current && state.profile?.savedVhost !== undefined) {
      switchStatus.current?.focus();
      focusSwitch.current = false;
    }
  }, [context, state.profile?.savedVhost]);
  React.useLayoutEffect(() => {
    if (!running && returnFocus.current) {
      (returnFocus.current === "broker"
        ? brokerButton
        : vhostsButton
      ).current?.focus();
      returnFocus.current = null;
    }
  }, [running]);
  React.useEffect(() => {
    mounted.current = true;
    setEntries({ broker: {}, vhosts: {} });
    setRunning(null);
    return () => {
      mounted.current = false;
      const op = active.current;
      active.current = null;
      if (op) {
        const input = {
          sessionId: op.sessionId,
          generation: op.generation,
          operationId: op.operationId,
        };
        void window.bunnies.cancelManagementRead(input).catch(() => undefined);
      }
    };
  }, [context, eligible]);
  async function execute(kind: Kind) {
    if (!eligible || !state.sessionId || active.current) return;
    const input = {
      sessionId: state.sessionId,
      generation: state.generation,
      operationId: crypto.randomUUID(),
    };
    const op = { ...input, kind };
    active.current = op;
    setRunning(kind);
    setEntries(e => ({
      ...e,
      [kind]: { ...e[kind], error: undefined, failedAt: undefined },
    }));
    try {
      const result = await (kind === "broker"
        ? window.bunnies.getBrokerInfo(input)
        : window.bunnies.listSessionVhosts(input));
      if (!mounted.current || active.current !== op) return;
      if (result.ok)
        setEntries(e => ({ ...e, [kind]: { data: result.value } }));
      else
        setEntries(e => ({
          ...e,
          [kind]: {
            ...e[kind],
            error: managementErrors[result.error.code],
            failedAt: new Date().toISOString(),
          },
        }));
    } catch {
      if (mounted.current && active.current === op)
        setEntries(e => ({
          ...e,
          [kind]: {
            ...e[kind],
            error: managementErrors.UNAVAILABLE,
            failedAt: new Date().toISOString(),
          },
        }));
    } finally {
      if (mounted.current && active.current === op) {
        active.current = null;
        returnFocus.current = kind;
        setRunning(null);
      }
    }
  }
  async function cancel() {
    const op = active.current;
    if (!op) return;
    const { kind, ...input } = op;
    try {
      const result = await window.bunnies.cancelManagementRead(input);
      if (!result.ok && mounted.current && active.current === op)
        setEntries(e => ({
          ...e,
          [kind]: {
            ...e[kind],
            error: managementErrors[result.error.code],
            failedAt: new Date().toISOString(),
          },
        }));
    } catch {
      /* Main lifecycle also cancels if transport is unavailable. */
    }
  }
  return (
    <section
      className="management-info"
      aria-label="Informações administrativas"
    >
      <h3>Informações administrativas</h3>
      <p>
        Fonte: HTTPS Management · {state.profile?.name} · Vhost atual:{" "}
        <b>{state.profile?.vhost}</b>.
      </p>
      {state.profile?.savedVhost !== undefined && (
        <p ref={switchStatus} tabIndex={-1} role="status">
          Vhost salvo <b>{state.profile.savedVhost}</b>.{" "}
          {state.profile.vhost !== state.profile.savedVhost &&
            "A seleção atual é temporária. "}
          {state.switching ? (
            <>
              {state.switching.phase === "closing"
                ? "Encerrando AMQPS em"
                : "Abrindo AMQPS para"}{" "}
              <b>
                {state.switching.phase === "closing"
                  ? state.switching.from
                  : state.switching.to}
              </b>
              {" desde "}
              <time dateTime={state.switching.startedAt}>
                {new Date(state.switching.startedAt).toLocaleTimeString(
                  "pt-BR",
                )}
              </time>
              .
            </>
          ) : state.amqps.error ? (
            profileErrorMessages[state.amqps.error]
          ) : state.amqps.phase === "available" ||
            state.amqps.phase === "blocked" ? (
            "Vhost aceito por AMQPS."
          ) : (
            "Aguardando AMQPS."
          )}
        </p>
      )}
      <p className="profile-hint">
        Consultas manuais de leitura. Vhosts visíveis não comprovam acesso AMQP.
        Os endpoints HTTPS e AMQPS podem apontar para brokers diferentes.
      </p>
      {!eligible && (
        <StatusMessage title="Consulta administrativa indisponível">
          Mantenha a janela ativa e uma sessão com HTTPS disponível. Nenhuma
          consulta será iniciada automaticamente.
        </StatusMessage>
      )}
      <div className="profile-actions">
        <Button
          ref={brokerButton}
          disabled={!eligible || !!running}
          onClick={() => {
            void execute("broker");
          }}
        >
          Consultar informações
        </Button>
        <Button
          ref={vhostsButton}
          disabled={!eligible || !!running}
          onClick={() => {
            void execute("vhosts");
          }}
        >
          Listar vhosts
        </Button>
        {running && (
          <Button
            onClick={() => {
              void cancel();
            }}
          >
            Cancelar consulta
          </Button>
        )}
      </div>
      {running && (
        <p role="status">
          Consultando{" "}
          {running === "broker" ? "versão informada" : "vhosts visíveis"}…
        </p>
      )}
      {(["broker", "vhosts"] as const).map(kind => {
        const { data: stored, error, failedAt } = entries[kind];
        const data =
          stored?.sessionId === state.sessionId &&
          stored?.generation === state.generation
            ? stored
            : undefined;
        return (
          <section
            key={kind}
            aria-label={
              kind === "broker"
                ? "Versão informada pelo endpoint"
                : "Vhosts visíveis no endpoint"
            }
          >
            {error && (
              <StatusMessage tone="danger" title={error}>
                Falha às{" "}
                {failedAt && new Date(failedAt).toLocaleString("pt-BR")}.{" "}
                {data && "O último resultado está desatualizado."}
              </StatusMessage>
            )}
            {data && eligible && (
              <>
                <p>
                  Última consulta bem-sucedida:{" "}
                  <time dateTime={data.checkedAt}>
                    {new Date(data.checkedAt).toLocaleString("pt-BR")}
                  </time>
                  {error && " · Desatualizado"}
                </p>
                {data.kind === "broker" ? (
                  <>
                    <dl>
                      <dt>RabbitMQ informado</dt>
                      <dd>{data.rabbitmqVersion ?? "Desconhecido"}</dd>
                      <dt>Management informado</dt>
                      <dd>{data.managementVersion ?? "Desconhecido"}</dd>
                    </dl>
                    <p>
                      {data.matrix === "reference"
                        ? "Série da matriz de referência; este dado não homologa todas as funcionalidades ou configurações."
                        : data.matrix === "outside"
                          ? "Versão fora da matriz de referência validada."
                          : "Versão desconhecida; capacidades não verificadas."}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Lista completa recebida: {data.names.length} vhost(s).
                      Limites: 200 nomes e 256 KiB. Não há paginação.
                    </p>
                    <p>
                      Vhost atual <b>{data.currentVhost}</b>:{" "}
                      {data.currentVisible
                        ? "visível no snapshot HTTPS"
                        : "não listado no snapshot HTTPS; não comprova inexistência"}
                      .
                    </p>
                    {data.names.some(name => name !== data.currentVhost) && (
                      <p className="profile-hint" id={selectionHint}>
                        Usar este vhost encerra a conexão AMQPS atual e pode
                        gerar registros no broker. A lista serve para seleção
                        por cinco minutos.
                      </p>
                    )}
                    {data.names.length ? (
                      <ul className="management-vhosts">
                        {data.names.map(name => (
                          <li key={name}>
                            <span className="management-vhost-name">
                              {name}
                            </span>
                            {name !== data.currentVhost && (
                              <Button
                                aria-label={`Usar este vhost: ${name}`}
                                aria-describedby={selectionHint}
                                disabled={
                                  !!error ||
                                  !!running ||
                                  busy ||
                                  !!state.switching ||
                                  state.amqps.error ===
                                    "AMQP_REMOTE_UNCONFIRMED"
                                }
                                onClick={() => {
                                  focusSwitch.current = true;
                                  void selectVhost({
                                    sessionId: data.sessionId,
                                    generation: data.generation,
                                    operationId: crypto.randomUUID(),
                                    selectionId: data.selectionId,
                                    vhost: name,
                                  }).then(success => {
                                    if (!success) focusSwitch.current = false;
                                  });
                                }}
                              >
                                Usar este vhost
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Nenhum vhost visível retornado. A sessão AMQPS foi
                        mantida.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        );
      })}
      <p className="profile-hint">
        A lista inteira é recusada se ultrapassar os limites. O servidor pode
        construir uma resposta maior antes da interrupção pelo cliente.
      </p>
    </section>
  );
}
