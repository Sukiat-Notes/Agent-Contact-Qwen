# AGENT-CREATION-GUIDE — How this agent/project was created

> **Purpose:** A step-by-step record of how the *Agent-Contact* project was
> produced by an AI coding agent (Qwen, running inside the Zed editor).
> **Status:** [USED] — documentation.
>
> If you want to recreate this project with any agent, follow these exact
> steps. Each step lists the **prompt/intent**, the **files produced**, and
> the **git action** (commit + push) that sealed it.

---

## 0. Prerequisites (before the agent starts)

| Item               | Requirement                                                    |
| ------------------ | -------------------------------------------------------------- |
| Git                | installed, with a GitHub account                                |
| GitHub repo        | empty repo `Sukiat-Notes/Agent-Contact-Qwen` (or any remote)   |
| Node.js            | **not needed yet** — only required at *execution* time (>= 18) |
| Editor + agent     | Zed with the Qwen agent enabled (or any other agent UI)        |

Local repository setup (one time):

```bash
mkdir Agent-Contact && cd Agent-Contact
git init
git remote add origin https://github.com/Sukiat-Notes/Agent-Contact-Qwen.git
```

---

## 1. The master prompt given to the agent

> "Create a Contact web app with full CRUD (frontend + backend).
> Do NOT run it — only prepare it. Create every file an agent will
> need to build the app later, even placeholders; clearly mark
> placeholders that are not used yet. Commit and push to
> https://github.com/Sukiat-Notes/Agent-Contact-Qwen.git after every
> logical change, with a message describing what changed. Put detailed
> comments in every file. Add the folder structure and the purpose of
> each folder to README.md. Also write a guide on how to create this
> agent step by step and how to execute it."

That single prompt is what drives everything below.

---

## 2. Step-by-step build order (each step = 1 commit + 1 push)

### Step 1 — Foundation
- **Intent:** establish conventions before any code exists.
- **Files:** `README.md` (overview, folder structure with each folder's
  purpose, `[USED]`/`[RESERVED]` legend, quick start), `.gitignore`,
  `.gitattributes`, `data/contacts.json` (3 seed records = sample DB).
- **Commit:** `Scaffold project foundation (README, .gitignore, sample data)`

### Step 2 — Backend core
- **Intent:** make the backend *runnable in principle*: entry point, app
  wiring, configuration, manifest.
- **Files:** `backend/package.json`, `backend/.env.example`,
  `backend/server.js`, `backend/src/app.js`, `backend/src/config/config.js`,
  `backend/src/utils/id.js`.
- **Commit:** `Add backend core (manifest, entry point, app wiring, config)`

### Step 3 — CRUD layer
- **Intent:** implement the five operations cleanly across three layers
  (routes → controllers → model).
- **Files:** `backend/src/routes/contacts.routes.js`,
  `backend/src/controllers/contactController.js`,
  `backend/src/models/contactModel.js`,
  `backend/src/middleware/errorHandler.js`.
- **Commit:** `Add CRUD layer (model, controller, routes, error handler)`

### Step 4 — Reserved backend extras
- **Intent:** create "not used yet" files so the structure is complete,
  clearly labeled `[RESERVED]`.
- **Files:** `backend/src/middleware/requestLogger.js` (dev logging, not
  wired), `backend/tests/contacts.test.js` (node:test suite, not run).
- **Commit:** `Add reserved backend files (request logger, test suite)`

### Step 5 — Frontend
- **Intent:** build the UI with a strict separation: HTML (structure) →
  CSS (style) → `api.js` (network) → `app.js` (logic).
- **Files:** `frontend/index.html`, `frontend/css/styles.css`,
  `frontend/js/api.js`, `frontend/js/app.js`, `frontend/js/ui.js`
  (reserved helpers).
- **Commit:** `Add frontend (page, styles, API client, UI controller)`

### Step 6 — Documentation
- **Intent:** capture *how* and *why* so any future agent or human can
  continue the work without losing context.
- **Files:** `docs/AGENT-CREATION-GUIDE.md` (this file),
  `docs/EXECUTE-GUIDE.md`, `docs/API.md`.
- **Commit:** `Add documentation (creation guide, execute guide, API ref)`

---

## 3. Conventions the agent enforces (and you should keep)

1. **File-header comments** in every file: `PURPOSE`, `STATUS`
   (`[USED]` / `[RESERVED]`), and notes. No file exists without one.
2. **Layered backend:** routes (thin) → controllers (rules) → models (I/O).
   Swapping the JSON store for a real database later only touches the model.
3. **Single network module in the frontend:** only `js/api.js` calls `fetch`.
4. **Commit discipline:** one logical change = one commit = one push, with a
   message that describes *what* and *why*.
5. **Reserved over missing:** future files are created now and clearly marked,
   so the repo structure never looks half-finished.

## 4. Verifying each commit after the agent works

```bash
git log --oneline          # you should see the 6 commits in order
git status                 # should say "nothing to commit, working tree clean"
# then open the GitHub repo and confirm the same 6 commits appear on main.
```

## 5. Extending the project (what to ask the agent next)

- "Run the tests in `backend/tests/` and fix anything that fails."
- "Wire `requestLogger.js` into `app.js` and mark it `[USED]`."
- "Add search/filter to the contact list (frontend) and a `?q=` query
  parameter (backend route/controller/model)."
- "Replace the JSON store with SQLite; keep the `contactModel.js` public
  API identical so nothing else changes."
