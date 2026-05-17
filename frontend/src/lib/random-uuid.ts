/**
 * RFC 4122 UUID v4 for client idempotency keys.
 * `crypto.randomUUID()` is unavailable in non-secure contexts (e.g. HTTP) in Chromium,
 * which breaks checkout on sites not yet on HTTPS.
 */
export function randomUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
