# Agent-Contact-Qwen

> A **Contact web app** with full **CRUD** (Create, Read, Update, Delete) capability —
> one Node.js/Express **backend** REST API + one **vanilla HTML/CSS/JS frontend**.
>
> **Current status: PREPARED, NOT YET EXECUTED.**
> Every file has been created and commented by the agent. The code is written and
> ready, but nothing has been run yet (`npm install` / `npm start` have NOT been
> executed). Each file header states its **PURPOSE** and **STATUS**
> (`USED` = part of the running app, `RESERVED` = placeholder for future work).

---

## 1. Tech stack

| Layer     | Choice                                      | Why                                            |
| --------- | ------------------------------------------- | ---------------------------------------------- |
| Backend   | Node.js + Express (REST API)                | Minimal, widely used, easy for an agent to build |
| Storage   | JSON file (`data/contacts.json`)            | Zero setup, no database server needed          |
| Frontend  | Vanilla HTML + CSS + JavaScript             | No build step, works from any static server    |
| Testing   | Node's built-in `node:test` (RESERVED)      | No extra test framework dependency             |
| Runtime   | Node.js >= 18                               | `node --watch` supported for dev               |

---

## 2. Folder structure

```
Agent-Contact/
├── README.md                          # THIS FILE — overview, structure, guides
├── .gitignore                         # [USED]   files excluded from Git (node_modules, .env, ...)
├── .gitattributes                     # [USED]   Git line-ending & file-type rules
│
├── data/                              # ── "Database" layer ─────────────────────────────
│   └── contacts.json                  # [USED]   JSON file store: seed records + where
│                                       #         the backend persists CRUD changes
│
├── backend/                           # ── REST API (Node.js + Express) ─────────────────
│   ├── package.json                   # [USED]   backend manifest, scripts, dependency (express)
│   ├── .env.example                   # [USED]   template of environment variables to copy
│   ├── server.js                      # [USED]   entry point: reads env, starts HTTP server
│   ├── src/
│   │   ├── app.js                     # [USED]   Express app wiring: json body, CORS, routes,
│   │   │                                #        static frontend, error handler
│   │   ├── config/
│   │   │   └── config.js              # [USED]   central config loaded from env vars
│   │   ├── routes/
│   │   │   └── contacts.routes.js     # [USED]   maps HTTP verbs + URLs → controller methods
│   │   ├── controllers/
│   │   │   └── contactController.js   # [USED]   CRUD business logic (validation + response)
│   │   ├── models/
│   │   │   └── contactModel.js        # [USED]   data access: read/write data/contacts.json
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # [USED]   404 + central error handler (wired in app.js)
│   │   │   └── requestLogger.js       # [RESERVED] dev request logger — NOT wired yet
│   │   └── utils/
│   │       └── id.js                  # [USED]   tiny ID generator for new contacts
│   └── tests/
│       └── contacts.test.js           # [RESERVED] node:test smoke tests — not run yet
│
├── frontend/                          # ── Browser UI (served by Express at /) ──────────
│   ├── index.html                     # [USED]   single page: contact list + add/edit form
│   ├── css/
│   │   └── styles.css                 # [USED]   styling for the UI
│   └── js/
│       ├── app.js                     # [USED]   UI controller: renders list, wires form
│       ├── api.js                     # [USED]   fetch wrapper: GET/POST/PUT/DELETE calls
│       └── ui.js                      # [RESERVED] future helpers (toasts, modals) — not used
│
└── docs/                              # ── Agent + human documentation ──────────────────
    ├── AGENT-CREATION-GUIDE.md        # Step-by-step: HOW THIS AGENT WAS CREATED
    ├── EXECUTE-GUIDE.md               # Step-by-step: HOW TO RUN THE AGENT / THE APP
    └── API.md                         # REST API reference (endpoints, request/response)
```

### Purpose of each top-level folder

| Folder       | Purpose                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `data/`      | The **JSON "database"**. The only place persistent state lives. Backed up by committing it.      |
| `backend/`   | The **REST API**: routing (`routes/`), business logic (`controllers/`), data access (`models/`), configuration, and reserved extras (middleware, tests). |
| `frontend/`  | The **browser UI**: a static single-page app that talks to the backend only through `js/api.js`. |
| `docs/`      | **Documentation**: how the agent was built, how to run it, and the API contract.                 |

Legend used in every file header and in the table above:

- **`[USED]`** — the file is part of the working app and will be loaded when the
  server runs.
- **`[RESERVED]`** — the file exists on purpose as a placeholder. It is **NOT**
  imported/wired anywhere yet; it becomes `USED` when the feature it describes is
  implemented. (You are safe to delete reserved files without breaking the app.)

---

## 3. CRUD operations (contract)

| Operation | HTTP            | URL                  | Frontend trigger            |
| --------- | --------------- | -------------------- | --------------------------- |
| Create    | `POST`          | `/api/contacts`      | "Add contact" form          |
| Read all  | `GET`           | `/api/contacts`      | page load / refresh         |
| Read one  | `GET`           | `/api/contacts/:id`  | (API only)                  |
| Update    | `PUT`           | `/api/contacts/:id`  | "Save changes" in edit form |
| Delete    | `DELETE`        | `/api/contacts/:id`  | row's "Delete" button       |
| Health    | `GET`           | `/api/health`        | (API only — smoke test)     |

Full request/response examples: **[`docs/API.md`](docs/API.md)**.

---

## 4. Guides

1. **How this agent/project was created, step by step** →
   [`docs/AGENT-CREATION-GUIDE.md`](docs/AGENT-CREATION-GUIDE.md)
2. **How to execute it** (install, run backend, open frontend, test CRUD) →
   [`docs/EXECUTE-GUIDE.md`](docs/EXECUTE-GUIDE.md)
3. **API reference** → [`docs/API.md`](docs/API.md)

### Quick start (short version)

```bash
# 1) Install backend dependencies (once)
cd backend
npm install

# 2) Start the API server (serves the frontend too, at http://localhost:3000)
npm start
# ...or for auto-restart on file changes...
npm run dev

# 3) Open the app
#    http://localhost:3000          → Contact web UI
#    http://localhost:3000/api/health → JSON health check
```

> ⚠️ This project has **not been executed yet** — the commands above are the
> intended workflow, not a record of what already ran.

---

## 5. Conventions

- **Comments first.** Every file starts with a header block: `PURPOSE`, `STATUS`
  (`USED` / `RESERVED`), and notes on what the file does.
- **Commit discipline.** Every logical change group is its own commit with a
  descriptive message, and is pushed immediately to
  `https://github.com/Sukiat-Notes/Agent-Contact-Qwen.git`.
- **Reserved over missing.** Files that will be needed later are created now and
  clearly marked `[RESERVED]`, so the structure is complete from day one.
