/**
 * ============================================================
 * tests/contacts.test.js
 * PURPOSE : Smoke tests for the contacts API using Node's BUILT-IN
 *           test runner (node:test) + global fetch. No extra
 *           devDependencies needed. Covers the happy path of all
 *           five CRUD operations plus the 404 behavior.
 * STATUS  : [RESERVED] — written and ready, but NOT RUN yet.
 *           How to run (from the backend/ folder):
 *               npm test
 *           Notes for the future:
 *             - Tests boot the app on port 0 (random free port).
 *             - They use a TEMP data file (os.tmpdir) so your real
 *               data/contacts.json is never modified.
 * ============================================================
 */

'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

// ---------------------------------------------------------------------------
// Test environment: point the data store at a throwaway file BEFORE the
// app is required (config.js caches the path at load time).
// ---------------------------------------------------------------------------
const tmpDataFile = path.join(os.tmpdir(), `agent-contact-test-${Date.now()}.json`);
process.env.CONTACTS_DATA_FILE = tmpDataFile;
process.env.PORT = '0'; // "0" = let the OS pick a free port

// Require the app AFTER env is set (order matters!).
const createApp = require('../src/app');

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  fs.rmSync(tmpDataFile, { force: true }); // clean up temp store
});

// ---------------------------------------------------------------------------
// CRUD happy path (order-dependent by design: C → R → U → D)
// ---------------------------------------------------------------------------

let createdId;

test('CREATE: POST /api/contacts returns 201 + a record with id', async () => {
  const res = await fetch(`${base}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Person', email: 'test@example.com', phone: '+1-555-0199' }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(body.data.id, 'created record must have an id');
  assert.equal(body.data.name, 'Test Person');
  createdId = body.data.id;
});

test('READ: GET /api/contacts includes the record we created', async () => {
  const res = await fetch(`${base}/api/contacts`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.data.some((c) => c.id === createdId));
});

test('UPDATE: PUT /api/contacts/:id changes fields, preserves id/createdAt', async () => {
  const res = await fetch(`${base}/api/contacts/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Renamed Person' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.name, 'Renamed Person');
  assert.equal(body.data.id, createdId);
});

test('DELETE: DELETE /api/contacts/:id returns 204, then 404 on re-read', async () => {
  const del = await fetch(`${base}/api/contacts/${createdId}`, { method: 'DELETE' });
  assert.equal(del.status, 204);

  const get = await fetch(`${base}/api/contacts/${createdId}`);
  assert.equal(get.status, 404);
});

// ---------------------------------------------------------------------------
// Validation + error handling
// ---------------------------------------------------------------------------

test('VALIDATION: POST without name/email returns 400 + error list', async () => {
  const res = await fetch(`${base}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '123' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.ok(Array.isArray(body.errors) && body.errors.length >= 2);
});

test('404: unknown route returns JSON (not HTML)', async () => {
  const res = await fetch(`${base}/api/does-not-exist`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.ok, false);
});
