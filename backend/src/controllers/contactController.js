/**
 * ============================================================
 * src/controllers/contactController.js
 * PURPOSE : BUSINESS LOGIC / APPLICATION LAYER. Sits between
 *           the HTTP routes and the data model:
 *             - validates incoming payloads (shape + content)
 *             - calls contactModel (data access)
 *             - shapes JSON responses + error status codes
 *           Controllers never touch the file system directly and
 *           routes never contain business rules — clean layering.
 * STATUS  : USED - required by routes/contacts.routes.js.
 * ============================================================
 */

'use strict';

const contactModel = require('../models/contactModel');
const { generateId } = require('../utils/id');

// ---------------------------------------------------------------------------
// Validation helpers (shared by CREATE and UPDATE)
// ---------------------------------------------------------------------------

/** Loose but sufficient email check for a local contacts app. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Extract + validate the mutable contact fields from a request body.
 * @param {object} body
 * @returns {{fields: object, errors: string[]}}
 */
function validateBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { fields: {}, errors: ['Request body must be a JSON object.'] };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

  // `name` and `email` are required; the rest are optional (default '').
  if (!name) errors.push('"name" is required and must be a non-empty string.');
  if (!email) {
    errors.push('"email" is required and must be a non-empty string.');
  } else if (!EMAIL_RE.test(email)) {
    errors.push(`"email" does not look like a valid email address ("${email}").`);
  }

  return {
    fields: { name, email, phone, company, notes },
    errors,
  };
}

/** Send a 400 with the validation error list. */
function reject(res, errors) {
  return res.status(400).json({ ok: false, error: 'Validation failed', errors });
}

// ---------------------------------------------------------------------------
// CRUD controllers (one per HTTP verb on /api/contacts)
// ---------------------------------------------------------------------------

/**
 * CREATE — POST /api/contacts
 * Body: { name, email, phone?, company?, notes? }
 */
async function createContact(req, res, next) {
  try {
    const { fields, errors } = validateBody(req.body);
    if (errors.length) return reject(res, errors);

    const now = new Date().toISOString();
    const contact = {
      id: generateId(),
      ...fields,
      createdAt: now,
      updatedAt: now,
    };

    await contactModel.create(contact);
    // 201 Created + Location is the REST-conformant response.
    res.status(201).json({ ok: true, data: contact });
  } catch (err) {
    next(err); // hand off to the central error handler (middleware)
  }
}

/**
 * READ (all) — GET /api/contacts
 */
async function listContacts(req, res, next) {
  try {
    const contacts = await contactModel.getAll();
    res.json({ ok: true, count: contacts.length, data: contacts });
  } catch (err) {
    next(err);
  }
}

/**
 * READ (one) — GET /api/contacts/:id
 */
async function getContact(req, res, next) {
  try {
    const contact = await contactModel.getById(req.params.id);
    if (!contact) {
      return res.status(404).json({ ok: false, error: `Contact "${req.params.id}" not found.` });
    }
    res.json({ ok: true, data: contact });
  } catch (err) {
    next(err);
  }
}

/**
 * UPDATE — PUT /api/contacts/:id
 * Body: any subset of { name, email, phone, company, notes }
 */
async function updateContact(req, res, next) {
  try {
    const { fields, errors } = validateBody(req.body);
    if (errors.length) return reject(res, errors);

    const updated = await contactModel.update(req.params.id, fields);
    if (!updated) {
      return res.status(404).json({ ok: false, error: `Contact "${req.params.id}" not found.` });
    }
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE — DELETE /api/contacts/:id
 */
async function deleteContact(req, res, next) {
  try {
    const removed = await contactModel.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ ok: false, error: `Contact "${req.params.id}" not found.` });
    }
    // 204 No Content: nothing to return, per REST convention.
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact,
};
