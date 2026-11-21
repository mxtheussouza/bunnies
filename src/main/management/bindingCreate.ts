import type { HttpsProbeInput } from "../connections/httpsProbe";
import { exchangeTypes } from "../../shared/exchanges";
import { MANAGEMENT_TIMEOUT_MS } from "../../shared/management";
import { MAX_QUEUE_DECLARATION_BODY } from "../../shared/queues";
import { assertExchangeRoute } from "./exchangeRead";
import { readManagement } from "./httpsRead";
import {
  bindingPairPath,
  bindingVerification,
  compareBinding,
  type BindingTarget,
} from "./bindingIdentity";
import {
  decodeManagementJson,
  isManagementJson,
  managementDepthOk,
  ManagementFailure,
  requestManagement,
} from "./httpsTransport";
import type { DeclarationPhase } from "./sendDeclaration";

export function bindingBody(target: BindingTarget) {
  assertExchangeRoute({
    kind: "exchangeDetail",
    vhost: target.vhost,
    name: target.source,
  });
  const body = Buffer.from(
    JSON.stringify({
      routing_key: target.routingKey,
      arguments: target.arguments,
    }),
  );
  if (body.length > MAX_QUEUE_DECLARATION_BODY)
    throw new ManagementFailure("LIMIT");
  return body;
}

export async function createBinding(
  profile: HttpsProbeInput,
  target: BindingTarget,
  body: Buffer,
  signal: AbortSignal,
  assertContext: () => Promise<void>,
  onPhase: (phase: DeclarationPhase) => void,
  remaining: () => number,
) {
  function boundedTime(max: number) {
    const ms = remaining();
    if (ms <= 0) throw new ManagementFailure("TIMEOUT");
    return Math.min(ms, max);
  }
  async function readExchange(name: string) {
    const data = await readManagement(
      profile,
      { kind: "exchangeDetail", vhost: target.vhost, name },
      signal,
      boundedTime(MANAGEMENT_TIMEOUT_MS),
    );
    if (
      data.kind !== "exchangeDetail" ||
      data.exchange.internal ||
      !exchangeTypes.some(type => type === data.exchange.type)
    )
      throw new ManagementFailure("BINDING_TARGET");
    return data.exchange;
  }
  await assertContext();
  const source = await readExchange(target.source);
  if (source.type === "headers") {
    const match = target.arguments["x-match"];
    const keys = Object.keys(target.arguments).filter(key => key !== "x-match");
    if (
      (match !== "all" && match !== "any") ||
      !keys.length ||
      keys.some(key => key.toLowerCase().startsWith("x-"))
    )
      throw new ManagementFailure("BINDING_ARGUMENTS");
  }
  await assertContext();
  if (target.destinationType === "exchange")
    await readExchange(target.destination);
  else {
    const data = await readManagement(
      profile,
      { kind: "queueDetail", vhost: target.vhost, name: target.destination },
      signal,
      boundedTime(MANAGEMENT_TIMEOUT_MS),
    );
    if (
      data.kind !== "queueDetail" ||
      (data.queue.type !== "classic" && data.queue.type !== "quorum")
    )
      throw new ManagementFailure("BINDING_TARGET");
  }
  await assertContext();
  const result = await requestManagement(
    profile,
    {
      method: "POST",
      route: bindingPairPath(target),
      body,
      timeout: boundedTime(Infinity),
      authorizeSend: assertContext,
      onSend: () => onPhase("sent"),
      checkResponse(status, headers) {
        if (status === 201 || (status === 401 && isManagementJson(headers)))
          return;
        throw new ManagementFailure(
          status >= 500
            ? "SERVER"
            : status >= 300 && status < 400
              ? "REDIRECT"
              : "RESPONSE",
        );
      },
    },
    signal,
  );
  if (result.status === 401) {
    const rejection = decodeManagementJson(result.bytes);
    if (
      managementDepthOk(rejection) &&
      rejection &&
      typeof rejection === "object" &&
      "error" in rejection &&
      rejection.error === "not_authorised" &&
      "reason" in rejection &&
      ["Access refused.", "Not management user", "Not authorized"].some(
        reason => reason === rejection.reason,
      )
    )
      throw new ManagementFailure("DENIED");
    throw new ManagementFailure("RESPONSE");
  }
  if (result.bytes.length) throw new ManagementFailure("RESPONSE");
  onPhase("accepted");
  await assertContext();
  const prefix = new URL(profile.httpsUrl).pathname.replace(/\/+$/, "");
  const verification = bindingVerification(prefix, target, result.location);
  if (!verification) throw new ManagementFailure("RESPONSE");
  const response = await requestManagement(
    profile,
    {
      method: "GET",
      route: verification.path,
      timeout: boundedTime(MANAGEMENT_TIMEOUT_MS),
      checkResponse(status, headers) {
        if (status !== 200 || !isManagementJson(headers))
          throw new ManagementFailure("RESPONSE");
      },
    },
    signal,
  );
  const data = decodeManagementJson(response.bytes);
  if (!managementDepthOk(data)) throw new ManagementFailure("RESPONSE");
  return {
    status: compareBinding(data, target, verification),
    identity: verification.id,
  } as const;
}
