/**
 * ============================================================
 * js/app.js
 * PURPOSE : THE UI CONTROLLER. Connects the HTML form + table in
 *           index.html to the API client in api.js.
 *             - renders the contact list into <tbody>
 *             - drives the form in create/edit mode
 *             - calls ContactApi.* and refreshes the list after
 *               each successful mutation
 *             - surfaces validation/network errors to the user
 *           No fetch() here: every network call goes through
 *           window.ContactApi (see api.js).
 * STATUS  : [USED] — loaded by index.html (after api.js).
 * ============================================================
 */

/* global window, ContactApi */
'use strict';

(function bootstrapApp() {
  // ------------------------------------------------------------------
  // Element handles (bound once; the page structure never changes)
  // ------------------------------------------------------------------
  const form = document.getElementById('contact-form');
  const fields = {
    id: document.getElementById('contact-id'),
    name: document.getElementById('field-name'),
    email: document.getElementById('field-email'),
    phone: document.getElementById('field-phone'),
    company: document.getElementById('field-company'),
    notes: document.getElementById('field-notes'),
  };
  const btnSave = document.getElementById('btn-save');
  const btnCancel = document.getElementById('btn-cancel');
  const btnRefresh = document.getElementById('btn-refresh');
  const formHint = document.getElementById('form-hint');
  const formError = document.getElementById('form-error');
  const tbody = document.getElementById('contacts-body');
  const emptyMsg = document.getElementById('contacts-empty');
  const countBadge = document.getElementById('contacts-count');

  /** The contact currently being edited (null when in create mode). */
  let editingId = null;

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------

  /**
   * Render ONE <tr> for a contact. Buttons are created via
   * createElement + addEventListener (no inline on* attributes),
   * which avoids HTML-escaping headaches and is safer.
   */
  function rowFor(contact) {
    const tr = document.createElement('tr');
    tr.dataset.id = contact.id;

    const cells = [
      textCell(contact.name),
      textCell(contact.email),
      textCell(contact.phone),
      textCell(contact.company),
    ];

    const actions = document.createElement('td');
    actions.className = 'col-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => startEdit(contact));

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.type = 'button';
    delBtn.className = 'danger';
    delBtn.addEventListener('click', () => removeContact(contact));

    actions.append(editBtn, delBtn);
    cells.push(actions);

    cells.forEach((td) => tr.appendChild(td));
    return tr;
  }

  /** Small helper: a <td> whose text is set safely via textContent. */
  function textCell(value) {
    const td = document.createElement('td');
    td.textContent = value || ''; // empty string for blank optional fields
    return td;
  }

  /**
   * Replace the table body with the given contacts.
   * Toggles the empty-state message + the count badge.
   */
  function renderList(contacts) {
    tbody.replaceChildren(); // clear existing rows
    countBadge.textContent = String(contacts.length);
    emptyMsg.hidden = contacts.length !== 0;

    for (const contact of contacts) tbody.appendChild(rowFor(contact));
  }

  /** Show/hide the single italic "loading…" row while a fetch is in flight. */
  function setLoading(loading) {
    if (loading) {
      const tr = document.createElement('tr');
      tr.className = 'loading';
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'Loading…';
      tr.appendChild(td);
      tbody.replaceChildren(tr);
      emptyMsg.hidden = true;
    } else {
      tbody.replaceChildren();
    }
  }

  // ------------------------------------------------------------------
  // Data operations (each = one API call + refresh on success)
  // ------------------------------------------------------------------

  /** READ: fetch all contacts and render them. */
  async function refresh() {
    setLoading(true);
    try {
      const contacts = await ContactApi.list();
      renderList(contacts);
    } catch (err) {
      showFormError(err.message);
      renderList([]);
    } finally {
      setLoading(false);
    }
  }

  /** CREATE: submit the form as a new contact. */
  async function createContact() {
    const payload = readForm();
    setLoading(true);
    try {
      await ContactApi.create(payload);
      resetForm();
      await refresh();
    } catch (err) {
      showFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /** UPDATE: submit the form as changes to the contact being edited. */
  async function saveEdit() {
    const payload = readForm();
    setLoading(true);
    try {
      await ContactApi.update(editingId, payload);
      resetForm();
      await refresh();
    } catch (err) {
      showFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /** DELETE: confirm, then remove the contact and refresh. */
  async function removeContact(contact) {
    const sure = window.confirm(`Delete "${contact.name}"? This cannot be undone.`);
    if (!sure) return;
    setLoading(true);
    try {
      await ContactApi.remove(contact.id);
      if (editingId === contact.id) resetForm(); // stop editing a gone record
      await refresh();
    } catch (err) {
      showFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------------
  // Form handling
  // ------------------------------------------------------------------

  /** Collect the current field values into a plain payload object. */
  function readForm() {
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      company: fields.company.value.trim(),
      notes: fields.notes.value.trim(),
    };
  }

  /** Switch the form into EDIT mode for the given contact. */
  function startEdit(contact) {
    editingId = contact.id;
    fields.id.value = contact.id;
    fields.name.value = contact.name || '';
    fields.email.value = contact.email || '';
    fields.phone.value = contact.phone || '';
    fields.company.value = contact.company || '';
    fields.notes.value = contact.notes || '';

    formHint.textContent = `Editing "${contact.name}".`;
    btnSave.textContent = 'Save changes';
    btnCancel.classList.remove('hidden');

    // Highlight the row being edited.
    tbody.querySelectorAll('tr').forEach((tr) => tr.classList.toggle('editing', tr.dataset.id === contact.id));
  }

  /** Return the form to CREATE mode and clear it. */
  function resetForm() {
    editingId = null;
    form.reset();
    fields.id.value = '';

    formHint.textContent = 'Add a new contact.';
    btnSave.textContent = 'Add contact';
    btnCancel.classList.add('hidden');
    formError.hidden = true;
    tbody.querySelectorAll('tr.editing').forEach((tr) => tr.classList.remove('editing'));
  }

  /** Show an error message under the form (and hide it when empty). */
  function showFormError(message) {
    if (!message) {
      formError.hidden = true;
      return;
    }
    formError.textContent = message;
    formError.hidden = false;
  }

  // ------------------------------------------------------------------
  // Event wiring + initial load
  // ------------------------------------------------------------------
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // use fetch, not a page-reload POST
    if (editingId) saveEdit();
    else createContact();
  });

  btnCancel.addEventListener('click', resetForm);
  btnRefresh.addEventListener('click', refresh);

  // First paint: load whatever is already stored.
  refresh();
})();
