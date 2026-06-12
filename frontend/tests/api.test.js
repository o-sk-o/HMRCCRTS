const { createApiClient } = require('../js/api');

const BASE_URL = 'http://localhost:4000';

describe('taskApi', () => {
  let api;

  beforeEach(() => {
    api = createApiClient(BASE_URL);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  function mockResponse(status, body) {
    return {
      ok: status >= 200 && status < 300,
      status: status,
      text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
    };
  }

  test('getTasks calls GET /tasks and returns the parsed body', async () => {
    const tasks = [{ id: '1', title: 'Test task' }];
    global.fetch.mockResolvedValue(mockResponse(200, tasks));

    const result = await api.getTasks();

    expect(global.fetch).toHaveBeenCalledWith(BASE_URL + '/tasks', { method: 'GET' });
    expect(result).toEqual(tasks);
  });

  test('createTask sends a POST request with JSON body', async () => {
    const newTask = {
      title: 'New task',
      status: 'To Do',
      dueDate: '2026-06-20T09:00:00.000Z',
    };
    const created = { id: '2', ...newTask, description: null };
    global.fetch.mockResolvedValue(mockResponse(201, created));

    const result = await api.createTask(newTask);

    expect(global.fetch).toHaveBeenCalledWith(
      BASE_URL + '/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })
    );
    expect(result).toEqual(created);
  });

  test('updateTaskStatus sends a PATCH request', async () => {
    const updated = { id: '2', status: 'Done' };
    global.fetch.mockResolvedValue(mockResponse(200, updated));

    const result = await api.updateTaskStatus('2', 'Done');

    expect(global.fetch).toHaveBeenCalledWith(
      BASE_URL + '/tasks/2',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Done' }),
      })
    );
    expect(result).toEqual(updated);
  });

  test('deleteTask sends a DELETE request', async () => {
    global.fetch.mockResolvedValue(mockResponse(204));

    await api.deleteTask('2');

    expect(global.fetch).toHaveBeenCalledWith(BASE_URL + '/tasks/2', { method: 'DELETE' });
  });

  test('throws an Error using the API error message on failure', async () => {
    global.fetch.mockResolvedValue(mockResponse(404, { error: 'Task with id "2" not found.' }));

    await expect(api.getTask('2')).rejects.toThrow('Task with id "2" not found.');
  });

  test('throws an Error using validation error messages on failure', async () => {
    global.fetch.mockResolvedValue(
      mockResponse(400, { errors: ['"title" is required and must be a non-empty string.'] })
    );

    await expect(api.createTask({})).rejects.toThrow(
      '"title" is required and must be a non-empty string.'
    );
  });
});
