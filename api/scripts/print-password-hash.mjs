#!/usr/bin/env node
/**
 * Prints a password_hash compatible with api/src/index.js hashPassword().
 * Usage (from repo root or api/):
 *   node api/scripts/print-password-hash.mjs "YourStrongPassword"
 */
import crypto from "crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node api/scripts/print-password-hash.mjs "<password>"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
console.log(`${salt}:${hash}`);
