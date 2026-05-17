import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";
import crypto from "crypto";
import nodemailer from "nodemailer";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";

const {
  PORT = 8000,
  DATABASE_URL,
  GOOGLE_CLIENT_ID,
  JWT_SECRET,
  FRONTEND_URL = "http://localhost:3000",
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_PASSWORD,
  SMTP_FROM = "no-reply@thesafespaceglobal.local",
  OTP_EXP_MINUTES = "10",
  PAYHERE_MERCHANT_ID,
  PAYHERE_MERCHANT_SECRET,
  PAYHERE_SANDBOX = "true",
  PAYHERE_CURRENCY = "LKR",
  PAYHERE_COUNTRY = "LK",
  API_PUBLIC_URL = `http://localhost:${process.env.PORT || 8000}`,
  PAYHERE_NOTIFY_URL,
  AUTH_COOKIE_NAME = "safespace_auth",
  CSRF_COOKIE_NAME = "safespace_csrf",
  AUTH_COOKIE_SECURE = "false",
  AUTH_COOKIE_SAMESITE = "lax",
  AUTH_COOKIE_DOMAIN,
  AUTH_COOKIE_MAX_AGE_SEC = String(7 * 24 * 60 * 60),
  TURNSTILE_SECRET_KEY = "",
  TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  STRAPI_URL,
  NEXT_PUBLIC_STRAPI_URL,
  STRAPI_API_TOKEN,
  NEXT_STRAPI_API_TOKEN,
  STRAPI_TOKEN,
  // When not "true", checkout never returns PayHere fields (bank reference + slip only).
  CHECKOUT_PAYHERE_ENABLED = "",
  ORDER_RESERVATION_MINUTES = "30",
  /** Flat delivery / handling fee added at checkout (cents). Server-authoritative; set NEXT_PUBLIC_ mirror for UI. */
  CHECKOUT_SHIPPING_CENTS = "0",
  ADMIN_ORDER_SECRET = "",
  ORDER_NOTIFY_ADMIN_EMAIL,
  CONTACT_NOTIFY_EMAIL,
  // Full block (used when structured BANK_* vars below are all unset).
  BANK_PAYMENT_INSTRUCTIONS = "Please transfer to: Account Name: The Safe Space Global, Bank: Example Bank, Account No: 0000000000, then share your slip via WhatsApp or email.",
  // Optional structured bank details — if any of these is non-empty, they are assembled for checkout/emails instead of BANK_PAYMENT_INSTRUCTIONS.
  BANK_ACCOUNT_NAME = "",
  BANK_INSTITUTION = "",
  BANK_ACCOUNT_NUMBER = "",
  BANK_BRANCH = "",
  BANK_SWIFT_OR_IBAN = "",
  BANK_PAYMENT_NOTE = "",
  ORDER_WHATSAPP_NUMBER = "",
  WHATSAPP_NOTIFY_WEBHOOK_URL = "",
  INTERNSHIP_NOTIFY_EMAIL,
  SMTP_APP_PASSWORD,
} = process.env;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

function md5Upper(str) {
  return crypto
    .createHash("md5")
    .update(String(str), "utf8")
    .digest("hex")
    .toUpperCase();
}

/** PayHere hosted checkout hash (see https://www.payhere.lk/developers) */
function payhereCheckoutHash(
  merchantId,
  orderId,
  amountStr,
  currency,
  merchantSecret,
) {
  const hashedSecret = md5Upper(merchantSecret);
  return md5Upper(merchantId + orderId + amountStr + currency + hashedSecret);
}

/** PayHere notify (IPN) md5sig */
function payhereNotifySig(
  merchantId,
  orderId,
  payhereAmount,
  statusCode,
  merchantSecret,
) {
  const hashedSecret = md5Upper(merchantSecret);
  return md5Upper(
    merchantId + orderId + payhereAmount + String(statusCode) + hashedSecret,
  );
}

const payhereSandbox = String(PAYHERE_SANDBOX).toLowerCase() === "true";
const payhereCheckoutAction = payhereSandbox
  ? "https://sandbox.payhere.lk/pay/checkout"
  : "https://www.payhere.lk/pay/checkout";

function notifyUrlResolved() {
  if (PAYHERE_NOTIFY_URL) return PAYHERE_NOTIFY_URL.trim();
  const base = API_PUBLIC_URL.replace(/\/$/, "");
  return `${base}/webhooks/payhere`;
}
const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;
const smtpPassword = String(
  SMTP_APP_PASSWORD || SMTP_PASSWORD || SMTP_PASS || "",
).trim();
const smtpFrom = String(SMTP_FROM || SMTP_USER || "").trim();
const smtpEnvProvided = Boolean(
  SMTP_HOST || SMTP_PORT || SMTP_USER || smtpPassword,
);
if (
  smtpEnvProvided &&
  !(SMTP_HOST && SMTP_PORT && SMTP_USER && smtpPassword)
) {
  console.error(
    "SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_APP_PASSWORD (or SMTP_PASS) must all be set together",
  );
  process.exit(1);
}
const smtpConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && smtpPassword);
if (smtpConfigured && !smtpFrom) {
  console.error("SMTP_FROM (or SMTP_USER) must be set when SMTP is configured");
  process.exit(1);
}
const strapiBaseUrl = String(STRAPI_URL || NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337").replace(/\/$/, "");
const strapiReadToken = STRAPI_API_TOKEN || NEXT_STRAPI_API_TOKEN || STRAPI_TOKEN || "";
const orderReservationMinutes = Math.max(1, Number(ORDER_RESERVATION_MINUTES) || 30);
const checkoutShippingCents = Math.max(
  0,
  Math.min(50_000_000, Number.parseInt(String(CHECKOUT_SHIPPING_CENTS), 10) || 0),
);
const adminOrderEmail = String(ORDER_NOTIFY_ADMIN_EMAIL || smtpFrom || "").trim();
const contactNotifyEmail = String(
  CONTACT_NOTIFY_EMAIL || ORDER_NOTIFY_ADMIN_EMAIL || smtpFrom || "",
).trim();
const orderWhatsappNumber = String(ORDER_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");
const mailer = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: smtpPassword },
    })
  : null;
if (mailer) {
  mailer.verify().catch((error) => {
    console.error("SMTP connection check failed:", error);
  });
}

// CV upload: accept only PDFs, keep file in memory, attach to admin email.
// We do NOT store the CV content in the database (only metadata).

async function syncOrderToStrapi(order) {
  if (!strapiBaseUrl || !strapiReadToken) return null;
  try {
    const res = await fetch(`${strapiBaseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${strapiReadToken}`,
      },
      body: JSON.stringify({
        data: {
          order_code: order.orderCode,
          status: order.status || "PENDING_PAYMENT",
          total_amount_cents: order.totalAmountCents,
          currency: order.currency || "LKR",
          customer_email: order.customerEmail,
          items_snapshot: order.items,
          shipping_details: order.shipping,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Strapi sync failed:", err);
      return null;
    }
    const data = await res.json();
    return data.data.id;
  } catch (err) {
    console.error("Strapi sync error:", err);
    return null;
  }
}

async function syncOrderSlipToStrapi(orderCode, file, reference, notes) {
  if (!strapiBaseUrl || !strapiReadToken) return null;
  try {
    // 1. Find the order in Strapi
    const orderRes = await fetch(`${strapiBaseUrl}/api/orders?filters[order_code][$eq]=${orderCode}`, {
      headers: { Authorization: `Bearer ${strapiReadToken}` }
    });
    const orderData = await orderRes.json();
    if (!orderData.data || orderData.data.length === 0) {
      console.warn(`Order ${orderCode} not found in Strapi for slip sync`);
      return null;
    }
    const strapiOrderId = orderData.data[0].id;

    // 2. Upload the file to Strapi media
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("files", blob, file.originalname);
    formData.append("ref", "api::order.order");
    formData.append("refId", String(strapiOrderId));
    formData.append("field", "payment_slip");

    const uploadRes = await fetch(`${strapiBaseUrl}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${strapiReadToken}` },
      body: formData
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      console.error("Strapi slip upload failed:", err);
    }

    // 3. Update order status and notes in Strapi
    await fetch(`${strapiBaseUrl}/api/orders/${strapiOrderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${strapiReadToken}`
      },
      body: JSON.stringify({
        data: {
          status: "PENDING_REVIEW",
          payment_reference: reference || null,
          admin_notes: notes || null
        }
      })
    });

    return true;
  } catch (err) {
    console.error("Strapi slip sync error:", err);
    return null;
  }
}
const internshipCvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.INTERNSHIP_CV_MAX_BYTES || 10 * 1024 * 1024), // default 10MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const nameOk = String(file.originalname || "").toLowerCase().endsWith(".pdf");
    const typeOk = String(file.mimetype || "").toLowerCase() === "application/pdf";
    if (nameOk || typeOk) return cb(null, true);
    return cb(new Error("Only PDF CV files are allowed"));
  },
});

const orderSlipUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.ORDER_SLIP_MAX_BYTES || 8 * 1024 * 1024),
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    if (mime === "application/pdf" || mime.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Slip must be a PDF or an image file"));
  },
});

function orderSlipUploadMiddleware(req, res, next) {
  orderSlipUpload.single("slip")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: "File is too large. Try a smaller image or PDF." });
      }
      return res.status(400).json({ error: err.message || "Upload rejected" });
    }
    return res.status(400).json({
      error: String(err?.message || "Invalid payment slip file"),
    });
  });
}

const internshipAdminEmail = String(
  INTERNSHIP_NOTIFY_EMAIL || CONTACT_NOTIFY_EMAIL || SMTP_FROM || "",
).trim();

const app = express();

const authCookieSecure = String(AUTH_COOKIE_SECURE).toLowerCase() === "true";
const authCookieMaxAgeMs = Number(AUTH_COOKIE_MAX_AGE_SEC) * 1000;

/**
 * In-memory abuse protection.
 * NOTE: For multi-instance deployments, replace with a shared store (e.g. Redis).
 */
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000);
const AUTH_IP_MAX = Number(process.env.AUTH_IP_MAX || 30);
const AUTH_USER_MAX = Number(process.env.AUTH_USER_MAX || 8);
const OTP_REQUEST_IP_MAX = Number(process.env.OTP_REQUEST_IP_MAX || 20);
const OTP_REQUEST_USER_MAX = Number(process.env.OTP_REQUEST_USER_MAX || 5);
const OTP_VERIFY_IP_MAX = Number(process.env.OTP_VERIFY_IP_MAX || 25);
const OTP_VERIFY_USER_MAX = Number(process.env.OTP_VERIFY_USER_MAX || 8);
const WAITLIST_IP_MAX = Number(process.env.WAITLIST_IP_MAX || 25);
const WAITLIST_USER_MAX = Number(process.env.WAITLIST_USER_MAX || 5);
const LOGIN_LOCKOUT_ATTEMPTS = Number(process.env.LOGIN_LOCKOUT_ATTEMPTS || 6);
const OTP_LOCKOUT_ATTEMPTS = Number(process.env.OTP_LOCKOUT_ATTEMPTS || 6);
const LOCKOUT_MS = Number(process.env.LOCKOUT_MS || 15 * 60 * 1000);

