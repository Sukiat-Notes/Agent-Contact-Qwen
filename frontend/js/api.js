/**
 * ============================================================
 * js/api.js
 * PURPOSE : THE ONLY PLACE the frontend talks to the backend.
 *           A thin wrapper over fetch that:
 *             - builds absolute URLs against the API base
 *             - sets/reads JSON headers
 *             - unwraps the `{ ok, data?, error? }` envelope
 *             - throws an Error with a readable message on failure
 *           The UI (app.js) never calls fetch() directly, so if
 *           the API base URL or the response envelope ever change,
 *           only THIS file needs editing.
 * STATUS  : [USED] — loaded by index.html before app.js.
 * ============================================================
 */

/* global window */
'use strict';

(function attachApiToWindow() {
  /**
   * Base URL of the API.
   * When the backend serves this page (default setup) the API is on the
   * SAME origin, so we use relative URLs and it "just works" on any host.
   * If you host the frontend separately, set this to e.g.
   *   "http://localhost:3000"
   */
  const API_BASE = '';

  /**
   * Perform a request and return the unwrapped payload.
   * @param {string} path   e.g. "/api/contacts"
   * @param {object} [opts]
   * @param {string}  [opts.method]   HTTP verb (default GET)
   * @param {object}  [opts.body]    JSON-serializable request body
   * @returns {Promise<*>}  the `data` member (or the whole body if absent)
   * @throws {Error}        with a human-readable message when !ok or on network error
   */
  async function request(path, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const init = {
      method,
      headers: { Accept: 'application/json' },
    };

    // Only add a body (and content type) when we actually send one.
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }

    // Network-level failure (server down, offline, CORS, ...) → readable error.
    let res;
    try {
      res = await fetch(API_BASE + path, init);
    } catch (netErr) {
      throw new Error('Network error: cannot reach the API. Is the backend running?');
    }

    // DELETE 204 returns no body; short-circuit before parsing JSON.
    if (res.status === 204) return null;

    let payload;
    try {
      payload = await res.json();
    } catch {
      throw new Error(`API returned ${res.status} with a non-JSON body.`);
    }

    // Our standard envelope is { ok: false, error } → surface the message.
    if (!res.ok || payload.ok === false) {
      const detail = payload.error || `HTTP ${res.status}`;
      const extras = Array.isArray(payload.errors) ? ' — ' + payload.errors.join(' ') : '';
      throw new Error(detail + extras);
    }

    // Return the useful part: the `data` member when present, else the body.
    return payload.data !== undefined ? payload.data : payload;
  }

  /** The public API consumed by app.js: one method per CRUD operation. */
  window.ContactApi = {
    /** READ (all)   → GET    /api/contacts            */
    list: () => request('/api/contacts'),
    /** READ (one)   → GET    /api/contacts/:id        */
    get: (id) => request(`/api/contacts/${encodeURIComponent(id)}`),
    /** CREATE       → POST   /api/contacts            */
    create: (contact) => request('/api/contacts', { method: 'POST', body: contact }),
    /** UPDATE       → PUT    /api/contacts/:id        */
    update: (id, contact) =>
      request(`/api/contacts/${encodeURIComponent(id)}`, { method: 'PUT', body: contact }),
    /** DELETE       → DELETE /api/contacts/:id        */
    remove: (id) => request(`/api/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    /** HEALTH       → GET    /api/health              */
    health: () => request('/api/health'),
  };
})();
