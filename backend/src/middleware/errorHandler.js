/**
 * ============================================================
 * src/middleware/errorHandler.js
 * PURPOSE : CENTRALIZED error handling. Two middlewares:
 *             - notFound   : catch-all for unknown URLs → JSON 404
 *             - errorHandler: catches anything passed to next(err)
 *                             or thrown in async handlers → JSON 500
 *           Placing them LAST in app.js means every route benefits
 *           from one consistent error shape:
 *             { "ok": false, "error": "<message>", "errors": [...]? }
 * STATUS  : USED - required by src/app.js (wired in app.js).
 * ============================================================
 */

'use strict';

/**
 * 404 handler — reached when no earlier route matched the URL.
 * Returns JSON (not HTML) because this is an API-first service.
 */
function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: `Not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central error handler — Express identifies it by its 4-arg signature.
 * Converts any thrown/rejected error into a JSON 500 response and logs
 * the details to the server console (clients only see a safe message,
 * never stack traces or internal paths).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.originalUrl} → ${err.message}`);

  // Malformed JSON body (thrown by express.json) → 400, not 500.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'Request body is not valid JSON.' });
  }
  // Oversized body (thrown by express.json limit) → 413.
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Request body too large.' });
  }

  res.status(500).json({ ok: false, error: 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