const ipBuckets = new Map();
const userBuckets = new Map();
const loginFailuresByIp = new Map();
const loginFailuresByUser = new Map();
const otpVerifyFailuresByIp = new Map();
const otpVerifyFailuresByUser = new Map();
const lockouts = new Map();
const SWEEP_INTERVAL_MS = Number(process.env.RATE_SWEEP_INTERVAL_MS || 60 * 1000);

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function bucketKey(scope, key) {
  return `${scope}:${key}`;
}

function sweepExpiredBucketStore(store, now) {
  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) store.delete(key);
  }
}

function sweepExpiredLockouts(now) {
  for (const [key, value] of lockouts.entries()) {
    if (!value?.until || value.until <= now) lockouts.delete(key);
  }
}

function startRateStoreSweeper() {
  const stores = [
    ipBuckets,
    userBuckets,
    loginFailuresByIp,
    loginFailuresByUser,
    otpVerifyFailuresByIp,
    otpVerifyFailuresByUser,
  ];
  const timer = setInterval(() => {
    const now = Date.now();
    for (const store of stores) {
      sweepExpiredBucketStore(store, now);
    }
    sweepExpiredLockouts(now);
  }, SWEEP_INTERVAL_MS);
  if (typeof timer.unref === "function") timer.unref();
}

function consumeBucket(store, key, windowMs, max, now = Date.now()) {
  const existing = store.get(key);
  if (!existing || existing.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  existing.count += 1;
  if (existing.count > max) {
    return { allowed: false, retryAfterMs: existing.expiresAt - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

function consumeIpLimit(req, res, scope, max, windowMs = RATE_WINDOW_MS) {
  const now = Date.now();
  const key = bucketKey(scope, getClientIp(req));
  const result = consumeBucket(ipBuckets, key, windowMs, max, now);
  if (!result.allowed) {
    const retrySeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
    res.set("Retry-After", String(retrySeconds));
    res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
    return false;
  }
  return true;
}

function consumeUserLimit(res, scope, userKey, max, windowMs = RATE_WINDOW_MS) {
  if (!userKey) return true;
  const now = Date.now();
  const key = bucketKey(scope, userKey);
  const result = consumeBucket(userBuckets, key, windowMs, max, now);
  if (!result.allowed) {
    const retrySeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
    res.set("Retry-After", String(retrySeconds));
    res
      .status(429)
      .json({ error: "Too many attempts. Please try again later." });
    return false;
  }
  return true;
}

function getActiveLock(key) {
  if (!key) return null;
  const lock = lockouts.get(key);
  if (!lock) return null;
  if (lock.until <= Date.now()) {
    lockouts.delete(key);
    return null;
  }
  return lock;
}

function assertNotLocked(res, lockKey) {
  const lock = getActiveLock(lockKey);
  if (!lock) return true;
  const retrySeconds = Math.max(1, Math.ceil((lock.until - Date.now()) / 1000));
  res.set("Retry-After", String(retrySeconds));
  res.status(429).json({ error: "Too many failed attempts. Try again later." });
  return false;
}

function registerFailure(store, key, threshold, lockMs, lockKey) {
  if (!key) return;
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    return;
  }
  existing.count += 1;
  if (existing.count >= threshold && lockKey) {
    lockouts.set(lockKey, { until: now + lockMs });
  }
}

function clearFailures(store, key) {
  if (!key) return;
  store.delete(key);
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const out = {};
  for (const part of String(raw).split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(val);
  }
  return out;
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined)
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  return parts.join("; ");
}

function setCookie(res, name, value, options = {}) {
  res.append("Set-Cookie", serializeCookie(name, value, options));
}

function clearCookie(res, name, options = {}) {
  setCookie(res, name, "", { ...options, maxAge: 0 });
}

function getCsrfToken(req) {
  const cookies = parseCookies(req);
  return cookies[CSRF_COOKIE_NAME] || null;
}

function issueCsrfCookie(res) {
  const token = crypto.randomBytes(24).toString("hex");
  setCookie(res, CSRF_COOKIE_NAME, token, {
    path: "/",
    sameSite: String(AUTH_COOKIE_SAMESITE || "Lax"),
    secure: authCookieSecure,
    httpOnly: false,
    maxAge: authCookieMaxAgeMs,
    domain: AUTH_COOKIE_DOMAIN || undefined,
  });
  return token;
}

function setAuthCookie(res, token) {
  setCookie(res, AUTH_COOKIE_NAME, token, {
    path: "/",
    sameSite: String(AUTH_COOKIE_SAMESITE || "Lax"),
    secure: authCookieSecure,
    httpOnly: true,
    maxAge: authCookieMaxAgeMs,
    domain: AUTH_COOKIE_DOMAIN || undefined,
  });
}

function clearAuthCookies(res) {
  const opts = {
    path: "/",
    sameSite: String(AUTH_COOKIE_SAMESITE || "Lax"),
    secure: authCookieSecure,
    domain: AUTH_COOKIE_DOMAIN || undefined,
  };
  clearCookie(res, AUTH_COOKIE_NAME, { ...opts, httpOnly: true });
  clearCookie(res, CSRF_COOKIE_NAME, { ...opts, httpOnly: false });
}

function requireCsrf(req, res, next) {
  const csrfCookie = getCsrfToken(req);
  const csrfHeader = req.headers["x-csrf-token"];
  if (!csrfCookie || !csrfHeader || csrfCookie !== String(csrfHeader)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  return next();
}

const corsAllowedOrigins = FRONTEND_URL.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Allow any localhost / 127.0.0.1 port in non-production so Next dev on e.g. :3001 works without editing .env */
function isDevLocalhostOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (corsAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (
        process.env.NODE_ENV !== "production" &&
        isDevLocalhostOrigin(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.post(
  "/webhooks/payhere",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
      return res.status(503).send("PayHere not configured");
    }
    const b = req.body || {};
    const merchantId = String(b.merchant_id ?? "");
    const orderId = String(b.order_id ?? "");
    const payhereAmount = String(b.payhere_amount ?? "");
    const statusCode = String(b.status_code ?? "");
    const md5sig = String(b.md5sig ?? "");
    const paymentId = b.payment_id != null ? String(b.payment_id) : null;

    if (merchantId !== PAYHERE_MERCHANT_ID) {
      return res.status(400).send("Invalid merchant");
    }
    const expected = payhereNotifySig(
      merchantId,
      orderId,
      payhereAmount,
      statusCode,
      PAYHERE_MERCHANT_SECRET,
    );
    if (expected !== md5sig) {
      console.error("PayHere notify: bad md5sig");
      return res.status(400).send("Bad signature");
    }

    try {
      if (statusCode === "2") {
        const amountFloat = parseFloat(payhereAmount);
        const amountCents = Number.isFinite(amountFloat)
          ? Math.round(amountFloat * 100)
          : 0;
        await pool.query(
          `UPDATE payments
         SET status = $1,
             stripe_payment_intent_id = COALESCE($2::text, stripe_payment_intent_id),
             amount_cents = CASE WHEN $3 > 0 THEN $3 ELSE amount_cents END,
             metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb,
             updated_at = now()
         WHERE stripe_session_id = $5`,
          [
            "succeeded",
            paymentId,
            amountCents,
            JSON.stringify({ payhere_notify: true }),
            orderId,
          ],
        );
        await pool.query(
          `UPDATE orders
           SET status = 'PAID',
               updated_at = now()
           WHERE payment_session_id = $1`,
          [orderId],
        );
      }
    } catch (e) {
      console.error("PayHere webhook error:", e);
      return res.status(500).send("Processing failed");
    }
    res.status(200).send("OK");
  },
);

app.use(express.json());

async function ensureSchema() {
  await pool
    .query(
      `
    ALTER TABLE users
      ALTER COLUMN google_sub DROP NOT NULL
  `,
    )
    .catch(() => {});
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'google'`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified boolean NOT NULL DEFAULT false`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`,
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash text NOT NULL,
      expires_at timestamptz NOT NULL,
      used_at timestamptz,
      attempts integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user_id ON password_reset_otps(user_id)`,
  );
  await pool
    .query(
      `
    CREATE TABLE IF NOT EXISTS waitlist_signups (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      source text NOT NULL DEFAULT 'store_waitlist',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `,
    )
    .catch((err) => {
      if (err?.code !== "23505") throw err;
    });
  await pool.query(`
    CREATE SEQUENCE IF NOT EXISTS orders_order_code_seq START 1001
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payment_session_id text UNIQUE NOT NULL,
      order_code text UNIQUE,
      idempotency_key text,
      status text NOT NULL DEFAULT 'PENDING_PAYMENT',
      total_amount_cents integer NOT NULL CHECK (total_amount_cents >= 0),
      currency text NOT NULL DEFAULT 'lkr',
      items_snapshot jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text`,
  );
  await pool.query(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code text`,
  );
  await pool.query(
    `ALTER TABLE orders ALTER COLUMN order_code
     SET DEFAULT ('ORD-' || lpad(nextval('orders_order_code_seq')::text, 6, '0'))`,
  );
  await pool.query(
    `UPDATE orders
     SET order_code = ('ORD-' || lpad(nextval('orders_order_code_seq')::text, 6, '0'))
     WHERE order_code IS NULL`,
  );
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  );
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency
     ON orders(user_id, idempotency_key)
     WHERE idempotency_key IS NOT NULL`,
  );
  for (const col of [
    "ship_full_name text",
    "ship_phone text",
    "ship_line1 text",
    "ship_line2 text",
    "ship_city text",
    "ship_region text",
    "ship_postal text",
    "ship_country text",
  ]) {
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col}`);
  }
  await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id uuid`);
  await pool
    .query(
      `ALTER TABLE payments
       ADD CONSTRAINT payments_order_id_fkey
       FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL`,
    )
    .catch(() => {});
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)`,
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_payment_slips (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payment_session_id text NOT NULL,
      payment_reference text,
      notes text,
      filename text NOT NULL,
      mime_type text NOT NULL,
      size_bytes bigint NOT NULL,
      file_data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_order_payment_slips_order_id ON order_payment_slips(order_id, created_at DESC)`,
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      subject text NOT NULL,
      message text NOT NULL,
      source text NOT NULL DEFAULT 'website_contact_form',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email)`,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS internship_applications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name text NOT NULL,
      email text NOT NULL,
      phone text,
      level text NOT NULL,
      message text NOT NULL,
      cv_filename text,
      cv_mime_type text,
      cv_size_bytes bigint,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_internship_applications_created_at ON internship_applications(created_at DESC)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_internship_applications_email ON internship_applications(email)`,
  );
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, expectedHash] = storedHash.split(":");
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(actual, "hex"),
    Buffer.from(expectedHash, "hex"),
  );
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function issueAuthToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function userPayload(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
  };
}

async function sendOtpEmail(email, code) {
  const subject = "Your The Safe Space password reset code";
  const text = `Use this OTP to reset your password: ${code}. It expires in ${OTP_EXP_MINUTES} minutes.`;
  if (!mailer) {
    throw new Error("SMTP is not configured");
  }
  await mailer.sendMail({
    from: smtpFrom,
    to: email,
    subject,
    text,
  });
}

