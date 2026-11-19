import React from "react";
import {
  boundedManagementText,
  managementErrors,
  type ManagementError,
  type ManagementInput,
  type ManagementResult,
  type QueueSnapshot,
} from "../../shared/management";
import {
  MAX_QUEUE_PAGE,
  QUEUE_PAGE_SIZE,
  queueListRouteConflict,
  queueSegmentUnsupported,
  type QueueDetail,
  type QueuePage,
  type QueueSummary,
} from "../../shared/queues";
import type { SessionSnapshot } from "../../shared/session";
import { environmentLabels } from "../../shared/profiles";
import { useSession } from "../shell/SessionProvider";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import "./queues.scss";

type ReadError = { code: ManagementError; requestId: string };
type QueueRequest = { page: number; search: string } | { name: string };
type DetailView = {
  name: string;
  data?: QueueSnapshot<QueueDetail>;
  error?: ReadError;
};
const unknown = "Indisponível";
const knownTypes = ["classic", "quorum", "stream"];
const fields = [
  ["ready", "Prontas"],
  ["unacknowledged", "Sem confirmação"],
  ["total", "Total"],
  ["consumers", "Consumidores"],
] as const;

function unavailableReason(state: SessionSnapshot): string | undefined {
  if (!state.desired || !state.profile)
    return "Conecte uma sessão em Conexões.";
  if (state.stopping) return "Aguarde o encerramento da sessão.";
  if (state.switching) return "Aguarde a troca de vhost.";
  if (state.paused) return "Volte à janela ativa para consultar.";
  if (state.https.phase !== "available") return "Aguarde a verificação HTTPS.";
  if (state.amqps.phase !== "available" && state.amqps.phase !== "blocked")
    return "Aguarde uma conexão AMQPS estabelecida neste vhost.";
}

function Time({ checkedAt }: { checkedAt: string }) {
  return (
    <time dateTime={checkedAt}>
      {new Date(checkedAt).toLocaleString("pt-BR")}
    </time>
  );
}

function ReadFailure({ error }: { error: ReadError }) {
  const titles: Partial<Record<ManagementError, string>> = {
    CANCELLED: "Consulta cancelada",
    AUTH: "Acesso recusado",
    DENIED: "Permissão negada",
    QUEUE_PAGE: "Página fora da faixa",
  };
  return (
    <StatusMessage
      tone="warning"
      title={titles[error.code] ?? "Falha na consulta"}
    >
      {error.code === "LIMIT"
        ? "A resposta excedeu 256 KiB de corpo ou 16 KiB de cabeçalhos."
        : managementErrors[error.code]}{" "}
      Diagnóstico {error.requestId}.
    </StatusMessage>
  );
}

