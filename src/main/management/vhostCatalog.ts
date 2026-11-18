import { randomUUID } from "node:crypto";
import type { SelectSessionVhostInput } from "../../shared/session";
import { ProfileFailure } from "../profiles/errors";

const ttlMs = 5 * 60 * 1000;
type Context = {
  owner: number;
  sessionId: string;
  generation: number;
  revision: string;
};
type Entry = Context & {
  selectionId: string;
  names: Set<string>;
  expiresAt: number;
};

export class VhostCatalog {
  private current?: Entry;

  replace(context: Context, names: string[]) {
    const selectionId = randomUUID();
    this.current = {
      ...context,
      selectionId,
      names: new Set(names),
      expiresAt: performance.now() + ttlMs,
    };
    return selectionId;
  }

  validateCurrent(revisionOf: (context: Context) => string) {
    const current = this.freshEntry();
    if (!current) return;
    try {
      if (revisionOf(current) !== current.revision) this.clear();
    } catch {
      this.clear();
    }
  }

  authorize(owner: number, revision: string, input: SelectSessionVhostInput) {
    const current = this.freshEntry();
    if (
      !current ||
      current.owner !== owner ||
      current.revision !== revision ||
      current.sessionId !== input.sessionId ||
      current.generation !== input.generation ||
      current.selectionId !== input.selectionId ||
      !current.names.has(input.vhost)
    )
      throw new ProfileFailure("CONFLICT");
  }
  private freshEntry() {
    if (this.current && performance.now() >= this.current.expiresAt)
      this.clear();
    return this.current;
  }

  clear() {
    this.current = undefined;
  }
}
