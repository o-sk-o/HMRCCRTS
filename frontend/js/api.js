(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.taskApi = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * Create an API client for the task manager backend.
   * @param {string} baseUrl - e.g. "http://localhost:4000"
   */
  function createApiClient(baseUrl) {
    async function request(path, options) {
      const res = await fetch(baseUrl + path, options);

      let body = null;
      const text = await res.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (e) {
          body = null;
        }
      }

      if (!res.ok) {
        const message =
          (body && body.errors && body.errors.join(', ')) ||
          (body && body.error) ||
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      return body;
    }

    return {
      getTasks: function () {
        return request('/tasks', { method: 'GET' });
      },

      getTask: function (id) {
        return request('/tasks/' + encodeURIComponent(id), { method: 'GET' });
      },

      createTask: function (task) {
        return request('/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        });
      },

      updateTaskStatus: function (id, status) {
        return request('/tasks/' + encodeURIComponent(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status }),
        });
      },

      deleteTask: function (id) {
        return request('/tasks/' + encodeURIComponent(id), { method: 'DELETE' });
      },
    };
  }

  return { createApiClient: createApiClient };
});
