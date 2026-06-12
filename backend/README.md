# HMCTS Task Manager – Backend

A small REST API that lets caseworkers create, view, update, and delete tasks.

Built with **Node.js**, **Express**, and **SQLite** (via `better-sqlite3`).

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Install dependencies

```bash
cd backend
npm install
```

### Run the server

```bash
npm start
```

The API will be available at `http://localhost:4000`. A SQLite database file
(`tasks.db`) is created automatically in the `backend` folder on first run.

To use a different port:

```bash
PORT=5000 npm start
```

### Run the tests

```bash
npm test
```

Tests run against an in-memory SQLite database, so they don't touch
`tasks.db` and can be run repeatedly without side effects.

## Data model

A task has the following shape:

```json
{
  "id": "c1a9c1ce-1234-4a8b-9f3e-abc123456789",
  "title": "Review case file",
  "description": "Check evidence bundle before hearing",
  "status": "To Do",
  "dueDate": "2026-06-20T09:00:00.000Z"
}
```

| Field         | Type   | Required | Notes                                              |
|---------------|--------|----------|----------------------------------------------------|
| `id`          | string | generated | UUID, assigned by the server                       |
| `title`       | string | yes      | Non-empty                                          |
| `description` | string | no       | Defaults to `null`                                  |
| `status`      | string | yes      | One of `To Do`, `In Progress`, `Done`              |
| `dueDate`     | string | yes      | Date/time, stored and returned as ISO 8601 (UTC)   |

## API endpoints

Base URL: `http://localhost:4000`

### `GET /health`

Simple health check.

**Response** `200 OK`

```json
{ "status": "ok" }
```

---

### `POST /tasks`

Create a new task.

**Request body**

```json
{
  "title": "Review case file",
  "description": "Check evidence bundle before hearing",
  "status": "To Do",
  "dueDate": "2026-06-20T09:00:00.000Z"
}
```

`description` is optional.

**Responses**

- `201 Created` – returns the created task (including its generated `id`)
- `400 Bad Request` – validation failed, e.g.:

```json
{ "errors": ["\"title\" is required and must be a non-empty string."] }
```

---

### `GET /tasks`

Retrieve all tasks, ordered by due date (soonest first).

**Response** `200 OK`

```json
[
  {
    "id": "c1a9c1ce-1234-4a8b-9f3e-abc123456789",
    "title": "Review case file",
    "description": "Check evidence bundle before hearing",
    "status": "To Do",
    "dueDate": "2026-06-20T09:00:00.000Z"
  }
]
```

---

### `GET /tasks/:id`

Retrieve a single task by its id.

**Responses**

- `200 OK` – returns the task
- `404 Not Found`:

```json
{ "error": "Task with id \"...\" not found." }
```

---

### `PATCH /tasks/:id`

Update the status of a task.

**Request body**

```json
{ "status": "In Progress" }
```

`status` must be one of `To Do`, `In Progress`, `Done`.

**Responses**

- `200 OK` – returns the updated task
- `400 Bad Request` – missing or invalid status
- `404 Not Found` – task does not exist

---

### `DELETE /tasks/:id`

Delete a task.

**Responses**

- `204 No Content` – deleted successfully
- `404 Not Found` – task does not exist

## Project structure

```
backend/
├── src/
│   ├── app.js          # Express app, middleware, error handling
│   ├── server.js        # Entry point – starts the HTTP server
│   ├── db.js            # SQLite connection and schema
│   └── routes/
│       └── tasks.js     # Task CRUD routes and validation
├── tests/
│   └── tasks.test.js    # Jest + Supertest tests
└── package.json
```

## Design notes / assumptions

- **Status values** are restricted to `To Do`, `In Progress`, `Done` to keep
  the UI simple and consistent. These could be made configurable if needed.
- **Dates** are stored and returned in ISO 8601 / UTC for consistency; the
  frontend converts to the user's local time for display.
- **SQLite** was chosen for simplicity and zero external setup — the whole
  app can run with `npm install && npm start`. For a production deployment
  this could be swapped for PostgreSQL with minimal changes, since all
  database access goes through `db.js`.
- **CORS** is enabled so the frontend (served separately) can call the API
  during local development.