async function sendSmtpMail(message) {
  if (!mailer) {
    throw new Error("SMTP is not configured");
  }
  try {
    await mailer.sendMail(message);
  } catch (error) {
    // Basic retry for transient SMTP/network issues.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await mailer.sendMail(message);
  }
}

async function settleEmailJobs(jobs, context) {
  const results = await Promise.allSettled(jobs);
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) =>
      result.status === "rejected"
        ? result.reason instanceof Error
          ? result.reason.message
          : String(result.reason)
        : null,
    )
    .filter(Boolean);
  if (failures.length > 0) {
    console.error(`${context} email error:`, failures);
  }
  return { results, failures };
}

async function sendWaitlistCustomerEmail(email) {
  const subject = "You are on The Safe Space waitlist";
  const text =
    `Thank you for joining The Safe Space waitlist.\n\n` +
    `We have saved your email and will let you know as soon as new offerings launch.\n\n` +
    `If you did not request this, you can ignore this email.\n\n` +
    `The Safe Space Global`;
  await sendSmtpMail({
    from: smtpFrom,
    to: email,
    subject,
    text,
  });
}

async function sendWaitlistTeamEmail(email, source) {
  const notifyEmail = contactNotifyEmail || smtpFrom || "hello@thesafespaceglobal.com";
  const subject = "New waitlist signup";
  const text =
    `A new waitlist signup was received.\n\n` +
    `Email: ${email}\n` +
    `Source: ${source}\n`;
  await sendSmtpMail({
    from: smtpFrom,
    to: notifyEmail,
    subject,
    text,
  });
}

async function sendCommunityVoiceConfirmationEmail(submission) {
  if (!submission.email) {
    return;
  }

  const subject = "We received your Community Voices submission";
  const text =
    `Hi ${submission.name},\n\n` +
    `Thank you for sharing your story with The Safe Space Global. We have received your submission and our team will review it.\n\n` +
    `If we need anything else, we will reach out to ${submission.email}.\n\n` +
    `The Safe Space Global`;

  await sendSmtpMail({
    from: smtpFrom,
    to: submission.email,
    replyTo: contactNotifyEmail,
    subject,
    text,
  });
}

function bankInstructionsText() {
  const accountName = String(BANK_ACCOUNT_NAME || "").trim();
  const institution = String(BANK_INSTITUTION || "").trim();
  const accountNumber = String(BANK_ACCOUNT_NUMBER || "").trim();
  const branch = String(BANK_BRANCH || "").trim();
  const swiftOrIban = String(BANK_SWIFT_OR_IBAN || "").trim();
  const note = String(BANK_PAYMENT_NOTE || "").trim();

  const useStructured =
    accountName ||
    institution ||
    accountNumber ||
    branch ||
    swiftOrIban ||
    note;

  if (useStructured) {
    const lines = [
      "Please transfer using the following bank details:",
      "",
    ];
    if (accountName) lines.push(`Account name: ${accountName}`);
    if (institution) lines.push(`Bank: ${institution}`);
    if (branch) lines.push(`Branch: ${branch}`);
    if (accountNumber) lines.push(`Account number: ${accountNumber}`);
    if (swiftOrIban) lines.push(`SWIFT / IBAN: ${swiftOrIban}`);
    if (note) {
      lines.push("");
      lines.push(note);
    }
    return lines.join("\n").trim();
  }

  return String(BANK_PAYMENT_INSTRUCTIONS || "").trim();
}

function buildWhatsappLink(message) {
  if (!orderWhatsappNumber) return null;
  return `https://wa.me/${orderWhatsappNumber}?text=${encodeURIComponent(message)}`;
}

async function notifyWhatsappChannel(payload) {
  if (!WHATSAPP_NOTIFY_WEBHOOK_URL) return;
  try {
    await fetch(WHATSAPP_NOTIFY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
  } catch (error) {
    console.error("WhatsApp webhook notify error:", error);
  }
}

async function sendOrderCreatedNotifications(order) {
  const result = {
    customerEmailSent: false,
    adminEmailSent: false,
    customerEmailError: null,
    adminEmailError: null,
  };
  const customerSubject = `Order received: ${order.orderCode}`;
  const customerText =
    `We received your order.\n\n` +
    `Order ID: ${order.orderCode}\n` +
    `Amount: ${order.currency.toUpperCase()} ${(order.totalAmountCents / 100).toFixed(2)}\n` +
    `Status: Waiting for payment\n\n` +
    (order.shippingBlock ? `${order.shippingBlock}\n` : "") +
    `${bankInstructionsText()}\n\n` +
    `After payment, please share your slip by replying to this email or via WhatsApp:\n` +
    `${order.whatsappLink || "WhatsApp number not configured"}\n`;

  if (order.customerEmail) {
    try {
      await sendSmtpMail({
        from: smtpFrom,
        to: order.customerEmail,
        subject: customerSubject,
        text: customerText,
      });
      result.customerEmailSent = true;
    } catch (err) {
      result.customerEmailError = err instanceof Error ? err.message : String(err);
      console.error("Customer order email failed:", err);
    }
  }

  const adminSubject = `New manual-payment order: ${order.orderCode}`;
  const adminText =
    `A new order was created.\n\n` +
    `Order ID: ${order.orderCode}\n` +
    `Customer: ${order.customerEmail}\n` +
    `Amount: ${order.currency.toUpperCase()} ${(order.totalAmountCents / 100).toFixed(2)}\n` +
    `Items:\n${order.itemsSummary}\n` +
    (order.shippingBlock ? `\n${order.shippingBlock}` : "");
  if (adminOrderEmail) {
    try {
      await sendSmtpMail({
        from: smtpFrom,
        to: adminOrderEmail,
        subject: adminSubject,
        text: adminText,
      });
      result.adminEmailSent = true;
    } catch (err) {
      result.adminEmailError = err instanceof Error ? err.message : String(err);
      console.error("Admin order email failed:", err);
    }
  }

  await notifyWhatsappChannel({
    type: "new_order",
    orderCode: order.orderCode,
    customerEmail: order.customerEmail,
    amountCents: order.totalAmountCents,
    currency: order.currency,
    items: order.items,
  });

  return result;
}

async function sendOrderPaidNotifications(order) {
  const result = {
    customerEmailSent: false,
    adminEmailSent: false,
    customerEmailError: null,
    adminEmailError: null,
  };
  const amountText = `${String(order.currency || "lkr").toUpperCase()} ${(
    Number(order.totalAmountCents || 0) / 100
  ).toFixed(2)}`;
  const customerSubject = `Payment confirmed: ${order.orderCode}`;
  const customerText =
    `Your payment has been confirmed.\n\n` +
    `Order ID: ${order.orderCode}\n` +
    `Amount: ${amountText}\n` +
    `Status: Paid\n\n` +
    `Thank you for your purchase.\n` +
    `The Safe Space Global`;

  if (order.customerEmail) {
    try {
      await sendSmtpMail({
        from: smtpFrom,
        to: order.customerEmail,
        subject: customerSubject,
        text: customerText,
      });
      result.customerEmailSent = true;
    } catch (err) {
      result.customerEmailError = err instanceof Error ? err.message : String(err);
      console.error("Customer paid email failed:", err);
    }
  }

  if (adminOrderEmail) {
    const adminSubject = `Order paid: ${order.orderCode}`;
    const adminText =
      `An order has been marked as PAID.\n\n` +
      `Order ID: ${order.orderCode}\n` +
      `Customer: ${order.customerEmail || "N/A"}\n` +
      `Amount: ${amountText}\n` +
      `Payment reference: ${order.paymentReference || "N/A"}\n` +
      `Notes: ${order.notes || "N/A"}\n`;
    try {
      await sendSmtpMail({
        from: smtpFrom,
        to: adminOrderEmail,
        subject: adminSubject,
        text: adminText,
      });
      result.adminEmailSent = true;
    } catch (err) {
      result.adminEmailError = err instanceof Error ? err.message : String(err);
      console.error("Admin paid email failed:", err);
    }
  }
  return result;
}

async function sendContactNotificationEmail(contact) {
  if (!contactNotifyEmail) {
    throw new Error("Contact notification email is not configured");
  }
  const subject = `New contact enquiry: ${contact.subject}`;
  const text =
    `A new contact enquiry was received.\n\n` +
    `Name: ${contact.name}\n` +
    `Email: ${contact.email}\n` +
    `Phone: ${contact.phone || "N/A"}\n` +
    `Subject: ${contact.subject}\n` +
    `Message:\n${contact.message}\n`;
  await sendSmtpMail({
    from: smtpFrom,
    to: contactNotifyEmail,
    replyTo: contact.email,
    subject,
    text,
  });
}

async function sendContactConfirmationEmail(contact) {
  if (!contact.email) {
    return;
  }

  const subject = "We received your message - The Safe Space Global";
  const text =
    `Hi ${contact.name},\n\n` +
    `Thank you for reaching out to The Safe Space Global. We received your message and our team will reply as soon as possible.\n\n` +
    `Subject: ${contact.subject}\n` +
    `Message:\n${contact.message}\n\n` +
    `If your enquiry is urgent, please contact us directly through the website or reply to this email.\n\n` +
    `The Safe Space Global`;

  await sendSmtpMail({
    from: smtpFrom,
    to: contact.email,
    replyTo: contactNotifyEmail,
    subject,
    text,
  });
}

async function sendCommunityVoiceNotificationEmail(submission) {
  if (!contactNotifyEmail) {
    throw new Error("Contact notification email is not configured");
  }
  const subject = "New Community Voices submission";
  const text =
    `A new Community Voices story was submitted.\n\n` +
    `Name/Credit: ${submission.name}\n` +
    `Email: ${submission.email}\n\n` +
    `Story:\n${submission.story}\n`;
  await sendSmtpMail({
    from: smtpFrom,
    to: contactNotifyEmail,
    replyTo: submission.email,
    subject,
    text,
  });
}

async function sendInternshipAdminEmail(application, cvFile) {
  if (!internshipAdminEmail) {
    throw new Error("Internship notify email is not configured");
  }

  const subject = "New internship application";
  const text =
    `A new internship application was received.\n\n` +
    `Full name: ${application.fullName}\n` +
    `Email: ${application.email}\n` +
    `Phone: ${application.phone || "N/A"}\n` +
    `Level: ${application.level}\n\n` +
    `Message:\n${application.message}\n`;

  await sendSmtpMail({
    from: smtpFrom,
    to: internshipAdminEmail,
    subject,
    text,
    replyTo: application.email,
    attachments: cvFile
      ? [
          {
            filename: cvFile.originalname || "cv.pdf",
            content: cvFile.buffer,
            contentType: cvFile.mimetype || "application/pdf",
          },
        ]
      : undefined,
  });
}

async function sendInternshipApplicantEmail(application) {
  if (!application.email) return;
  const subject = "Application received - The Safe Space Internship";
  const text =
    `Hi ${application.fullName},\n\n` +
    `Thank you for applying to the Safe Space Internship Programme.\n\n` +
    `We have received your application (Level: ${application.level}). ` +
    `Our team will review it and get back to you shortly.\n\n` +
    `If you have any additional information you’d like to share, you can reply to this email.\n\n` +
    `The Safe Space Global`;

  await sendSmtpMail({
    from: smtpFrom,
    to: application.email,
    subject,
    text,
  });
}

async function expirePendingOrders() {
  await pool.query(
    `UPDATE orders
     SET status = 'EXPIRED', updated_at = now()
     WHERE status = 'PENDING_PAYMENT'
       AND created_at < now() - ($1::text || ' minutes')::interval`,
    [String(orderReservationMinutes)],
  );
}

/** Structured checkout logs for operations (never log shipping PII). */
function checkoutLog(level, event, fields) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function checkoutJsonFail(res, traceId, status, errorCode, message) {
  res.setHeader("X-Checkout-Trace-Id", traceId);
  return res.status(status).json({
    error: message,
    checkoutTraceId: traceId,
    errorCode,
  });
}

function checkoutJsonSuccess(res, traceId, body) {
  res.setHeader("X-Checkout-Trace-Id", traceId);
  return res.json({ ...body, checkoutTraceId: traceId });
}

const SHIP_NAME_MAX = 120;
const SHIP_LINE_MAX = 240;
const SHIP_CITY_MAX = 100;
const SHIP_REGION_MAX = 100;
const SHIP_POSTAL_MAX = 32;
const SHIP_COUNTRY_MAX = 80;

/** Validate shipping + contact from checkout body (stored on order; never logged). */
function parseCheckoutShipping(body) {
  const s = body?.shipping;
  if (!s || typeof s !== "object") {
    return {
      ok: false,
      error: "Add delivery contact and address before completing checkout.",
    };
  }
  const fullName = String(s.fullName ?? "").trim();
  const phoneRaw = String(s.phone ?? "").trim();
  const addressLine1 = String(s.addressLine1 ?? "").trim();
  const addressLine2 = String(s.addressLine2 ?? "").trim();
  const city = String(s.city ?? "").trim();
  const region = String(s.region ?? "").trim();
  const postalCode = String(s.postalCode ?? "").trim();
  const country = String(s.country ?? "").trim();

  if (!fullName || fullName.length > SHIP_NAME_MAX) {
    return { ok: false, error: "Enter the recipient’s full name (max 120 characters)." };
  }
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneRaw.length > 32) {
    return { ok: false, error: "Enter a valid phone number for delivery updates." };
  }
  if (!addressLine1 || addressLine1.length > SHIP_LINE_MAX) {
    return { ok: false, error: "Enter a street address (line 1)." };
  }
  if (addressLine2.length > SHIP_LINE_MAX) {
    return { ok: false, error: "Address line 2 is too long." };
  }
  if (!city || city.length > SHIP_CITY_MAX) {
    return { ok: false, error: "Enter city or town." };
  }
  if (region.length > SHIP_REGION_MAX) {
    return { ok: false, error: "Region / state is too long." };
  }
  if (postalCode.length > SHIP_POSTAL_MAX) {
    return { ok: false, error: "Postal code is too long." };
  }
  if (!country || country.length > SHIP_COUNTRY_MAX) {
    return { ok: false, error: "Enter country." };
  }

  return {
    ok: true,
    shipping: {
      fullName,
      phone: phoneRaw,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      region: region || null,
      postalCode: postalCode || null,
      country,
    },
  };
}

