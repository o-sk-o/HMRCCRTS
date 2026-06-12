// Use an in-memory database for tests so they don't touch tasks.db on disk
// and each test run starts from a clean slate.
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/app');
const { validateTask, VALID_STATUSES } = require('../src/routes/tasks');

describe('validateTask', () => {
  test('returns no errors for a valid task', () => {
    const errors = validateTask({
      title: 'Review case file',
      status: 'To Do',
      dueDate: '2026-06-20T09:00:00.000Z',
    });
    expect(errors).toEqual([]);
  });

  test('requires title, status and dueDate', () => {
    const errors = validateTask({});
    expect(errors.length).toBe(3);
  });

  test('rejects an invalid status', () => {
    const errors = validateTask({
      title: 'Task',
      status: 'Not a real status',
      dueDate: '2026-06-20T09:00:00.000Z',
    });
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining('"status"')])
    );
  });

  test('rejects an invalid dueDate', () => {
    const errors = validateTask({
      title: 'Task',
      status: 'To Do',
      dueDate: 'not-a-date',
    });
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining('"dueDate"')])
    );
  });
});

describe('Tasks API', () => {
  const validTask = {
    title: 'Review case file',
    description: 'Check evidence bundle before hearing',
    status: 'To Do',
    dueDate: '2026-06-20T09:00:00.000Z',
  };

  let createdId;

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /tasks creates a new task', async () => {
    const res = await request(app).post('/tasks').send(validTask);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: validTask.title,
      description: validTask.description,
      status: validTask.status,
    });
    expect(res.body.id).toBeDefined();

    createdId = res.body.id;
  });

  test('POST /tasks rejects an invalid payload', async () => {
    const res = await request(app).post('/tasks').send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /tasks works without an optional description', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Task with no description',
      status: 'To Do',
      dueDate: '2026-07-01T10:00:00.000Z',
    });

    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  test('GET /tasks returns an array containing the created task', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((task) => task.id === createdId)).toBe(true);
  });

  test('GET /tasks/:id returns the matching task', async () => {
    const res = await request(app).get(`/tasks/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.title).toBe(validTask.title);
  });

  test('GET /tasks/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/tasks/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('PATCH /tasks/:id updates the status', async () => {
    const res = await request(app)
      .patch(`/tasks/${createdId}`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  test('PATCH /tasks/:id rejects an invalid status', async () => {
    const res = await request(app)
      .patch(`/tasks/${createdId}`)
      .send({ status: 'Not a real status' });

    expect(res.status).toBe(400);
    expect(VALID_STATUSES).not.toContain('Not a real status');
  });

  test('PATCH /tasks/:id returns 404 for an unknown id', async () => {
    const res = await request(app)
      .patch('/tasks/does-not-exist')
      .send({ status: 'Done' });

    expect(res.status).toBe(404);
  });

  test('DELETE /tasks/:id removes the task', async () => {
    const res = await request(app).delete(`/tasks/${createdId}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/tasks/${createdId}`);
    expect(getRes.status).toBe(404);
  });

  test('DELETE /tasks/:id returns 404 for an unknown id', async () => {
    const res = await request(app).delete(`/tasks/${createdId}`);
    expect(res.status).toBe(404);
  });
});
