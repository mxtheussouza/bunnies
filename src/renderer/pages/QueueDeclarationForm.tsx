import React from "react";
import { isQueueDeclaration } from "../../shared/management";
import type { QueueDeclaration } from "../../shared/queues";
import DeclarationDialog, {
  type DeclarationFormProps,
} from "./DeclarationDialog";

export default function QueueDeclarationForm(props: DeclarationFormProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<QueueDeclaration["type"]>("classic");
  const [ttl, setTtl] = React.useState("");
  const [maxLength, setMaxLength] = React.useState("");
  const [useDlx, setUseDlx] = React.useState(false);
  const [dlx, setDlx] = React.useState("");
  const [useRoutingKey, setUseRoutingKey] = React.useState(false);
  const [routingKey, setRoutingKey] = React.useState("");
  const declaration: QueueDeclaration = {
    name,
    type,
    arguments: {
      ...(ttl === "" ? {} : { "x-message-ttl": Number(ttl) }),
      ...(maxLength === "" ? {} : { "x-max-length": Number(maxLength) }),
      ...(useDlx ? { "x-dead-letter-exchange": dlx } : {}),
      ...(useDlx && useRoutingKey
        ? { "x-dead-letter-routing-key": routingKey }
        : {}),
    },
  };
  const valid =
    /^\d*$/.test(ttl) &&
    /^\d*$/.test(maxLength) &&
    isQueueDeclaration(declaration);

  return (
    <DeclarationDialog
      {...props}
      resource="fila"
      name={name}
      setName={setName}
      valid={valid}
      submitDeclaration={input =>
        window.bunnies.declareSessionQueue({ ...input, declaration })
      }
      cancelDeclaration={window.bunnies.cancelQueueDeclaration}
      description="Fila durável, não exclusiva e sem exclusão automática."
      validationMessage="Informe um nome de fila válido (até 255 bytes UTF-8, sem prefixo amq. ou segmentos . e ..). Use números inteiros de 0 a 2.147.483.647 e textos DLX de até 255 bytes UTF-8."
    >
      <label>
        Tipo da fila
        <select
          value={type}
          onChange={event =>
            setType(event.target.value === "quorum" ? "quorum" : "classic")
          }
        >
          <option value="classic">classic</option>
          <option value="quorum">quorum</option>
        </select>
      </label>
      <label>
        TTL de mensagens (ms)
        <input
          inputMode="numeric"
          maxLength={10}
          value={ttl}
          onChange={event => setTtl(event.target.value)}
        />
      </label>
      <label>
        Limite de mensagens
        <input
          inputMode="numeric"
          maxLength={10}
          value={maxLength}
          onChange={event => setMaxLength(event.target.value)}
        />
      </label>
      <p>
        Campos vazios omitem o argumento. Zero é um limite explícito e pode
        fazer mensagens expirarem ou serem descartadas. Policies do broker podem
        afetar os valores efetivos.
      </p>
      <label className="queue-checkbox">
        <input
          type="checkbox"
          checked={useDlx}
          onChange={event => setUseDlx(event.target.checked)}
        />
        Configurar dead-letter exchange (DLX)
      </label>
      {useDlx && (
        <>
          <label>
            Nome da DLX (vazio para a exchange padrão)
            <input
              maxLength={255}
              value={dlx}
              onChange={event => setDlx(event.target.value)}
            />
          </label>
          <label className="queue-checkbox">
            <input
              type="checkbox"
              checked={useRoutingKey}
              onChange={event => setUseRoutingKey(event.target.checked)}
            />
            Definir routing key
          </label>
          {useRoutingKey && (
            <label>
              Routing key da DLX
              <input
                maxLength={255}
                value={routingKey}
                onChange={event => setRoutingKey(event.target.value)}
              />
            </label>
          )}
          <p>
            A DLX exige leitura na fila e escrita na exchange do mesmo vhost.
          </p>
        </>
      )}
    </DeclarationDialog>
  );
}