function formatShippingForEmail(ship) {
  if (!ship) return "";
  const lines = [
    ship.fullName,
    ship.phone,
    ship.addressLine1,
    ship.addressLine2,
    `${ship.city}${ship.region ? `, ${ship.region}` : ""}${ship.postalCode ? ` ${ship.postalCode}` : ""}`.trim(),
    ship.country,
  ].filter(Boolean);
  return `Delivery contact & address:\n${lines.join("\n")}\n`;
}

function orderRowToShipping(row) {
  if (!row?.ship_full_name || !row?.ship_phone || !row?.ship_line1) return null;
  return {
    fullName: String(row.ship_full_name),
    phone: String(row.ship_phone),
    addressLine1: String(row.ship_line1),
    addressLine2: row.ship_line2 ? String(row.ship_line2) : null,
    city: String(row.ship_city || ""),
    region: row.ship_region ? String(row.ship_region) : null,
    postalCode: row.ship_postal ? String(row.ship_postal) : null,
    country: String(row.ship_country || ""),
  };
}

async function verifyTurnstileToken(req, res) {
  if (!TURNSTILE_SECRET_KEY) return true;
  const token = String(req.body?.captchaToken || "").trim();
  if (!token) {
    res.status(400).json({ error: "CAPTCHA validation is required." });
    return false;
  }
  try {
    const form = new URLSearchParams();
    form.set("secret", TURNSTILE_SECRET_KEY);
    form.set("response", token);
    form.set("remoteip", getClientIp(req));
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const verifyData = await verifyRes
      .json()
      .catch(() => ({}));
    if (!verifyRes.ok || !verifyData?.success) {
      res.status(400).json({ error: "CAPTCHA verification failed. Please retry." });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Turnstile verify error:", error);
    res.status(502).json({ error: "Could not verify CAPTCHA right now." });
    return false;
  }
}

function mapStrapiItemSaleRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const attrs =
        entry.attributes && typeof entry.attributes === "object"
          ? entry.attributes
          : {};
      /** Strapi v5 uses documentId for stable REST ids; v4 uses numeric id. Must match Next `/api/item-sales`. */
      const id = String(
        entry.documentId ??
          attrs.documentId ??
          entry.id ??
          attrs.id ??
          "",
      ).trim();

      const title =
        attrs.title ?? entry.title ?? attrs.name ?? entry.name ?? "Untitled item";
      const description =
        attrs.description ?? entry.description ?? null;
      const rawAmount = attrs.amount ?? entry.amount;
      const amountNum =
        typeof rawAmount === "string"
          ? Number.parseFloat(rawAmount)
          : Number(rawAmount);
      const amount = Number.isFinite(amountNum) ? amountNum : NaN;
      const aqRaw = attrs.available_qty ?? entry.available_qty;
      const availableQty =
        typeof aqRaw === "number" && Number.isFinite(aqRaw) ? aqRaw : null;

      const status =
        availableQty !== null && availableQty <= 0 ? "sold_out" : "available";

      return {
        id,
        name: String(title || "Untitled item").trim() || "Untitled item",
        description,
        price_cents: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
        available_qty: availableQty,
        status,
      };
    })
    .filter(
      (row) =>
        row &&
        row.id &&
        Number.isInteger(row.price_cents) &&
        row.price_cents > 0,
    );
}

/**
 * Load store items from Strapi for checkout pricing / validation.
 * Strapi v5 rejects legacy v4 query strings (fields[0]=…, sort[0]=…), which caused 400 after a 401 token retry.
 * Order and URLs stay aligned with `frontend/src/app/api/item-sales/route.ts`.
 */
async function fetchStrapiStoreItems() {
  const candidatePaths = [
    "item-sales?populate=*&sort=display_order:asc",
    "item-sales?populate=*&sort[0]=display_order:asc",
    "item-sales?populate=cover,gallery&sort=display_order:asc",
    "item-sales?populate=cover,gallery&sort[0]=display_order:asc",
    "item-sales?populate=*",
    "item-sales",
  ];

  const doFetch = async (path, useAuth) =>
    fetch(`${strapiBaseUrl}/api/${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(useAuth && strapiReadToken
          ? { Authorization: `Bearer ${strapiReadToken}` }
          : {}),
      },
      signal: AbortSignal.timeout(12000),
    });

  let lastStatus = 0;
  let lastDetail = "";

  for (const path of candidatePaths) {
    let res = await doFetch(path, Boolean(strapiReadToken));
    if ((res.status === 401 || res.status === 403) && strapiReadToken) {
      res = await doFetch(path, false);
    }
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const rows = Array.isArray(json?.data) ? json.data : [];
      return mapStrapiItemSaleRows(rows);
    }
    lastStatus = res.status;
    lastDetail = await res.text().catch(() => "");
    checkoutLog("warn", "strapi.item_sales.query_failed", {
      path,
      status: res.status,
      detail: String(lastDetail).slice(0, 400),
    });
    if (res.status !== 400 && res.status !== 404) {
      break;
    }
  }

  throw new Error(
    `Strapi item-sales fetch failed (${lastStatus})${lastDetail ? `: ${String(lastDetail).slice(0, 500)}` : ""}`,
  );
}

async function fetchSoldQuantitiesByItemId(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return new Map();
  const result = await pool.query(
    `
      SELECT
        item->>'itemId' AS item_id,
        SUM(COALESCE((item->>'quantity')::int, 0))::int AS sold_qty
      FROM orders o
      CROSS JOIN LATERAL jsonb_array_elements(o.items_snapshot->'items') AS item
      WHERE o.status = 'PAID'
        AND item->>'itemId' = ANY($1::text[])
      GROUP BY item->>'itemId'
    `,
    [itemIds],
  );
  const soldById = new Map();
  for (const row of result.rows) {
    soldById.set(String(row.item_id), Number(row.sold_qty) || 0);
  }
  return soldById;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/auth/csrf", (req, res) => {
  const existing = getCsrfToken(req);
  const token = existing || issueCsrfCookie(res);
  return res.json({ csrfToken: token });
});

app.get("/auth/google/config", (_req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.json({ enabled: false });
  }
  return res.json({ enabled: true, clientId: GOOGLE_CLIENT_ID });
});

/** Public catalog for store / checkout (services you can purchase) */
app.get("/store/catalog", async (_req, res) => {
  try {
    await expirePendingOrders();
    const items = await fetchStrapiStoreItems();
    const soldById = await fetchSoldQuantitiesByItemId(items.map((i) => i.id));
    const normalized = items.map((item) => {
      const soldQty = soldById.get(item.id) || 0;
      const hasTrackedQty = typeof item.available_qty === "number";
      const remainingQty = hasTrackedQty
        ? Math.max(0, Number(item.available_qty) - soldQty)
        : null;
      const status =
        item.status === "sold_out" || (remainingQty !== null && remainingQty <= 0)
          ? "sold_out"
          : "available";
      return {
        ...item,
        sold_qty: soldQty,
        available_qty: remainingQty,
        status,
      };
    });
    res.json({ items: normalized });
  } catch (e) {
    console.error("Catalog error:", e);
    res.status(503).json({ error: "Could not load Strapi catalog" });
  }
});

app.post("/waitlist", async (req, res) => {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  const source =
    String(req.body?.source || "store_waitlist").trim() || "store_waitlist";

  if (!consumeIpLimit(req, res, "waitlist", WAITLIST_IP_MAX)) return;
  if (!consumeUserLimit(res, "waitlist", email, WAITLIST_USER_MAX)) return;
  if (!assertNotLocked(res, bucketKey("waitlist-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("waitlist-user-lock", email))) return;
  if (!(await verifyTurnstileToken(req, res))) return;

  if (!email) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("waitlist-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("waitlist-ip-lock", ip),
    );
    return res.status(400).json({ error: "email is required" });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    registerFailure(
      loginFailuresByUser,
      bucketKey("waitlist-user-fail", email),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("waitlist-user-lock", email),
    );
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    await pool.query(
      `INSERT INTO waitlist_signups (email, source)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET source = EXCLUDED.source`,
      [email, source],
    );

    await settleEmailJobs([
      sendWaitlistCustomerEmail(email),
      sendWaitlistTeamEmail(email, source),
    ], "Waitlist");

    return res.json({
      ok: true,
      message:
        "You are on the waitlist. We will email you when new offerings launch.",
    });
  } catch (e) {
    console.error("Waitlist signup error:", e);
    return res.status(500).json({ error: "Could not save waitlist signup" });
  }
});

app.post("/contact-inquiries", async (req, res) => {
  const ip = getClientIp(req);
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const phone = String(req.body?.phone || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const message = String(req.body?.message || "").trim();
  const source =
    String(req.body?.source || "website_contact_form").trim() ||
    "website_contact_form";

  if (!consumeIpLimit(req, res, "contact", WAITLIST_IP_MAX)) return;
  if (!consumeUserLimit(res, "contact", email, WAITLIST_USER_MAX)) return;
  if (!assertNotLocked(res, bucketKey("contact-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("contact-user-lock", email))) return;
  if (!(await verifyTurnstileToken(req, res))) return;

  if (name.length < 2) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("contact-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("contact-ip-lock", ip),
    );
    return res.status(400).json({ error: "Name is required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    registerFailure(
      loginFailuresByUser,
      bucketKey("contact-user-fail", email || ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("contact-user-lock", email || ip),
    );
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (subject.length < 3) {
    return res.status(400).json({ error: "Subject is required" });
  }
  if (message.length < 15) {
    return res
      .status(400)
      .json({ error: "Message must be at least 15 characters" });
  }

  try {
    await pool.query(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message, source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, phone || null, subject, message, source],
    );

    const emailResult = await settleEmailJobs([
      sendContactConfirmationEmail({
        name,
        email,
        phone,
        subject,
        message,
      }),
      sendContactNotificationEmail({
        name,
        email,
        phone,
        subject,
        message,
      }),
    ], "Contact");
    if (emailResult.failures.length > 0) {
      return res.status(502).json({
        error:
          "Your message was saved, but email delivery failed. Please check SMTP settings.",
        details: emailResult.failures,
      });
    }

    clearFailures(loginFailuresByIp, bucketKey("contact-ip-fail", ip));
    clearFailures(loginFailuresByUser, bucketKey("contact-user-fail", email));
    lockouts.delete(bucketKey("contact-ip-lock", ip));
    lockouts.delete(bucketKey("contact-user-lock", email));

    return res.json({ ok: true });
  } catch (e) {
    console.error("Contact inquiry error:", e);
    return res.status(500).json({ error: "Could not save contact inquiry" });
  }
});

app.post("/community-voices", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const story = String(req.body?.story || "").trim();

  if (name.length < 2) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (story.length < 20) {
    return res.status(400).json({ error: "Story must be at least 20 characters" });
  }

  try {
    await pool.query(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message, source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        name,
        email,
        null,
        "Community Voices Submission",
        story,
        "community_voices_form",
      ],
    );

    await Promise.all([
      sendCommunityVoiceConfirmationEmail({
        name,
        email,
        story,
      }),
      sendCommunityVoiceNotificationEmail({
        name,
        email,
        story,
      }),
    ]);

    return res.json({ ok: true });
  } catch (e) {
    console.error("Community Voices submission error:", e);
    return res.status(500).json({ error: "Could not submit story right now" });
  }
});

app.post(
  "/internship/applications",
  internshipCvUpload.single("cv"),
  async (req, res) => {
    const fullName = String(req.body?.fullName || "").trim();
    const email = normalizeEmail(req.body?.email);
    const phone = String(req.body?.phone || "").trim();
    const level = String(req.body?.level || "").trim();
    const message = String(req.body?.message || "").trim();
    const cvFile = req.file;

    if (fullName.length < 2) {
      return res.status(400).json({ error: "Full name is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (level.length < 2) {
      return res.status(400).json({ error: "Level is required" });
    }
    if (message.length < 10) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!cvFile) {
      return res.status(400).json({ error: "CV PDF is required" });
    }

    try {
      const applicationId = await pool.query(
        `INSERT INTO internship_applications (full_name, email, phone, level, message, cv_filename, cv_mime_type, cv_size_bytes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          fullName,
          email,
          phone || null,
          level,
          message,
          cvFile.originalname || null,
          cvFile.mimetype || null,
          cvFile.size || null,
        ],
      );

      const savedId = applicationId.rows[0]?.id;

      // Send emails (do not store CV in DB)
      await settleEmailJobs([
        sendInternshipAdminEmail(
          { fullName, email, phone: phone || null, level, message },
          cvFile,
        ),
        sendInternshipApplicantEmail({
          fullName,
          email,
          phone: phone || null,
          level,
          message,
        }),
      ], "Internship");

      return res.json({
        ok: true,
        applicationId: savedId || null,
      });
    } catch (e) {
      console.error("Internship application error:", e);
      return res.status(500).json({ error: "Could not save application" });
    }
  },
);

