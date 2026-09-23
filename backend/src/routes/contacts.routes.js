/**
 * ============================================================
 * src/routes/contacts.routes.js
 * PURPOSE : ROUTING LAYER. The thinnest layer of the backend:
 *           it maps (HTTP verb + URL) → controller function.
 *           No business logic and no data access live here.
 * STATUS  : USED - mounted by src/app.js at /api/contacts.
 * ============================================================
 *
 * Route table (final URLs once mounted):
 *   POST   /api/contacts        → createContact
 *   GET    /api/contacts        → listContacts
 *   GET    /api/contacts/:id    → getContact
 *   PUT    /api/contacts/:id    → updateContact
 *   DELETE /api/contacts/:id    → deleteContact
 * ============================================================
 */

'use strict';

const express = require('express');

const {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

const router = express.Router();

// CREATE — add a new contact.
router.post('/', createContact);

// READ — list all contacts.
router.get('/', listContacts);

// READ — fetch a single contact by ID.
router.get('/:id', getContact);

// UPDATE — replace mutable fields of a contact.
router.put('/:id', updateContact);

// DELETE — remove a contact.
router.delete('/:id', deleteContact);

module.exports = router;
