(function () {
  "use strict";

  const API_BASE = "/api/tasks";
  const taskListEl = document.getElementById("task-list");
  const emptyStateEl = document.getElementById("empty-state");
  const errorEl = document.getElementById("error-message");
  const addForm = document.getElementById("add-task-form");
  const filterButtons = document.querySelectorAll(".btn-filter");

  // Edit modal elements
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-task-form");
  const editIdInput = document.getElementById("edit-task-id");
  const editTitleInput = document.getElementById("edit-title");
  const editDescInput = document.getElementById("edit-description");
  const editStatusInput = document.getElementById("edit-status");
  const editCancelBtn = document.getElementById("edit-cancel");

  let currentFilter = "all";

  // ---------- API helpers ----------

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    setTimeout(function () {
      errorEl.hidden = true;
    }, 5000);
  }

  function hideError() {
    errorEl.hidden = true;
  }

  async function apiFetch(url, options) {
    try {
      var res = await fetch(url, options);
      if (!res.ok) {
        var body = null;
        try {
          body = await res.json();
        } catch (_) {
          // ignore
        }
        var detail = body && body.detail ? body.detail : res.statusText;
        throw new Error(detail);
      }
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      showError(err.message || "Something went wrong");
      throw err;
    }
  }

  // ---------- Render ----------

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusLabel(status) {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return "Pending";
    }
  }

  function createTaskElement(task) {
    var li = document.createElement("li");
    li.className = "task-item status-" + task.status;
    li.dataset.id = task.id;

    var statuses = ["pending", "in_progress", "done"];
    var statusButtonsHtml = statuses
      .map(function (s) {
        var cls = "btn btn-status " + s + (s === task.status ? " active" : "");
        return (
          '<button type="button" class="' +
          cls +
          '" data-status="' +
          s +
          '" aria-label="Set status to ' +
          statusLabel(s) +
          '">' +
          statusLabel(s) +
          "</button>"
        );
      })
      .join("");

    var descHtml = task.description
      ? '<p class="task-description">' + escapeHtml(task.description) + "</p>"
      : "";

    li.innerHTML =
      '<div class="task-header">' +
      '<span class="task-title">' +
      escapeHtml(task.title) +
      "</span>" +
      '<span class="status-badge ' +
      task.status +
      '">' +
      statusLabel(task.status) +
      "</span>" +
      "</div>" +
      descHtml +
      '<div class="task-meta">' +
      '<span class="task-date">' +
      formatDate(task.created_at) +
      "</span>" +
      '<div class="task-actions">' +
      '<div class="status-buttons">' +
      statusButtonsHtml +
      "</div>" +
      '<button type="button" class="btn btn-icon" data-action="edit" aria-label="Edit task">Edit</button>' +
      '<button type="button" class="btn btn-danger" data-action="delete" aria-label="Delete task">Delete</button>' +
      "</div>" +
      "</div>";

    return li;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderTasks(tasks) {
    taskListEl.innerHTML = "";
    if (tasks.length === 0) {
      emptyStateEl.hidden = false;
      emptyStateEl.textContent =
        currentFilter === "all"
          ? "No tasks yet. Add one above!"
          : 'No tasks with status "' + statusLabel(currentFilter) + '".';
      return;
    }
    emptyStateEl.hidden = true;
    tasks.forEach(function (task) {
      taskListEl.appendChild(createTaskElement(task));
    });
  }

  // ---------- Data loading ----------

  async function loadTasks() {
    hideError();
    var url = API_BASE;
    if (currentFilter !== "all") {
      url += "?status=" + encodeURIComponent(currentFilter);
    }
    try {
      var tasks = await apiFetch(url);
      renderTasks(tasks);
    } catch (_) {
      // error already shown
    }
  }

  // ---------- Actions ----------

  async function addTask(title, description) {
    var body = { title: title };
    if (description) body.description = description;
    await apiFetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await loadTasks();
  }

  async function updateTask(id, data) {
    await apiFetch(API_BASE + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await loadTasks();
  }

  async function deleteTask(id) {
    await apiFetch(API_BASE + "/" + id, { method: "DELETE" });
    await loadTasks();
  }

  // ---------- Event handlers ----------

  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = document.getElementById("task-title").value.trim();
    var desc = document.getElementById("task-description").value.trim();
    if (!title) return;
    addTask(title, desc).then(function () {
      addForm.reset();
      document.getElementById("task-title").focus();
    });
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      loadTasks();
    });
  });

  taskListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var li = btn.closest(".task-item");
    if (!li) return;
    var id = li.dataset.id;

    if (btn.dataset.status) {
      updateTask(id, { status: btn.dataset.status });
      return;
    }

    if (btn.dataset.action === "delete") {
      if (confirm("Delete this task?")) {
        deleteTask(id);
      }
      return;
    }

    if (btn.dataset.action === "edit") {
      openEditModal(li, id);
    }
  });

  // ---------- Edit modal ----------

  function openEditModal(li, id) {
    var titleEl = li.querySelector(".task-title");
    var descEl = li.querySelector(".task-description");
    var badgeEl = li.querySelector(".status-badge");

    editIdInput.value = id;
    editTitleInput.value = titleEl ? titleEl.textContent : "";
    editDescInput.value = descEl ? descEl.textContent : "";

    // determine current status from badge class
    var statusClass = "";
    if (badgeEl.classList.contains("in_progress")) statusClass = "in_progress";
    else if (badgeEl.classList.contains("done")) statusClass = "done";
    else statusClass = "pending";
    editStatusInput.value = statusClass;

    editModal.hidden = false;
    editTitleInput.focus();
  }

  function closeEditModal() {
    editModal.hidden = true;
  }

  editCancelBtn.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", function (e) {
    if (e.target === editModal) closeEditModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !editModal.hidden) closeEditModal();
  });

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = editIdInput.value;
    var title = editTitleInput.value.trim();
    var desc = editDescInput.value.trim();
    var status = editStatusInput.value;
    if (!title) return;
    updateTask(id, { title: title, description: desc, status: status }).then(
      closeEditModal
    );
  });

  // ---------- Init ----------

  loadTasks();
})();