app.post("/auth/signup", requireCsrf, async (req, res) => {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const displayName =
    String(req.body?.displayName || "").trim() || email.split("@")[0] || "User";

  if (!consumeIpLimit(req, res, "signup", AUTH_IP_MAX)) return;
  if (!consumeUserLimit(res, "signup", email, AUTH_USER_MAX)) return;
  if (!assertNotLocked(res, bucketKey("signup-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("signup-user-lock", email))) return;

  if (!email || !password) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("signup-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("signup-ip-lock", ip),
    );
    return res.status(400).json({ error: "email and password are required" });
  }
  if (password.length < 8) {
    registerFailure(
      loginFailuresByUser,
      bucketKey("signup-user-fail", email),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("signup-user-lock", email),
    );
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    let user;
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.password_hash) {
        await client.query("ROLLBACK");
        registerFailure(
          loginFailuresByUser,
          bucketKey("signup-user-fail", email),
          LOGIN_LOCKOUT_ATTEMPTS,
          LOCKOUT_MS,
          bucketKey("signup-user-lock", email),
        );
        return res
          .status(409)
          .json({ error: "Account already exists. Please log in." });
      }
      const updated = await client.query(
        `UPDATE users
         SET password_hash = $1, auth_provider = 'both', display_name = COALESCE(NULLIF(display_name, ''), $2), updated_at = now()
         WHERE id = $3
         RETURNING id, email, display_name`,
        [hashPassword(password), displayName, row.id],
      );
      user = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO users (email, password_hash, display_name, auth_provider, is_email_verified)
         VALUES ($1, $2, $3, 'password', false)
         RETURNING id, email, display_name`,
        [email, hashPassword(password), displayName],
      );
      user = inserted.rows[0];
    }
    await client.query("COMMIT");
    clearFailures(loginFailuresByIp, bucketKey("signup-ip-fail", ip));
    clearFailures(loginFailuresByUser, bucketKey("signup-user-fail", email));
    lockouts.delete(bucketKey("signup-ip-lock", ip));
    lockouts.delete(bucketKey("signup-user-lock", email));
    const token = issueAuthToken(user);
    setAuthCookie(res, token);
    const csrfToken = issueCsrfCookie(res);
    return res.json({ user: userPayload(user), csrfToken });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Signup error:", e);
    return res.status(500).json({ error: "Could not sign up" });
  } finally {
    client.release();
  }
});

app.post("/auth/login", requireCsrf, async (req, res) => {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!consumeIpLimit(req, res, "login", AUTH_IP_MAX)) return;
  if (!consumeUserLimit(res, "login", email, AUTH_USER_MAX)) return;
  if (!assertNotLocked(res, bucketKey("login-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("login-user-lock", email))) return;

  if (!email || !password) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("login-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("login-ip-lock", ip),
    );
    return res.status(400).json({ error: "email and password are required" });
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rows.length === 0) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("login-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("login-ip-lock", ip),
    );
    registerFailure(
      loginFailuresByUser,
      bucketKey("login-user-fail", email),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("login-user-lock", email),
    );
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const user = result.rows[0];
  if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
    registerFailure(
      loginFailuresByIp,
      bucketKey("login-ip-fail", ip),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("login-ip-lock", ip),
    );
    registerFailure(
      loginFailuresByUser,
      bucketKey("login-user-fail", email),
      LOGIN_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("login-user-lock", email),
    );
    return res.status(401).json({ error: "Invalid email or password" });
  }
  clearFailures(loginFailuresByIp, bucketKey("login-ip-fail", ip));
  clearFailures(loginFailuresByUser, bucketKey("login-user-fail", email));
  lockouts.delete(bucketKey("login-ip-lock", ip));
  lockouts.delete(bucketKey("login-user-lock", email));
  await pool.query(
    "UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1",
    [user.id],
  );
  const token = issueAuthToken(user);
  setAuthCookie(res, token);
  const csrfToken = issueCsrfCookie(res);
  return res.json({ user: userPayload(user), csrfToken });
});

/**
 * Google Sign-In: verify ID token server-side, then create user or log in.
 * Never trust the client without verification.
 */
app.post("/auth/google", requireCsrf, async (req, res) => {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    return res
      .status(503)
      .json({ error: "Google auth is not configured on the server" });
  }
  const idToken = req.body?.idToken;
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ error: "idToken is required" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (e) {
    console.error("Google token verification failed:", e.message);
    return res.status(401).json({ error: "Invalid Google token" });
  }

  const googleSub = payload.sub;
  const email = payload.email;
  const displayName = payload.name || payload.email || "User";

  if (!email || !googleSub) {
    return res.status(400).json({ error: "Token missing email or subject" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let userResult = await client.query(
      "SELECT * FROM users WHERE google_sub = $1",
      [googleSub],
    );
    let user;

    if (userResult.rows.length === 0) {
      userResult = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (userResult.rows.length > 0) {
        await client.query(
          "UPDATE users SET google_sub = $1, display_name = $2, updated_at = now() WHERE id = $3",
          [googleSub, displayName, userResult.rows[0].id],
        );
        user = {
          ...userResult.rows[0],
          google_sub: googleSub,
          display_name: displayName,
        };
      } else {
        const insert = await client.query(
          `INSERT INTO users (email, google_sub, display_name) VALUES ($1, $2, $3)
           RETURNING id, email, google_sub, display_name, created_at`,
          [email, googleSub, displayName],
        );
        user = insert.rows[0];
      }
    } else {
      user = userResult.rows[0];
      await client.query(
        "UPDATE users SET display_name = $1, updated_at = now() WHERE id = $2",
        [displayName, user.id],
      );
      user.display_name = displayName;
    }

    await client.query("COMMIT");

    await client.query(
      "UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1",
      [user.id],
    );
    const token = issueAuthToken(user);
    setAuthCookie(res, token);
    const csrfToken = issueCsrfCookie(res);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
      csrfToken,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Auth error:", e);
    res.status(500).json({ error: "Authentication failed" });
  } finally {
    client.release();
  }
});

app.post("/auth/password-reset/request", requireCsrf, async (req, res) => {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  if (!consumeIpLimit(req, res, "otp-request", OTP_REQUEST_IP_MAX)) return;
  if (!consumeUserLimit(res, "otp-request", email, OTP_REQUEST_USER_MAX))
    return;
  if (!assertNotLocked(res, bucketKey("otp-request-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("otp-request-user-lock", email))) return;

  if (!email) return res.status(400).json({ error: "email is required" });

  const result = await pool.query(
    "SELECT id, email FROM users WHERE email = $1",
    [email],
  );
  if (result.rows.length > 0) {
    const user = result.rows[0];
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpInsert = await pool.query(
      `INSERT INTO password_reset_otps (user_id, code_hash, expires_at)
       VALUES ($1, $2, now() + ($3::text || ' minutes')::interval)
       RETURNING id`,
      [user.id, codeHash, OTP_EXP_MINUTES],
    );
    try {
      await sendOtpEmail(user.email, otp);
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      await pool.query("DELETE FROM password_reset_otps WHERE id = $1", [otpInsert.rows[0].id]).catch(() => {});
      return res.status(500).json({ error: "Could not send OTP email" });
    }
    return res.json({
      ok: true,
      accountFound: true,
      message:
        "We emailed a 6-digit code to this address. Check your inbox and spam folder, then enter the code below.",
    });
  }
  // Intentionally explicit: product choice is clearer UX over email-enumeration hiding.
  return res.json({
    ok: true,
    accountFound: false,
    message:
      "There is no account for this email. Check for typos, or create an account first using Sign up. You can also try Google sign-in if you registered that way.",
  });
});

app.post("/auth/password-reset/verify", requireCsrf, async (req, res) => {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || "").trim();
  const newPassword = String(req.body?.newPassword || "");

  if (!consumeIpLimit(req, res, "otp-verify", OTP_VERIFY_IP_MAX)) return;
  if (!consumeUserLimit(res, "otp-verify", email, OTP_VERIFY_USER_MAX)) return;
  if (!assertNotLocked(res, bucketKey("otp-verify-ip-lock", ip))) return;
  if (!assertNotLocked(res, bucketKey("otp-verify-user-lock", email))) return;

  if (!email || !otp || !newPassword) {
    registerFailure(
      otpVerifyFailuresByIp,
      bucketKey("otp-verify-ip-fail", ip),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-ip-lock", ip),
    );
    return res
      .status(400)
      .json({ error: "email, otp and newPassword are required" });
  }
  if (newPassword.length < 8) {
    registerFailure(
      otpVerifyFailuresByUser,
      bucketKey("otp-verify-user-fail", email),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-user-lock", email),
    );
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (userResult.rows.length === 0) {
    registerFailure(
      otpVerifyFailuresByIp,
      bucketKey("otp-verify-ip-fail", ip),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-ip-lock", ip),
    );
    registerFailure(
      otpVerifyFailuresByUser,
      bucketKey("otp-verify-user-fail", email),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-user-lock", email),
    );
    return res.status(400).json({ error: "Invalid OTP or email" });
  }
  const userId = userResult.rows[0].id;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpResult = await pool.query(
    `SELECT id, attempts, expires_at
     FROM password_reset_otps
     WHERE user_id = $1 AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );
  if (otpResult.rows.length === 0) {
    registerFailure(
      otpVerifyFailuresByIp,
      bucketKey("otp-verify-ip-fail", ip),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-ip-lock", ip),
    );
    registerFailure(
      otpVerifyFailuresByUser,
      bucketKey("otp-verify-user-fail", email),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-user-lock", email),
    );
    return res.status(400).json({ error: "Invalid OTP or email" });
  }
  const otpRow = otpResult.rows[0];
  if (new Date(otpRow.expires_at).getTime() < Date.now()) {
    registerFailure(
      otpVerifyFailuresByUser,
      bucketKey("otp-verify-user-fail", email),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-user-lock", email),
    );
    return res.status(400).json({ error: "OTP expired" });
  }
  if (otpRow.attempts >= 5) {
    return res
      .status(429)
      .json({ error: "Too many attempts, request a new OTP" });
  }

  const verify = await pool.query(
    `UPDATE password_reset_otps
     SET attempts = attempts + 1
     WHERE id = $1 AND code_hash = $2
     RETURNING id`,
    [otpRow.id, otpHash],
  );
  if (verify.rows.length === 0) {
    registerFailure(
      otpVerifyFailuresByIp,
      bucketKey("otp-verify-ip-fail", ip),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-ip-lock", ip),
    );
    registerFailure(
      otpVerifyFailuresByUser,
      bucketKey("otp-verify-user-fail", email),
      OTP_LOCKOUT_ATTEMPTS,
      LOCKOUT_MS,
      bucketKey("otp-verify-user-lock", email),
    );
    return res.status(400).json({ error: "Invalid OTP or email" });
  }

  clearFailures(otpVerifyFailuresByIp, bucketKey("otp-verify-ip-fail", ip));
  clearFailures(
    otpVerifyFailuresByUser,
    bucketKey("otp-verify-user-fail", email),
  );
  lockouts.delete(bucketKey("otp-verify-ip-lock", ip));
  lockouts.delete(bucketKey("otp-verify-user-lock", email));
  await pool.query(
    "UPDATE password_reset_otps SET used_at = now() WHERE id = $1",
    [otpRow.id],
  );
  await pool.query(
    `UPDATE users
     SET password_hash = $1, auth_provider = CASE WHEN auth_provider = 'google' THEN 'both' ELSE auth_provider END, updated_at = now()
     WHERE id = $2`,
    [hashPassword(newPassword), userId],
  );
  return res.json({ ok: true, message: "Password reset successful" });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const bearerFromHeader = header?.startsWith("Bearer ")
    ? header.slice(7)
    : null;
  const cookies = parseCookies(req);
  const bearerFromCookie = cookies[AUTH_COOKIE_NAME] || null;
  const bearer = bearerFromHeader || bearerFromCookie;
  if (!bearer) {
    return res.status(401).json({ error: "Missing authorization" });
  }
  try {
    const decoded = jwt.verify(bearer, JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function requireAdminMiddleware(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1::uuid LIMIT 1",
      [req.userId],
    );
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    return next();
  } catch (error) {
    console.error("Admin access check failed:", error);
    return res.status(500).json({ error: "Could not verify admin access" });
  }
}

/**
 * PayHere hosted checkout — returns form POST target + fields (browser submits to PayHere).
 * Body: { items, successUrl, cancelUrl, idempotencyKey, shipping: { fullName, phone, addressLine1, addressLine2?, city, region?, postalCode?, country } }
 */
app.post("/checkout/session", authMiddleware, requireCsrf, async (req, res) => {
  const checkoutTraceId = crypto.randomUUID();
  await expirePendingOrders().catch((e) =>
    checkoutLog("warn", "checkout.expire_pending_failed", {
      traceId: checkoutTraceId,
      message: e instanceof Error ? e.message : String(e),
    }),
  );
  const { items, successUrl, cancelUrl, idempotencyKey } = req.body || {};

  if (!successUrl || !cancelUrl) {
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_URLS",
      "successUrl and cancelUrl are required",
    );
  }
  const idemKey = String(idempotencyKey || "").trim();
  if (!idemKey || idemKey.length < 8 || idemKey.length > 128) {
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_IDEMPOTENCY",
      "idempotencyKey is required",
    );
  }

  const parsedShip = parseCheckoutShipping(req.body);
  if (!parsedShip.ok) {
    checkoutLog("info", "checkout.shipping_validation_failed", {
      traceId: checkoutTraceId,
      userId: req.userId,
    });
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_SHIPPING",
      parsedShip.error,
    );
  }
  const ship = parsedShip.shipping;

  const currency = String(PAYHERE_CURRENCY || "LKR").toUpperCase();
  if (!Array.isArray(items) || items.length === 0) {
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_ITEMS",
      "Provide items[] with itemId and quantity",
    );
  }
  if (items.length > 50) {
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_ITEMS",
      "Too many line items",
    );
  }

  checkoutLog("info", "checkout.session.start", {
    traceId: checkoutTraceId,
    userId: req.userId,
    itemCount: items.length,
    shippingCents: checkoutShippingCents,
  });

  const normalizedItems = [];
  const qtyByItemId = new Map();
  for (const raw of items) {
    const itemId = String(raw?.itemId || "").trim();
    if (!itemId) {
      return checkoutJsonFail(
        res,
        checkoutTraceId,
        400,
        "CHECKOUT_ITEM_ID",
        `Invalid itemId: ${itemId || "unknown"}`,
      );
    }
    const qty = Math.min(99, Math.max(1, parseInt(String(raw?.quantity), 10) || 1));
    normalizedItems.push({ itemId, quantity: qty });
    qtyByItemId.set(itemId, (qtyByItemId.get(itemId) || 0) + qty);
  }

  const distinctItemIds = Array.from(qtyByItemId.keys());
  let storeItems;
  try {
    storeItems = await fetchStrapiStoreItems();
  } catch (error) {
    checkoutLog("error", "checkout.catalog_fetch_failed", {
      traceId: checkoutTraceId,
      userId: req.userId,
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      503,
      "CHECKOUT_CATALOG",
      "Catalog unavailable. Please try again shortly.",
    );
  }
  const catalogById = new Map(storeItems.map((row) => [row.id, row]));
  if (!distinctItemIds.every((id) => catalogById.has(id))) {
    checkoutLog("warn", "checkout.unknown_item_ids", {
      traceId: checkoutTraceId,
      userId: req.userId,
      requestedIds: distinctItemIds,
    });
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      400,
      "CHECKOUT_CATALOG",
      "One or more items are not purchasable.",
    );
  }
  const soldById = await fetchSoldQuantitiesByItemId(distinctItemIds);
  for (const itemId of distinctItemIds) {
    const row = catalogById.get(itemId);
    const requestedQty = qtyByItemId.get(itemId) || 0;
    const soldQty = soldById.get(itemId) || 0;
    const trackedQty =
      typeof row.available_qty === "number" ? Number(row.available_qty) : null;
    if (trackedQty !== null) {
      const remaining = trackedQty - soldQty;
      if (remaining <= 0) {
        return checkoutJsonFail(
          res,
          checkoutTraceId,
          409,
          "CHECKOUT_SOLD_OUT",
          `${row.name} is sold out.`,
        );
      }
      if (requestedQty > remaining) {
        return checkoutJsonFail(
          res,
          checkoutTraceId,
          409,
          "CHECKOUT_STOCK",
          `${row.name} has only ${remaining} remaining for purchase.`,
        );
      }
    }
  }

  let subtotalCents = 0;
  const itemLabels = [];
  const pricingSnapshotItems = [];
  for (const { itemId, quantity } of normalizedItems) {
    const row = catalogById.get(itemId);
    const itemName = String(row.name || "Item").trim().slice(0, 120) || "Item";
    const unitPriceCents = Number(row.price_cents);
    const lineTotalCents = unitPriceCents * quantity;
    subtotalCents += lineTotalCents;
    itemLabels.push(quantity > 1 ? `${itemName} x${quantity}` : itemName);
    pricingSnapshotItems.push({
      itemId,
      name: itemName,
      quantity,
      unitPriceCents,
      lineTotalCents,
      description: row.description || null,
    });
  }

  const computedTotalCents = subtotalCents + checkoutShippingCents;
  const paymentSessionId = crypto.randomUUID();
  const amountStr = (computedTotalCents / 100).toFixed(2);

  const userRow = await pool.query(
    "SELECT email, display_name FROM users WHERE id = $1::uuid",
    [req.userId],
  );
  if (userRow.rows.length === 0) {
    checkoutLog("warn", "checkout.user_missing", {
      traceId: checkoutTraceId,
      userId: req.userId,
    });
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      404,
      "CHECKOUT_USER",
      "User not found",
    );
  }
  const { email: userEmail, display_name: displayName } = userRow.rows[0];
  const email = String(userEmail || "customer@example.com").trim();
  const nameParts = String(displayName || "Customer")
    .trim()
    .split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "User";

  const buildPayHereFields = (sessionId, amountValue, s) => {
    const useShip = Boolean(s && s.fullName);
    const phDigits = useShip ? String(s.phone).replace(/\D/g, "").slice(0, 15) : "";
    const phone = phDigits.length >= 8 ? phDigits : "0000000000";
    const addr = useShip
      ? [s.addressLine1, s.addressLine2, s.city].filter(Boolean).join(", ").slice(0, 240)
      : "N/A";
    const parts = useShip ? String(s.fullName).trim().split(/\s+/) : [];
    const fn = useShip
      ? parts[0]?.slice(0, 50) || "Customer"
      : firstName.slice(0, 50);
    const ln = useShip
      ? parts.slice(1).join(" ").slice(0, 50) || "Customer"
      : lastName.slice(0, 50);
    return {
      merchant_id: PAYHERE_MERCHANT_ID,
      return_url: String(successUrl),
      cancel_url: String(cancelUrl),
      notify_url: notifyUrlResolved(),
      order_id: sessionId,
      items: itemLabels.join(", ").slice(0, 500),
      currency,
      amount: amountValue,
      first_name: fn,
      last_name: ln,
      email: email.slice(0, 100),
      phone,
      address: addr || "N/A",
      city: (useShip ? s.city : "N/A").slice(0, 50),
      country: String((useShip ? s.country : PAYHERE_COUNTRY) || "LK")
        .slice(0, 2)
        .toUpperCase(),
      hash: payhereCheckoutHash(
        PAYHERE_MERCHANT_ID,
        sessionId,
        amountValue,
        currency,
        PAYHERE_MERCHANT_SECRET,
      ),
    };
  };
  const hasPayHere =
    String(CHECKOUT_PAYHERE_ENABLED || "")
      .trim()
      .toLowerCase() === "true" &&
    Boolean(PAYHERE_MERCHANT_ID) &&
    Boolean(PAYHERE_MERCHANT_SECRET);
  const fields = hasPayHere
    ? buildPayHereFields(paymentSessionId, amountStr, ship)
    : null;

  try {
    const orderInsert = await pool.query(
      `INSERT INTO orders (
         user_id, payment_session_id, idempotency_key, status, total_amount_cents, currency, items_snapshot,
         ship_full_name, ship_phone, ship_line1, ship_line2, ship_city, ship_region, ship_postal, ship_country
       )
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, order_code`,
      [
        req.userId,
        paymentSessionId,
        idemKey,
        "PENDING_PAYMENT",
        computedTotalCents,
        currency.toLowerCase(),
        JSON.stringify({
          currency: currency.toLowerCase(),
          subtotal_cents: subtotalCents,
          shipping_cents: checkoutShippingCents,
          total_cents: computedTotalCents,
          items: pricingSnapshotItems,
        }),
        ship.fullName,
        ship.phone,
        ship.addressLine1,
        ship.addressLine2,
        ship.city,
        ship.region,
        ship.postalCode,
        ship.country,
      ],
    );
    const createdOrderId = orderInsert.rows[0].id;
    const createdOrderCode = orderInsert.rows[0].order_code;

    // Sync to Strapi for admin verification
    void syncOrderToStrapi({
      orderCode: createdOrderCode,
      status: "PENDING_PAYMENT",
      totalAmountCents: computedTotalCents,
      currency: currency.toLowerCase(),
      customerEmail: email,
      items: pricingSnapshotItems,
      shipping: ship,
    }).catch((e) => console.error("Initial Strapi order sync failed:", e));

    await pool.query(
      `INSERT INTO payments (user_id, order_id, stripe_session_id, amount_cents, currency, status, metadata)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7::jsonb)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [
        req.userId,
        createdOrderId,
        paymentSessionId,
        computedTotalCents,
        currency.toLowerCase(),
        "pending",
        JSON.stringify({
          provider: hasPayHere ? "payhere" : "manual_bank",
          order_id: paymentSessionId,
          order_entity_id: createdOrderId,
          pricing_snapshot: {
            currency: currency.toLowerCase(),
            subtotal_cents: subtotalCents,
            shipping_cents: checkoutShippingCents,
            total_cents: computedTotalCents,
            items: pricingSnapshotItems,
          },
        }),
      ],
    );

    const itemsSummary = pricingSnapshotItems
      .map(
        (it) =>
          `- ${it.name} x${it.quantity} (${currency} ${(it.lineTotalCents / 100).toFixed(2)})`,
      )
      .join("\n");
    const shipSummaryLine =
      checkoutShippingCents > 0
        ? `\n- Delivery / handling: ${currency} ${(checkoutShippingCents / 100).toFixed(2)}\n`
        : "";
    const itemsSummaryWithShip = `${itemsSummary}${shipSummaryLine}`;
    const whatsappMessage =
      `Order ${createdOrderCode}\n` +
      `Amount: ${currency} ${(computedTotalCents / 100).toFixed(2)}\n` +
      `I have completed the bank transfer and will share my slip.`;
    const whatsappLink = buildWhatsappLink(whatsappMessage);
    const shippingBlock = formatShippingForEmail(ship);

    const notificationStatus = await sendOrderCreatedNotifications({
      orderCode: createdOrderCode,
      customerEmail: email,
      totalAmountCents: computedTotalCents,
      currency: currency.toLowerCase(),
      items: pricingSnapshotItems,
      itemsSummary: itemsSummaryWithShip,
      whatsappLink,
      shippingBlock,
    });

    checkoutLog("info", "checkout.session.created", {
      traceId: checkoutTraceId,
      userId: req.userId,
      orderId: createdOrderId,
      orderCode: createdOrderCode,
      subtotalCents,
      shippingCents: checkoutShippingCents,
      totalCents: computedTotalCents,
      currency: currency.toLowerCase(),
    });

    return checkoutJsonSuccess(res, checkoutTraceId, {
      url: null,
      sessionId: paymentSessionId,
      orderId: createdOrderId,
      orderCode: createdOrderCode,
      manualPayment: !hasPayHere,
      status: "PENDING_PAYMENT",
      bankInstructions: bankInstructionsText(),
      whatsappLink,
      emailNotifications: notificationStatus,
      subtotalCents,
      shippingCents: checkoutShippingCents,
      totalCents: computedTotalCents,
      ...(hasPayHere
        ? {
            payhere: {
              action: payhereCheckoutAction,
              fields,
              currency,
            },
          }
        : {
            message:
              "Order created. Payment is handled manually by admin review.",
          }),
    });
  } catch (e) {
    if (e?.code === "23505") {
      try {
        const existing = await pool.query(
          `SELECT id, order_code, payment_session_id, total_amount_cents, status,
             ship_full_name, ship_phone, ship_line1, ship_line2, ship_city, ship_region, ship_postal, ship_country
           FROM orders
           WHERE user_id = $1::uuid AND idempotency_key = $2
           LIMIT 1`,
          [req.userId, idemKey],
        );
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          if (String(row.status) === "PAID") {
            return checkoutJsonFail(
              res,
              checkoutTraceId,
              409,
              "CHECKOUT_ALREADY_PAID",
              "This checkout attempt is already paid.",
            );
          }
          const replayAmountStr = (Number(row.total_amount_cents) / 100).toFixed(2);
          const replayShip = orderRowToShipping(row);
          checkoutLog("info", "checkout.session.idempotent_replay", {
            traceId: checkoutTraceId,
            userId: req.userId,
            orderId: row.id,
            orderCode: row.order_code,
          });
          return checkoutJsonSuccess(res, checkoutTraceId, {
            url: null,
            sessionId: row.payment_session_id,
            orderId: row.id,
            orderCode: row.order_code,
            manualPayment: !hasPayHere,
            status: row.status,
            bankInstructions: bankInstructionsText(),
            whatsappLink: buildWhatsappLink(
              `Order ${row.order_code}\nAmount: ${currency} ${(Number(row.total_amount_cents) / 100).toFixed(2)}\nI have completed the bank transfer and will share my slip.`,
            ),
            emailNotifications: {
              customerEmailSent: false,
              adminEmailSent: false,
              customerEmailError: "Checkout was replayed from an existing order.",
              adminEmailError: null,
            },
            ...(hasPayHere
              ? {
                  payhere: {
                    action: payhereCheckoutAction,
                    fields: buildPayHereFields(
                      row.payment_session_id,
                      replayAmountStr,
                      replayShip,
                    ),
                    currency,
                  },
                }
              : {
                  message:
                    "Order already created. Payment is handled manually by admin review.",
                }),
          });
        }
      } catch (idemLookupErr) {
        checkoutLog("error", "checkout.idempotency_lookup_failed", {
          traceId: checkoutTraceId,
          userId: req.userId,
          message:
            idemLookupErr instanceof Error
              ? idemLookupErr.message
              : String(idemLookupErr),
        });
      }
    }
    checkoutLog("error", "checkout.session.insert_failed", {
      traceId: checkoutTraceId,
      userId: req.userId,
      code: e?.code,
      message: e instanceof Error ? e.message : String(e),
    });
    return checkoutJsonFail(
      res,
      checkoutTraceId,
      500,
      "CHECKOUT_SERVER",
      "Could not create checkout session",
    );
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, email, display_name FROM users WHERE id = $1::uuid",
      [req.userId],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const purchasesResult = await pool.query(
      `SELECT
         p.id,
         p.order_id,
         p.stripe_session_id,
         p.stripe_payment_intent_id,
         p.amount_cents,
         p.currency,
         p.status,
         p.created_at,
         o.order_code,
         o.status AS order_status
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       WHERE p.user_id = $1::uuid
       ORDER BY p.created_at DESC`,
      [req.userId],
    );
    const meetingsResult = await pool.query(
      `SELECT b.id, b.status, b.starts_at, b.created_at, s.name AS service_name, s.description AS service_description
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = $1::uuid
       ORDER BY b.created_at DESC`,
      [req.userId],
    );
    return res.json({
      user: userPayload(userResult.rows[0]),
      purchases: purchasesResult.rows,
      meetings: meetingsResult.rows,
    });
  } catch (e) {
    console.error("Failed to fetch /me:", e);
    return res.status(500).json({ error: "Could not load profile data" });
  }
});

app.get("/checkout/verify", authMiddleware, async (req, res) => {
  await expirePendingOrders().catch(() => {});
  const sessionId = String(req.query?.session_id || "").trim();
  if (!sessionId) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.status AS order_status,
         o.total_amount_cents,
         o.currency,
         p.status AS payment_status,
         COALESCE(p.metadata->>'provider', '') AS payment_provider
       FROM orders o
       LEFT JOIN payments p ON p.stripe_session_id = o.payment_session_id
       WHERE o.payment_session_id = $1
         AND o.user_id = $2::uuid
       LIMIT 1`,
      [sessionId, req.userId],
    );

    if (result.rows.length === 0) {
      return res.json({ status: "failed" });
    }

    const orderStatus = String(result.rows[0].order_status || "").toUpperCase();
    const paymentRaw = String(result.rows[0].payment_status || "").toLowerCase();
    const status =
      orderStatus === "PAID"
        ? "success"
        : orderStatus === "PENDING_PAYMENT" || paymentRaw === "pending"
          ? "pending"
          : "failed";
    const row = result.rows[0];
    const paymentProvider = String(row.payment_provider || "").toLowerCase();
    const manualPayment = paymentProvider === "manual_bank";
    const whatsappLink = buildWhatsappLink(
      `Order ${row.order_code}\nAmount: ${String(row.currency || "").toUpperCase()} ${(Number(row.total_amount_cents || 0) / 100).toFixed(2)}\nI have completed the bank transfer and will share my slip.`,
    );
    return res.json({
      status,
      orderId: row.id,
      orderCode: row.order_code,
      totalAmountCents: Number(row.total_amount_cents || 0),
      currency: String(row.currency || "lkr"),
      bankInstructions: bankInstructionsText(),
      whatsappLink,
      manualPayment,
    });
  } catch (e) {
    console.error("Checkout verify error:", e);
    return res.status(500).json({ error: "Could not verify checkout status" });
  }
});

