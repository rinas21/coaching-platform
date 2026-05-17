#!/usr/bin/env node
/**
 * One-time bootstrap: create or upgrade an admin user (same password hashing as api/src/index.js).
 *
 * Usage (from repo root, with DATABASE_URL in .env):
 *   cd api && node --env-file=../.env scripts/create-admin-user.js you@example.com 'YourSecurePassword'
 *
 * Docker (after rebuild that includes this script):
 *   docker exec -it safespace_api node /app/scripts/create-admin-user.js you@example.com 'YourSecurePassword'
 */

import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const email = normalizeEmail(process.argv[2]);
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin-user.js <email> <password>");
  console.error("DATABASE_URL must be set (e.g. via ../.env)");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const hash = hashPassword(password);
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           is_admin = true,
           auth_provider = CASE WHEN auth_provider = 'google' THEN 'both' ELSE COALESCE(auth_provider, 'password') END,
           updated_at = now()
       WHERE email = $2`,
      [hash, email],
    );
    console.log("OK: existing user updated — is_admin=true and password set for:", email);
  } else {
    const inserted = await pool.query(
      `INSERT INTO users (
         email,
         password_hash,
         auth_provider,
         is_email_verified,
         display_name,
         is_admin,
         created_at,
         updated_at
       )
       VALUES ($1, $2, 'password', true, $3, true, now(), now())
       RETURNING id, email, is_admin`,
      [email, hash, email.split("@")[0] || "Admin"],
    );
    console.log("OK: admin user created:", inserted.rows[0]);
  }
  console.log("Next: open /admin/login on the frontend and sign in with this email and password.");
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
} finally {
  await pool.end();
}
