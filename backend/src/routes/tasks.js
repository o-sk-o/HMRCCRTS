const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');

const router = express.Router();

const VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

/**
 * Validate a task payload.
 * @param {object} body - request body
 * @param {object} [options]
 * @param {boolean} [options.partial=false] - if true, only validate fields that are present
 * @returns {string[]} array of error messages (empty if valid)
 */
function validateTask(body, { partial = false } = {}) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object.'];
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
  if (!partial || hasTitle) {
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      errors.push('"title" is required and must be a non-empty string.');
    }
  }

  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');
  if (!partial || hasStatus) {
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      errors.push(`"status" is required and must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
  }

  const hasDueDate = Object.prototype.hasOwnProperty.call(body, 'dueDate');
  if (!partial || hasDueDate) {
    if (!body.dueDate || isNaN(Date.parse(body.dueDate))) {
      errors.push('"dueDate" is required and must be a valid date/time (ISO 8601 recommended).');
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(body, 'description') &&
    body.description !== null &&
    typeof body.description !== 'string'
  ) {
    errors.push('"description" must be a string if provided.');
  }

  return errors;
}

function toApiTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
  };
}

// Create a task
router.post('/', (req, res, next) => {
  try {
    const errors = validateTask(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const id = randomUUID();
    const { title, status, dueDate } = req.body;
    const description =
      req.body.description === undefined ? null : req.body.description;

    db.prepare(
      `INSERT INTO tasks (id, title, description, status, due_date)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, title.trim(), description, status, new Date(dueDate).toISOString());

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(toApiTask(created));
  } catch (err) {
    next(err);
  }
});

// Retrieve all tasks
router.get('/', (req, res, next) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY due_date ASC').all();
    res.json(tasks.map(toApiTask));
  } catch (err) {
    next(err);
  }
});

// Retrieve a single task by id
router.get('/:id', (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: `Task with id "${req.params.id}" not found.` });
    }
    res.json(toApiTask(task));
  } catch (err) {
    next(err);
  }
});

// Update the status of a task
router.patch('/:id', (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: `Task with id "${req.params.id}" not found.` });
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'status')) {
      return res.status(400).json({ errors: ['"status" is required in the request body.'] });
    }

    if (!VALID_STATUSES.includes(req.body.status)) {
      return res
        .status(400)
        .json({ errors: [`"status" must be one of: ${VALID_STATUSES.join(', ')}.`] });
    }

    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(req.body.status, req.params.id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(toApiTask(updated));
  } catch (err) {
    next(err);
  }
});

// Delete a task
router.delete('/:id', (req, res, next) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: `Task with id "${req.params.id}" not found.` });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.VALID_STATUSES = VALID_STATUSES;
module.exports.validateTask = validateTask;
