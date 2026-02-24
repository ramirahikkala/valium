(function () {
  "use strict";

  // ---------- i18n ----------

  var STRINGS = {
    fi: {
      // Navigaatio
      tasks: "Tehtävät",
      gym: "Sali",
      workout_tab: "🏋️ Treeni",
      programs_tab: "⚙️ Ohjelmat",
      history_tab: "📊 Historia",
      settings: "Asetukset",
      language: "Kieli",
      hamburger_aria: "Avaa valikko",

      // Kirjautuminen
      subtitle: "Pikkuapurisi asioiden hoitamiseen",
      sign_out: "Kirjaudu ulos",
      error_generic: "Jotain meni pieleen",
      error_login_failed: "Kirjautuminen epäonnistui: ",
      error_client_id: "Google-kirjautumista ei ole konfiguroitu palvelimelle",
      error_auth_config: "Kirjautumisasetuksia ei voitu ladata",
      error_select_list: "Valitse ensin lista",

      // Listat
      new_list_placeholder: "Uusi lista...",
      add_list_btn: "+ Lista",
      delete_list_confirm: "Poistetaanko lista \"{name}\" ja kaikki sen tehtävät?",

      // Suodattimet
      filter_all: "Kaikki",
      filter_pending: "Odottaa",
      filter_in_progress: "Kesken",
      filter_done: "Valmis",

      // Tehtävän tila
      status_pending: "Odottaa",
      status_in_progress: "Kesken",
      status_done: "Valmis",

      // Tehtävälomake
      add_task: "＋ Lisää tehtävä",
      add_task_submit: "Lisää tehtävä",
      label_title: "Otsikko",
      task_title_placeholder: "Mitä pitää tehdä?",
      label_description_optional: "Kuvaus (valinnainen)",
      task_desc_placeholder: "Lisää tietoja...",

      // Tehtävälista
      empty_all: "Ei tehtäviä. Lisää yksi yllä!",
      empty_filtered: "Ei tehtäviä valitulla suodattimella.",
      drag_reorder_aria: "Järjestä uudelleen raahaamalla",
      set_status_to: "Aseta tilaksi ",
      task_edit_btn: "Muokkaa",
      task_delete_btn: "Poista",
      delete_task_confirm: "Poistetaanko tehtävä?",

      // Muokkausmodaali
      edit_task_heading: "Muokkaa tehtävää",
      label_description: "Kuvaus",
      label_status: "Tila",
      label_move_to_list: "Siirrä listaan",
      alarm_legend: "Muistutus",
      label_remind_at: "Muistuta",
      label_recurrence: "Toistuvuus",
      recurrence_once: "Kerran",
      recurrence_daily: "Päivittäin",
      recurrence_weekly: "Viikoittain",
      recurrence_monthly: "Kuukausittain",
      label_enabled: "Käytössä",
      cancel: "Peruuta",
      save: "Tallenna",

      // Sali — ohjelmat
      programs_heading: "Ohjelmat ⚙️",
      add_program_btn: "+ Uusi ohjelma",
      show_archived_label: "Näytä arkistoidut",
      exercises_heading: "Liikkeet",
      add_exercise_lib_btn: "+ Lisää",
      exercise_name_placeholder: "Liikkeen nimi",
      add_btn: "Lisää",
      program_name_placeholder: "Ohjelman nimi",
      create_btn: "Luo",
      no_exercises_library: "Ei liikkeitä. Lisää liike yllä.",
      rename_btn: "Nimeä",
      delete_btn: "Poista",
      rename_prompt: "Uusi nimi:",
      delete_exercise_confirm: "Poistetaanko liike? Se poistetaan myös kaikista ohjelmista.",
      no_programs_empty: "Ei ohjelmia. Luo uusi ohjelma ylhäältä.",
      badge_active: "Aktiivinen",
      badge_archived: "Arkistoitu",
      edit_exercise_btn: "Muokkaa",
      archive_btn: "Arkistoi",
      restore_btn: "Palauta",
      no_exercises_program: "Ei liikkeitä. Lisää alla.",
      add_exercise_btn: "+ Lisää liike",
      delete_program_confirm: "Poistetaanko ohjelma \"{name}\" ja kaikki sen liikkeet?",
      delete_exercise_from_program_confirm: "Poistetaanko liike \"{name}\"?",
      fallback_program: "ohjelma",
      fallback_exercise: "liike",
      last_perf_abbrev: "Ed: ",
      sets_label: "sarjaa",
      rest_short: "lepo\u00a0",

      // Sali — liike­modaali
      gym_modal_add_heading: "Lisää liike",
      gym_modal_edit_heading: "Muokkaa liikettä",
      label_exercise: "Liike",
      select_exercise_option: "Valitse liike...",
      label_weight_kg: "Paino (kg)",
      label_sets: "Sarjat",
      label_reps: "Toistot",
      label_rest_seconds: "Lepotauko (sekuntia)",

      // Sali — liike­modaali — nouseva ohjelma
      autoinc_label: "Nouseva ohjelma",
      autoinc_increment_label: "Nousu / treeni (kg)",
      autoinc_reset_label: "Pohjan nousu resetissä (kg)",
      autoinc_badge: "↑",
      fail_btn: "Fail",
      failed_label: "Failed ✗",

      // Sali — treeni
      workout_idle_heading: "💪 Aloita treeni",
      label_select_program: "Valitse ohjelma",
      start_workout_btn: "Aloita treeni",
      complete_workout_btn_text: "Treeni valmis!",
      no_active_programs_option: "Ei aktiivisia ohjelmia",
      last_perf_prefix: "Edellinen: ",
      reps_suffix: "\u00a0toistoa",
      sets_progress: "Sarjat: ",
      rest_countdown_label: "lepotauko",
      all_sets_done_text: "\u2713 Kaikki sarjat tehty!",
      log_set_btn: "Sarja tehty",
      skip_rest_btn: "Ohita tauko",
      complete_workout_confirm: "Merkitäänkö treeni valmiiksi?",
      complete_workout_heading: "Treeni valmis",
      complete_workout_how: "Miten treeni meni?",
      complete_workout_normal: "Normaali lopetus",
      complete_workout_failed: "Epäonnistunut",
      complete_workout_weight_q: "Painon hallinta",
      complete_workout_weight_desc: "Mitä tehdään painolle ensi kerralla?",
      complete_stay_weight: "Jää samaan painoon",
      complete_reset_cycle: "Aloita uusi kierros",
      workout_started: "Aloitettu: ",

      // Sali — historia
      history_heading: "Historia 📊",
      no_sessions_text: "Ei treenejä vielä.",
      session_badge_done: "Valmis",
      session_badge_active: "Kesken",
      no_sets_text: "Ei kirjattuja sarjoja.",
      sets_load_error: "Virhe haettaessa sarjoja.",
    },
    en: {
      // Navigation
      tasks: "Tasks",
      gym: "Gym",
      workout_tab: "🏋️ Workout",
      programs_tab: "⚙️ Programs",
      history_tab: "📊 History",
      settings: "Settings",
      language: "Language",
      hamburger_aria: "Open menu",

      // Auth
      subtitle: "Your little helper for getting things done",
      sign_out: "Sign out",
      error_generic: "Something went wrong",
      error_login_failed: "Sign-in failed: ",
      error_client_id: "Google Sign-In not configured on server",
      error_auth_config: "Could not load auth configuration",
      error_select_list: "Please select a list first",

      // Lists
      new_list_placeholder: "New list...",
      add_list_btn: "+ List",
      delete_list_confirm: "Delete list \"{name}\" and all its tasks?",

      // Filters
      filter_all: "All",
      filter_pending: "Pending",
      filter_in_progress: "In progress",
      filter_done: "Done",

      // Task status
      status_pending: "Pending",
      status_in_progress: "In progress",
      status_done: "Done",

      // Add task form
      add_task: "＋ Add task",
      add_task_submit: "Add task",
      label_title: "Title",
      task_title_placeholder: "What needs to be done?",
      label_description_optional: "Description (optional)",
      task_desc_placeholder: "Add details...",

      // Task list
      empty_all: "No tasks. Add one above!",
      empty_filtered: "No tasks with the selected filter.",
      drag_reorder_aria: "Drag to reorder",
      set_status_to: "Set status to ",
      task_edit_btn: "Edit",
      task_delete_btn: "Delete",
      delete_task_confirm: "Delete this task?",

      // Edit modal
      edit_task_heading: "Edit task",
      label_description: "Description",
      label_status: "Status",
      label_move_to_list: "Move to list",
      alarm_legend: "Reminder",
      label_remind_at: "Remind at",
      label_recurrence: "Recurrence",
      recurrence_once: "Once",
      recurrence_daily: "Daily",
      recurrence_weekly: "Weekly",
      recurrence_monthly: "Monthly",
      label_enabled: "Enabled",
      cancel: "Cancel",
      save: "Save",

      // Gym — programs
      programs_heading: "Programs ⚙️",
      add_program_btn: "+ New program",
      show_archived_label: "Show archived",
      exercises_heading: "Exercises",
      add_exercise_lib_btn: "+ Add",
      exercise_name_placeholder: "Exercise name",
      add_btn: "Add",
      program_name_placeholder: "Program name",
      create_btn: "Create",
      no_exercises_library: "No exercises. Add one above.",
      rename_btn: "Rename",
      delete_btn: "Delete",
      rename_prompt: "New name:",
      delete_exercise_confirm: "Delete exercise? It will also be removed from all programs.",
      no_programs_empty: "No programs. Create a new one above.",
      badge_active: "Active",
      badge_archived: "Archived",
      edit_exercise_btn: "Edit",
      archive_btn: "Archive",
      restore_btn: "Restore",
      no_exercises_program: "No exercises. Add below.",
      add_exercise_btn: "+ Add exercise",
      delete_program_confirm: "Delete program \"{name}\" and all its exercises?",
      delete_exercise_from_program_confirm: "Delete exercise \"{name}\"?",
      fallback_program: "program",
      fallback_exercise: "exercise",
      last_perf_abbrev: "Prev: ",
      sets_label: "sets",
      rest_short: "rest\u00a0",

      // Gym — exercise modal
      gym_modal_add_heading: "Add exercise",
      gym_modal_edit_heading: "Edit exercise",
      label_exercise: "Exercise",
      select_exercise_option: "Select exercise...",
      label_weight_kg: "Weight (kg)",
      label_sets: "Sets",
      label_reps: "Reps",
      label_rest_seconds: "Rest (seconds)",

      // Gym — exercise modal — progressive overload
      autoinc_label: "Progressive overload",
      autoinc_increment_label: "Increment per workout (kg)",
      autoinc_reset_label: "Base increment on reset (kg)",
      autoinc_badge: "↑",
      fail_btn: "Fail",
      failed_label: "Failed ✗",

      // Gym — workout
      workout_idle_heading: "💪 Start workout",
      label_select_program: "Select program",
      start_workout_btn: "Start workout",
      complete_workout_btn_text: "Workout done!",
      no_active_programs_option: "No active programs",
      last_perf_prefix: "Previous: ",
      reps_suffix: "\u00a0reps",
      sets_progress: "Sets: ",
      rest_countdown_label: "rest",
      all_sets_done_text: "\u2713 All sets done!",
      log_set_btn: "Set done",
      skip_rest_btn: "Skip rest",
      complete_workout_confirm: "Mark workout as complete?",
      complete_workout_heading: "Workout done",
      complete_workout_how: "How did the workout go?",
      complete_workout_normal: "Normal completion",
      complete_workout_failed: "Struggled",
      complete_workout_weight_q: "Weight management",
      complete_workout_weight_desc: "What to do with weight next time?",
      complete_stay_weight: "Keep same weight",
      complete_reset_cycle: "Start new cycle",
      workout_started: "Started: ",

      // Gym — history
      history_heading: "History 📊",
      no_sessions_text: "No workouts yet.",
      session_badge_done: "Done",
      session_badge_active: "Active",
      no_sets_text: "No logged sets.",
      sets_load_error: "Error loading sets.",
    },
  };

  // Date locale mapping
  var LOCALES = { fi: "fi-FI", en: "en-GB" };

  var currentLang = localStorage.getItem("lang") || "fi";

  /** Translate a key. */
  function t(key) {
    return (STRINGS[currentLang] || STRINGS.fi)[key] || key;
  }

  /** Translate with variable interpolation: tf("delete_list_confirm", { name: "Foo" }) */
  function tf(key, vars) {
    var str = t(key);
    Object.keys(vars).forEach(function (k) {
      str = str.replace("{" + k + "}", vars[k]);
    });
    return str;
  }

  /** Apply translations to all data-i18n* elements in the DOM. */
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });
    var langSel = document.getElementById("language-select");
    if (langSel) langSel.value = currentLang;
  }

  async function loadUserSettings() {
    try {
      var settings = await apiFetch("/api/user/settings");
      if (settings && settings.language) {
        currentLang = settings.language;
        localStorage.setItem("lang", settings.language);
      }
    } catch (_) {}
    applyTranslations();
  }

  // ---------- API ----------

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
      showError(err.message || t("error_generic"));
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
      loginError.textContent = t("error_login_failed") + (err.message || "Unknown error");
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
          loginError.textContent = t("error_client_id");
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
        loginError.textContent = t("error_auth_config");
        loginError.hidden = false;
      });
  }

  signOutBtn.addEventListener("click", signOut);

  // ---------- Settings ----------

  var settingsBtn = document.getElementById("settings-btn");
  var sidebarSettingsChildren = document.getElementById("sidebar-settings-children");
  var langSelect = document.getElementById("language-select");

  settingsBtn.addEventListener("click", function () {
    sidebarSettingsChildren.hidden = !sidebarSettingsChildren.hidden;
  });

  langSelect.addEventListener("change", async function () {
    var lang = this.value;
    await apiFetch("/api/user/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
    localStorage.setItem("lang", lang);
    location.reload();
  });

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
        delBtn.title = t("delete_btn");
        delBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (confirm(tf("delete_list_confirm", { name: lst.name }))) {
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
    return d.toLocaleDateString(LOCALES[currentLang] || "fi-FI", {
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
        return t("status_in_progress");
      case "done":
        return t("status_done");
      default:
        return t("status_pending");
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
          '" aria-label="' +
          t("set_status_to") + statusLabel(s) +
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
      '<span class="drag-handle" aria-label="' + t("drag_reorder_aria") + '">&#x2630;</span>' +
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
      '<button type="button" class="btn btn-icon" data-action="edit">' + t("task_edit_btn") + '</button>' +
      '<button type="button" class="btn btn-danger" data-action="delete">' + t("task_delete_btn") + '</button>' +
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
          ? t("empty_all")
          : t("empty_filtered");
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

  // ---------- Collapsible add-task form ----------

  var addTaskToggleBtn = document.getElementById("add-task-toggle");
  var addTaskBody = document.getElementById("add-task-body");

  addTaskToggleBtn.addEventListener("click", function () {
    addTaskBody.hidden = !addTaskBody.hidden;
    if (!addTaskBody.hidden) {
      document.getElementById("task-title").focus();
    }
  });

  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = document.getElementById("task-title").value.trim();
    var desc = document.getElementById("task-description").value.trim();
    if (!title) return;
    if (!currentListId) {
      showError(t("error_select_list"));
      return;
    }
    addTask(title, desc).then(function () {
      addForm.reset();
      addTaskBody.hidden = true;
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
      if (confirm(t("delete_task_confirm"))) {
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
    // Load language preference first so UI renders in correct language
    await loadUserSettings();

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

  // Apply language from localStorage immediately so the login screen is also translated
  applyTranslations();
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

  // Sidebar DOM elements
  var sidebarEl = document.getElementById("sidebar");
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  var sidebarToggleBtn = document.getElementById("sidebar-toggle");
  var sidebarGymChildren = document.getElementById("sidebar-gym-children");

  // Hamburger toggle
  sidebarToggleBtn.addEventListener("click", function () {
    sidebarEl.classList.toggle("open");
    sidebarOverlay.classList.toggle("visible");
  });

  sidebarOverlay.addEventListener("click", function () {
    sidebarEl.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
  });

  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      sidebarEl.classList.remove("open");
      sidebarOverlay.classList.remove("visible");
    }
  }

  // Gym DOM elements — view toggle
  var viewTabTasks = document.getElementById("view-tab-tasks");
  var viewTabGym = document.getElementById("view-tab-gym");
  var tasksView = document.getElementById("tasks-view");
  var gymView = document.getElementById("gym-view");
  var gymTabButtons = document.querySelectorAll(".sidebar-gym-btn");

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
  var gymAutoincEnabled = document.getElementById("gym-autoinc-enabled");
  var gymAutoincSettings = document.getElementById("gym-autoinc-settings");
  var gymAutoincIncrement = document.getElementById("gym-autoinc-increment");
  var gymAutoincReset = document.getElementById("gym-autoinc-reset");

  gymAutoincEnabled.addEventListener("change", function () {
    gymAutoincSettings.hidden = !gymAutoincEnabled.checked;
  });

  // Tracks program_exercise IDs that the user marked as failed during the workout
  var gymFailedExercises = new Set();

  // ---------- View toggle ----------

  viewTabTasks.addEventListener("click", function () { switchToView("tasks"); closeSidebarOnMobile(); });
  viewTabGym.addEventListener("click", function () { switchToView("gym"); });

  function switchToView(view) {
    if (view === "gym") {
      tasksView.hidden = true;
      gymView.hidden = false;
      viewTabTasks.classList.remove("active");
      viewTabGym.classList.add("active");
      sidebarGymChildren.hidden = false;
      switchGymTab(gymCurrentTab);
    } else {
      tasksView.hidden = false;
      gymView.hidden = true;
      viewTabTasks.classList.add("active");
      viewTabGym.classList.remove("active");
      sidebarGymChildren.hidden = true;
      closeSidebarOnMobile();
    }
  }

  // ---------- Gym tab switching ----------

  gymTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchGymTab(btn.dataset.gymTab);
      closeSidebarOnMobile();
    });
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
      libraryExercisesListEl.innerHTML = '<p class="library-empty">' + t("no_exercises_library") + '</p>';
      return;
    }
    gymExerciseLibrary.forEach(function (ex) {
      var row = document.createElement("div");
      row.className = "library-exercise-row";
      row.innerHTML =
        '<span class="library-exercise-name">' + escapeHtml(ex.name) + "</span>" +
        '<div class="library-exercise-btns">' +
        '<button class="btn btn-icon btn-sm" data-action="rename-library-exercise" data-id="' + ex.id +
        '" data-name="' + escapeHtml(ex.name) + '">' + t("rename_btn") + '</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete-library-exercise" data-id="' + ex.id + '">' + t("delete_btn") + '</button>' +
        "</div>";
      libraryExercisesListEl.appendChild(row);
    });
  }

  libraryExercisesListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "rename-library-exercise") {
      var newName = prompt(t("rename_prompt"), btn.dataset.name);
      if (newName && newName.trim()) renameLibraryExercise(id, newName.trim());
    } else if (btn.dataset.action === "delete-library-exercise") {
      if (confirm(t("delete_exercise_confirm"))) {
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
      programsListEl.innerHTML = '<p class="empty-state">' + t("no_programs_empty") + '</p>';
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
          ? ' · ' + t("last_perf_abbrev") + ex.last_performance.weight_used + 'kg\u00d7' + ex.last_performance.reps_done
          : '';
        return (
          '<div class="exercise-row" data-ex-id="' + ex.id + '">' +
          '<div class="exercise-info">' +
          '<span class="exercise-name">' + escapeHtml(ex.exercise_name) + "</span>" +
          '<span class="exercise-meta">' + ex.weight + "\u00a0kg \u00d7 " + ex.reps + " \u00d7 " + ex.sets + "\u00a0" + t("sets_label") + " \u00b7 " + t("rest_short") + ex.rest_seconds + "s" + lastPerfStr + "</span>" +
          "</div>" +
          '<div class="exercise-btns">' +
          '<button class="btn btn-icon btn-sm" data-action="edit-exercise"' +
          ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '"' +
          ' data-ex-exercise-name="' + escapeHtml(ex.exercise_name) + '" data-ex-weight="' + ex.weight +
          '" data-ex-sets="' + ex.sets + '" data-ex-reps="' + ex.reps +
          '" data-ex-rest="' + ex.rest_seconds +
          '" data-ex-auto-increment="' + ex.auto_increment +
          '" data-ex-increment-kg="' + ex.increment_kg +
          '" data-ex-reset-increment-kg="' + ex.reset_increment_kg + '">' + t("edit_exercise_btn") + '</button>' +
          '<button class="btn btn-danger btn-sm" data-action="delete-exercise"' +
          ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '">' + t("delete_btn") + '</button>' +
          "</div></div>"
        );
      }).join("");
    } else {
      exercisesHtml = '<p class="exercise-empty">' + t("no_exercises_program") + '</p>';
    }

    card.innerHTML =
      '<div class="program-card-header">' +
      '<div class="program-title-row">' +
      '<h3 class="program-name">' + escapeHtml(program.name) + "</h3>" +
      '<span class="program-badge ' + (program.is_active ? "active" : "archived") + '">' +
      (program.is_active ? t("badge_active") : t("badge_archived")) + "</span>" +
      "</div>" +
      '<div class="program-header-btns">' +
      '<button class="btn btn-icon btn-sm" data-action="rename-program" data-id="' + program.id +
      '" data-name="' + escapeHtml(program.name) + '">' + t("rename_btn") + '</button>' +
      (program.is_active
        ? '<button class="btn btn-secondary btn-sm" data-action="archive-program" data-id="' + program.id + '">' + t("archive_btn") + '</button>'
        : '<button class="btn btn-secondary btn-sm" data-action="restore-program" data-id="' + program.id + '">' + t("restore_btn") + '</button>') +
      '<button class="btn btn-danger btn-sm" data-action="delete-program" data-id="' + program.id + '">' + t("delete_btn") + '</button>' +
      "</div></div>" +
      '<div class="exercises-list">' + exercisesHtml + "</div>" +
      '<button class="btn btn-icon btn-sm add-exercise-btn" data-action="add-exercise" data-program-id="' + program.id + '">' + t("add_exercise_btn") + '</button>';

    return card;
  }

  programsListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    var id = btn.dataset.id ? parseInt(btn.dataset.id, 10) : null;

    if (action === "rename-program") {
      var name = prompt(t("rename_prompt"), btn.dataset.name);
      if (name && name.trim()) updateProgram(id, { name: name.trim() });

    } else if (action === "archive-program") {
      updateProgram(id, { is_active: false });

    } else if (action === "restore-program") {
      updateProgram(id, { is_active: true });

    } else if (action === "delete-program") {
      var card = btn.closest(".program-card");
      var pname = card ? card.querySelector(".program-name").textContent : t("fallback_program");
      if (confirm(tf("delete_program_confirm", { name: pname }))) {
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
        auto_increment: btn.dataset.exAutoIncrement === "true",
        increment_kg: parseFloat(btn.dataset.exIncrementKg),
        reset_increment_kg: parseFloat(btn.dataset.exResetIncrementKg),
      });

    } else if (action === "delete-exercise") {
      var programId = parseInt(btn.dataset.programId, 10);
      var exerciseId = parseInt(btn.dataset.exId, 10);
      var row = btn.closest(".exercise-row");
      var ename = row ? row.querySelector(".exercise-name").textContent : t("fallback_exercise");
      if (confirm(tf("delete_exercise_from_program_confirm", { name: ename }))) {
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
    gymAutoincEnabled.checked = !!data.auto_increment;
    gymAutoincSettings.hidden = !data.auto_increment;
    gymAutoincIncrement.value = String(data.increment_kg !== undefined ? data.increment_kg : 2.5);
    gymAutoincReset.value = data.reset_increment_kg !== undefined ? data.reset_increment_kg : 5;
    gymModalTitle.textContent = mode === "edit" ? t("gym_modal_edit_heading") : t("gym_modal_add_heading");

    if (mode === "edit") {
      // Show static exercise name, hide dropdown
      gymModalSelectGroup.hidden = true;
      gymModalNameDisplay.hidden = false;
      gymModalExerciseNameEl.textContent = data.exerciseName || "";
    } else {
      // Populate dropdown from library
      gymModalSelectGroup.hidden = false;
      gymModalNameDisplay.hidden = true;
      gymExSelectInput.innerHTML = '<option value="">' + t("select_exercise_option") + '</option>';
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
    var autoincData = {
      auto_increment: gymAutoincEnabled.checked,
      increment_kg: parseFloat(gymAutoincIncrement.value) || 2.5,
      reset_increment_kg: parseFloat(gymAutoincReset.value) || 5,
    };
    if (exerciseId) {
      // Edit: only update weight/sets/reps/rest + auto-increment fields
      var data = Object.assign({
        weight: parseFloat(gymExWeightInput.value) || 0,
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      }, autoincData);
      closeGymModal();
      updateExercise(programId, exerciseId, data);
    } else {
      // Add: send exercise_id from library
      var selectedExId = parseInt(gymExSelectInput.value, 10);
      if (!selectedExId) return;
      var data = Object.assign({
        exercise_id: selectedExId,
        weight: parseFloat(gymExWeightInput.value) || 0,
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      }, autoincData);
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
        workoutProgramSelect.innerHTML = '<option value="">' + t("no_active_programs_option") + '</option>';
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
    gymFailedExercises.clear();
    workoutIdleEl.hidden = true;
    workoutActiveEl.hidden = false;
    activeProgramNameEl.textContent = gymActiveSession.program_name;
    workoutStartTimeEl.textContent = t("workout_started") + formatDate(gymActiveSession.started_at);
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
        '<span class="ewc-last-perf">' + t("last_perf_prefix") +
        ex.last_performance.weight_used + "\u00a0kg \u00d7 " +
        ex.last_performance.reps_done +
        " \u00b7 " + formatDate(ex.last_performance.completed_at) + "</span>";
    }
    var autoincBadge = ex.auto_increment
      ? ' <span class="autoinc-badge" title="' + t("autoinc_label") + '">' + t("autoinc_badge") + "</span>"
      : "";
    var isFailed = gymFailedExercises.has(ex.id);
    var failBtnHtml = ex.auto_increment
      ? '<button class="btn ewc-fail-btn' + (isFailed ? " ewc-failed" : "") + '" data-ex-id="' + ex.id + '">' +
        (isFailed ? t("failed_label") : t("fail_btn")) + "</button>"
      : "";
    card.innerHTML =
      '<div class="ewc-header">' +
      '<span class="ewc-name">' + escapeHtml(ex.exercise_name) + autoincBadge + "</span>" +
      lastPerfHtml +
      "</div>" +
      '<div class="ewc-weight-static">' + currentWeight + "\u00a0kg \u00d7\u00a0" + ex.reps + t("reps_suffix") + "</div>" +
      '<div class="ewc-rest-static">' + t("rest_short") + currentRest + "\u00a0s</div>" +
      '<div class="ewc-progress">' + t("sets_progress") + '<strong class="ewc-sets-done">' + done + "</strong>\u00a0/\u00a0" + ex.sets + "</div>" +
      '<div class="ewc-rest-info" hidden>' +
      '<span class="ewc-countdown" id="countdown-' + ex.id + '">' + formatGymSeconds(currentRest) + "</span>" +
      '<span class="ewc-rest-label">' + t("rest_countdown_label") + "</span>" +
      "</div>" +
      '<div class="ewc-done-banner" ' + (state === "done" ? "" : "hidden") + ">" + t("all_sets_done_text") + "</div>" +
      '<div class="ewc-actions">' +
      '<button class="btn btn-primary ewc-log-btn" data-ex-id="' + ex.id + '"' + (state !== "idle" ? " hidden" : "") + ">" + t("log_set_btn") + "</button>" +
      '<button class="btn btn-secondary ewc-skip-btn" data-ex-id="' + ex.id + '" hidden>' + t("skip_rest_btn") + "</button>" +
      failBtnHtml +
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
    // "Sarja tehty"
    var logBtn = e.target.closest(".ewc-log-btn");
    if (logBtn && gymActiveSession) {
      var exId = parseInt(logBtn.dataset.exId, 10);
      var exercise = gymActiveExercises.find(function (ex) { return ex.id === exId; });
      if (!exercise || gymExerciseStates[exId] !== "idle") return;
      var weightUsed = exercise.weight;
      var restSecs = exercise.rest_seconds;
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

    // "Fail" button — toggle failed state for auto-increment exercises
    var failBtn = e.target.closest(".ewc-fail-btn");
    if (failBtn) {
      var exId = parseInt(failBtn.dataset.exId, 10);
      if (gymFailedExercises.has(exId)) {
        gymFailedExercises.delete(exId);
        failBtn.textContent = t("fail_btn");
        failBtn.classList.remove("ewc-failed");
      } else {
        gymFailedExercises.add(exId);
        failBtn.textContent = t("failed_label");
        failBtn.classList.add("ewc-failed");
      }
    }
  });

  completeWorkoutBtn.addEventListener("click", function () {
    if (!gymActiveSession) return;
    var hasProgressive = gymActiveExercises.some(function (ex) { return ex.auto_increment; });
    document.getElementById("cwm-normal").textContent = t("complete_workout_normal");
    document.getElementById("cwm-failed").textContent = t("complete_workout_failed");
    document.getElementById("cwm-stay").textContent = t("complete_stay_weight");
    document.getElementById("cwm-reset").textContent = t("complete_reset_cycle");
    document.getElementById("cwm-step1").hidden = false;
    document.getElementById("cwm-failed").hidden = !hasProgressive;
    document.getElementById("cwm-step2").hidden = true;
    document.getElementById("complete-workout-modal").hidden = false;
  });

  document.getElementById("cwm-normal").addEventListener("click", function () {
    doCompleteWorkout("success");
  });
  document.getElementById("cwm-failed").addEventListener("click", function () {
    document.getElementById("cwm-step1").hidden = true;
    document.getElementById("cwm-step2").hidden = false;
  });
  document.getElementById("cwm-stay").addEventListener("click", function () {
    doCompleteWorkout("failed_stay");
  });
  document.getElementById("cwm-reset").addEventListener("click", function () {
    doCompleteWorkout("failed_reset");
  });

  async function doCompleteWorkout(outcome) {
    document.getElementById("complete-workout-modal").hidden = true;
    try {
      await apiFetch(GYM_API + "/sessions/" + gymActiveSession.id + "/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          failed_exercise_ids: Array.from(gymFailedExercises),
          session_outcome: outcome,
        }),
      });
      gymFailedExercises.clear();
      stopAllGymTimers();
      gymActiveSession = null;
      gymActiveExercises = [];
      gymSetsDone = {};
      gymExerciseStates = {};
      localStorage.removeItem("gymActiveSessionId");
      workoutActiveEl.hidden = true;
      workoutIdleEl.hidden = false;
    } catch (_) {}
  }

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
      sessionsListEl.innerHTML = '<p class="empty-state">' + t("no_sessions_text") + '</p>';
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
        ? '<span class="session-badge done">' + t("session_badge_done") + '</span>'
        : '<span class="session-badge active">' + t("session_badge_active") + '</span>';

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
        setsEl.innerHTML = '<p class="session-no-sets">' + t("no_sets_text") + '</p>';
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
      setsEl.innerHTML = '<p class="session-no-sets">' + t("sets_load_error") + '</p>';
    }
  });

})();