app.post(
  "/orders/payment-slip",
  authMiddleware,
  requireCsrf,
  orderSlipUploadMiddleware,
  async (req, res) => {
    const orderCode = String(req.body?.orderCode || "").trim();
    const sessionId = String(req.body?.sessionId || "").trim();
    const paymentReference = String(req.body?.paymentReference || "").trim();
    const notes = String(req.body?.notes || "").trim();
    const slipFile = req.file;

    if (!orderCode && !sessionId) {
      return res.status(400).json({ error: "orderCode or sessionId is required" });
    }
    if (!slipFile) {
      return res.status(400).json({ error: "Payment slip file is required" });
    }

    try {
      const lookup = await pool.query(
        `SELECT id, order_code, payment_session_id, status
         FROM orders
         WHERE user_id = $1::uuid
           AND (
             ($2 <> '' AND order_code = $2) OR
             ($3 <> '' AND payment_session_id = $3)
           )
         LIMIT 1`,
        [req.userId, orderCode, sessionId],
      );
      if (lookup.rows.length === 0) {
        return res.status(404).json({ error: "Order not found for this account" });
      }
      const order = lookup.rows[0];
      const currentStatus = String(order.status || "").toUpperCase();
      if (currentStatus === "PAID") {
        return res.status(409).json({ error: "Order is already paid" });
      }

      const slipInsert = await pool.query(
        `INSERT INTO order_payment_slips (
           order_id, user_id, payment_session_id, payment_reference, notes,
           filename, mime_type, size_bytes, file_data
         )
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, created_at`,
        [
          order.id,
          req.userId,
          order.payment_session_id,
          paymentReference || null,
          notes || null,
          String(slipFile.originalname || "payment-slip"),
          String(slipFile.mimetype || "application/octet-stream"),
          Number(slipFile.size || 0),
          slipFile.buffer,
        ],
      );

      await pool.query(
        `UPDATE orders
         SET status = 'PENDING_REVIEW',
             updated_at = now()
         WHERE id = $1::uuid
           AND status <> 'PAID'`,
        [order.id],
      );
    await pool.query(
      `UPDATE payments
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = now()
       WHERE stripe_session_id = $1`,
      [
        order.payment_session_id,
        JSON.stringify({
          slip_uploaded: true,
          slip_uploaded_at: new Date().toISOString(),
          payment_reference: paymentReference || null,
          notes: notes || null,
        }),
      ],
    );

    // Sync slip and notes to Strapi
    void syncOrderSlipToStrapi(
      order.order_code,
      slipFile,
      paymentReference,
      notes
    ).catch((e) => console.error("Strapi slip sync failed:", e));

    return res.json({
        ok: true,
        orderId: order.id,
        orderCode: order.order_code,
        status: "PENDING_REVIEW",
        slipId: slipInsert.rows[0]?.id,
      });
    } catch (error) {
      console.error("Payment slip upload failed:", error);
      return res.status(500).json({ error: "Could not upload payment slip" });
    }
  },
);

