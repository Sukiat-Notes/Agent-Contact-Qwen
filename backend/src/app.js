/**
 * ============================================================
 * src/app.js
 * PURPOSE : Builds and returns a fully-wired Express application
 *           WITHOUT starting a network listener (that's
 *           server.js's job). Order matters here:
 *             1. JSON body parsing
 *             2. (reserved) request logger
 *             3. API routes  (/api/*)
 *             4. Static frontend (optional, at /)
 *             5. 404 catch-all + central error handler (LAST)
 * STATUS  : USED - required by server.js on every boot.
 * ============================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');

const express = require('express');

const config = require('./config/config');
const contactsRoutes = require('./routes/contacts.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
// [RESERVED] Request logger middleware. NOT required/wired here yet —
// uncomment when log-noise is wanted in development.
// const { requestLogger } = require('./middleware/requestLogger');

/**
 * Create and configure the Express app.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // -------------------------------------------------------------------------
  // 1) Parse JSON request bodies (used by POST/PUT /api/contacts).
  //    Bodies larger than 100kb are rejected early with a 413 response.
  // -------------------------------------------------------------------------
  app.use(express.json({ limit: '100kb' }));

  // -------------------------------------------------------------------------
  // [RESERVED - NOT WIRED] Request logging middleware.
  // Uncomment the next line to log every request line (method, url, status).
  // -------------------------------------------------------------------------
  // app.use(requestLogger);

  // -------------------------------------------------------------------------
  // 2) Minimal CORS support so the frontend can also be served from a
  //    different origin/port during development (e.g. a separate static
  //    server). Same-origin usage (default setup) is unaffected.
  // -------------------------------------------------------------------------
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204); // preflight answer
    }
    next();
  });

  // -------------------------------------------------------------------------
  // 3) API routes.
  //    - GET /api/health      → liveness probe (no DB access)
  //    - /api/contacts ...    → CRUD (see routes/contacts.routes.js)
  // -------------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'agent-contact-backend',
      time: new Date().toISOString(),
    });
  });

  app.use('/api/contacts', contactsRoutes);

  // -------------------------------------------------------------------------
  // 4) Static frontend (optional). Serves frontend/ at the site root, so
  //    http://localhost:3000/ shows the Contact UI and /api/* serves JSON.
  //    Skipped entirely if SERVE_FRONTEND=false or the folder is missing.
  // -------------------------------------------------------------------------
  const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
  if (config.serveFrontend && fs.existsSync(frontendDir)) {
    app.use(express.static(frontendDir));
  }

  // -------------------------------------------------------------------------
  // 5) 404 + error handling. MUST come last, after every route, so unknown
  //    URLs and thrown/rejected errors land in one consistent JSON shape.
  // -------------------------------------------------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
