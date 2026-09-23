/**
 * ============================================================
 * server.js
 * PURPOSE : ENTRY POINT of the backend. Loads configuration,
 *           builds the Express app (see src/app.js) and starts
 *           the HTTP server. Keeping "make the app" (app.js)
 *           and "run the app" (server.js) separate lets tests
 *           import the app without opening a real port.
 * STATUS  : USED - executed by `npm start` / `npm run dev`.
 *           (NOT executed yet: project is prepared, not run.)
 * ============================================================
 */

'use strict';

// Central configuration (reads .env / process env, applies defaults).
const config = require('./src/config/config');
// The fully-wired Express application (routes, middleware, static files).
const createApp = require('./src/app');

// ---------------------------------------------------------------------------
// Create the application instance (no port is opened by createApp itself).
// ---------------------------------------------------------------------------
const app = createApp();

// ---------------------------------------------------------------------------
// Start listening. `app.listen` returns the active http.Server, which we
// expose for clean shutdown (e.g. `server.close()` in tests or a SIGINT hook).
// ---------------------------------------------------------------------------
const server = app.listen(config.port, () => {
  // A single, unambiguous log line so a human (or the agent) can confirm
  // the server is up and on which port.
  console.log(
    `[server] Contact API listening on http://localhost:${config.port}`
  );
  console.log(
    `[server] Health check  : http://localhost:${config.port}/api/health`
  );
  if (config.serveFrontend) {
    console.log(`[server] Web UI       : http://localhost:${config.port}/`);
  }
});

// ---------------------------------------------------------------------------
// Graceful shutdown: stop accepting new connections, then exit, when the
// process is asked to terminate (Ctrl+C, `docker stop`, CI timeouts, ...).
// This prevents dropped in-flight requests and torn JSON writes.
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`\n[server] ${signal} received - shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('[server] Error during shutdown:', err.message);
      process.exit(1);
    }
    console.log('[server] Closed. Bye.');
    process.exit(0);
  });
  // Failsafe: if connections never drain, force-exit after 5 seconds.
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // e.g. docker stop / CI

// Export for testing (node --test / future tooling).
module.exports = { server, app };
