HMCTS Caseworker Task Manager


A small full-stack application that lets HMCTS caseworkers create, view,
update, and delete task.

Stack
Layer	Tech
Backend	Node.js, Express, SQLite (`better-sqlite3`)
Frontend	Vanilla HTML/CSS/JavaScript (no build step)
Testing	Jest (+ Supertest for the API)

A plain JS / Node stack was chosen to keep the project lightweight, fast to
set up, and easy to test — there's no build tooling, framework, or
compilation step on either side.


Project structure
```
.
├── backend/    # Express REST API + SQLite database
└── frontend/   # Static HTML/CSS/JS UI that consumes the API
```
Each folder has its own `README.md` with more detail (the backend one
documents every API endpoint).
Quick start
You'll need Node.js 18+ and npm.
1. Backend
```bash
cd backend
npm install
npm test     # run the test suite
npm start    # starts the API on http://localhost:4000
```
2. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm test     # run the test suite
npm start    # serves the UI on http://localhost:5000
```
Then open http://localhost:5000 in your browser. The page calls the
backend at `http://localhost:4000` by default (configurable via
`window.API_BASE_URL` in `frontend/index.html`).

Features

Backend API
Create a task (title, optional description, status, due date/time)
Retrieve a task by ID
Retrieve all tasks
Update a task's status
Delete a task
Input validation and consistent error responses
Unit/integration tests covering success and error paths

Frontend

Form to add a task, with client-side validation
List of tasks showing title, description, due date, and status
Inline status updates via a dropdown
Delete a task with a confirmation prompt
Unit tests for validation/formatting helpers and the API client
Design decisions and assumptions

Status values are fixed to `To Do`, `In Progress`, `Done`. 
This keeps
both the API contract and the UI simple, while covering the basic
workflow a caseworker needs.

SQLite is used for persistence so the project runs with no external
database setup. The data access layer is isolated in `backend/src/db.js`,
so swapping in PostgreSQL/MySQL later would only require changes there
and in the SQL statements in `backend/src/routes/tasks.js`.

Dates are stored and transmitted as ISO 8601 UTC strings; the
frontend converts to/from the browser's local timezone for display and
input.

No frontend framework — a small vanilla JS app keeps the test setup
trivial (plain Jest, no DOM testing library needed for the parts that are
unit tested) while still being readable and maintainable at this scale.

Possible next steps

- Add filtering/sorting in the UI (e.g. by status or due date)

- Add pagination if the task list grows large

- Add authentication if this were exposed beyond a single caseworker

- Swap SQLite for a managed database and add a migrations tool for a real
deployment
