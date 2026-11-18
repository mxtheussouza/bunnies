export type AmqpsEndpoint = { hostname: string; port: number; vhost: string };

const hasControl = (value: string) =>
  [...value].some(
    character =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
  );

// Parse the raw path separately: WHATWG dot-segment normalization must not
// silently change the virtual host, and amqplib will decode its vhost option.
export function parseAmqpsEndpoint(value: string): AmqpsEndpoint | null {
  if (value.length > 2048 || /[\\\s]/u.test(value) || hasControl(value))
    return null;
  const match = /^amqps:\/\/([^/?#]+)(?:\/([^/?#]*))?$/u.exec(value);
  if (!match) return null;
  const authority = /^(\[[^\]]+\]|[^:@[\]]+)(?::([0-9]+))?$/u.exec(match[1]);
  if (!authority) return null;
  try {
    const url = new URL("https://" + match[1]);
    if (!url.hostname || url.username || url.password) return null;
    const port = authority[2] === undefined ? 5671 : Number(authority[2]);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
    const vhost = match[2] === undefined ? "/" : decodeURIComponent(match[2]);
    encodeURIComponent(vhost); // Reject unpaired UTF-16 surrogates instead of replacing them.
    if (
      !vhost ||
      hasControl(vhost) ||
      new TextEncoder().encode(vhost).length > 255
    )
      return null;
    return { hostname: url.hostname.replace(/^\[|\]$/g, ""), port, vhost };
  } catch {
    return null;
  }
}
