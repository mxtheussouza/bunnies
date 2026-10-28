import React from "react";
import {
  environmentLabels,
  environments,
  type ProfileFields,
  type ProfileSummary,
  type SaveProfileInput,
  type SecretProtectionStatus,
} from "../../shared/profiles";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";

const empty: ProfileFields = {
  name: "",
  environment: "development",
  httpsUrl: "",
  amqpsUrl: "",
  username: "",
};
export default function ProfileForm({
  profile,
  revision,
  protection,
  busy,
  error,
  onSave,
  onClose,
}: {
  profile?: ProfileSummary;
  revision: string;
  protection: SecretProtectionStatus;
  busy: boolean;
  error: string;
  onSave: (input: SaveProfileInput) => void;
  onClose: () => void;
}) {
  const initial = profile
    ? {
        name: profile.name,
        environment: profile.environment,
        httpsUrl: profile.httpsUrl,
        amqpsUrl: profile.amqpsUrl,
        username: profile.username,
      }
    : empty;
  const [fields, setFields] = React.useState<ProfileFields>(initial);
  const [action, setAction] = React.useState<"keep" | "replace" | "remove">(
    profile ? "keep" : "replace",
  );
  const [mode, setMode] = React.useState<"memory" | "protected">("memory");
  const [password, setPassword] = React.useState("");
  const [discard, setDiscard] = React.useState(false);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const cancel = React.useRef<HTMLButtonElement>(null);
  const dirty =
    JSON.stringify(fields) !== JSON.stringify(initial) ||
    password.length > 0 ||
    (profile ? action !== "keep" : action !== "replace");
  function requestClose() {
    if (busy) return;
    setPassword("");
    if (dirty) setDiscard(true);
    else onClose();
  }
  React.useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement;
    element?.showModal();
    return () => {
      if (element?.open) element.close();
      if (focus instanceof HTMLElement && focus.isConnected) focus.focus();
    };
  }, []);
  React.useEffect(() => {
    if (discard) cancel.current?.focus();
  }, [discard]);
  function field(key: keyof ProfileFields, value: string) {
    setFields(previous => ({ ...previous, [key]: value }));
  }
  return (
    <dialog
      ref={dialog}
      className="profile-dialog"
      aria-labelledby="profile-form-title"
      onCancel={event => {
        event.preventDefault();
        requestClose();
      }}
    >
      <form
        onSubmit={event => {
          event.preventDefault();
          const secret =
            action === "replace" ? { action, mode, password } : { action };
          const input: SaveProfileInput = {
            ...fields,
            revision,
            ...(profile ? { id: profile.id } : {}),
            secret,
          };
          setPassword("");
          onSave(input);
        }}
      >
        <h2 id="profile-form-title">
          {profile ? "Editar perfil" : "Novo perfil"}
        </h2>
        <p className="profile-hint">
          Salvar este perfil não inicia conexão. HTTPS e AMQPS são endpoints
          independentes.
        </p>
        {error && (
          <div id="profile-form-error">
            <StatusMessage tone="danger" title={error} />
          </div>
        )}
        <fieldset
          disabled={busy || discard}
          className="profile-fields"
          aria-describedby={error ? "profile-form-error" : undefined}
        >
          <label>
            Nome do perfil
            <input
              name="name"
              autoFocus
              required
              maxLength={120}
              value={fields.name}
              onChange={e => field("name", e.target.value)}
            />
          </label>
          <div className="profile-field">
            <label htmlFor="profile-environment">Ambiente</label>
            <select
              id="profile-environment"
              name="environment"
              value={fields.environment}
              onChange={e => field("environment", e.target.value)}
            >
              {environments.map(value => (
                <option key={value} value={value}>
                  {environmentLabels[value]}
                </option>
              ))}
            </select>
          </div>
          {fields.environment === "production" && (
            <p className="production-label">
              ⚠ Produção — confira o ambiente antes de operar.
            </p>
          )}
          <label>
            Endpoint HTTPS
            <input
              name="httpsUrl"
              type="url"
              required
              maxLength={2048}
              pattern="https://.*"
              placeholder="https://broker.exemplo:15671"
              value={fields.httpsUrl}
              onChange={e => field("httpsUrl", e.target.value)}
              aria-describedby="profile-endpoint-hint"
            />
          </label>
          <label>
            Endpoint AMQPS
            <input
              name="amqpsUrl"
              type="url"
              required
              maxLength={2048}
              pattern="amqps://.*"
              placeholder="amqps://broker.exemplo:5671"
              value={fields.amqpsUrl}
              onChange={e => field("amqpsUrl", e.target.value)}
              aria-describedby="profile-endpoint-hint"
            />
          </label>
          <p id="profile-endpoint-hint" className="profile-hint">
            Sem usuário/senha nas URLs, query ou fragmento. CA customizada e
            teste TLS estarão disponíveis em outra etapa.
          </p>
          <label>
            Usuário
            <input
              name="username"
              autoComplete="off"
              required
              maxLength={256}
              value={fields.username}
              onChange={e => field("username", e.target.value)}
            />
          </label>
          <div className="profile-field">
            <label htmlFor="profile-secretAction">Senha</label>
            <select
              id="profile-secretAction"
              name="secretAction"
              value={action}
              onChange={e => {
                setAction(e.target.value as typeof action);
                setPassword("");
              }}
            >
              {profile && <option value="keep">Manter senha atual</option>}
              <option value="replace">
                {profile ? "Substituir senha" : "Informar senha"}
              </option>
              <option value="remove">
                {profile ? "Remover senha" : "Sem senha por enquanto"}
              </option>
            </select>
          </div>
          {profile && action === "keep" && (
            <p className="profile-hint">
              {profile.secret.saved
                ? "Senha protegida salva; seu conteúdo não é recuperado neste formulário."
                : profile.secret.availableThisRun
                  ? "Senha disponível apenas nesta execução."
                  : "Nenhuma senha disponível nesta execução."}
            </p>
          )}
          {action === "replace" && (
            <>
              <div className="profile-field">
                <label htmlFor="profile-secretMode">
                  Armazenamento da senha
                </label>
                <select
                  id="profile-secretMode"
                  name="secretMode"
                  value={mode}
                  onChange={e => setMode(e.target.value as typeof mode)}
                  aria-describedby="profile-protection-hint"
                >
                  <option value="memory">Somente nesta execução</option>
                  <option
                    value="protected"
                    disabled={protection.persistence !== "enabled"}
                  >
                    Protegida pelo sistema operacional
                  </option>
                </select>
              </div>
              <label>
                Nova senha
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={4096}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  aria-describedby="profile-password-hint"
                />
              </label>
              <p id="profile-password-hint" className="profile-hint">
                O campo é descartado ao enviar ou fechar. No modo em memória,
                digite novamente após encerrar o aplicativo.
              </p>
            </>
          )}
          <p id="profile-protection-hint" className="profile-hint">
            {protection.persistence === "enabled"
              ? "Proteção persistente verificada para este alvo."
              : "Salvar senha no dispositivo está indisponível: proteção do sistema ainda não comprovada. Use somente nesta execução."}
          </p>
        </fieldset>
        {discard ? (
          <div className="discard-confirmation" role="alert">
            <p>
              Descartar as alterações deste perfil? A senha digitada já foi
              descartada.
            </p>
            <div className="profile-actions">
              <Button ref={cancel} onClick={() => setDiscard(false)}>
                Continuar editando
              </Button>
              <Button onClick={onClose}>Descartar alterações</Button>
            </div>
          </div>
        ) : (
          <div className="profile-actions">
            <Button onClick={requestClose} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={busy}>
              Salvar perfil
            </Button>
          </div>
        )}
      </form>
    </dialog>
  );
}
