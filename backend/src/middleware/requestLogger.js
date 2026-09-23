/**
 * ============================================================
 * src/middleware/requestLogger.js
 * PURPOSE : Development request logger. For every request it
 *           logs: timestamp, method, URL, response status and
 *           duration in ms — useful while building/debugging.
 * STATUS  : [RESERVED] — NOT WIRED anywhere yet.
 *           To activate it, uncomment the line marked
 *           "[RESERVED - NOT WIRED]" in src/app.js:
 *               const { requestLogger } = require('./middleware/requestLogger');
 *               ...
 *               app.use(requestLogger);
 *           Deleting this file breaks NOTHING (nothing imports it).
 * ============================================================
 */

'use strict';

/**
 * Express middleware that logs one line per request AFTER the response
 * finishes (so we can report the final status + real duration).
 *
 * Usage (when enabled):  app.use(requestLogger)
 */
function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  // Once the response is sent, print the log line.
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(
      `[http] ${new Date().toISOString()} ${req.method} ${req.originalUrl} ` +
        `→ ${res.statusCode} (${durationMs.toFixed(1)} ms)`
    );
  });

  next(); // continue down the middleware chain
}

module.exports = { requestLogger };
