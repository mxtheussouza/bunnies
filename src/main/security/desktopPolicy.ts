import { viewActions, type DesktopRequest } from "../../shared/desktop";

export const APP_SCHEME = "bunnies";
export const APP_URL = "bunnies://app/app_window/index.html";
export const PRODUCTION_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
].join("; ");

export function isTrustedPage(candidate: string, expected: string): boolean {
  // Compare the whole canonical URL; no opaque origins, prefix or host-only trust.
  try {
    const actual = new URL(candidate);
    const trusted = new URL(expected);
    return (
      !actual.username &&
      !actual.password &&
      actual.href === trusted.href &&
      (trusted.protocol === "bunnies:" ||
        (trusted.protocol === "http:" && trusted.hostname === "localhost"))
    );
  } catch {
    return false;
  }
}

export function parseDesktopRequest(input: unknown): DesktopRequest | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const keys = Reflect.ownKeys(input);
  if (!Object.hasOwn(input, "command") || keys.length < 1 || keys.length > 2)
    return null;
  const record = input as Record<string, unknown>;
  if (typeof record.command !== "string" || record.command.length > 32)
    return null;
  if (
    [
      "info",
      "close",
      "quit",
      "minimize",
      "toggleMaximize",
      "showEditMenu",
    ].includes(record.command)
  ) {
    return keys.length === 1 ? (record as DesktopRequest) : null;
  }
  if (record.command === "view") {
    if (
      !keys.includes("action") ||
      typeof record.action !== "string" ||
      record.action.length > 32
    )
      return null;
    const allowed: readonly string[] = viewActions;
    return allowed.includes(record.action) ? (record as DesktopRequest) : null;
  }
  if (
    record.command === "openLink" &&
    keys.includes("id") &&
    record.id === "author"
  ) {
    return record as DesktopRequest;
  }
  return null;
}

export function resourcePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "bunnies:" ||
      parsed.host !== "app" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      /[%\\]/.test(parsed.pathname)
    )
      return null;
    if (
      /^\/app_window\/index\.(html|js|css)$/.test(parsed.pathname) ||
      /^\/assets\/[a-f0-9]+\.(png|jpe?g|gif|webp|svg|woff2?|ttf|eot)$/.test(
        parsed.pathname,
      )
    ) {
      return parsed.pathname.slice(1);
    }
  } catch {
    /* Invalid URL is denied. */
  }
  return null;
}

export function isAllowedDevConnection(
  candidate: string,
  entry: string,
): boolean {
  try {
    const actual = new URL(candidate);
    const trusted = new URL(entry);
    return (
      !actual.username &&
      !actual.password &&
      trusted.protocol === "http:" &&
      trusted.hostname === "localhost" &&
      actual.hostname === trusted.hostname &&
      actual.port === trusted.port &&
      ["http:", "ws:"].includes(actual.protocol)
    );
  } catch {
    return false;
  }
}
