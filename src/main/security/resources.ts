import { readFile, realpath } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { PRODUCTION_CSP, resourcePath } from "./desktopPolicy";

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

export function createResourceHandler(root: string) {
  return async (request: Request): Promise<Response> => {
    const headers = {
      "Content-Security-Policy": PRODUCTION_CSP,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    };
    const path = resourcePath(request.url);
    if (!path || !["GET", "HEAD"].includes(request.method)) {
      return new Response(null, { status: 404, headers });
    }
    try {
      const base = await realpath(root);
      const file = await realpath(resolve(base, path));
      const within = relative(base, file);
      if (
        !within ||
        within === ".." ||
        within.startsWith("../") ||
        within.startsWith("..\\") ||
        isAbsolute(within)
      ) {
        return new Response(null, { status: 404, headers });
      }
      const body =
        request.method === "HEAD" ? null : new Uint8Array(await readFile(file));
      return new Response(body, {
        headers: { ...headers, "Content-Type": contentTypes[extname(file)] },
      });
    } catch {
      // Never return filesystem paths, stacks or the underlying error to the renderer.
      return new Response(null, { status: 404, headers });
    }
  };
}
