/** Base URL for Strapi (server: STRAPI_URL; browser: NEXT_PUBLIC_STRAPI_URL). */
export function getStrapiBaseUrl(): string {
  // Server-side: prefer STRAPI_URL (e.g. Docker service name). Client/build: NEXT_PUBLIC_STRAPI_URL.
  if (typeof window === 'undefined' && process.env.STRAPI_URL) {
    return process.env.STRAPI_URL.replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '');
}

function isUnreachableStrapiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || '';
  if (!msg.includes('fetch failed') && error.name !== 'TypeError') return false;
  const cause = error.cause;
  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = (cause as { code?: string }).code;
    return code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET';
  }
  return true;
}

export type StrapiFetchFailure = {
  ok: false;
  kind: "http" | "network" | "invalid_json";
  message: string;
  status?: number;
};

export type StrapiFetchSuccess<T> = {
  ok: true;
  data: T;
};

export type StrapiFetchResult<T> = StrapiFetchSuccess<T> | StrapiFetchFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapStrapiEntity<T>(entry: unknown): T | null {
  if (!isRecord(entry)) return null;
  if (!isRecord(entry.attributes)) {
    return entry as T;
  }
  const merged: Record<string, unknown> = {
    ...entry.attributes,
  };
  if ("id" in entry && !("id" in merged)) {
    merged.id = entry.id;
  }
  if ("documentId" in entry && !("documentId" in merged)) {
    merged.documentId = entry.documentId;
  }
  return merged as T;
}

export function getStrapiCollection<T>(payload: unknown): T[] {
  const source = isRecord(payload) && "data" in payload ? payload.data : payload;
  if (!Array.isArray(source)) return [];
  return source
    .map((entry) => unwrapStrapiEntity<T>(entry))
    .filter((entry): entry is T => entry !== null);
}

export function getStrapiSingle<T>(payload: unknown): T | null {
  const source = isRecord(payload) && "data" in payload ? payload.data : payload;
  if (Array.isArray(source)) {
    const first = source[0];
    return first ? unwrapStrapiEntity<T>(first) : null;
  }
  return unwrapStrapiEntity<T>(source);
}

export async function fetchStrapi<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<StrapiFetchResult<T>> {
  const baseUrl = getStrapiBaseUrl();
  const token =
    process.env.STRAPI_API_TOKEN ||
    process.env.NEXT_STRAPI_API_TOKEN ||
    process.env.STRAPI_TOKEN;
  const timeoutSignal = AbortSignal.timeout(6000);
  const mergedSignal = (() => {
    if (!options.signal) return timeoutSignal;
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal.addEventListener('abort', abort, { once: true });
    timeoutSignal.addEventListener('abort', abort, { once: true });
    return controller.signal;
  })();
  const requestWithToken = async (includeToken: boolean) =>
    fetch(`${baseUrl}/api${path}`, {
      ...options,
      signal: mergedSignal,
      headers: {
        'Content-Type': 'application/json',
        ...(includeToken && token && {
          Authorization: `Bearer ${token}`,
        }),
        ...options.headers,
      },
    });

  try {
    let res = await requestWithToken(Boolean(token));

    // If configured token is stale/invalid, retry public read requests without it.
    if (res.status === 401 && token) {
      res = await requestWithToken(false);
    }

    if (!res.ok) {
      let bodyText: string | undefined;
      try {
        bodyText = await res.text();
      } catch {
        // ignore
      }
      const message = `Failed to fetch ${path}: ${res.status} ${res.statusText}${bodyText ? ` - ${bodyText}` : ""}`;
      // 404/410: no collection, type not deployed, or route not registered yet — normal before CMS is populated.
      // Do not log as errors: CI/build and empty prod look like failures when they are expected.
      const quietHttp = res.status === 404 || res.status === 410;
      if (quietHttp) {
        if (process.env.STRAPI_DEBUG_FETCH === "true") {
          console.info(`[Strapi] ${res.status} ${path} (no content or route yet)`);
        }
      } else if (process.env.NODE_ENV !== "production") {
        console.warn(`[Strapi]`, message);
      } else {
        console.warn(`[Strapi] ${res.status} ${path}`);
      }
      return {
        ok: false,
        kind: "http",
        status: res.status,
        message,
      };
    }

    try {
      const json = (await res.json()) as T;
      return { ok: true, data: json };
    } catch (error) {
      const message = `Invalid JSON response for ${path}`;
      console.warn(message, error);
      return {
        ok: false,
        kind: "invalid_json",
        status: res.status,
        message,
      };
    }
  } catch (error) {
    if (isUnreachableStrapiError(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Strapi] Cannot reach ${baseUrl} (${path}). Start Strapi or set STRAPI_URL / NEXT_PUBLIC_STRAPI_URL.`,
        );
      }
      return {
        ok: false,
        kind: "network",
        message: `Cannot reach Strapi at ${baseUrl}`,
      };
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Fetch error ${path}:`, error);
      } else {
        console.warn(`[Strapi] Fetch error ${path}`);
      }
      const message = error instanceof Error ? error.message : "Unknown Strapi fetch error";
      return {
        ok: false,
        kind: "network",
        message,
      };
    }
  }
}

export function getStrapiMedia(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  const shouldProxyAbsoluteUrl = (parsed: URL): boolean => {
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
    if (host === "backend" || host === "safespace_strapi") return true;
    if (host.endsWith(".local")) return true;
    return false;
  };

  // If it's a full URL, check if it points to a local Strapi instance that should be proxied
  if (url.startsWith("http") || url.startsWith("//")) {
    try {
      const parsed = new URL(url.startsWith("//") ? `http:${url}` : url);
      if (shouldProxyAbsoluteUrl(parsed)) {
        return `/api/image-proxy?url=${encodeURIComponent(parsed.pathname + parsed.search)}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  // Relative path - always proxy
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export function getStrapiMediaUrl(media: unknown): string | undefined {
  if (!media) return undefined;

  if (typeof media === "string") {
    return getStrapiMedia(media) || media;
  }

  if (Array.isArray(media)) {
    return getStrapiMediaUrl(media[0]);
  }

  if (!isRecord(media)) return undefined;

  if (typeof (media as { url?: unknown }).url === "string") {
    const url = (media as { url: string }).url;
    return getStrapiMedia(url) || url;
  }

  // Strapi often returns media as { attributes: { url: "..." } }
  const maybeAttributes = (media as { attributes?: unknown }).attributes;
  if (maybeAttributes && isRecord(maybeAttributes)) {
    const url = (maybeAttributes as { url?: unknown }).url;
    if (typeof url === "string") {
      return getStrapiMedia(url) || url;
    }
  }

  if ("data" in media) {
    return getStrapiMediaUrl(media.data);
  }

  return undefined;
}
