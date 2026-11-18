import {
  HTTPS_TEST_TIMEOUT_MS,
  AMQPS_TEST_TIMEOUT_MS,
  type AmqpsTestOutcome,
  type HttpsTestInput,
  type HttpsTestOutcome,
} from "../../shared/connections";
import { ProfileFailure } from "../profiles/errors";
import type { ProfileService } from "../profiles/service";
import { probeHttps } from "./httpsProbe";
import { probeAmqps } from "./amqpsProbe";
import { ConnectionActivity } from "./activity";
export class ConnectionTestService {
  private running = new Map<
    number,
    { id: string; transport: "https" | "amqps"; controller: AbortController }
  >();
  private closed = false;
  private unsubscribe: () => void;
  constructor(
    private readonly profiles: ProfileService,
    private readonly probe = probeHttps,
    private readonly amqpProbe = probeAmqps,
    private readonly activity = new ConnectionActivity(),
  ) {
    this.unsubscribe = profiles.onChanged(() => {
      for (const owner of this.running.keys())
        this.cancelOwner(owner, "CONFLICT");
    });
  }
  async test(owner: number, input: HttpsTestInput): Promise<HttpsTestOutcome> {
    return this.run(owner, input, "https");
  }
  async testAmqps(
    owner: number,
    input: HttpsTestInput,
  ): Promise<AmqpsTestOutcome> {
    const value = await this.run(owner, input, "amqps");
    if (!("vhost" in value) || typeof value.vhost !== "string")
      throw new ProfileFailure("INTERNAL");
    return { ...value, vhost: value.vhost };
  }
  private async run(
    owner: number,
    input: HttpsTestInput,
    transport: "https" | "amqps",
  ): Promise<HttpsTestOutcome | AmqpsTestOutcome> {
    if (this.closed || this.running.has(owner))
      throw new ProfileFailure("UNAVAILABLE");
    const release = this.activity.probe(owner);
    const controller = new AbortController();
    this.running.set(owner, { id: input.operationId, transport, controller });
    const started = performance.now();
    const timer = setTimeout(
      () =>
        controller.abort(
          new ProfileFailure(
            transport === "https" ? "TEST_TIMEOUT" : "AMQP_TIMEOUT",
          ),
        ),
      transport === "https" ? HTTPS_TEST_TIMEOUT_MS : AMQPS_TEST_TIMEOUT_MS,
    );
    timer.unref();
    let abort!: () => void;
    const cancelled = new Promise<never>((_resolve, reject) => {
      abort = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", abort, { once: true });
    });
    const work = async () => {
      const profile = await this.profiles
        .connectionSnapshot(input.profileId, input.revision)
        .catch(error => {
          if (
            transport === "amqps" &&
            error instanceof ProfileFailure &&
            error.code === "CREDENTIALS"
          )
            throw new ProfileFailure("AMQP_CREDENTIALS");
          throw error;
        });
      controller.signal.throwIfAborted();
      const vhost =
        transport === "amqps"
          ? await this.amqpProbe(profile, controller.signal)
          : (await this.probe(profile, controller.signal), undefined);
      controller.signal.throwIfAborted();
      await this.profiles.assertRevision(input.revision);
      controller.signal.throwIfAborted();
      return {
        ...input,
        ...(vhost === undefined ? {} : { vhost }),
        outcome: "authenticated" as const,
        checkedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
      };
    };
    try {
      return await Promise.race([work(), cancelled]);
    } finally {
      release();
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", abort);
      if (this.running.get(owner)?.controller === controller)
        this.running.delete(owner);
    }
  }
  cancel(
    owner: number,
    operationId: string,
    transport: "https" | "amqps" = "https",
  ) {
    const active = this.running.get(owner);
    if (active?.id === operationId && active.transport === transport)
      this.cancelOwner(owner);
  }
  cancelOwner(owner: number, code?: "CONFLICT") {
    const active = this.running.get(owner);
    active?.controller.abort(
      new ProfileFailure(
        code ??
          (active.transport === "https" ? "TEST_CANCELLED" : "AMQP_CANCELLED"),
      ),
    );
  }
  dispose() {
    this.closed = true;
    this.unsubscribe();
    for (const owner of this.running.keys()) this.cancelOwner(owner);
  }
}
