/**
 * ============================================================
 * src/config/config.js
 * PURPOSE : SINGLE source of truth for runtime configuration.
 *           Every other module reads `config.js` instead of
 *           touching `process.env` directly, which makes the
 *           app easy to test and easy to re-configure.
 *           Values come from environment variables (optionally
 *           loaded from backend/.env) with safe defaults.
 * STATUS  : USED - required by server.js, app.js and models.
 * ============================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');

// -------------------------------------------------------------------------
// Tiny .env loader (no external dependency): reads KEY=VALUE lines from
// backend/.env (if it exists) and copies them into process.env WITHOUT
// overwriting variables that are already set (real env wins).
// [USED - intentionally dependency-free]
// -------------------------------------------------------------------------
function loadDotEnv() {
  const candidates = [
    path.resolve(__dirname, '..', '..', '.env'), // backend/.env
    path.resolve(__dirname, '..', '..', '..', '.env'), // repo-root .env
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue; // blank / comment
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue; // malformed line - skip
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
    return; // first .env found wins
  }
}
loadDotEnv();

// -------------------------------------------------------------------------
// Helpers to coerce env strings into sane values.
// -------------------------------------------------------------------------
function toBool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}
function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

// -------------------------------------------------------------------------
// Public configuration object (consumed by the rest of the app).
// -------------------------------------------------------------------------
const config = {
  /** TCP port for the HTTP server. Default 3000. */
  port: toInt(process.env.PORT, 3000),

  /**
   * Absolute path of the JSON "database".
   * Relative paths (from .env) are resolved against the repository root,
   * i.e. the folder that contains `backend/` and `data/`.
   */
  dataFile: path.resolve(__dirname, '..', '..', '..', process.env.CONTACTS_DATA_FILE || 'data/contacts.json'),

  /** Log verbosity (informational only in v0.1). Default 'info'. */
  logLevel: process.env.LOG_LEVEL || 'info',

  /** Whether Express should also serve frontend/ at `/`. Default true. */
  serveFrontend: toBool(process.env.SERVE_FRONTEND, true),
};

module.exports = config;
