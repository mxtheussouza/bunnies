import React from "react";
import {
  environmentLabels,
  MAX_PROFILES,
  profileErrorMessages,
  type ProfileSnapshot,
  type ProfileSummary,
  type SaveProfileInput,
  type SecretProtectionStatus,
} from "../../shared/profiles";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import StatusMessage from "../components/StatusMessage";
import ProfileTests from "./ProfileTests";
import { parseAmqpsEndpoint } from "../../shared/amqpsEndpoint";
import ProfileForm from "./ProfileForm";
import "./profiles.scss";
import { useSession } from "../shell/SessionProvider";
import SessionControls from "./SessionControls";
import ManagementInfo from "./ManagementInfo";

const noProtection: SecretProtectionStatus = {
  persistence: "disabled",
  reason: "unverified",
};
export default function Connections() {
  const { state: session } = useSession();
  const [testing, setTesting] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<ProfileSnapshot | null>(null);
  const [protection, setProtection] = React.useState(noProtection);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<ProfileSummary | "new" | null>(
    null,
  );
  const [formError, setFormError] = React.useState("");
  const mounted = React.useRef(false);
  const selectedHeading = React.useRef<HTMLHeadingElement>(null);
  const listHeading = React.useRef<HTMLHeadingElement>(null);
  async function load() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await window.bunnies.listProfiles();
      if (!mounted.current) return;
      if (result.ok) {
        setSnapshot(result.value);
        setSelected(id =>
          result.value.profiles.some(p => p.id === id) ? id : null,
        );
      } else {
        setSnapshot(null);
        setError(profileErrorMessages[result.error.code]);
      }
    } catch {
      if (mounted.current) {
        setSnapshot(null);
        setError(profileErrorMessages.UNAVAILABLE);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }
  React.useEffect(() => {
    mounted.current = true;
    void load();
    void window.bunnies
      .getSecretProtectionStatus()
      .then(result => {
        if (mounted.current && result.ok) setProtection(result.value);
      })
      .catch(() => undefined);
    return () => {
      mounted.current = false;
    };
  }, []);
  async function save(input: SaveProfileInput) {
    if (busy) return;
    setBusy(true);
    setFormError("");
    setNotice("");
    try {
      const result = await window.bunnies.saveProfile(input);
      if (!mounted.current) return;
      if (result.ok) {
        setSnapshot(result.value);
        setEditor(null);
        setNotice("Perfil salvo neste dispositivo. Nenhuma conexão iniciada.");
      } else setFormError(profileErrorMessages[result.error.code]);
    } catch {
      if (mounted.current) setFormError(profileErrorMessages.UNAVAILABLE);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function remove(profile: ProfileSummary) {
    if (!snapshot || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await window.bunnies.removeProfile({
        id: profile.id,
        revision: snapshot.revision,
      });
      if (!mounted.current) return;
      if (result.ok) {
        setSnapshot(result.value);
        setSelected(null);
        setNotice(
          "Perfil local removido. Nenhum recurso do broker foi alterado.",
        );
        listHeading.current?.focus();
      } else if (result.error.code === "CANCELLED")
        setNotice(profileErrorMessages.CANCELLED);
      else setError(profileErrorMessages[result.error.code]);
    } catch {
      if (mounted.current) setError(profileErrorMessages.UNAVAILABLE);
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  const profile = snapshot?.profiles.find(item => item.id === selected);
  React.useEffect(() => {
    if (selected) selectedHeading.current?.focus();
  }, [selected]);
  return (
    <>
      <Card className="connections-card">
        <div className="profile-toolbar">
          <h2 ref={listHeading} tabIndex={-1}>
            Perfis neste dispositivo
          </h2>
          <div className="profile-actions">
            <Button
              onClick={() => {
                void load();
              }}
              disabled={busy || loading}
            >
              Recarregar lista
            </Button>
            <Button
              variant="primary"
              disabled={
                !snapshot ||
                busy ||
                loading ||
                snapshot.profiles.length >= MAX_PROFILES
              }
              onClick={() => {
                setFormError("");
                setEditor("new");
              }}
            >
              Novo perfil
            </Button>
          </div>
        </div>
        {loading && <p role="status">Carregando perfis locais…</p>}
        {error && <StatusMessage tone="danger" title={error} />}
        {notice && <StatusMessage title={notice} />}
        {snapshot &&
          !loading &&
          (snapshot.profiles.length === 0 ? (
            <EmptyState title="Nenhuma conexão configurada">
              <p>Cadastre um perfil local para organizar seus ambientes.</p>
              <p>Salvar não testa nem ativa uma conexão.</p>
            </EmptyState>
          ) : (
            <ul className="profile-list" aria-label="Perfis locais">
              {snapshot.profiles.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="profile-select"
                    aria-pressed={selected === item.id}
                    disabled={busy}
                    onClick={() => setSelected(item.id)}
                  >
                    <strong>{item.name}</strong>
                    <span
                      className={
                        item.environment === "production"
                          ? "production-label"
                          : "profile-hint"
                      }
                    >
                      {item.environment === "production" ? "⚠ " : ""}
                      {environmentLabels[item.environment]}
                    </span>
                    <span className="profile-hint">
                      {selected === item.id ? "Selecionado · " : ""}
                      {session.desired && session.profile?.id === item.id
                        ? "Sessão ativa"
                        : "Sem sessão ativa"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        {profile && (
          <section
            className="profile-detail"
            aria-labelledby="selected-profile-title"
          >
            <h2 id="selected-profile-title" ref={selectedHeading} tabIndex={-1}>
              {profile.name}
            </h2>
            <p
              className={
                profile.environment === "production"
                  ? "production-label"
                  : "profile-hint"
              }
            >
              {profile.environment === "production" ? "⚠ " : ""}
              {environmentLabels[profile.environment]} ·{" "}
              {session.desired && session.profile?.id === profile.id
                ? "Perfil da sessão ativa"
                : "Perfil selecionado, sem sessão ativa"}
            </p>
            <dl>
              <dt>HTTPS</dt>
              <dd>{profile.httpsUrl}</dd>
              <dt>AMQPS</dt>
              <dd>{profile.amqpsUrl}</dd>
              <dt>Vhost AMQPS interpretado</dt>
              <dd>
                {parseAmqpsEndpoint(profile.amqpsUrl)?.vhost ??
                  "Endpoint fora do recorte AMQPS; revise em Editar perfil."}
              </dd>
              <dt>Usuário</dt>
              <dd>{profile.username}</dd>
              <dt>Confiança TLS</dt>
              <dd>
                {profile.trust.mode === "default" ? (
                  "CAs padrão do aplicativo"
                ) : (
                  <>
                    <span>
                      CA personalizada · {profile.trust.fingerprints.length}{" "}
                      certificado(s)
                    </span>
                    <ul className="ca-fingerprints">
                      {profile.trust.fingerprints.map((fingerprint, index) => (
                        <li key={index}>SHA-256: {fingerprint}</li>
                      ))}
                    </ul>
                  </>
                )}
              </dd>
              <dt>Senha</dt>
              <dd>
                {profile.secret.saved
                  ? "Protegida salva; conteúdo não exibido"
                  : profile.secret.availableThisRun
                    ? "Disponível somente nesta execução"
                    : "Não disponível nesta execução"}
              </dd>
            </dl>
            <div className="profile-actions">
              <Button
                disabled={busy || loading}
                onClick={() => {
                  setFormError("");
                  setEditor(profile);
                }}
              >
                Editar perfil
              </Button>
              <Button
                disabled={busy || loading}
                onClick={() => {
                  void remove(profile);
                }}
              >
                Remover perfil
              </Button>
            </div>
            <SessionControls
              profileId={profile.id}
              revision={snapshot!.revision}
              disabled={
                busy || loading || testing || !profile.secret.availableThisRun
              }
            />
            {(session.desired || session.stopping) && (
              <p className="profile-hint">
                Salvar alterações encerra a sessão atual. Testes separados ficam
                disponíveis após desconectar.
              </p>
            )}
            {session.desired && session.profile?.id === profile.id && (
              <ManagementInfo
                key={session.sessionId + ":" + session.generation}
              />
            )}
            <ProfileTests
              key={profile.id + snapshot?.revision}
              profileId={profile.id}
              revision={snapshot!.revision}
              hasPassword={profile.secret.availableThisRun}
              blocked={session.desired || session.stopping}
              onRunningChange={setTesting}
            />
            <p className="profile-hint">
              Os testes criam conexões transitórias e podem gerar logs/métricas
              no broker. Não comprovam permissão para publicar ou acessar filas.
              O teste não ativa sessão; use Conectar para mantê-la.
            </p>
          </section>
        )}
      </Card>
      {!session.desired && !session.stopping && (
        <StatusMessage title="Sem sessão ativa">
          Selecionar ou salvar perfis não envia dados ao broker. Testar HTTPS ou
          AMQPS é uma ação explícita; a conexão do teste é encerrada ao
          terminar.
        </StatusMessage>
      )}
      {editor && snapshot && (
        <ProfileForm
          profile={editor === "new" ? undefined : editor}
          revision={snapshot.revision}
          protection={protection}
          busy={busy}
          error={formError}
          onSave={input => {
            void save(input);
          }}
          onClose={() => {
            setEditor(null);
            setFormError("");
          }}
        />
      )}
    </>
  );
}
