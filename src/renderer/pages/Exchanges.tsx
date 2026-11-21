import React from "react";
import {
  bindingIdentity,
  exchangeSegmentUnsupported,
  type BindingDirection,
  type ExchangeDetail,
  type ExchangePage,
  type ExchangeBindings,
  type ExchangeData,
} from "../../shared/exchanges";
import {
  boundedManagementText,
  managementErrors,
  type ExchangeSnapshot,
  type ManagementError,
  type ManagementInput,
  type ManagementResult,
} from "../../shared/management";
import { queueSegmentUnsupported } from "../../shared/queues";
import ExchangeDeclarationForm from "./ExchangeDeclarationForm";
import type { SessionRef, SessionSnapshot } from "../../shared/session";
import {
  managementUnavailableReason,
  useSession,
} from "../shell/SessionProvider";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import "./exchanges.scss";

type ReadError = { code: ManagementError; requestId: string };

function ExchangeName({ name }: { name: string }) {
  return name === "" ? (
    "Exchange padrão"
  ) : (
    <bdi className="exchange-name">{name}</bdi>
  );
}

function CheckedAt({ checkedAt }: { checkedAt: string }) {
  return (
    <p className="exchange-reading">
      Consultado em{" "}
      <time dateTime={checkedAt}>
        {new Date(checkedAt).toLocaleString("pt-BR")}
      </time>
    </p>
  );
}

function Arguments({ value }: { value?: string | null }) {
  if (value === undefined) return <span>Não informado</span>;
  if (value === null) return <span>Indisponível por limite de precisão</span>;
  if (value === "{}") return <span>Nenhum</span>;
  return <pre className="exchange-arguments">{value}</pre>;
}

function ExchangeProperties({
  data,
}: {
  data: ExchangeSnapshot<ExchangeDetail>;
}) {
  const { exchange } = data;
  return (
    <>
      <CheckedAt checkedAt={data.checkedAt} />
      <dl className="exchange-properties">
        <dt>Tipo</dt>
        <dd>
          <bdi>{exchange.type}</bdi>
        </dd>
        <dt>Durável</dt>
        <dd>{exchange.durable ? "Sim" : "Não"}</dd>
        <dt>Exclusão automática</dt>
        <dd>{exchange.autoDelete ? "Sim" : "Não"}</dd>
        <dt>Interna</dt>
        <dd>{exchange.internal ? "Sim" : "Não"}</dd>
        {exchange.name === "" && (
          <>
            <dt>Nome AMQP</dt>
            <dd>Vazio</dd>
          </>
        )}
        {exchange.name.startsWith("amq.") && (
          <>
            <dt>Recurso</dt>
            <dd>Reservado</dd>
          </>
        )}
        <dt>Argumentos</dt>
        <dd>
          <Arguments value={exchange.argumentsJson} />
        </dd>
      </dl>
    </>
  );
}

