const Database = require('better-sqlite3');
const path = require('path');

// Allow the DB location to be overridden (e.g. ':memory:' for tests)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'tasks.db');

const db = new Database(dbPath);

// WAL mode improves concurrent read/write performance for file-based DBs.
// Skip it for the in-memory database used in tests, where it has no effect.
if (dbPath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    due_date TEXT NOT NULL
  )
`);

module.exports = db;
