import React from "react";
import { useManagementEndpoint } from "./useManagementEndpoint";
import {
  exchangeTypes,
  type ExchangeDeclaration,
} from "../../shared/exchanges";
import { isExchangeDeclaration } from "../../shared/management";
import DeclarationDialog, {
  type DeclarationFormProps,
} from "./DeclarationDialog";

export default function ExchangeDeclarationForm(props: DeclarationFormProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<ExchangeDeclaration["type"]>("direct");
  const [durable, setDurable] = React.useState(true);
  const [autoDelete, setAutoDelete] = React.useState(false);
  const endpoint = useManagementEndpoint(props.profile.id);
  const declaration = { name, type, durable, autoDelete };
  return (
    <DeclarationDialog
      {...props}
      resource="exchange"
      name={name}
      setName={setName}
      destinationReady={!!endpoint}
      endpoint={endpoint}
      description={
        endpoint === ""
          ? "Não foi possível conferir o destino HTTPS do perfil. Feche e abra novamente o formulário."
          : "A exchange será declarada neste vhost como não interna, com argumentos vazios."
      }
      validationMessage="Informe um nome de até 255 bytes UTF-8. O nome vazio, o prefixo amq., os nomes . e .. e caracteres de controle são reservados ou inválidos."
      valid={isExchangeDeclaration(declaration)}
      cancelDeclaration={window.bunnies.cancelExchangeDeclaration}
      submitDeclaration={input =>
        window.bunnies.declareSessionExchange({ ...input, declaration })
      }
    >
      <label>
        Tipo da exchange
        <select
          value={type}
          onChange={event => {
            const next = exchangeTypes.find(t => t === event.target.value);
            if (next) setType(next);
          }}
        >
          {exchangeTypes.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="queue-checkbox">
        <input
          type="checkbox"
          checked={durable}
          onChange={event => setDurable(event.target.checked)}
        />
        Durável
      </label>
      <label className="queue-checkbox">
        <input
          type="checkbox"
          checked={autoDelete}
          onChange={event => setAutoDelete(event.target.checked)}
        />
        Exclusão automática
      </label>
      {autoDelete && (
        <p>
          O broker pode remover esta exchange quando o último binding de saída
          for removido.
        </p>
      )}
    </DeclarationDialog>
  );
}