function BindingList({ data }: { data: ExchangeSnapshot<ExchangeBindings> }) {
  const title =
    data.direction === "incoming" ? "Bindings de entrada" : "Bindings de saída";
  return (
    <section aria-labelledby="exchange-bindings-heading">
      <h3 id="exchange-bindings-heading">{title}</h3>
      <CheckedAt checkedAt={data.checkedAt} />
      {data.items.length === 0 ? (
        <p role="status">Nenhum binding retornado nesta direção.</p>
      ) : (
        <ul className="exchange-bindings">
          {data.items.map(item => (
            <li key={bindingIdentity(item)}>
              <dl className="exchange-properties">
                <dt>Origem</dt>
                <dd>
                  <ExchangeName name={item.source} />
                </dd>
                <dt>
                  {item.destinationType === "queue"
                    ? "Fila de destino"
                    : "Exchange de destino"}
                </dt>
                <dd>
                  <ExchangeName name={item.destination} />
                </dd>
                <dt>Routing key</dt>
                <dd>
                  {item.routingKey === "" ? (
                    "Vazia"
                  ) : (
                    <bdi>{JSON.stringify(item.routingKey)}</bdi>
                  )}
                </dd>
                <dt>Identidade do binding</dt>
                <dd>
                  <bdi>{JSON.stringify(item.propertiesKey)}</bdi>
                </dd>
                <dt>Argumentos</dt>
                <dd>
                  <Arguments value={item.argumentsJson} />
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExchangeWorkspace({
  session,
  profile,
}: {
  session: SessionRef;
  profile: NonNullable<SessionSnapshot["profile"]>;
}) {
  const vhost = profile.vhost;
  const declarationButton = React.useRef<HTMLButtonElement>(null);
  const [declarationOpen, setDeclarationOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<ExchangeSnapshot<ExchangePage>>();
  const [selected, setSelected] = React.useState<string>();
  const [detail, setDetail] =
    React.useState<ExchangeSnapshot<ExchangeDetail>>();
  const [bindings, setBindings] =
    React.useState<ExchangeSnapshot<ExchangeBindings>>();
  const [running, setRunning] = React.useState<ExchangeData["kind"]>();
  const [error, setError] = React.useState<ReadError>();
  const active = React.useRef<ManagementInput | null>(null);
  const rowTrigger = React.useRef<HTMLButtonElement>(null);
  const browseHeading = React.useRef<HTMLHeadingElement>(null);
  const detailHeading = React.useRef<HTMLHeadingElement>(null);
  const results = React.useRef<HTMLParagraphElement>(null);
  const focusResults = React.useRef(false);
  const invalidDraft = draft !== "" && !boundedManagementText(draft, 255);
  const detailOpen = selected !== undefined;

  const invalidate = React.useCallback(() => {
    const input = active.current;
    active.current = null;
    if (input)
      void window.bunnies.cancelManagementRead(input).catch(() => undefined);
  }, []);

  React.useLayoutEffect(() => invalidate, [invalidate]);
  React.useLayoutEffect(() => {
    if (detailOpen) detailHeading.current?.focus();
    else if (rowTrigger.current) {
      const trigger = rowTrigger.current;
      rowTrigger.current = null;
      (trigger.isConnected ? trigger : browseHeading.current)?.focus();
    }
  }, [detailOpen]);
  React.useLayoutEffect(() => {
    if (page && focusResults.current) {
      results.current?.focus();
      focusResults.current = false;
    }
  }, [page]);

  async function execute<T extends ExchangeData>(
    kind: T["kind"],
    query: (
      input: ManagementInput,
    ) => Promise<ManagementResult<ExchangeSnapshot<T>>>,
    save: (value: ExchangeSnapshot<T>) => void,
  ) {
    if (active.current) return;
    const input = { ...session, operationId: crypto.randomUUID() };
    active.current = input;
    setError(undefined);
    setRunning(kind);
    try {
      const response = await query(input);
      if (active.current !== input) return;
      if (!response.ok)
        setError({ code: response.error.code, requestId: response.requestId });
      else if (
        response.value.kind !== kind ||
        response.value.vhost !== vhost ||
        response.value.sessionId !== input.sessionId ||
        response.value.generation !== input.generation ||
        response.value.operationId !== input.operationId
      )
        setError({ code: "RESPONSE", requestId: response.requestId });
      else save(response.value);
    } catch {
      if (active.current === input)
        setError({ code: "UNAVAILABLE", requestId: "transport" });
    } finally {
      if (active.current === input) {
        active.current = null;
        setRunning(undefined);
      }
    }
  }

  function loadPage(number: number, term: string, paginate = false) {
    if (active.current) return;
    setSearch(term);
    setPage(undefined);
    focusResults.current = paginate;
    void execute<ExchangePage>(
      "exchangePage",
      input =>
        window.bunnies.listSessionExchanges({
          ...input,
          page: number,
          ...(term ? { search: term } : {}),
        }),
      setPage,
    );
  }
  function openDetail(name: string, trigger: HTMLButtonElement) {
    if (active.current) return;
    rowTrigger.current = trigger;
    setSelected(name);
    setDetail(undefined);
    setBindings(undefined);
    void execute<ExchangeDetail>(
      "exchangeDetail",
      input => window.bunnies.getSessionExchange({ ...input, name }),
      setDetail,
    );
  }
  function closeDetail() {
    invalidate();
    setRunning(undefined);
    setError(undefined);
    setSelected(undefined);
    setDetail(undefined);
    setBindings(undefined);
  }
  function loadBindings(direction: BindingDirection) {
    if (!selected || active.current) return;
    setBindings(undefined);
    const name = selected;
    void execute<ExchangeBindings>(
      "exchangeBindings",
      input =>
        window.bunnies.listSessionExchangeBindings({
          ...input,
          name,
          direction,
        }),
      setBindings,
    );
  }
  function cancelRead() {
    if (active.current)
      void window.bunnies
        .cancelManagementRead(active.current)
        .catch(() => undefined);
  }

  const outsidePage = !!page && page.page > Math.max(1, page.pageCount);
  const readError = error && (
    <StatusMessage
      tone="warning"
      title={
        error.code === "CANCELLED"
          ? "Consulta cancelada"
          : error.code === "EXCHANGE_PAGE"
            ? "Página fora da faixa"
            : error.code === "EXCHANGE_BINDINGS_LIMIT" || error.code === "LIMIT"
              ? "Limite da consulta"
              : "Falha na consulta"
      }
    >
      {error.code === "LIMIT"
        ? "A resposta excedeu 256 KiB de corpo ou 16 KiB de cabeçalhos."
        : managementErrors[error.code]}{" "}
      Diagnóstico {error.requestId}.
    </StatusMessage>
  );
  const progress = running && (
    <div className="exchange-actions">
      <p role="status">Consultando o RabbitMQ…</p>
      <Button onClick={cancelRead}>Cancelar consulta</Button>
    </div>
  );

  return (
    <section className="exchanges" aria-label="Consultar exchanges">
      <p className="exchange-reading">
        Vhost <bdi>{vhost}</bdi> · HTTPS Management
      </p>
      {declarationOpen && (
        <ExchangeDeclarationForm
          profile={profile}
          session={session}
          available={true}
          onClose={() => setDeclarationOpen(false)}
          onPossibleWrite={() => setPage(undefined)}
          onVerify={name => {
            setDeclarationOpen(false);
            if (declarationButton.current)
              openDetail(name, declarationButton.current);
          }}
        />
      )}
      <div hidden={detailOpen}>
        <Button
          ref={declarationButton}
          disabled={!!running}
          aria-haspopup="dialog"
          onClick={() => {
            if (!active.current) setDeclarationOpen(true);
          }}
        >
          Nova exchange
        </Button>
        <h2
          className="exchange-section-heading"
          ref={browseHeading}
          tabIndex={-1}
        >
          Lista de exchanges
        </h2>
        <form
          className="exchange-controls"
          onSubmit={event => {
            event.preventDefault();
            if (!invalidDraft) loadPage(1, draft);
          }}
        >
          <label>
            Buscar trecho do nome
            <input
              type="text"
              maxLength={255}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              aria-invalid={invalidDraft || undefined}
              aria-describedby={
                invalidDraft ? "exchange-search-error" : undefined
              }
            />
          </label>
          <Button
            type="submit"
            variant="primary"
            aria-disabled={invalidDraft || !!running}
          >
            {draft ? "Buscar exchanges" : "Carregar exchanges"}
          </Button>
        </form>
        {invalidDraft && (
          <p id="exchange-search-error">
            Use até 255 bytes UTF-8 em uma única linha.
          </p>
        )}
        {!detailOpen && progress}
        {!detailOpen && readError}
        {(outsidePage || error?.code === "EXCHANGE_PAGE") && (
          <Button onClick={() => loadPage(1, search, true)}>
            Voltar à primeira página
          </Button>
        )}
        {page && !outsidePage && (
          <>
            <CheckedAt checkedAt={page.checkedAt} />
            <p ref={results} tabIndex={-1} role="status">
              {page.filteredCount === 0
                ? "Nenhuma exchange retornada."
                : `Página ${page.page} de ${page.pageCount} · ${page.filteredCount} de ${page.totalCount} exchanges`}
            </p>
            {page.items.length > 0 && (
              <ul className="exchange-list" aria-label="Exchanges encontradas">
                {page.items.map(row => (
                  <li key={row.name}>
                    {exchangeSegmentUnsupported(row.name) ? (
                      <span>
                        <ExchangeName name={row.name} /> · Detalhe indisponível
                      </span>
                    ) : (
                      <Button
                        variant="quiet"
                        onClick={event =>
                          openDetail(row.name, event.currentTarget)
                        }
                      >
                        <ExchangeName name={row.name} />
                      </Button>
                    )}
                    <span className="exchange-reading">
                      <bdi>{row.type}</bdi>
                      {row.name.startsWith("amq.") && " · Reservada"}
                      {row.internal && " · Interna"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {page.pageCount > 1 && (
              <div className="exchange-actions">
                <Button
                  disabled={page.page <= 1}
                  onClick={() => loadPage(page.page - 1, search, true)}
                >
                  Página anterior
                </Button>
                <Button
                  disabled={page.page >= page.pageCount}
                  onClick={() => loadPage(page.page + 1, search, true)}
                >
                  Próxima página
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {detailOpen && (
        <section aria-labelledby="exchange-detail">
          <h2 ref={detailHeading} id="exchange-detail" tabIndex={-1}>
            <ExchangeName name={selected} />
          </h2>
          <Button onClick={closeDetail}>Voltar à lista</Button>
          {progress}
          {readError}
          {detail && (
            <>
              <ExchangeProperties data={detail} />
              {selected === "" ? (
                <p>
                  O RabbitMQ vincula cada fila do vhost à exchange padrão
                  automaticamente, usando o nome da fila como routing key. Esses
                  vínculos são implícitos.
                </p>
              ) : (
                <div className="exchange-actions">
                  <Button
                    aria-disabled={!!running}
                    onClick={() => loadBindings("incoming")}
                  >
                    Consultar bindings de entrada
                  </Button>
                  <Button
                    aria-disabled={!!running}
                    onClick={() => loadBindings("outgoing")}
                  >
                    Consultar bindings de saída
                  </Button>
                </div>
              )}
              {bindings && <BindingList data={bindings} />}
            </>
          )}
        </section>
      )}
    </section>
  );
}

export default function Exchanges() {
  const { state } = useSession();
  const reason = managementUnavailableReason(state);
  const { sessionId, generation, profile } = state;
  if (reason || !sessionId || !profile)
    return (
      <StatusMessage title="Consulta indisponível">
        {reason ?? managementErrors.UNAVAILABLE}
      </StatusMessage>
    );

  if (queueSegmentUnsupported(profile.vhost))
    return (
      <StatusMessage tone="warning" title="Consulta indisponível">
        {managementErrors.EXCHANGE_SEGMENT}
      </StatusMessage>
    );

  return (
    <ExchangeWorkspace
      key={JSON.stringify([sessionId, generation, profile.vhost])}
      session={{ sessionId, generation }}
      profile={profile}
    />
  );
}
