/**
 * ============================================================
 * src/utils/id.js
 * PURPOSE : Generates unique IDs for new contact records.
 *           Format: `c-<timestamp-base36><random-base36>`
 *           (e.g. "c-m2x9k1a3f7b2"). Human-readable prefix makes
 *           logs and API responses easy to scan.
 * STATUS  : USED - called by contactController.js on CREATE.
 * ============================================================
 */

'use strict';

/**
 * Create a new contact ID.
 * Uniqueness strategy (good enough for a single-file store):
 *   - millisecond timestamp in base36  → time ordering
 *   - 6 random chars in base36         → collision resistance
 * @returns {string}
 */
function generateId() {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `c-${timePart}${randomPart}`;
}

module.exports = { generateId };
