/**
 * Browser-side error logging. Use for failures you do not surface in the UI.
 */
export function logClientError(
  scope: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  if (typeof console === "undefined" || typeof console.error !== "function") {
    return;
  }
  if (extra && Object.keys(extra).length > 0) {
    console.error(`[client:${scope}]`, err, extra);
  } else {
    console.error(`[client:${scope}]`, err);
  }
}