function isClientOrderIdUuid(value) {
  const s = String(value || "").trim();
  return (
    s.length === 36 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s,
    )
  );
}

/** Remove an unpaid order and its payment row from the signed-in user’s account. */
app.delete(
  "/orders/:orderId",
  authMiddleware,
  requireCsrf,
  async (req, res) => {
    const orderId = String(req.params.orderId || "").trim();
    if (!isClientOrderIdUuid(orderId)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const o = await client.query(
        `SELECT id, payment_session_id, status
         FROM orders
         WHERE id = $1::uuid AND user_id = $2::uuid
         FOR UPDATE`,
        [orderId, req.userId],
      );
      if (o.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }
      const st = String(o.rows[0].status || "").toUpperCase();
      if (st === "PAID") {
        await client.query("ROLLBACK");
        return res.status(403).json({
          error:
            "This order is already marked complete. It cannot be removed from your account.",
        });
      }
      const paymentSessionId = String(o.rows[0].payment_session_id || "");

      await client.query(
        `DELETE FROM payments
         WHERE user_id = $1::uuid
           AND (
             order_id = $2::uuid
             OR ($3 <> '' AND stripe_session_id = $3)
           )`,
        [req.userId, orderId, paymentSessionId],
      );

      const del = await client.query(
        `DELETE FROM orders WHERE id = $1::uuid AND user_id = $2::uuid`,
        [orderId, req.userId],
      );
      if (del.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }

      await client.query("COMMIT");
      return res.json({ ok: true });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // ignore
      }
      console.error("User order delete failed:", err);
      return res.status(500).json({ error: "Could not remove order" });
    } finally {
      client.release();
    }
  },
);