function QueueMetadata({ data }: { data: QueueSnapshot<QueueDetail> }) {
  const { queue } = data;
  const flags = [
    ["durable", "Durável"],
    ["exclusive", "Exclusiva"],
    ["autoDelete", "Auto-delete"],
  ] as const;
  const flag = (value: boolean | undefined) =>
    value === undefined ? unknown : value ? "Sim" : "Não";
  return (
    <>
      <p>
        HTTPS Management · <Time checkedAt={data.checkedAt} />
      </p>
      <dl className="queue-properties">
        <dt>Tipo</dt>
        <dd>{queue.type ?? unknown}</dd>
        <dt>Estado</dt>
        <dd>{queue.state ?? unknown}</dd>
        {flags.map(([key, label]) => (
          <React.Fragment key={key}>
            <dt>{label}</dt>
            <dd>{flag(queue[key])}</dd>
          </React.Fragment>
        ))}
        {fields.map(([key, label]) => (
          <React.Fragment key={key}>
            <dt>{label}</dt>
            <dd>{queue[key] ?? unknown}</dd>
          </React.Fragment>
        ))}
      </dl>
      <h3>Argumentos básicos</h3>
      {queue.arguments === undefined ? (
        <p>{unknown}</p>
      ) : Object.keys(queue.arguments).length ? (
        <dl className="queue-properties">
          {Object.entries(queue.arguments).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt>{key}</dt>
              <dd>{value === "" ? "Texto vazio" : value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : (
        <p>Nenhum argumento do catálogo informado.</p>
      )}
      <h3>Detalhes de consumidores</h3>
      {queue.consumerDetails === undefined ? (
        <p>{unknown}</p>
      ) : queue.consumerDetails.items.length ? (
        <>
          {queue.consumerDetails.partial && (
            <p>
              Dados parciais. Exibindo os primeiros{" "}
              {queue.consumerDetails.items.length} consumidores.
            </p>
          )}
          <ul className="queue-consumers">
            {queue.consumerDetails.items.map((consumer, index) => (
              <li key={index}>
                <strong>{consumer.tag}</strong>
                <span>Ativo: {flag(consumer.active)}</span>
                <span>
                  Confirmação exigida: {flag(consumer.acknowledgementRequired)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Nenhum consumidor retornado.</p>
      )}
    </>
  );
}

function QueueWorkspace({ state }: { state: SessionSnapshot }) {
  const reason = unavailableReason(state);
  const profile = state.profile;
  const routeError = queueListRouteConflict(profile?.vhost ?? "")
    ? "QUEUE_LIST_ROUTE"
    : queueSegmentUnsupported(profile?.vhost ?? "")
      ? "QUEUE_SEGMENT"
      : undefined;
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [data, setData] = React.useState<QueueSnapshot<QueuePage>>();
  const [error, setError] = React.useState<ReadError>();
  const [stale, setStale] = React.useState(false);
  const [running, setRunning] = React.useState<"page" | "detail">();
  const [detail, setDetail] = React.useState<DetailView>();
  const active = React.useRef<ManagementInput | null>(null);
  const returnFocus = React.useRef<HTMLButtonElement | null>(null);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const detailHeading = React.useRef<HTMLHeadingElement>(null);
  const browseHeading = React.useRef<HTMLHeadingElement>(null);
  const summary = React.useRef<HTMLParagraphElement>(null);
  const focusSummary = React.useRef(false);
  const detailOpen = !!detail;
  const canRead = !reason && !routeError && !!state.sessionId;
  const invalidDraft = draft !== "" && !boundedManagementText(draft, 255);

  const requestCancellation = React.useCallback(() => {
    if (active.current)
      void window.bunnies
        .cancelManagementRead(active.current)
        .catch(() => undefined);
  }, []);

  React.useLayoutEffect(() => {
    if (!canRead) {
      setRunning(undefined);
      setStale(true);
      setDetail(undefined);
    }
    return () => {
      requestCancellation();
      active.current = null;
    };
  }, [canRead, requestCancellation]);

  React.useLayoutEffect(() => {
    const modal = dialog.current;
    if (!detailOpen || !modal) return;
    const fallback = browseHeading.current;
    modal.showModal();
    detailHeading.current?.focus();
    return () => {
      modal.close();
      const trigger = returnFocus.current;
      if (trigger?.isConnected && !trigger.disabled) trigger.focus();
      else if (fallback?.isConnected) fallback.focus();
    };
  }, [detailOpen]);

  React.useLayoutEffect(() => {
    if (focusSummary.current) {
      summary.current?.focus();
      focusSummary.current = false;
    }
  }, [data]);

  async function execute(query: QueueRequest, fromPagination = false) {
    if (!canRead || !profile || !state.sessionId || active.current) return;
    const input: ManagementInput = {
      sessionId: state.sessionId,
      generation: state.generation,
      operationId: crypto.randomUUID(),
    };
    active.current = input;
    const list = "page" in query;
    setRunning(list ? "page" : "detail");
    function failed(failure: ReadError) {
      if (active.current !== input) return;
      if (list) {
        setError(failure);
        setStale(true);
      } else setDetail({ name: query.name, error: failure });
    }
    try {
      if (list) {
        const result = await window.bunnies.listSessionQueues({
          ...input,
          page: query.page,
          ...(query.search === "" ? {} : { search: query.search }),
        });
        if (active.current !== input) return;
        if (!matchesContext(result))
          failed({ code: "RESPONSE", requestId: result.requestId });
        else if (!result.ok)
          failed({ code: result.error.code, requestId: result.requestId });
        else {
          focusSummary.current = fromPagination;
          setData(result.value);
          setSearch(query.search);
          setError(undefined);
          setStale(false);
        }
      } else {
        const result = await window.bunnies.getSessionQueue({
          ...input,
          name: query.name,
        });
        if (active.current !== input) return;
        if (!matchesContext(result))
          failed({ code: "RESPONSE", requestId: result.requestId });
        else if (!result.ok)
          failed({ code: result.error.code, requestId: result.requestId });
        else setDetail({ name: query.name, data: result.value });
      }
    } catch {
      failed({ code: "UNAVAILABLE", requestId: "transport" });
    } finally {
      if (active.current === input) {
        active.current = null;
        setRunning(undefined);
      }
    }
    function matchesContext(result: ManagementResult<QueueSnapshot>) {
      return !result.ok || result.value.vhost === profile?.vhost;
    }
  }

  function openDetail(row: QueueSummary, trigger: HTMLButtonElement) {
    if (!canRead || active.current || queueSegmentUnsupported(row.name)) return;
    returnFocus.current = trigger;
    setDetail({ name: row.name });
    void execute({ name: row.name });
  }

  function closeDetail() {
    if (active.current) {
      requestCancellation();
      active.current = null;
      setRunning(undefined);
    }
    setDetail(undefined);
  }

  const rows = data?.items.filter(item => {
    if (filter === "all") return true;
    if (filter === "other") return !knownTypes.includes(item.type ?? "");
    return item.type === filter;
  });
  const outsidePage = !!data && data.page > Math.max(1, data.pageCount);
  const controlsDisabled = !canRead || !!running;

  return (
    <section className="queues" aria-labelledby="queues-browse">
      <h2 id="queues-browse" tabIndex={-1} ref={browseHeading}>
        Consultar filas
      </h2>
      {profile && (
        <p
          className={
            profile.environment === "production"
              ? "queue-context queue-context--production"
              : "queue-context"
          }
        >
          {profile.name} · {environmentLabels[profile.environment]} · Vhost{" "}
          <b>{profile.vhost}</b>
          {profile.savedVhost !== undefined &&
            profile.vhost !== profile.savedVhost &&
            " (temporário)"}
          {" · HTTPS Management"}
        </p>
      )}
      {routeError ? (
        <StatusMessage tone="warning" title="Listagem indisponível">
          {managementErrors[routeError]}
        </StatusMessage>
      ) : (
        reason && (
          <StatusMessage title="Consulta indisponível">{reason}</StatusMessage>
        )
      )}
      {canRead && (
        <form
          className="queue-controls"
          onSubmit={event => {
            event.preventDefault();
            if (!controlsDisabled && !invalidDraft)
              void execute({ page: 1, search: draft });
          }}
        >
          <label>
            Buscar trecho do nome
            <input
              type="text"
              value={draft}
              maxLength={255}
              aria-invalid={invalidDraft || undefined}
              aria-describedby={
                invalidDraft ? "queues-search-error" : undefined
              }
              onChange={event => setDraft(event.target.value)}
            />
          </label>
          <Button
            type="submit"
            variant="primary"
            aria-disabled={controlsDisabled || invalidDraft}
          >
            {draft ? "Buscar filas" : "Carregar filas"}
          </Button>
          {invalidDraft && (
            <span id="queues-search-error">
              Use até 255 bytes UTF-8 em uma única linha.
            </span>
          )}
        </form>
      )}
      {running === "page" && (
        <StatusMessage
          title="Carregando filas…"
          action={
            <Button onClick={requestCancellation}>Cancelar consulta</Button>
          }
        />
      )}
      {error && <ReadFailure error={error} />}
      {data && (
        <>
          <p role="status" ref={summary} tabIndex={-1}>
            {data.filteredCount} de {data.totalCount} filas
            {search && (
              <>
                {" "}
                · Busca aplicada <b>{search}</b>
              </>
            )}
            {" · "}
            <Time checkedAt={data.checkedAt} />
            {(stale || !canRead) && " · Desatualizado"}
          </p>
          {outsidePage ? (
            <p>A página solicitada ficou fora da faixa.</p>
          ) : data.items.length === 0 ? (
            <p>
              {search
                ? "Nenhuma fila corresponde à busca."
                : "Nenhuma fila visível neste vhost."}
            </p>
          ) : (
            <>
              <label className="queue-filter">
                Tipo (Nesta página)
                <select
                  value={filter}
                  onChange={event => setFilter(event.target.value)}
                >
                  <option value="all">Todos</option>
                  {knownTypes.map(type => (
                    <option key={type}>{type}</option>
                  ))}
                  <option value="other">Outros ou indisponíveis</option>
                </select>
              </label>
              {rows?.length === 0 ? (
                <p>Nenhuma fila corresponde ao filtro nesta página.</p>
              ) : (
                <div
                  className="queue-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Tabela de filas"
                >
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Fila</th>
                        <th scope="col">Tipo</th>
                        {fields.map(([key, label]) => (
                          <th scope="col" key={key}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows?.map(row => (
                        <tr key={row.name}>
                          <th scope="row">
                            {queueSegmentUnsupported(row.name) ? (
                              <>
                                {row.name}
                                <small>
                                  Detalhe indisponível para este nome.
                                </small>
                              </>
                            ) : (
                              <Button
                                variant="quiet"
                                aria-label={`Ver detalhes da fila ${row.name}`}
                                aria-haspopup="dialog"
                                aria-disabled={controlsDisabled}
                                onClick={event =>
                                  openDetail(row, event.currentTarget)
                                }
                              >
                                {row.name}
                              </Button>
                            )}
                          </th>
                          <td>{row.type ?? unknown}</td>
                          {fields.map(([key]) => (
                            <td key={key}>{row[key] ?? unknown}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          <nav aria-label="Paginação de filas" className="queue-controls">
            {data.pageCount > 0 && (
              <span>
                Página {data.page} de {data.pageCount} · até {QUEUE_PAGE_SIZE}{" "}
                filas por página
              </span>
            )}
            {!outsidePage && data.page > 1 && (
              <Button
                aria-disabled={controlsDisabled}
                onClick={() => {
                  if (!controlsDisabled)
                    void execute({ page: data.page - 1, search }, true);
                }}
              >
                Página anterior
              </Button>
            )}
            {!outsidePage &&
              data.page < Math.min(data.pageCount, MAX_QUEUE_PAGE) && (
                <Button
                  aria-disabled={controlsDisabled}
                  onClick={() => {
                    if (!controlsDisabled)
                      void execute({ page: data.page + 1, search }, true);
                  }}
                >
                  Próxima página
                </Button>
              )}
          </nav>
        </>
      )}
      {(outsidePage || error?.code === "QUEUE_PAGE") && (
        <Button
          aria-disabled={controlsDisabled}
          onClick={() => {
            if (!controlsDisabled) void execute({ page: 1, search }, true);
          }}
        >
          Voltar à primeira página
        </Button>
      )}
      <dialog
        ref={dialog}
        className="queue-detail"
        aria-labelledby="queue-detail-title"
        onCancel={event => {
          event.preventDefault();
          closeDetail();
        }}
      >
        {detail && (
          <>
            <h2 id="queue-detail-title" tabIndex={-1} ref={detailHeading}>
              {detail.name}
            </h2>
            <p className="queue-context">
              Vhost <b>{profile?.vhost}</b>
            </p>
            <Button onClick={closeDetail}>Fechar detalhe</Button>
            {running === "detail" && (
              <StatusMessage title="Carregando detalhe…" />
            )}
            {detail.error && <ReadFailure error={detail.error} />}
            {detail.data && <QueueMetadata data={detail.data} />}
          </>
        )}
      </dialog>
    </section>
  );
}

export default function Queues() {
  const { state } = useSession();
  return (
    <QueueWorkspace
      key={`${state.sessionId}:${state.generation}`}
      state={state}
    />
  );
}
