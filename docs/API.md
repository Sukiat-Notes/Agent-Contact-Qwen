# API.md — REST API reference (Contact CRUD)

> **Purpose:** The complete contract between the frontend and the backend.
> **Status:** [USED] — documentation. All endpoints are implemented and
> wired (see `backend/src/routes/contacts.routes.js`).
>
> **Base URL:** `http://localhost:3000` (or whatever `PORT` you set).
> **Content type:** `application/json` for all bodies and responses.

## Response envelope

Every JSON response uses one of these two shapes:

```jsonc
// success
{ "ok": true, "data": <contact | contact[]> , "count": <int?> }

// failure
{ "ok": false, "error": "<message>", "errors": ["<detail>", "..."]? }
```

`count` is present only on `GET /api/contacts` (list).

---

## Endpoints

### `GET /api/health` — liveness probe
No DB access. Returns:
```json
{ "status": "ok", "service": "agent-contact-backend", "time": "<ISO-8601>" }
```

---

### `GET /api/contacts` — READ (all)
Returns every contact, newest-first.

**200 response**
```json
{
  "ok": true,
  "count": 1,
  "data": [
    {
      "id": "c-1001",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "phone": "+1-555-0101",
      "company": "Analytical Engines Ltd",
      "notes": "Sample record 1",
      "createdAt": "2026-09-23T00:00:00.000Z",
      "updatedAt": "2026-09-23T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/contacts/:id` — READ (one)
**200 response:** `{ "ok": true, "data": { ...contact } }`
**404 response:** `{ "ok": false, "error": "Contact \"<id>\" not found." }`

---

### `POST /api/contacts` — CREATE
**Request body**
| Field     | Type   | Required | Notes                      |
| --------- | ------ | -------- | -------------------------- |
| `name`    | string | ✅       | non-empty                  |
| `email`   | string | ✅       | must look like an email    |
| `phone`   | string | —        | defaults to `""`           |
| `company` | string | —        | defaults to `""`           |
| `notes`   | string | —        | defaults to `""`           |

`id`, `createdAt`, `updatedAt` are generated server-side.

**Example**
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"New Person","email":"new@example.com"}'
```
**201 response:** `{ "ok": true, "data": { ...full contact } }`
**400 response (validation):**
```json
{ "ok": false, "error": "Validation failed",
  "errors": ["\"name\" is required and must be a non-empty string.",
             "\"email\" is required and must be a non-empty string."] }
```

---

### `PUT /api/contacts/:id` — UPDATE
**Request body:** any subset of the mutable fields
(`name`, `email`, `phone`, `company`, `notes`). `name` and `email` are still
validated as required, so include them (or their new values) in every PUT.
`id` and `createdAt` are immutable and ignored if sent.

**200 response:** `{ "ok": true, "data": { ...updated contact } }`
**404:** not found · **400:** validation failed (same shape as POST)

---

### `DELETE /api/contacts/:id` — DELETE
**204 response:** empty body (no content), per REST convention.
**404:** not found.

---

## Error code summary

| Code | Meaning                                                        |
| ---- | -------------------------------------------------------------- |
| 200  | Success (GET, PUT)                                             |
| 201  | Created (POST)                                                 |
| 204  | Deleted, no body (DELETE)                                      |
| 400  | Validation failed / malformed JSON body                        |
| 404  | Unknown route, or contact `:id` not found                      |
| 413  | Request body exceeds the 100kb limit                           |
| 500  | Unexpected server error (safe generic message)                 |

---

## Field reference

| Field       | Type   | Source        | Notes                                   |
| ----------- | ------ | ------------- | --------------------------------------- |
| `id`        | string | server        | `c-<base36>`; immutable                 |
| `name`      | string | client        | required                                 |
| `email`     | string | client        | required, basic format check            |
| `phone`     | string | client        | optional                                 |
| `company`   | string | client        | optional                                 |
| `notes`     | string | client        | optional                                 |
| `createdAt` | string | server (ISO)  | set on CREATE, never changed            |
| `updatedAt` | string | server (ISO)  | set on CREATE and every UPDATE          |
