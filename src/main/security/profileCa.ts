import { X509Certificate, randomUUID } from "node:crypto";
import { isUtf8 } from "node:buffer";
import {
  MAX_CA_BYTES,
  MAX_CA_CERTIFICATES,
  CA_SELECTION_TTL_MS,
  type CaSelection,
  type TrustSummary,
} from "../../shared/connections";
import { ProfileFailure } from "../profiles/errors";
import { exactObject } from "../profiles/validation";
import { FileLimitFailure, readBoundedFile } from "./boundedFile";
export type StoredTrust = { mode: "default" } | { mode: "custom"; pem: string };
export function parseCaPem(value: string): {
  pem: string;
  fingerprints: string[];
} {
  if (value.length > MAX_CA_BYTES || Buffer.byteLength(value) > MAX_CA_BYTES)
    throw new ProfileFailure("CA_LIMIT");
  const blocks = [
    ...value.matchAll(
      /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g,
    ),
  ];
  if (!blocks.length) throw new ProfileFailure("CA_INVALID");
  if (blocks.length > MAX_CA_CERTIFICATES) throw new ProfileFailure("CA_LIMIT");
  if (
    value
      .replace(
        /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
        "",
      )
      .trim()
  )
    throw new ProfileFailure("CA_INVALID");
  try {
    const certificates = blocks.map(block => {
      if (!/^[A-Za-z0-9+/=\r\n]+$/.test(block[1])) throw new Error();
      const base64 = block[1].replace(/[\r\n]/g, "");
      const bytes = Buffer.from(base64, "base64");
      if (bytes.toString("base64") !== base64) throw new Error();
      const certificate = new X509Certificate(bytes);
      if (!certificate.ca || !certificate.raw.equals(bytes)) throw new Error();
      return certificate;
    });
    return {
      pem: certificates.map(cert => cert.toString().trim()).join("\n") + "\n",
      fingerprints: certificates.map(cert => cert.fingerprint256),
    };
  } catch {
    throw new ProfileFailure("CA_INVALID");
  }
}
export function validStoredTrust(value: unknown): value is StoredTrust {
  if (exactObject(value, ["mode"]) && value.mode === "default") return true;
  if (
    !exactObject(value, ["mode", "pem"]) ||
    value.mode !== "custom" ||
    typeof value.pem !== "string"
  )
    return false;
  try {
    parseCaPem(value.pem);
    return true;
  } catch {
    return false;
  }
}
export function summarizeTrust(trust: StoredTrust): TrustSummary {
  return trust.mode === "default"
    ? { mode: "default" }
    : { mode: "custom", fingerprints: parseCaPem(trust.pem).fingerprints };
}
export class ProfileCaSelections {
  private pending = new Map<
    number,
    {
      id: string;
      pem: string;
      expires: number;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private selecting = new Map<number, symbol>();
  private closed = false;
  constructor(private readonly now: () => number = Date.now) {}
  async select(
    owner: number,
    choose: () => Promise<string | null>,
    trusted: () => boolean,
  ): Promise<CaSelection | null> {
    if (this.closed || this.selecting.has(owner))
      throw new ProfileFailure("UNAVAILABLE");
    const ticket = Symbol();
    this.selecting.set(owner, ticket);
    try {
      const path = await choose();
      if (!trusted()) throw new ProfileFailure("FORBIDDEN");
      if (this.selecting.get(owner) !== ticket || this.closed)
        throw new ProfileFailure("CA_SELECTION");
      if (path === null) return null;
      let bytes: Buffer;
      try {
        bytes = await readBoundedFile(path, MAX_CA_BYTES);
      } catch (error) {
        throw new ProfileFailure(
          error instanceof FileLimitFailure && error.reason === "size"
            ? "CA_LIMIT"
            : "CA_INVALID",
        );
      }
      if (!isUtf8(bytes)) throw new ProfileFailure("CA_INVALID");
      const parsed = parseCaPem(bytes.toString("utf8"));
      if (!trusted()) throw new ProfileFailure("FORBIDDEN");
      if (this.selecting.get(owner) !== ticket || this.closed)
        throw new ProfileFailure("CA_SELECTION");
      this.discard(owner);
      const id = randomUUID();
      const timer = setTimeout(
        () => this.discard(owner, id),
        CA_SELECTION_TTL_MS,
      );
      timer.unref();
      this.pending.set(owner, {
        id,
        pem: parsed.pem,
        expires: this.now() + CA_SELECTION_TTL_MS,
        timer,
      });
      return { selectionId: id, fingerprints: parsed.fingerprints };
    } finally {
      if (this.selecting.get(owner) === ticket) this.selecting.delete(owner);
    }
  }
  get(owner: number, id: string): StoredTrust {
    const value = this.pending.get(owner);
    if (!value || value.id !== id || value.expires <= this.now()) {
      if (value?.expires !== undefined && value.expires <= this.now())
        this.discard(owner);
      throw new ProfileFailure("CA_SELECTION");
    }
    return { mode: "custom", pem: value.pem };
  }
  discard(owner: number, id?: string) {
    const value = this.pending.get(owner);
    if (value && (id === undefined || value.id === id)) {
      clearTimeout(value.timer);
      this.pending.delete(owner);
    }
  }
  disposeOwner(owner: number) {
    this.discard(owner);
    this.selecting.delete(owner);
  }
  dispose() {
    this.closed = true;
    for (const owner of this.pending.keys()) this.discard(owner);
    this.selecting.clear();
  }
}
