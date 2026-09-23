/**
 * ============================================================
 * src/models/contactModel.js
 * PURPOSE : DATA ACCESS LAYER. The ONLY module that touches the
 *           JSON "database" (config.dataFile, default
 *           data/contacts.json). Implements the four CRUD
 *           primitives: getAll, getById, create, update, remove.
 *           Keeping I/O in one place means a future swap to
 *           SQLite/Postgres only touches THIS file.
 * STATUS  : USED - required by contactController.js.
 * ============================================================
 *
 * Data file shape:
 * {
 *   "meta":     { version, createdAt, updatedAt, ... },
 *   "contacts": [ { id, name, email, phone, company, notes,
 *                   createdAt, updatedAt }, ... ]
 * }
 *
 * Concurrency note (documented, not solved): the file store is
 * not multi-process safe. This app assumes ONE server process
 * (local/dev tooling). Writes read-modify-write the whole file;
 * that is acceptable at this scale.
 * ============================================================
 */

'use strict';

const fs = require('fs/promises');
const path = require('path');

const config = require('../config/config');

// The absolute path of the JSON "database" (resolved in config.js).
const DATA_FILE = config.dataFile;

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

/**
 * Ensure the data file (and its parent folder) exist.
 * If the file is missing we bootstrap it with an empty collection so the
 * app can start on a fresh checkout.
 */
async function ensureStore() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const fresh = {
      meta: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      contacts: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(fresh, null, 2) + '\n', 'utf8');
  }
}

/**
 * Read + parse the whole store.
 * @returns {Promise<{meta: object, contacts: object[]}>}
 */
async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  // Defensive normalization: tolerate hand-edited files missing pieces.
  parsed.meta = parsed.meta || {};
  parsed.contacts = Array.isArray(parsed.contacts) ? parsed.contacts : [];
  return parsed;
}

/**
 * Serialize + write the whole store atomically-enough (write file, then
 * fsync the directory is overkill for this app's scale).
 * Also bumps meta.updatedAt so consumers can see the last change.
 */
async function writeStore(store) {
  store.meta.updatedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// CRUD primitives (the public API of this module)
// ---------------------------------------------------------------------------

/**
 * READ (all): return every contact, newest-first.
 * @returns {Promise<object[]>}
 */
async function getAll() {
  const store = await readStore();
  return [...store.contacts].sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

/**
 * READ (one): return a single contact by ID, or null if not found.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getById(id) {
  const store = await readStore();
  return store.contacts.find((c) => c.id === id) || null;
}

/**
 * CREATE: append a new contact and persist.
 * `contact` must already be validated + stamped (id, timestamps) by the
 * controller; the model only stores what it is given.
 * @param {object} contact
 * @returns {Promise<object>} the stored contact
 */
async function create(contact) {
  const store = await readStore();
  store.contacts.push(contact);
  await writeStore(store);
  return contact;
}

/**
 * UPDATE: replace mutable fields of the contact with the given `id`.
 * Immutable fields (id, createdAt) are preserved.
 * @param {string} id
 * @param {object} fields   mutable fields to apply
 * @returns {Promise<object|null>} the updated contact, or null if not found
 */
async function update(id, fields) {
  const store = await readStore();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const current = store.contacts[idx];
  const updated = {
    ...current,
    ...fields,
    id: current.id,                       // id is immutable
    createdAt: current.createdAt,         // createdAt is immutable
    updatedAt: new Date().toISOString(),
  };
  store.contacts[idx] = updated;
  await writeStore(store);
  return updated;
}

/**
 * DELETE: remove the contact with the given `id`.
 * @param {string} id
 * @returns {Promise<boolean>} true if a record was removed, false if not found
 */
async function remove(id) {
  const store = await readStore();
  const before = store.contacts.length;
  store.contacts = store.contacts.filter((c) => c.id !== id);
  if (store.contacts.length === before) return false; // nothing removed
  await writeStore(store);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
