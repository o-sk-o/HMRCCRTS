const {
  validateTaskForm,
  formatDueDate,
  toIsoDateTime,
  escapeHtml,
  VALID_STATUSES,
} = require('../js/helpers');

describe('validateTaskForm', () => {
  test('returns no errors for valid data', () => {
    const errors = validateTaskForm({
      title: 'Review case file',
      status: 'To Do',
      dueDate: '2026-06-20T09:00:00.000Z',
    });
    expect(errors).toEqual([]);
  });

  test('requires a title', () => {
    const errors = validateTaskForm({
      title: '   ',
      status: 'To Do',
      dueDate: '2026-06-20T09:00:00.000Z',
    });
    expect(errors).toContain('Please enter a title.');
  });

  test('requires a valid status', () => {
    const errors = validateTaskForm({
      title: 'Task',
      status: 'Unknown',
      dueDate: '2026-06-20T09:00:00.000Z',
    });
    expect(errors).toContain('Please choose a valid status.');
  });

  test('requires a due date', () => {
    const errors = validateTaskForm({
      title: 'Task',
      status: 'To Do',
      dueDate: null,
    });
    expect(errors).toContain('Please choose a due date and time.');
  });

  test('rejects an unparsable due date', () => {
    const errors = validateTaskForm({
      title: 'Task',
      status: 'To Do',
      dueDate: 'not-a-date',
    });
    expect(errors).toContain('Please enter a valid due date and time.');
  });
});

describe('formatDueDate', () => {
  test('formats a valid ISO date', () => {
    const formatted = formatDueDate('2026-06-20T09:00:00.000Z');
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/2026/);
  });

  test('returns the original string if the date is invalid', () => {
    expect(formatDueDate('not-a-date')).toBe('not-a-date');
  });
});

describe('toIsoDateTime', () => {
  test('converts a datetime-local value to an ISO string', () => {
    const iso = toIsoDateTime('2026-06-20T09:00');
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('returns null for an empty value', () => {
    expect(toIsoDateTime('')).toBeNull();
  });

  test('returns null for an invalid value', () => {
    expect(toIsoDateTime('not-a-date')).toBeNull();
  });
});

describe('escapeHtml', () => {
  test('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });

  test('returns an empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('VALID_STATUSES', () => {
  test('contains the expected statuses', () => {
    expect(VALID_STATUSES).toEqual(['To Do', 'In Progress', 'Done']);
  });
});
