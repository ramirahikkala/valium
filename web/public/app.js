(function () {
  "use strict";

  var API_BASE = "/api/tasks";
  var API_LISTS = "/api/lists";
  var API_AUTH = "/api/auth";

  // DOM elements — login
  var loginScreen = document.getElementById("login-screen");
  var loginError = document.getElementById("login-error");
  var googleSigninBtn = document.getElementById("google-signin-btn");

  // DOM elements — app
  var appContainer = document.getElementById("app-container");
  var userAvatar = document.getElementById("user-avatar");
  var userName = document.getElementById("user-name");
  var signOutBtn = document.getElementById("sign-out-btn");

  // DOM elements — lists
  var listTabs = document.getElementById("list-tabs");
  var addListForm = document.getElementById("add-list-form");
  var newListNameInput = document.getElementById("new-list-name");

  // DOM elements — tasks
  var taskListEl = document.getElementById("task-list");
  var emptyStateEl = document.getElementById("empty-state");
  var errorEl = document.getElementById("error-message");
  var addForm = document.getElementById("add-task-form");
  var filterButtons = document.querySelectorAll(".btn-filter");

  // Edit modal elements
  var editModal = document.getElementById("edit-modal");
  var editForm = document.getElementById("edit-task-form");
  var editIdInput = document.getElementById("edit-task-id");
  var editTitleInput = document.getElementById("edit-title");
  var editDescInput = document.getElementById("edit-description");
  var editStatusInput = document.getElementById("edit-status");
  var editListInput = document.getElementById("edit-list");
  var editCancelBtn = document.getElementById("edit-cancel");
  var editAlarmAtInput = document.getElementById("edit-alarm-at");
  var editAlarmRecurrenceInput = document.getElementById("edit-alarm-recurrence");
  var editAlarmEnabledInput = document.getElementById("edit-alarm-enabled");

  // State
  var authToken = localStorage.getItem("authToken") || null;
  var currentUser = null;
  var lists = [];
  var currentListId = null;
  var currentFilter = "all";

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
      options = options || {};
      options.headers = options.headers || {};
      if (authToken) {
        options.headers["Authorization"] = "Bearer " + authToken;
      }
      var res = await fetch(url, options);
      if (res.status === 401) {
        // Token expired or invalid — redirect to login
        signOut();
        return null;
      }
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

  // ---------- Auth ----------

  function showLogin() {
    loginScreen.hidden = false;
    appContainer.hidden = true;
  }

  function showApp() {
    loginScreen.hidden = true;
    appContainer.hidden = false;
  }

  function signOut() {
    authToken = null;
    currentUser = null;
    currentListId = null;
    lists = [];
    localStorage.removeItem("authToken");
    showLogin();
    // Re-render Google button so it's clickable again
    initGoogleSignIn();
  }

  async function handleGoogleCredential(response) {
    try {
      var data = await apiFetch(API_AUTH + "/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!data) return;
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem("authToken", authToken);
      loginError.hidden = true;
      await initApp();
    } catch (err) {
      loginError.textContent = "Sign-in failed: " + (err.message || "Unknown error");
      loginError.hidden = false;
    }
  }

  async function checkAuthAndInit() {
    if (!authToken) {
      showLogin();
      return;
    }
    try {
      var user = await apiFetch(API_AUTH + "/me");
      if (!user) return; // 401 handled by apiFetch
      currentUser = user;
      await initApp();
    } catch (_) {
      showLogin();
    }
  }

  function initGoogleSignIn() {
    // Wait for GIS library to load
    if (typeof google === "undefined" || !google.accounts) {
      setTimeout(initGoogleSignIn, 200);
      return;
    }
    // Fetch client ID from backend
    fetch(API_AUTH + "/config")
      .then(function (res) { return res.json(); })
      .then(function (config) {
        if (!config.client_id) {
          loginError.textContent = "Google Client ID not configured on server";
          loginError.hidden = false;
          return;
        }
        google.accounts.id.initialize({
          client_id: config.client_id,
          callback: handleGoogleCredential,
        });
        // Clear previous button content
        googleSigninBtn.innerHTML = "";
        google.accounts.id.renderButton(googleSigninBtn, {
          theme: "outline",
          size: "large",
          width: 280,
          text: "signin_with",
        });
      })
      .catch(function () {
        loginError.textContent = "Could not load auth configuration";
        loginError.hidden = false;
      });
  }

  signOutBtn.addEventListener("click", signOut);

  // ---------- Lists ----------

  function renderListTabs() {
    listTabs.innerHTML = "";
    lists.forEach(function (lst) {
      var tab = document.createElement("button");
      tab.className = "list-tab" + (lst.id === currentListId ? " active" : "");
      tab.dataset.listId = lst.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", lst.id === currentListId ? "true" : "false");
      tab.textContent = lst.name;

      // Delete button (don't allow deleting last list)
      if (lists.length > 1) {
        var delBtn = document.createElement("span");
        delBtn.className = "list-tab-delete";
        delBtn.textContent = "\u00d7";
        delBtn.title = "Delete list";
        delBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (confirm('Delete list "' + lst.name + '" and all its tasks?')) {
            deleteList(lst.id);
          }
        });
        tab.appendChild(delBtn);
      }

      tab.addEventListener("click", function () {
        currentListId = lst.id;
        renderListTabs();
        loadTasks();
      });

      listTabs.appendChild(tab);
    });
  }

  async function loadLists() {
    try {
      lists = await apiFetch(API_LISTS);
      if (!lists) return;
      // If no current list selected, pick the first one
      if (!currentListId && lists.length > 0) {
        currentListId = lists[0].id;
      }
      renderListTabs();
      populateEditListSelect();
    } catch (_) {
      // error already shown
    }
  }

  async function createList(name) {
    try {
      var newList = await apiFetch(API_LISTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      if (!newList) return;
      currentListId = newList.id;
      await loadLists();
      await loadTasks();
    } catch (_) {
      // error already shown
    }
  }

  async function deleteList(listId) {
    try {
      await apiFetch(API_LISTS + "/" + listId, { method: "DELETE" });
      // If we deleted the current list, switch to the first available
      if (currentListId === listId) {
        currentListId = null;
      }
      await loadLists();
      await loadTasks();
    } catch (_) {
      // error already shown
    }
  }

  function populateEditListSelect() {
    editListInput.innerHTML = "";
    lists.forEach(function (lst) {
      var opt = document.createElement("option");
      opt.value = lst.id;
      opt.textContent = lst.name;
      editListInput.appendChild(opt);
    });
  }

  addListForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = newListNameInput.value.trim();
    if (!name) return;
    createList(name).then(function () {
      newListNameInput.value = "";
    });
  });

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
    li.dataset.listId = task.list_id || "";

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

    var alarmHtml = "";
    if (task.has_alarm && task.alarm) {
      var alarmIcon = task.alarm.enabled ? "\uD83D\uDD14" : "\uD83D\uDD15";
      var alarmTime = formatDate(task.alarm.alarm_at);
      var recLabel = task.alarm.recurrence !== "none" ? " (" + task.alarm.recurrence + ")" : "";
      alarmHtml = '<span class="alarm-indicator' + (task.alarm.enabled ? "" : " disabled") +
        '" title="Alarm: ' + alarmTime + recLabel + '">' + alarmIcon + '</span>';
    }

    var descHtml = task.description
      ? '<p class="task-description">' + escapeHtml(task.description) + "</p>"
      : "";

    li.innerHTML =
      '<span class="drag-handle" aria-label="Drag to reorder">&#x2630;</span>' +
      '<div class="task-content">' +
      '<div class="task-header">' +
      '<span class="task-title">' +
      escapeHtml(task.title) +
      "</span>" +
      alarmHtml +
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
      "</div>" +
      "</div>";

    return li;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var sortableInstance = null;

  function initSortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
    }
    sortableInstance = new Sortable(taskListEl, {
      handle: ".drag-handle",
      animation: 150,
      ghostClass: "sortable-ghost",
      onEnd: function () {
        var items = taskListEl.querySelectorAll(".task-item");
        var ids = [];
        items.forEach(function (item) {
          ids.push(parseInt(item.dataset.id, 10));
        });
        apiFetch(API_BASE + "/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_ids: ids }),
        });
      },
    });
  }

  function renderTasks(tasks) {
    taskListEl.innerHTML = "";
    if (tasks.length === 0) {
      emptyStateEl.hidden = false;
      emptyStateEl.textContent =
        currentFilter === "all"
          ? "No tasks yet. Add one above!"
          : "No tasks matching the current filter.";
      return;
    }
    emptyStateEl.hidden = true;
    tasks.forEach(function (task) {
      taskListEl.appendChild(createTaskElement(task));
    });
    initSortable();
  }

  // ---------- Data loading ----------

  async function loadTasks() {
    if (!currentListId) {
      renderTasks([]);
      return;
    }
    hideError();
    var params = ["list_id=" + currentListId];
    if (currentFilter !== "all") {
      params.push("status=" + encodeURIComponent(currentFilter));
    }
    var url = API_BASE + "?" + params.join("&");
    try {
      var tasks = await apiFetch(url);
      if (tasks) renderTasks(tasks);
    } catch (_) {
      // error already shown
    }
  }

  // ---------- Actions ----------

  async function addTask(title, description) {
    var body = { title: title, list_id: currentListId };
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
    if (!currentListId) {
      showError("Please select a list first");
      return;
    }
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

    // set list
    populateEditListSelect();
    editListInput.value = li.dataset.listId || "";

    // Load alarm data
    editAlarmAtInput.value = "";
    editAlarmRecurrenceInput.value = "none";
    editAlarmEnabledInput.checked = true;

    apiFetch(API_BASE + "/" + id + "/alarm")
      .then(function (alarm) {
        if (alarm) {
          // Convert UTC ISO to local datetime-local format
          var dt = new Date(alarm.alarm_at);
          var local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
          editAlarmAtInput.value = local.toISOString().slice(0, 16);
          editAlarmRecurrenceInput.value = alarm.recurrence || "none";
          editAlarmEnabledInput.checked = alarm.enabled;
        }
      })
      .catch(function () {
        // No alarm set — fields stay empty
      });

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

  async function saveAlarm(taskId) {
    var alarmAt = editAlarmAtInput.value;
    if (!alarmAt) {
      // No datetime → delete alarm if it exists
      try {
        await apiFetch(API_BASE + "/" + taskId + "/alarm", { method: "DELETE" });
      } catch (_) {
        // 404 is fine — no alarm to delete
      }
      return;
    }

    var alarmData = {
      alarm_at: new Date(alarmAt).toISOString(),
      recurrence: editAlarmRecurrenceInput.value,
      enabled: editAlarmEnabledInput.checked,
    };

    // Try PUT first (update existing), fall back to POST (create new)
    try {
      await apiFetch(API_BASE + "/" + taskId + "/alarm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alarmData),
      });
    } catch (_) {
      try {
        await apiFetch(API_BASE + "/" + taskId + "/alarm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alarmData),
        });
      } catch (_) {
        // error already shown
      }
    }
  }

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = editIdInput.value;
    var title = editTitleInput.value.trim();
    var desc = editDescInput.value.trim();
    var status = editStatusInput.value;
    var listId = editListInput.value ? parseInt(editListInput.value, 10) : null;
    if (!title) return;
    updateTask(id, {
      title: title,
      description: desc,
      status: status,
      list_id: listId,
    })
      .then(function () { return saveAlarm(id); })
      .then(function () { closeEditModal(); return loadTasks(); });
  });

  // ---------- App init ----------

  async function initApp() {
    // Set user info in header
    if (currentUser) {
      userName.textContent = currentUser.name;
      if (currentUser.picture) {
        userAvatar.src = currentUser.picture;
        userAvatar.alt = currentUser.name;
        userAvatar.hidden = false;
      } else {
        userAvatar.hidden = true;
      }
    }
    showApp();
    await loadLists();
    await loadTasks();
  }

  // ---------- Bootstrap ----------

  initGoogleSignIn();
  checkAuthAndInit();
})();
