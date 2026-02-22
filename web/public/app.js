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
    stopAllGymTimers();
    localStorage.removeItem("gymActiveSessionId");
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
    return d.toLocaleDateString("fi-FI", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
    if (e.key === "Escape") {
      if (!editModal.hidden) closeEditModal();
      if (!gymModal.hidden) closeGymModal();
    }
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

  // ========== GYM MODULE ==========

  var GYM_API = "/api/gym";

  // Gym state
  var gymExerciseLibrary = [];   // global exercise library
  var gymActiveSession = null;
  var gymActiveExercises = [];
  var gymSetsDone = {};          // program_exercise_id → sets done count
  var gymExerciseTimers = {};
  var gymExerciseStates = {};    // program_exercise_id → "idle" | "resting" | "done"
  var gymWorkoutWeights = {};    // program_exercise_id → current weight override
  var gymWorkoutRests = {};      // program_exercise_id → current rest override
  var gymCurrentTab = "programs";
  var gymPrograms = [];

  // Gym DOM elements — view toggle
  var viewTabTasks = document.getElementById("view-tab-tasks");
  var viewTabGym = document.getElementById("view-tab-gym");
  var tasksView = document.getElementById("tasks-view");
  var gymView = document.getElementById("gym-view");
  var gymTabButtons = document.querySelectorAll(".gym-tab");

  // Gym DOM elements — sections
  var gymProgramsSection = document.getElementById("gym-programs");
  var gymWorkoutSection = document.getElementById("gym-workout");
  var gymHistorySection = document.getElementById("gym-history");

  // Gym DOM elements — programs
  var programsListEl = document.getElementById("programs-list");
  var addProgramBtn = document.getElementById("add-program-btn");
  var addProgramFormWrap = document.getElementById("add-program-form-wrap");
  var addProgramForm = document.getElementById("add-program-form");
  var newProgramNameInput = document.getElementById("new-program-name");
  var cancelAddProgramBtn = document.getElementById("cancel-add-program");
  var showArchivedCheckbox = document.getElementById("show-archived");

  // Gym DOM elements — workout
  var workoutIdleEl = document.getElementById("workout-idle");
  var workoutActiveEl = document.getElementById("workout-active");
  var workoutProgramSelect = document.getElementById("workout-program-select");
  var startWorkoutBtn = document.getElementById("start-workout-btn");
  var completeWorkoutBtn = document.getElementById("complete-workout-btn");
  var activeProgramNameEl = document.getElementById("active-program-name");
  var workoutStartTimeEl = document.getElementById("workout-start-time");
  var activeExercisesEl = document.getElementById("active-exercises");

  // Gym DOM elements — history
  var sessionsListEl = document.getElementById("sessions-list");

  // Gym DOM elements — exercise library
  var addLibraryExerciseBtn = document.getElementById("add-library-exercise-btn");
  var addLibraryExerciseForm = document.getElementById("add-library-exercise-form");
  var newLibraryExerciseNameInput = document.getElementById("new-library-exercise-name");
  var cancelLibraryExerciseBtn = document.getElementById("cancel-library-exercise-btn");
  var libraryExercisesListEl = document.getElementById("library-exercises-list");

  // Gym DOM elements — modal
  var gymModal = document.getElementById("gym-modal");
  var gymModalTitle = document.getElementById("gym-modal-title");
  var gymModalForm = document.getElementById("gym-modal-form");
  var gymModalProgramId = document.getElementById("gym-modal-program-id");
  var gymModalExerciseId = document.getElementById("gym-modal-exercise-id");
  var gymModalSelectGroup = document.getElementById("gym-modal-select-group");
  var gymModalNameDisplay = document.getElementById("gym-modal-name-display");
  var gymModalExerciseNameEl = document.getElementById("gym-modal-exercise-name");
  var gymExSelectInput = document.getElementById("gym-ex-select");
  var gymExWeightInput = document.getElementById("gym-ex-weight");
  var gymExSetsInput = document.getElementById("gym-ex-sets");
  var gymExRepsInput = document.getElementById("gym-ex-reps");
  var gymExRestInput = document.getElementById("gym-ex-rest");
  var gymModalCancelBtn = document.getElementById("gym-modal-cancel");

  // ---------- View toggle ----------

  viewTabTasks.addEventListener("click", function () { switchToView("tasks"); });
  viewTabGym.addEventListener("click", function () { switchToView("gym"); });

  function switchToView(view) {
    if (view === "gym") {
      tasksView.hidden = true;
      gymView.hidden = false;
      viewTabTasks.classList.remove("active");
      viewTabGym.classList.add("active");
      switchGymTab(gymCurrentTab);
    } else {
      tasksView.hidden = false;
      gymView.hidden = true;
      viewTabTasks.classList.add("active");
      viewTabGym.classList.remove("active");
    }
  }

  // ---------- Gym tab switching ----------

  gymTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { switchGymTab(btn.dataset.gymTab); });
  });

  function switchGymTab(tab) {
    gymCurrentTab = tab;
    gymTabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.gymTab === tab);
    });
    gymProgramsSection.hidden = tab !== "programs";
    gymWorkoutSection.hidden = tab !== "workout";
    gymHistorySection.hidden = tab !== "history";
    if (tab === "programs") loadGymPrograms();
    else if (tab === "workout") loadWorkoutTab();
    else if (tab === "history") loadGymHistory();
  }

  // ---------- Programs ----------

  async function loadExerciseLibrary() {
    try {
      var exs = await apiFetch(GYM_API + "/exercises");
      if (exs) {
        gymExerciseLibrary = exs;
        renderExerciseLibrary();
      }
    } catch (_) {}
  }

  function renderExerciseLibrary() {
    libraryExercisesListEl.innerHTML = "";
    if (gymExerciseLibrary.length === 0) {
      libraryExercisesListEl.innerHTML = '<p class="library-empty">Ei liikkeitä. Lisää liike yllä.</p>';
      return;
    }
    gymExerciseLibrary.forEach(function (ex) {
      var row = document.createElement("div");
      row.className = "library-exercise-row";
      row.innerHTML =
        '<span class="library-exercise-name">' + escapeHtml(ex.name) + "</span>" +
        '<div class="library-exercise-btns">' +
        '<button class="btn btn-icon btn-sm" data-action="rename-library-exercise" data-id="' + ex.id +
        '" data-name="' + escapeHtml(ex.name) + '">Nimeä</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete-library-exercise" data-id="' + ex.id + '">Poista</button>' +
        "</div>";
      libraryExercisesListEl.appendChild(row);
    });
  }

  libraryExercisesListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "rename-library-exercise") {
      var newName = prompt("Uusi nimi:", btn.dataset.name);
      if (newName && newName.trim()) renameLibraryExercise(id, newName.trim());
    } else if (btn.dataset.action === "delete-library-exercise") {
      if (confirm("Poistetaanko liike? Se poistetaan myös kaikista ohjelmista.")) {
        deleteLibraryExercise(id);
      }
    }
  });

  addLibraryExerciseBtn.addEventListener("click", function () {
    addLibraryExerciseForm.hidden = false;
    newLibraryExerciseNameInput.focus();
  });

  cancelLibraryExerciseBtn.addEventListener("click", function () {
    addLibraryExerciseForm.hidden = true;
    addLibraryExerciseForm.reset();
  });

  addLibraryExerciseForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var name = newLibraryExerciseNameInput.value.trim();
    if (!name) return;
    addLibraryExerciseForm.hidden = true;
    addLibraryExerciseForm.reset();
    try {
      await apiFetch(GYM_API + "/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      await loadExerciseLibrary();
    } catch (_) {}
  });

  async function renameLibraryExercise(id, name) {
    try {
      await apiFetch(GYM_API + "/exercises/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      await loadExerciseLibrary();
    } catch (_) {}
  }

  async function deleteLibraryExercise(id) {
    try {
      await apiFetch(GYM_API + "/exercises/" + id, { method: "DELETE" });
      await loadExerciseLibrary();
      await loadGymPrograms();
    } catch (_) {}
  }

  async function loadGymPrograms() {
    await loadExerciseLibrary();
    var url = GYM_API + "/programs";
    if (!showArchivedCheckbox.checked) url += "?active=true";
    try {
      var programs = await apiFetch(url);
      if (!programs) return;
      gymPrograms = programs;
      renderProgramsList();
    } catch (_) {}
  }

  function renderProgramsList() {
    programsListEl.innerHTML = "";
    if (gymPrograms.length === 0) {
      programsListEl.innerHTML = '<p class="empty-state">Ei ohjelmia. Luo uusi ohjelma ylhäältä.</p>';
      return;
    }
    gymPrograms.forEach(function (program) {
      programsListEl.appendChild(createProgramCard(program));
    });
  }

  function createProgramCard(program) {
    var card = document.createElement("div");
    card.className = "program-card" + (program.is_active ? "" : " archived");
    card.dataset.id = program.id;

    var exercisesHtml;
    if (program.exercises && program.exercises.length > 0) {
      exercisesHtml = program.exercises.map(function (ex) {
        var lastPerfStr = ex.last_performance
          ? ' · Ed: ' + ex.last_performance.weight_used + 'kg×' + ex.last_performance.reps_done
          : '';
        return (
          '<div class="exercise-row" data-ex-id="' + ex.id + '">' +
          '<div class="exercise-info">' +
          '<span class="exercise-name">' + escapeHtml(ex.exercise_name) + "</span>" +
          '<span class="exercise-meta">' + ex.weight + "\u00a0kg \u00d7 " + ex.reps + " \u00d7 " + ex.sets + "\u00a0sarjaa \u00b7 lepo\u00a0" + ex.rest_seconds + "s" + lastPerfStr + "</span>" +
          "</div>" +
          '<div class="exercise-btns">' +
          '<button class="btn btn-icon btn-sm" data-action="edit-exercise"' +
          ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '"' +
          ' data-ex-exercise-name="' + escapeHtml(ex.exercise_name) + '" data-ex-weight="' + ex.weight +
          '" data-ex-sets="' + ex.sets + '" data-ex-reps="' + ex.reps +
          '" data-ex-rest="' + ex.rest_seconds + '">Muokkaa</button>' +
          '<button class="btn btn-danger btn-sm" data-action="delete-exercise"' +
          ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '">Poista</button>' +
          "</div></div>"
        );
      }).join("");
    } else {
      exercisesHtml = '<p class="exercise-empty">Ei liikkeitä. Lisää alla.</p>';
    }

    card.innerHTML =
      '<div class="program-card-header">' +
      '<div class="program-title-row">' +
      '<h3 class="program-name">' + escapeHtml(program.name) + "</h3>" +
      '<span class="program-badge ' + (program.is_active ? "active" : "archived") + '">' +
      (program.is_active ? "Aktiivinen" : "Arkistoitu") + "</span>" +
      "</div>" +
      '<div class="program-header-btns">' +
      '<button class="btn btn-icon btn-sm" data-action="rename-program" data-id="' + program.id +
      '" data-name="' + escapeHtml(program.name) + '">Nimeä</button>' +
      (program.is_active
        ? '<button class="btn btn-secondary btn-sm" data-action="archive-program" data-id="' + program.id + '">Arkistoi</button>'
        : '<button class="btn btn-secondary btn-sm" data-action="restore-program" data-id="' + program.id + '">Palauta</button>') +
      '<button class="btn btn-danger btn-sm" data-action="delete-program" data-id="' + program.id + '">Poista</button>' +
      "</div></div>" +
      '<div class="exercises-list">' + exercisesHtml + "</div>" +
      '<button class="btn btn-icon btn-sm add-exercise-btn" data-action="add-exercise" data-program-id="' + program.id + '">+ Lisää liike</button>';

    return card;
  }

  programsListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    var id = btn.dataset.id ? parseInt(btn.dataset.id, 10) : null;

    if (action === "rename-program") {
      var name = prompt("Uusi nimi:", btn.dataset.name);
      if (name && name.trim()) updateProgram(id, { name: name.trim() });

    } else if (action === "archive-program") {
      updateProgram(id, { is_active: false });

    } else if (action === "restore-program") {
      updateProgram(id, { is_active: true });

    } else if (action === "delete-program") {
      var card = btn.closest(".program-card");
      var pname = card ? card.querySelector(".program-name").textContent : "ohjelma";
      if (confirm('Poistetaanko ohjelma "' + pname + '" ja kaikki sen liikkeet?')) {
        deleteProgram(id);
      }

    } else if (action === "add-exercise") {
      openGymModal("add", { programId: parseInt(btn.dataset.programId, 10) });

    } else if (action === "edit-exercise") {
      openGymModal("edit", {
        programId: parseInt(btn.dataset.programId, 10),
        exerciseId: parseInt(btn.dataset.exId, 10),
        exerciseName: btn.dataset.exExerciseName,
        weight: parseFloat(btn.dataset.exWeight),
        sets: parseInt(btn.dataset.exSets, 10),
        reps: parseInt(btn.dataset.exReps, 10),
        rest_seconds: parseInt(btn.dataset.exRest, 10),
      });

    } else if (action === "delete-exercise") {
      var programId = parseInt(btn.dataset.programId, 10);
      var exerciseId = parseInt(btn.dataset.exId, 10);
      var row = btn.closest(".exercise-row");
      var ename = row ? row.querySelector(".exercise-name").textContent : "liike";
      if (confirm('Poistetaanko liike "' + ename + '"?')) {
        deleteExercise(programId, exerciseId);
      }
    }
  });

  async function createProgram(name) {
    try {
      await apiFetch(GYM_API + "/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      await loadGymPrograms();
    } catch (_) {}
  }

  async function updateProgram(id, data) {
    try {
      await apiFetch(GYM_API + "/programs/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadGymPrograms();
    } catch (_) {}
  }

  async function deleteProgram(id) {
    try {
      await apiFetch(GYM_API + "/programs/" + id, { method: "DELETE" });
      await loadGymPrograms();
    } catch (_) {}
  }

  async function createExercise(programId, data) {
    try {
      await apiFetch(GYM_API + "/programs/" + programId + "/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadGymPrograms();
    } catch (_) {}
  }

  async function updateExercise(programId, exerciseId, data) {
    try {
      await apiFetch(GYM_API + "/programs/" + programId + "/exercises/" + exerciseId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadGymPrograms();
    } catch (_) {}
  }

  async function deleteExercise(programId, exerciseId) {
    try {
      await apiFetch(GYM_API + "/programs/" + programId + "/exercises/" + exerciseId, {
        method: "DELETE",
      });
      await loadGymPrograms();
    } catch (_) {}
  }

  // Add program form

  addProgramBtn.addEventListener("click", function () {
    addProgramFormWrap.hidden = false;
    newProgramNameInput.focus();
  });

  cancelAddProgramBtn.addEventListener("click", function () {
    addProgramFormWrap.hidden = true;
    addProgramForm.reset();
  });

  addProgramForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = newProgramNameInput.value.trim();
    if (!name) return;
    addProgramFormWrap.hidden = true;
    addProgramForm.reset();
    createProgram(name);
  });

  showArchivedCheckbox.addEventListener("change", loadGymPrograms);

  // ---------- Gym exercise modal ----------

  function openGymModal(mode, data) {
    gymModalProgramId.value = data.programId;
    gymModalExerciseId.value = data.exerciseId || "";
    gymExWeightInput.value = data.weight !== undefined ? data.weight : 0;
    gymExSetsInput.value = data.sets || 3;
    gymExRepsInput.value = data.reps || 10;
    gymExRestInput.value = data.rest_seconds !== undefined ? data.rest_seconds : 90;
    gymModalTitle.textContent = mode === "edit" ? "Muokkaa liikettä" : "Lisää liike";

    if (mode === "edit") {
      // Show static exercise name, hide dropdown
      gymModalSelectGroup.hidden = true;
      gymModalNameDisplay.hidden = false;
      gymModalExerciseNameEl.textContent = data.exerciseName || "";
    } else {
      // Populate dropdown from library
      gymModalSelectGroup.hidden = false;
      gymModalNameDisplay.hidden = true;
      gymExSelectInput.innerHTML = '<option value="">Valitse liike...</option>';
      gymExerciseLibrary.forEach(function (ex) {
        var opt = document.createElement("option");
        opt.value = ex.id;
        opt.textContent = ex.name;
        gymExSelectInput.appendChild(opt);
      });
    }

    gymModal.hidden = false;
    if (mode === "edit") {
      gymExWeightInput.focus();
    } else {
      gymExSelectInput.focus();
    }
  }

  function closeGymModal() {
    gymModal.hidden = true;
    gymModalForm.reset();
  }

  gymModalCancelBtn.addEventListener("click", closeGymModal);

  gymModal.addEventListener("click", function (e) {
    if (e.target === gymModal) closeGymModal();
  });

  gymModalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var programId = parseInt(gymModalProgramId.value, 10);
    var exerciseId = gymModalExerciseId.value ? parseInt(gymModalExerciseId.value, 10) : null;
    if (exerciseId) {
      // Edit: only update weight/sets/reps/rest
      var data = {
        weight: parseFloat(gymExWeightInput.value) || 0,
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      };
      closeGymModal();
      updateExercise(programId, exerciseId, data);
    } else {
      // Add: send exercise_id from library
      var selectedExId = parseInt(gymExSelectInput.value, 10);
      if (!selectedExId) return;
      var data = {
        exercise_id: selectedExId,
        weight: parseFloat(gymExWeightInput.value) || 0,
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      };
      closeGymModal();
      createExercise(programId, data);
    }
  });

  // ---------- Workout ----------

  async function loadWorkoutTab() {
    try {
      var programs = await apiFetch(GYM_API + "/programs?active=true");
      if (!programs) return;
      workoutProgramSelect.innerHTML = "";
      if (programs.length === 0) {
        workoutProgramSelect.innerHTML = '<option value="">Ei aktiivisia ohjelmia</option>';
      } else {
        programs.forEach(function (p) {
          var opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.name;
          workoutProgramSelect.appendChild(opt);
        });
      }
    } catch (_) {}

    // Restore active session from localStorage if any
    var savedId = localStorage.getItem("gymActiveSessionId");
    if (savedId) {
      try {
        var sessions = await apiFetch(GYM_API + "/sessions");
        if (sessions) {
          var found = sessions.find(function (s) {
            return String(s.id) === savedId && !s.completed_at;
          });
          if (found) {
            await restoreWorkoutSession(found);
            return;
          }
        }
      } catch (_) {}
      localStorage.removeItem("gymActiveSessionId");
    }

    workoutIdleEl.hidden = false;
    workoutActiveEl.hidden = true;
  }

  async function restoreWorkoutSession(session) {
    gymActiveSession = session;
    gymSetsDone = {};
    gymActiveExercises = [];

    if (session.program_id) {
      try {
        var exercises = await apiFetch(GYM_API + "/programs/" + session.program_id + "/exercises");
        if (exercises) gymActiveExercises = exercises;
      } catch (_) {}
    }

    try {
      var sets = await apiFetch(GYM_API + "/sessions/" + session.id + "/sets");
      if (sets) {
        sets.forEach(function (s) {
          if (s.exercise_id) {
            // s.exercise_id is the global exercise ID; map to program_exercise_id
            var pe = gymActiveExercises.find(function (ex) {
              return ex.exercise_id === s.exercise_id;
            });
            if (pe) gymSetsDone[pe.id] = (gymSetsDone[pe.id] || 0) + 1;
          }
        });
      }
    } catch (_) {}

    renderActiveWorkout();
  }

  startWorkoutBtn.addEventListener("click", async function () {
    var programId = parseInt(workoutProgramSelect.value, 10);
    if (!programId) return;
    try {
      var session = await apiFetch(GYM_API + "/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_id: programId }),
      });
      if (!session) return;
      gymActiveSession = session;
      gymSetsDone = {};
      gymActiveExercises = [];
      localStorage.setItem("gymActiveSessionId", session.id);

      try {
        var exercises = await apiFetch(GYM_API + "/programs/" + programId + "/exercises");
        if (exercises) gymActiveExercises = exercises;
      } catch (_) {}

      renderActiveWorkout();
    } catch (_) {}
  });

  function renderActiveWorkout() {
    stopAllGymTimers();
    gymExerciseTimers = {};
    gymExerciseStates = {};
    gymWorkoutWeights = {};
    gymWorkoutRests = {};
    workoutIdleEl.hidden = true;
    workoutActiveEl.hidden = false;
    activeProgramNameEl.textContent = gymActiveSession.program_name;
    workoutStartTimeEl.textContent = "Aloitettu: " + formatDate(gymActiveSession.started_at);
    activeExercisesEl.innerHTML = "";
    gymActiveExercises.forEach(function (ex) {
      gymWorkoutWeights[ex.id] = ex.weight;
      gymWorkoutRests[ex.id] = ex.rest_seconds;
      var done = gymSetsDone[ex.id] || 0;
      var state = done >= ex.sets ? "done" : "idle";
      gymExerciseStates[ex.id] = state;
      activeExercisesEl.appendChild(createExerciseWorkoutCard(ex, done, state));
    });
  }

  function createExerciseWorkoutCard(ex, done, state) {
    var card = document.createElement("div");
    card.className = "exercise-workout-card" + (state === "done" ? " done" : "");
    card.dataset.exId = ex.id;
    var currentWeight = gymWorkoutWeights[ex.id] !== undefined ? gymWorkoutWeights[ex.id] : ex.weight;
    var currentRest = gymWorkoutRests[ex.id] !== undefined ? gymWorkoutRests[ex.id] : ex.rest_seconds;
    var lastPerfHtml = "";
    if (ex.last_performance) {
      lastPerfHtml =
        '<span class="ewc-last-perf">Edellinen: ' +
        ex.last_performance.weight_used + "\u00a0kg \u00d7 " +
        ex.last_performance.reps_done + "</span>";
    }
    card.innerHTML =
      '<div class="ewc-header">' +
      '<span class="ewc-name">' + escapeHtml(ex.exercise_name) + "</span>" +
      lastPerfHtml +
      "</div>" +
      '<div class="ewc-weight-row">' +
      '<button class="ewc-adj-btn" data-adj-weight="-5" data-ex-id="' + ex.id + '">-5</button>' +
      '<button class="ewc-adj-btn" data-adj-weight="-2.5" data-ex-id="' + ex.id + '">-2.5</button>' +
      '<span class="ewc-weight-display" id="weight-display-' + ex.id + '">' + currentWeight + "\u00a0kg</span>" +
      '<span class="ewc-target-reps">\u00d7\u00a0' + ex.reps + "\u00a0toistoa</span>" +
      '<button class="ewc-adj-btn" data-adj-weight="+2.5" data-ex-id="' + ex.id + '">+2.5</button>' +
      '<button class="ewc-adj-btn" data-adj-weight="+5" data-ex-id="' + ex.id + '">+5</button>' +
      "</div>" +
      '<div class="ewc-rest-row">' +
      '<button class="ewc-adj-btn ewc-adj-small" data-adj-rest="-30" data-ex-id="' + ex.id + '">-30s</button>' +
      '<span class="ewc-rest-display" id="rest-display-' + ex.id + '">lepo\u00a0' + currentRest + "\u00a0s</span>" +
      '<button class="ewc-adj-btn ewc-adj-small" data-adj-rest="+30" data-ex-id="' + ex.id + '">+30s</button>' +
      "</div>" +
      '<div class="ewc-progress">Sarjat: <strong class="ewc-sets-done">' + done + "</strong>\u00a0/\u00a0" + ex.sets + "</div>" +
      '<div class="ewc-rest-info" hidden>' +
      '<span class="ewc-countdown" id="countdown-' + ex.id + '">' + formatGymSeconds(currentRest) + "</span>" +
      '<span class="ewc-rest-label">lepotauko</span>' +
      "</div>" +
      '<div class="ewc-done-banner" ' + (state === "done" ? "" : "hidden") + ">\u2713 Kaikki sarjat tehty!</div>" +
      '<div class="ewc-actions">' +
      '<button class="btn btn-primary ewc-log-btn" data-ex-id="' + ex.id + '"' + (state !== "idle" ? " hidden" : "") + ">Sarja tehty</button>" +
      '<button class="btn btn-secondary ewc-skip-btn" data-ex-id="' + ex.id + '" hidden>Ohita tauko</button>' +
      "</div>";
    return card;
  }

  function transitionToIdle(exId) {
    gymExerciseStates[exId] = "idle";
    stopGymTimer(exId);
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.querySelector(".ewc-log-btn").hidden = false;
    card.querySelector(".ewc-skip-btn").hidden = true;
    card.querySelector(".ewc-rest-info").hidden = true;
    card.classList.remove("resting");
  }

  function transitionToResting(exId) {
    gymExerciseStates[exId] = "resting";
    var exercise = gymActiveExercises.find(function (ex) { return ex.id === exId; });
    if (!exercise) return;
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.querySelector(".ewc-log-btn").hidden = true;
    card.querySelector(".ewc-skip-btn").hidden = false;
    card.querySelector(".ewc-rest-info").hidden = false;
    card.classList.add("resting");
    var restSecs = gymWorkoutRests[exId] !== undefined ? gymWorkoutRests[exId] : exercise.rest_seconds;
    startRestCountdown(exId, restSecs);
  }

  function transitionToDone(exId) {
    gymExerciseStates[exId] = "done";
    stopGymTimer(exId);
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.querySelector(".ewc-log-btn").hidden = true;
    card.querySelector(".ewc-skip-btn").hidden = true;
    card.querySelector(".ewc-rest-info").hidden = true;
    card.querySelector(".ewc-done-banner").hidden = false;
    card.classList.remove("resting");
    card.classList.add("done");
  }

  function startRestCountdown(exId, seconds) {
    stopGymTimer(exId);
    var secondsLeft = seconds;
    var countdownEl = document.getElementById("countdown-" + exId);
    if (countdownEl) countdownEl.textContent = formatGymSeconds(secondsLeft);
    gymExerciseTimers[exId] = {
      intervalId: setInterval(function () {
        secondsLeft--;
        if (countdownEl) countdownEl.textContent = formatGymSeconds(Math.max(0, secondsLeft));
        if (secondsLeft <= 0) {
          stopGymTimer(exId);
          playRestAlarm();
          flashCard(exId);
          transitionToIdle(exId);
        }
      }, 1000),
    };
  }

  function stopGymTimer(exId) {
    if (gymExerciseTimers[exId] && gymExerciseTimers[exId].intervalId) {
      clearInterval(gymExerciseTimers[exId].intervalId);
      delete gymExerciseTimers[exId];
    }
  }

  function stopAllGymTimers() {
    if (!gymExerciseTimers) return;
    Object.keys(gymExerciseTimers).forEach(function (exId) {
      stopGymTimer(exId);
    });
    gymExerciseTimers = {};
  }

  function flashCard(exId) {
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.classList.add("ewc-alert");
    setTimeout(function () { card.classList.remove("ewc-alert"); }, 3000);
  }

  function playRestAlarm() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(function (delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      });
    } catch (_) {}
  }

  function formatGymSeconds(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  activeExercisesEl.addEventListener("click", async function (e) {
    // Weight adjuster buttons
    var adjWeightBtn = e.target.closest(".ewc-adj-btn[data-adj-weight]");
    if (adjWeightBtn) {
      var exId = parseInt(adjWeightBtn.dataset.exId, 10);
      var delta = parseFloat(adjWeightBtn.dataset.adjWeight);
      var current = gymWorkoutWeights[exId] !== undefined ? gymWorkoutWeights[exId] : 0;
      gymWorkoutWeights[exId] = Math.max(0, Math.round((current + delta) * 10) / 10);
      var displayEl = document.getElementById("weight-display-" + exId);
      if (displayEl) displayEl.textContent = gymWorkoutWeights[exId] + "\u00a0kg";
      return;
    }

    // Rest adjuster buttons
    var adjRestBtn = e.target.closest(".ewc-adj-btn[data-adj-rest]");
    if (adjRestBtn) {
      var exId = parseInt(adjRestBtn.dataset.exId, 10);
      var delta = parseInt(adjRestBtn.dataset.adjRest, 10);
      var current = gymWorkoutRests[exId] !== undefined ? gymWorkoutRests[exId] : 0;
      gymWorkoutRests[exId] = Math.max(0, current + delta);
      var displayEl = document.getElementById("rest-display-" + exId);
      if (displayEl) displayEl.textContent = "lepo\u00a0" + gymWorkoutRests[exId] + "\u00a0s";
      return;
    }

    // "Sarja tehty"
    var logBtn = e.target.closest(".ewc-log-btn");
    if (logBtn && gymActiveSession) {
      var exId = parseInt(logBtn.dataset.exId, 10);
      var exercise = gymActiveExercises.find(function (ex) { return ex.id === exId; });
      if (!exercise || gymExerciseStates[exId] !== "idle") return;
      var weightUsed = gymWorkoutWeights[exId] !== undefined ? gymWorkoutWeights[exId] : exercise.weight;
      var restSecs = gymWorkoutRests[exId] !== undefined ? gymWorkoutRests[exId] : exercise.rest_seconds;
      var done = gymSetsDone[exId] || 0;
      var setNumber = done + 1;
      try {
        await apiFetch(GYM_API + "/sessions/" + gymActiveSession.id + "/sets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: exercise.exercise_id,   // global exercise library ID
            exercise_name: exercise.exercise_name,
            set_number: setNumber,
            weight_used: weightUsed,
            reps_done: exercise.reps,
          }),
        });
        gymSetsDone[exId] = setNumber;
        var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
        if (card) {
          var doneEl = card.querySelector(".ewc-sets-done");
          if (doneEl) doneEl.textContent = setNumber;
        }
        if (setNumber >= exercise.sets) {
          transitionToDone(exId);
        } else if (restSecs > 0) {
          transitionToResting(exId);
        }
        // restSecs = 0 → stay idle, no countdown
      } catch (_) {}
      return;
    }

    // "Ohita tauko"
    var skipBtn = e.target.closest(".ewc-skip-btn");
    if (skipBtn) {
      var exId = parseInt(skipBtn.dataset.exId, 10);
      transitionToIdle(exId);
    }
  });

  completeWorkoutBtn.addEventListener("click", async function () {
    if (!gymActiveSession) return;
    if (!confirm("Merkitäänkö treeni valmiiksi?")) return;
    try {
      await apiFetch(GYM_API + "/sessions/" + gymActiveSession.id + "/complete", {
        method: "PUT",
      });
      stopAllGymTimers();
      gymActiveSession = null;
      gymActiveExercises = [];
      gymSetsDone = {};
      gymExerciseStates = {};
      localStorage.removeItem("gymActiveSessionId");
      workoutActiveEl.hidden = true;
      workoutIdleEl.hidden = false;
    } catch (_) {}
  });

  // ---------- History ----------

  async function loadGymHistory() {
    try {
      var sessions = await apiFetch(GYM_API + "/sessions");
      if (!sessions) return;
      renderSessionsList(sessions);
    } catch (_) {}
  }

  function renderSessionsList(sessions) {
    sessionsListEl.innerHTML = "";
    if (sessions.length === 0) {
      sessionsListEl.innerHTML = '<p class="empty-state">Ei treenejä vielä.</p>';
      return;
    }
    sessions.forEach(function (s) {
      var item = document.createElement("div");
      item.className = "session-item";
      item.dataset.sessionId = s.id;

      var duration = "";
      if (s.completed_at && s.started_at) {
        var diffMs = new Date(s.completed_at) - new Date(s.started_at);
        var diffMin = Math.round(diffMs / 60000);
        duration = " (" + diffMin + "\u00a0min)";
      }

      var statusBadge = s.completed_at
        ? '<span class="session-badge done">Valmis</span>'
        : '<span class="session-badge active">Kesken</span>';

      item.innerHTML =
        '<div class="session-header" data-action="toggle-session">' +
        '<div class="session-info">' +
        statusBadge +
        '<span class="session-program-name">' + escapeHtml(s.program_name) + "</span>" +
        '<span class="session-date">' + formatDate(s.started_at) + duration + "</span>" +
        "</div>" +
        '<span class="session-toggle-icon">\u25bc</span>' +
        "</div>" +
        '<div class="session-sets" hidden></div>';

      sessionsListEl.appendChild(item);
    });
  }

  sessionsListEl.addEventListener("click", async function (e) {
    var header = e.target.closest("[data-action='toggle-session']");
    if (!header) return;
    var item = header.closest(".session-item");
    if (!item) return;
    var setsEl = item.querySelector(".session-sets");
    var icon = item.querySelector(".session-toggle-icon");

    if (!setsEl.hidden) {
      setsEl.hidden = true;
      if (icon) icon.textContent = "\u25bc";
      return;
    }

    setsEl.hidden = false;
    if (icon) icon.textContent = "\u25b2";
    if (setsEl.dataset.loaded) return;
    setsEl.dataset.loaded = "1";

    var sessionId = parseInt(item.dataset.sessionId, 10);
    try {
      var sets = await apiFetch(GYM_API + "/sessions/" + sessionId + "/sets");
      if (!sets || sets.length === 0) {
        setsEl.innerHTML = '<p class="session-no-sets">Ei kirjattuja sarjoja.</p>';
        return;
      }
      var byExercise = {};
      var exerciseOrder = [];
      sets.forEach(function (s) {
        var key = s.exercise_name;
        if (!byExercise[key]) {
          byExercise[key] = [];
          exerciseOrder.push(key);
        }
        byExercise[key].push(s);
      });
      var html = exerciseOrder.map(function (exName) {
        var exSets = byExercise[exName];
        var setsStr = exSets.map(function (s) {
          return s.weight_used + "\u00a0kg\u00d7" + s.reps_done;
        }).join(", ");
        return (
          '<div class="session-exercise-row">' +
          '<span class="ses-ex-name">' + escapeHtml(exName) + "</span>" +
          '<span class="ses-ex-sets">' + setsStr + "</span>" +
          "</div>"
        );
      }).join("");
      setsEl.innerHTML = html;
    } catch (_) {
      setsEl.innerHTML = '<p class="session-no-sets">Virhe haettaessa sarjoja.</p>';
    }
  });

})();
