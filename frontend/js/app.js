(function () {
  var API_BASE = window.API_BASE_URL || 'http://localhost:4000';
  var api = window.taskApi.createApiClient(API_BASE);
  var helpers = window.taskHelpers;

  var taskListEl = document.getElementById('task-list');
  var formEl = document.getElementById('task-form');
  var errorEl = document.getElementById('form-error');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  function renderTasks(tasks) {
    taskListEl.innerHTML = '';

    if (!tasks.length) {
      taskListEl.innerHTML =
        '<p class="empty-state">No tasks yet. Add one using the form above.</p>';
      return;
    }

    tasks.forEach(function (task) {
      var card = document.createElement('article');
      card.className = 'task-card';
      card.setAttribute('data-status', task.status);

      var optionsHtml = helpers.VALID_STATUSES.map(function (status) {
        var selected = status === task.status ? ' selected' : '';
        return (
          '<option value="' +
          helpers.escapeHtml(status) +
          '"' +
          selected +
          '>' +
          helpers.escapeHtml(status) +
          '</option>'
        );
      }).join('');

      card.innerHTML =
        '<div class="task-card__main">' +
        '<h3 class="task-card__title">' +
        helpers.escapeHtml(task.title) +
        '</h3>' +
        (task.description
          ? '<p class="task-card__description">' +
            helpers.escapeHtml(task.description) +
            '</p>'
          : '') +
        '<p class="task-card__due">Due: ' +
        helpers.escapeHtml(helpers.formatDueDate(task.dueDate)) +
        '</p>' +
        '</div>' +
        '<div class="task-card__actions">' +
        '<label class="visually-hidden" for="status-' +
        task.id +
        '">Status for ' +
        helpers.escapeHtml(task.title) +
        '</label>' +
        '<select id="status-' +
        task.id +
        '" class="status-select" data-id="' +
        task.id +
        '">' +
        optionsHtml +
        '</select>' +
        '<button type="button" class="delete-btn" data-id="' +
        task.id +
        '">Delete</button>' +
        '</div>';

      taskListEl.appendChild(card);
    });
  }

  function refreshTasks() {
    api
      .getTasks()
      .then(renderTasks)
      .catch(function (err) {
        showError('Could not load tasks: ' + err.message);
      });
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var title = document.getElementById('title').value.trim();
    var description = document.getElementById('description').value.trim();
    var status = document.getElementById('status').value;
    var dueDateLocal = document.getElementById('dueDate').value;
    var dueDate = helpers.toIsoDateTime(dueDateLocal);

    var formErrors = helpers.validateTaskForm({
      title: title,
      status: status,
      dueDate: dueDate,
    });

    if (formErrors.length) {
      showError(formErrors.join(' '));
      return;
    }

    api
      .createTask({
        title: title,
        description: description || undefined,
        status: status,
        dueDate: dueDate,
      })
      .then(function () {
        formEl.reset();
        document.getElementById('status').value = 'To Do';
        refreshTasks();
      })
      .catch(function (err) {
        showError(err.message);
      });
  });

  taskListEl.addEventListener('change', function (e) {
    if (e.target.classList.contains('status-select')) {
      clearError();
      api
        .updateTaskStatus(e.target.getAttribute('data-id'), e.target.value)
        .then(refreshTasks)
        .catch(function (err) {
          showError(err.message);
          refreshTasks();
        });
    }
  });

  taskListEl.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
      clearError();
      var id = e.target.getAttribute('data-id');
      if (!window.confirm('Delete this task?')) return;
      api
        .deleteTask(id)
        .then(refreshTasks)
        .catch(function (err) {
          showError(err.message);
        });
    }
  });

  refreshTasks();
})();
