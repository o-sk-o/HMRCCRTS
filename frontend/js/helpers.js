(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.taskHelpers = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var VALID_STATUSES = ['To Do', 'In Progress', 'Done'];

  /**
   * Validate task form data before sending it to the API.
   * @param {{title: string, status: string, dueDate: string}} data
   * @returns {string[]} array of error messages (empty if valid)
   */
  function validateTaskForm(data) {
    var errors = [];

    if (!data || !data.title || !data.title.trim()) {
      errors.push('Please enter a title.');
    }

    if (!data || !data.status || VALID_STATUSES.indexOf(data.status) === -1) {
      errors.push('Please choose a valid status.');
    }

    if (!data || !data.dueDate) {
      errors.push('Please choose a due date and time.');
    } else if (isNaN(Date.parse(data.dueDate))) {
      errors.push('Please enter a valid due date and time.');
    }

    return errors;
  }

  /**
   * Format an ISO date string for display in the user's local timezone.
   * @param {string} isoString
   * @returns {string}
   */
  function formatDueDate(isoString) {
    var date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Convert a <input type="datetime-local"> value (local time, no timezone)
   * into an ISO 8601 UTC string for the API.
   * @param {string} localDateTimeValue e.g. "2026-06-20T09:00"
   * @returns {string|null}
   */
  function toIsoDateTime(localDateTimeValue) {
    if (!localDateTimeValue) return null;
    var date = new Date(localDateTimeValue);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  /**
   * Escape a string for safe insertion into HTML.
   * @param {string} value
   * @returns {string}
   */
  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    VALID_STATUSES: VALID_STATUSES,
    validateTaskForm: validateTaskForm,
    formatDueDate: formatDueDate,
    toIsoDateTime: toIsoDateTime,
    escapeHtml: escapeHtml,
  };
});
