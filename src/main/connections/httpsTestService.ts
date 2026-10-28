import {
  HTTPS_TEST_TIMEOUT_MS,
  type HttpsTestInput,
  type HttpsTestOutcome,
} from "../../shared/connections";
import { ProfileFailure } from "../profiles/errors";
import type { ProfileService } from "../profiles/service";
import { probeHttps } from "./httpsProbe";
export class HttpsTestService {
  private running = new Map<
    number,
    { id: string; controller: AbortController }
  >();
  private closed = false;
  private unsubscribe: () => void;
  constructor(
    private readonly profiles: ProfileService,
    private readonly probe = probeHttps,
  ) {
    this.unsubscribe = profiles.onChanged(() => {
      for (const owner of this.running.keys())
        this.cancelOwner(owner, "CONFLICT");
    });
  }
  async test(owner: number, input: HttpsTestInput): Promise<HttpsTestOutcome> {
    if (this.closed || this.running.has(owner))
      throw new ProfileFailure("UNAVAILABLE");
    const controller = new AbortController();
    this.running.set(owner, { id: input.operationId, controller });
    const started = performance.now();
    const timer = setTimeout(
      () => controller.abort(new ProfileFailure("TEST_TIMEOUT")),
      HTTPS_TEST_TIMEOUT_MS,
    );
    timer.unref();
    let abort!: () => void;
    const cancelled = new Promise<never>((_resolve, reject) => {
      abort = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", abort, { once: true });
    });
    const work = async () => {
      const profile = await this.profiles.connectionSnapshot(
        input.profileId,
        input.revision,
      );
      controller.signal.throwIfAborted();
      await this.probe(profile, controller.signal);
      controller.signal.throwIfAborted();
      await this.profiles.assertRevision(input.revision);
      controller.signal.throwIfAborted();
      return {
        ...input,
        outcome: "authenticated" as const,
        checkedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
      };
    };
    try {
      return await Promise.race([work(), cancelled]);
    } finally {
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", abort);
      if (this.running.get(owner)?.controller === controller)
        this.running.delete(owner);
    }
  }
  cancel(owner: number, operationId: string) {
    if (this.running.get(owner)?.id === operationId) this.cancelOwner(owner);
  }
  cancelOwner(
    owner: number,
    code: "TEST_CANCELLED" | "CONFLICT" = "TEST_CANCELLED",
  ) {
    this.running.get(owner)?.controller.abort(new ProfileFailure(code));
  }
  dispose() {
    this.closed = true;
    this.unsubscribe();
    for (const owner of this.running.keys()) this.cancelOwner(owner);
  }
}
