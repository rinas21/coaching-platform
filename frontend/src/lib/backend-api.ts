/**
 * Browser-side calls to the Express API. Auth is handled via httpOnly cookie session and CSRF
 * token header for state-changing requests.
 */
export function getBackendApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export type AuthGoogleResponse = {
  user: { id: string; email: string; displayName: string | null };
  csrfToken?: string;
};

export type AuthResponse = AuthGoogleResponse;
export type GoogleConfigResponse = { enabled: boolean; clientId?: string };
let csrfTokenCache: string | null = null;

/** Call after logout so the next state-changing request fetches a fresh CSRF token. */
export function invalidateCsrfTokenCache(): void {
  csrfTokenCache = null;
}

/** Thrown when the API returns a non-2xx response (use `status` for 401 vs real failures). */
export class ApiHttpError extends Error {
  readonly status: number;
  /** Correlates browser errors with API logs (e.g. checkout `checkoutTraceId`). */
  readonly traceId?: string;

  constructor(message: string, status: number, traceId?: string) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.traceId = traceId;
  }
}

/** Map API { error } + status to a single user-safe sentence (no stack traces or env hints). */
function userFacingAuthError(status: number, apiError?: string): string {
  const e = String(apiError || "").trim();

  if (status === 403) {
    if (/csrf/i.test(e) || !e) {
      return "Your session expired. Refresh the page and try again.";
    }
  }

  if (status === 401 && /Google token/i.test(e)) {
    return "Google sign-in could not be verified. Please try again.";
  }

  if (status === 401 && e === "Invalid email or password") {
    return "Invalid email or password.";
  }

  if (status === 409 && e.includes("already exists")) {
    return "An account with this email already exists. Sign in instead, or use Forgot password if you need to reset.";
  }

  if (status === 400 && e === "Password must be at least 8 characters") {
    return "Password must be at least 8 characters.";
  }

  if (status === 400 && (e === "email and password are required" || e === "email is required")) {
    return "Please enter your email (and password where required).";
  }

  if (status === 400 && e === "OTP expired") {
    return "That code has expired. Request a new code and try again.";
  }

  if (status === 429) {
    if (/new OTP|OTP/i.test(e)) {
      return "Too many attempts with this code. Request a new code or wait a few minutes.";
    }
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (status === 503 && /Google auth is not configured/i.test(e)) {
    return "Google sign-in is not available right now. Use email and password, or try again later.";
  }

  if (status === 400 && /idToken/i.test(e)) {
    return "Google sign-in did not complete. Please try again.";
  }

  if (status === 400 && (e === "Invalid OTP or email" || e.includes("Invalid OTP"))) {
    return "That code did not match. Check the code or request a new one.";
  }

  if (status === 400 && e.includes("newPassword")) {
    return "Enter the code from your email and a new password (at least 8 characters).";
  }

  if (status === 500 && e.includes("OTP email")) {
    return "We could not send the email right now. Please try again later or contact support.";
  }

  if (status >= 500) {
    return "Something went wrong on our end. Please try again shortly.";
  }

  if (e) {
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

async function ensureCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;
  const res = await fetch(`${getBackendApiUrl()}/auth/csrf`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`CSRF setup failed (${res.status})`);
  }
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  if (!data.csrfToken) {
    throw new Error("CSRF token missing from server response");
  }
  csrfTokenCache = data.csrfToken;
  return data.csrfToken;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  requireCsrf?: boolean;
  cache?: RequestCache;
};

async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const method = options.method || "GET";
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  if (options.requireCsrf || method !== "GET") {
    headers["x-csrf-token"] = await ensureCsrfToken();
  }

  return fetch(`${getBackendApiUrl()}${path}`, {
    method,
    headers,
    credentials: "include",
    cache: options.cache,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export type MeResponse = {
  user: { id: string; email: string; displayName: string | null };
  purchases: Array<{
    id: string;
    order_id?: string | null;
    stripe_session_id: string | null;
    stripe_payment_intent_id: string | null;
    amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
    order_code?: string | null;
    order_status?: string | null;
  }>;
  meetings: Array<{
    id: string;
    status: string;
    starts_at: string | null;
    created_at: string;
    service_name: string;
    service_description: string | null;
  }>;
};

export type AdminMeResponse = {
  admin: { id: string; email: string; displayName: string | null };
};

export async function authGoogle(idToken: string): Promise<AuthGoogleResponse> {
  const res = await apiFetch("/auth/google", {
    method: "POST",
    body: { idToken },
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  const data = (await res.json()) as AuthGoogleResponse;
  if (data.csrfToken) csrfTokenCache = data.csrfToken;
  return data;
}

export async function getGoogleClientConfig(): Promise<GoogleConfigResponse> {
  try {
    const res = await apiFetch("/auth/google/config");
    if (!res.ok) {
      return { enabled: false };
    }
    return res.json() as Promise<GoogleConfigResponse>;
  } catch {
    return { enabled: false };
  }
}

export async function authSignup(payload: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResponse> {
  const res = await apiFetch("/auth/signup", {
    method: "POST",
    body: payload,
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  const data = (await res.json()) as AuthResponse;
  if (data.csrfToken) csrfTokenCache = data.csrfToken;
  return data;
}

export async function authLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: payload,
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  const data = (await res.json()) as AuthResponse;
  if (data.csrfToken) csrfTokenCache = data.csrfToken;
  return data;
}

export type PasswordResetRequestResult = {
  ok: boolean;
  /** When true, an OTP was sent and the UI should advance to the code step. */
  accountFound: boolean;
  message: string;
};

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
  const res = await apiFetch("/auth/password-reset/request", {
    method: "POST",
    body: { email },
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  return res.json() as Promise<PasswordResetRequestResult>;
}

export async function verifyPasswordReset(payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ ok: boolean; message: string }> {
  const res = await apiFetch("/auth/password-reset/verify", {
    method: "POST",
    body: payload,
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  return res.json() as Promise<{ ok: boolean; message: string }>;
}

export async function getMe(): Promise<MeResponse> {
  const res = await apiFetch("/me");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiHttpError(
      (err as { error?: string }).error || `Load profile failed (${res.status})`,
      res.status,
    );
  }
  return res.json() as Promise<MeResponse>;
}

/** Same as GET /me but returns null when not logged in (401), API down, or network error. */
export async function getMeOptional(): Promise<MeResponse | null> {
  try {
    const res = await apiFetch("/me");
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return res.json() as Promise<MeResponse>;
  } catch {
    return null;
  }
}

export type PayHereCheckoutPayload = {
  action: string;
  fields: Record<string, string>;
  currency: string;
};

export type CheckoutShippingPayload = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
};

export type CheckoutSessionResponse = {
  url: string | null;
  sessionId: string;
  orderId?: string;
  orderCode?: string;
  status?: string;
  bankInstructions?: string;
  whatsappLink?: string;
  manualPayment?: boolean;
  message?: string;
  payhere?: PayHereCheckoutPayload;
  subtotalCents?: number;
  shippingCents?: number;
  totalCents?: number;
  checkoutTraceId?: string;
};

export type CheckoutVerifyStatus = "pending" | "success" | "failed";
export type CheckoutVerifyResponse = {
  status: CheckoutVerifyStatus;
  orderId?: string;
  orderCode?: string;
  totalAmountCents?: number;
  currency?: string;
  bankInstructions?: string;
  whatsappLink?: string | null;
  /** True when checkout was created for manual bank transfer (not PayHere card flow). */
  manualPayment?: boolean;
};

export type UploadOrderSlipResponse = {
  ok: boolean;
  orderId: string;
  orderCode: string;
  status: string;
  slipId?: string;
};

/** Shown after a successful slip upload (admins review in the admin portal; no email required). */
export function slipUploadConfirmationMessage(orderCode: string): string {
  return (
    `We received your slip for ${orderCode}. It is saved — our team will review your transfer in the admin dashboard. ` +
    `You can leave this page; your order will show as verifying payment.`
  );
}

export type CatalogItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  created_at: string;
  available_qty?: number | null;
  status?: "available" | "sold_out";
  cta_label?: string;
  cta_link?: string;
  cover_url?: string | null;
  gallery_urls?: string[];
};

export async function fetchStoreCatalog(): Promise<CatalogItem[]> {
  const res = await fetch(`${getBackendApiUrl()}/store/catalog`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load store (${res.status})`);
  }
  const data = (await res.json()) as { items: CatalogItem[] };
  return data.items;
}

export async function fetchStrapiItemSales(): Promise<CatalogItem[]> {
  const res = await fetch("/api/item-sales", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Could not load item-sales (${res.status})`);
  }

  const data = (await res.json()) as { items?: Array<CatalogItem> };
  return data.items || [];
}

export async function createCheckoutSession(
  body: {
    idempotencyKey: string;
    items?: Array<{
      itemId: string;
      quantity?: number;
    }>;
    successUrl: string;
    cancelUrl: string;
    shipping: CheckoutShippingPayload;
  }
): Promise<CheckoutSessionResponse> {
  const res = await apiFetch("/checkout/session", {
    method: "POST",
    body,
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      checkoutTraceId?: string;
    };
    throw new ApiHttpError(
      err.error || `Checkout failed (${res.status})`,
      res.status,
      err.checkoutTraceId,
    );
  }
  return res.json() as Promise<CheckoutSessionResponse>;
}

export async function submitWaitlist(payload: {
  email: string;
  source?: string;
  captchaToken?: string;
}): Promise<{ ok: boolean; message: string }> {
  const res = await apiFetch("/waitlist", {
    method: "POST",
    body: payload,
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Waitlist failed (${res.status})`);
  }
  return res.json() as Promise<{ ok: boolean; message: string }>;
}

export async function authLogout(): Promise<void> {
  const res = await apiFetch("/auth/logout", {
    method: "POST",
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(userFacingAuthError(res.status, err.error));
  }
  invalidateCsrfTokenCache();
}

export async function verifyCheckoutSession(sessionId: string): Promise<CheckoutVerifyResponse> {
  const safe = encodeURIComponent(sessionId);
  const res = await apiFetch(`/checkout/verify?session_id=${safe}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Checkout verify failed (${res.status})`);
  }
  const data = (await res.json().catch(() => ({}))) as CheckoutVerifyResponse;
  if (data.status !== "pending" && data.status !== "success" && data.status !== "failed") {
    throw new Error("Invalid checkout status response");
  }
  return data;
}

export async function getAdminMe(): Promise<AdminMeResponse> {
  const res = await apiFetch("/admin/me");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Admin auth failed (${res.status})`);
  }
  return res.json() as Promise<AdminMeResponse>;
}

export async function uploadOrderPaymentSlip(payload: {
  orderCode?: string;
  sessionId?: string;
  paymentReference?: string;
  notes?: string;
  slipFile: File;
}): Promise<UploadOrderSlipResponse> {
  const csrf = await ensureCsrfToken();
  const form = new FormData();
  if (payload.orderCode) form.set("orderCode", payload.orderCode);
  if (payload.sessionId) form.set("sessionId", payload.sessionId);
  if (payload.paymentReference) form.set("paymentReference", payload.paymentReference);
  if (payload.notes) form.set("notes", payload.notes);
  form.set("slip", payload.slipFile);

  const res = await fetch(`${getBackendApiUrl()}/orders/payment-slip`, {
    method: "POST",
    credentials: "include",
    headers: {
      "x-csrf-token": csrf,
    },
    body: form,
  });
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let message = `Slip upload failed (${res.status})`;
    if (ct.includes("application/json")) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      if (err.error) message = err.error;
    } else {
      const text = (await res.text().catch(() => "")).trim();
      if (text && text.length < 400) message = text;
    }
    throw new Error(message);
  }
  return res.json() as Promise<UploadOrderSlipResponse>;
}

/** Deletes the order and linked payment row; blocked when the order is PAID (admin completed). */
export async function deleteUserOrder(orderId: string): Promise<void> {
  const safe = encodeURIComponent(orderId);
  const res = await apiFetch(`/orders/${safe}`, {
    method: "DELETE",
    requireCsrf: true,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Could not remove order (${res.status})`);
  }
}
