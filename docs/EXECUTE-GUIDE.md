# EXECUTE-GUIDE — How to run the agent's output (the Contact app)

> **Purpose:** Take the prepared project from "not run yet" to a working
> CRUD web app, and verify every operation.
> **Status:** [USED] — documentation.

> ⚠️ **Current state:** the project has NOT been executed yet.
> This guide is the intended workflow.

---

## 1. Requirements

| Tool      | Version        | Check with            |
| --------- | -------------- | --------------------- |
| Node.js   | >= 18          | `node --version`      |
| npm       | >= 9 (bundled) | `npm --version`       |
| Git       | any recent     | `git --version`       |

No database server is needed — the app persists to `data/contacts.json`.

---

## 2. Install (once)

```bash
cd backend
npm install          # creates node_modules/ and package-lock.json
```

`npm install` writes `package-lock.json` and a `node_modules/` folder.
Both are expected; `node_modules/` is git-ignored, the lock file should be
committed on your first commit after install.

---

## 3. Run the API + web app (single server)

```bash
cd backend
npm start            # production-ish: node server.js
#  ...or, for auto-restart when you edit code:
npm run dev          # node --watch server.js
```

Expected console output:

```
[server] Contact API listening on http://localhost:3000
[server] Health check  : http://localhost:3000/api/health
[server] Web UI       : http://localhost:3000/
```

Open **http://localhost:3000** — you should see the Contact UI with the 3
seed contacts from `data/contacts.json`.

### Customizing (optional)
```bash
cd backend
cp .env.example .env      # then edit values (port, data file, ...)
```
Every variable has a default, so skipping this step is fine.

---

## 4. Verify CRUD (browser)

| # | Action                          | Expected                                                        |
| - | ------------------------------- | --------------------------------------------------------------- |
| 1 | Page loads                      | 3 seed contacts shown, count badge = 3                          |
| 2 | Fill form → **Add contact**     | New row appears; count = 4                                      |
| 3 | Click a row's **Edit**          | Form switches to "Editing …", row highlighted                   |
| 4 | Change a field → **Save changes**| Row updates; `updatedAt` changed (see JSON)                     |
| 5 | Click **Delete** → confirm      | Row disappears; count decrements                                 |
| 6 | **Refresh** button              | List re-fetches; all changes survived (they're in the JSON file)|

---

## 5. Verify CRUD (command line — no browser needed)

```bash
# READ (all)
curl http://localhost:3000/api/contacts

# READ (one) — use a real id from the previous response
curl http://localhost:3000/api/contacts/c-1001

# CREATE
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"New Person","email":"new@example.com","phone":"+1-555-0110"}'

# UPDATE (replace fields)
curl -X PUT http://localhost:3000/api/contacts/c-1001 \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada L.","company":"Engines"}'

# DELETE
curl -X DELETE http://localhost:3000/api/contacts/c-1001

# HEALTH (smoke test)
curl http://localhost:3000/api/health
```

---

## 6. Run the (reserved) test suite

```bash
cd backend
npm test             # runs tests/contacts.test.js via node:test
```
Tests use a temporary data file — your real `data/contacts.json` is untouched.

---

## 7. Stop / reset

- **Stop:** press `Ctrl+C` in the server terminal (graceful shutdown is
  implemented in `server.js`).
- **Reset data:** stop the server, then either
  - restore the file from Git: `git checkout -- data/contacts.json`, or
  - delete the file: the model will re-create it empty on next start.

---

## 8. Troubleshooting

| Symptom                                   | Likely cause / fix                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `EADDRINUSE` on startup                   | Port 3000 taken → set `PORT=3001` in `backend/.env` or kill the process |
| `Cannot find module 'express'`            | `npm install` not run in `backend/`                                     |
| UI loads but list is empty/error          | API not running, or wrong origin → check the backend console            |
| Changes don't appear after refresh        | Confirm `data/contacts.json` actually changed (it's the "database")    |
| CORS error (only when hosting UI elsewhere) | Set `API_BASE` at the top of `frontend/js/api.js` to the API origin  |