app.get("/admin/me", authMiddleware, requireAdminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, display_name FROM users WHERE id = $1::uuid LIMIT 1",
      [req.userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin user not found" });
    }
    return res.json({
      admin: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        displayName: result.rows[0].display_name,
      },
    });
  } catch (error) {
    console.error("Admin profile fetch failed:", error);
    return res.status(500).json({ error: "Could not load admin profile" });
  }
});

app.get("/admin/orders", authMiddleware, requireAdminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.payment_session_id,
         o.status,
         o.total_amount_cents,
         o.currency,
         o.items_snapshot,
         o.created_at,
         o.ship_full_name,
         o.ship_phone,
         o.ship_line1,
         o.ship_line2,
         o.ship_city,
         o.ship_region,
         o.ship_postal,
         o.ship_country,
         u.email AS customer_email,
         s.id AS slip_id,
         s.filename AS slip_filename,
         s.mime_type AS slip_mime_type,
         s.size_bytes AS slip_size_bytes,
         s.payment_reference AS slip_payment_reference,
         s.notes AS slip_notes,
         s.created_at AS slip_created_at,
         (p.metadata->>'confirmed_at') AS payment_verified_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN payments p ON p.stripe_session_id = o.payment_session_id
       LEFT JOIN LATERAL (
         SELECT id, filename, mime_type, size_bytes, payment_reference, notes, created_at
         FROM order_payment_slips
         WHERE order_id = o.id
         ORDER BY created_at DESC
         LIMIT 1
       ) s ON true
       WHERE o.status IN ('PENDING_PAYMENT', 'PENDING_REVIEW', 'PAID')
       ORDER BY
         CASE
           WHEN o.status = 'PAID' THEN 0
           WHEN o.status = 'PENDING_REVIEW' THEN 1
           WHEN o.status = 'PENDING_PAYMENT' THEN 2
           ELSE 3
         END ASC,
         o.created_at DESC
       LIMIT 200`,
    );
    return res.json({ orders: result.rows });
  } catch (error) {
    console.error("Admin orders list failed:", error);
    return res.status(500).json({ error: "Could not fetch admin orders" });
  }
});

app.get("/admin/orders/:orderId/slip", authMiddleware, requireAdminMiddleware, async (req, res) => {
  const orderId = String(req.params?.orderId || "").trim();
  const slipId = String(req.query?.slipId || "").trim();
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }
  try {
    const result = await pool.query(
      `SELECT id, filename, mime_type, file_data
       FROM order_payment_slips
       WHERE order_id = $1::uuid
         AND ($2 = '' OR id::text = $2)
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId, slipId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Slip not found" });
    }
    const row = result.rows[0];
    res.setHeader("Content-Type", row.mime_type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${String(row.filename || "payment-slip").replace(/"/g, "")}"`,
    );
    return res.send(row.file_data);
  } catch (error) {
    console.error("Admin slip fetch failed:", error);
    return res.status(500).json({ error: "Could not fetch slip" });
  }
});

app.post("/admin/orders/mark-paid", express.json(), (req, res, next) => {
  const secret = String(req.body?.secret || "").trim();
  if (ADMIN_ORDER_SECRET && secret === ADMIN_ORDER_SECRET) {
    return next();
  }
  authMiddleware(req, res, () => {
    requireAdminMiddleware(req, res, next);
  });
}, async (req, res) => {
  const orderId = String(req.body?.orderId || "").trim();
  const orderCode = String(req.body?.orderCode || "").trim();
  const paymentReference = String(req.body?.paymentReference || "").trim();
  const notes = String(req.body?.notes || "").trim();
  if (!orderId && !orderCode) {
    return res.status(400).json({ error: "orderId or orderCode is required" });
  }

  const whereClause = orderId ? "o.id = $1::uuid" : "o.order_code = $1";
  try {
    const orderResult = await pool.query(
      `SELECT o.id, o.payment_session_id, o.status, o.order_code, o.total_amount_cents, o.currency, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE ${whereClause}
       LIMIT 1`,
      [orderId || orderCode],
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const row = orderResult.rows[0];
    const existingStatus = String(row.status || "").toUpperCase();
    if (existingStatus === "PAID") {
      return res.json({
        ok: true,
        orderId: row.id,
        orderCode: row.order_code,
        status: "PAID",
        alreadyPaid: true,
      });
    }
    await pool.query(
      `UPDATE orders
       SET status = 'PAID',
           updated_at = now()
       WHERE id = $1::uuid`,
      [row.id],
    );
    await pool.query(
      `UPDATE payments
       SET status = 'succeeded',
           metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = now()
       WHERE stripe_session_id = $1`,
      [
        row.payment_session_id,
        JSON.stringify({
          manual_confirmation: true,
          payment_reference: paymentReference || null,
          notes: notes || null,
          confirmed_at: new Date().toISOString(),
        }),
      ],
    );
    const emailNotifications = await sendOrderPaidNotifications({
      orderCode: row.order_code,
      customerEmail: row.customer_email,
      totalAmountCents: Number(row.total_amount_cents || 0),
      currency: String(row.currency || "lkr"),
      paymentReference,
      notes,
    });
    return res.json({
      ok: true,
      orderId: row.id,
      orderCode: row.order_code,
      status: "PAID",
      emailNotifications,
    });
  } catch (error) {
    console.error("Manual order confirmation failed:", error);
    return res.status(500).json({ error: "Could not mark order as paid" });
  }
});

app.post("/auth/logout", requireCsrf, (_req, res) => {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

ensureSchema()
  .then(() => startRateStoreSweeper())
  .then(() => {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`API listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Schema initialization failed:", err);
    process.exit(1);
  });
