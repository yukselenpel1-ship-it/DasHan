export class OriginError extends Error {
  constructor() { super("Bu istek kabul edilmedi."); }
}
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const url = new URL(request.url);
  // Next.js may normalize the internal URL host to localhost. The HTTP Host
  // remains the browser's destination; do not trust a supplied forwarded host.
  const host = request.headers.get("host") ?? url.host;
  return origin === `${url.protocol}//${host}`;
}
