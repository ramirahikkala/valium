(function () {
  "use strict";

  // ---------- i18n ----------

  var STRINGS = {
    fi: {
      // Navigaatio
      gym: "Sali",
      workout_tab: "Treeni",
      programs_tab: "Ohjelmat",
      history_tab: "Historia",
      progress_tab: "Kehitys",

      // Kirjautuminen
      subtitle: "Pikkuapurisi asioiden hoitamiseen",
      sign_out: "Kirjaudu ulos",
      error_generic: "Jotain meni pieleen",
      error_login_failed: "Kirjautuminen epäonnistui: ",
      error_client_id: "Google-kirjautumista ei ole konfiguroitu palvelimelle",
      error_auth_config: "Kirjautumisasetuksia ei voitu ladata",

      // Yleiset
      cancel: "Peruuta",
      save: "Tallenna",
      back: "Takaisin",
      create_btn: "Luo",
      add_btn: "Lisää",
      edit_btn: "Muokkaa",
      delete_btn: "Poista",
      rename_btn: "Nimeä",
      rename_prompt: "Uusi nimi:",

      // Sali — ohjelmat
      programs_heading: "Ohjelmat",
      add_program_btn: "+ Uusi ohjelma",
      show_archived_label: "Näytä arkistoidut",
      exercises_heading: "Liikkeet",
      add_exercise_lib_btn: "+ Lisää",
      exercise_name_placeholder: "Liikkeen nimi",
      program_name_placeholder: "Ohjelman nimi",
      no_exercises_library: "Ei liikkeitä. Lisää liike yllä.",
      delete_exercise_confirm: "Poistetaanko liike? Se poistetaan myös kaikista ohjelmista.",
      delete_session_btn: "Poista treeni",
      delete_session_confirm: "Poistetaanko tämä treeni historiasta?",
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
      deload_mode_label: "Deload-tyyppi",
      deload_mode_reset: "Pohjapaino + nousu",
      deload_mode_percent: "\u221210\u00a0% (StrongLifts)",
      failure_threshold_label: "Epäonnistumisia ennen deloadia",
      autoinc_badge: "↑",
      fail_btn: "Fail",
      failed_label: "Failed ✗",

      // Sali — treeni
      workout_idle_heading: "Aloita treeni",
      last_session_label: "Edellinen treeni",
      last_session_today: "tänään",
      last_session_yesterday: "eilen",
      last_session_days_ago: "{n} päivää sitten",
      label_select_program: "Valitse ohjelma",
      start_workout_btn: "Aloita treeni",
      complete_workout_btn_text: "Treeni valmis!",
      cancel_workout_btn: "Keskeytä treeni",
      cancel_workout_confirm: "Keskeytä treeni? Sarjoja ei tallenneta eikä painoja päivitetä.",
      no_active_programs_option: "Ei aktiivisia ohjelmia",
      last_perf_prefix: "Edellinen: ",
      reps_suffix: "\u00a0toistoa",
      sets_progress: "Sarjat: ",
      rest_countdown_label: "lepotauko",
      all_sets_done_text: "\u2713 Kaikki sarjat tehty!",
      log_set_btn: "Sarja tehty",
      skip_rest_btn: "Ohita tauko",
      complete_workout_heading: "Treeni valmis!",
      cwm_confirm_btn: "Valmis!",
      cwm_next_label: "Ensi kerta",
      cwm_deload_label: "deload",
      cwm_same_label: "sama paino",
      cwm_no_change_label: "ei automaattia",
      workout_started: "Aloitettu: ",

      // Sali — historia
      history_heading: "Historia",
      no_sessions_text: "Ei treenejä vielä.",
      session_badge_done: "Valmis",
      session_badge_active: "Kesken",
      no_sets_text: "Ei kirjattuja sarjoja.",
      sets_load_error: "Virhe haettaessa sarjoja.",
      sessions_load_error: "Virhe haettaessa treenejä.",

      // Sali — kehitys
      progress_heading: "Kehityskäyrät",
      progress_select_exercise: "Valitse liike",
      progress_no_exercises: "Ei liikkeitä kirjastossa.",
      progress_no_data: "Ei dataa tälle liikkeelle.",
      progress_load_error: "Virhe haettaessa dataa.",
      progress_chart_weight: "Paino (kg)",
      progress_sets_label: "Sarjat",
      progress_range_3m: "3 kk",
      progress_range_6m: "6 kk",
      progress_range_1y: "1 v",
      progress_range_all: "Kaikki",
      progress_stats_reps: "Toistot",
      progress_stats_min: "Min",
      progress_stats_max: "Max",
    },
    en: {
      // Navigation
      gym: "Gym",
      workout_tab: "Workout",
      programs_tab: "Programs",
      history_tab: "History",
      progress_tab: "Progress",

      // Login
      subtitle: "Your little helper for getting things done",
      sign_out: "Sign out",
      error_generic: "Something went wrong",
      error_login_failed: "Login failed: ",
      error_client_id: "Google login is not configured on the server",
      error_auth_config: "Could not load auth settings",

      // Common
      cancel: "Cancel",
      save: "Save",
      back: "Back",
      create_btn: "Create",
      add_btn: "Add",
      edit_btn: "Edit",
      delete_btn: "Delete",
      rename_btn: "Rename",
      rename_prompt: "New name:",

      // Gym — programs
      programs_heading: "Programs",
      add_program_btn: "+ New program",
      show_archived_label: "Show archived",
      exercises_heading: "Exercises",
      add_exercise_lib_btn: "+ Add",
      exercise_name_placeholder: "Exercise name",
      program_name_placeholder: "Program name",
      no_exercises_library: "No exercises. Add one above.",
      delete_exercise_confirm: "Delete exercise? It will also be removed from all programs.",
      delete_session_btn: "Delete workout",
      delete_session_confirm: "Delete this workout from history?",
      no_programs_empty: "No programs. Create one above.",
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

      // Gym — auto-increment
      autoinc_label: "Progressive overload",
      autoinc_increment_label: "Increase per workout (kg)",
      autoinc_reset_label: "Base increase on reset (kg)",
      deload_mode_label: "Deload type",
      deload_mode_reset: "Base weight + increase",
      deload_mode_percent: "\u221210\u00a0% (StrongLifts)",
      failure_threshold_label: "Failures before deload",
      autoinc_badge: "↑",
      fail_btn: "Fail",
      failed_label: "Failed ✗",

      // Gym — workout
      workout_idle_heading: "Start workout",
      last_session_label: "Last workout",
      last_session_today: "today",
      last_session_yesterday: "yesterday",
      last_session_days_ago: "{n} days ago",
      label_select_program: "Select program",
      start_workout_btn: "Start workout",
      complete_workout_btn_text: "Finish workout!",
      cancel_workout_btn: "Cancel workout",
      cancel_workout_confirm: "Cancel workout? Sets won't be saved and weights won't be updated.",
      no_active_programs_option: "No active programs",
      last_perf_prefix: "Previous: ",
      reps_suffix: "\u00a0reps",
      sets_progress: "Sets: ",
      rest_countdown_label: "rest",
      all_sets_done_text: "\u2713 All sets done!",
      log_set_btn: "Set done",
      skip_rest_btn: "Skip rest",
      complete_workout_heading: "Workout done!",
      cwm_confirm_btn: "Done!",
      cwm_next_label: "Next time",
      cwm_deload_label: "deload",
      cwm_same_label: "same weight",
      cwm_no_change_label: "no auto",
      workout_started: "Started: ",

      // Gym — history
      history_heading: "History",
      no_sessions_text: "No workouts yet.",
      session_badge_done: "Done",
      session_badge_active: "Active",
      no_sets_text: "No logged sets.",
      sets_load_error: "Error loading sets.",
      sessions_load_error: "Error loading workouts.",

      // Gym — progress
      progress_heading: "Progress",
      progress_select_exercise: "Select exercise",
      progress_no_exercises: "No exercises in library.",
      progress_no_data: "No data for this exercise.",
      progress_load_error: "Error loading data.",
      progress_chart_weight: "Weight (kg)",
      progress_sets_label: "Sets",
      progress_range_3m: "3 mo",
      progress_range_6m: "6 mo",
      progress_range_1y: "1 yr",
      progress_range_all: "All",
      progress_stats_reps: "Reps",
      progress_stats_min: "Min",
      progress_stats_max: "Max",
    },
  };

  var LOCALES = { fi: "fi-FI", en: "en-GB" };
  var currentLang = localStorage.getItem("lang") || "fi";

  function t(key) {
    return (STRINGS[currentLang] || STRINGS.fi)[key] || key;
  }

  function tf(key, vars) {
    var str = t(key);
    Object.keys(vars).forEach(function (k) {
      str = str.replace("{" + k + "}", vars[k]);
    });
    return str;
  }

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

  var API_AUTH = "/api/auth";
  var GYM_API = "/api/gym";

  var loginScreen = document.getElementById("login-screen");
  var loginError = document.getElementById("login-error");
  var googleSigninBtn = document.getElementById("google-signin-btn");
  var appContainer = document.getElementById("app-container");
  var errorEl = document.getElementById("error-message");

  var authToken = localStorage.getItem("authToken") || null;
  var currentUser = null;

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    setTimeout(function () { errorEl.hidden = true; }, 5000);
  }

  async function apiFetch(url, options) {
    try {
      options = options || {};
      options.headers = options.headers || {};
      if (authToken) options.headers["Authorization"] = "Bearer " + authToken;
      if (options.body instanceof FormData) delete options.headers["Content-Type"];
      var res = await fetch(url, options);
      if (res.status === 401) { signOut(); return null; }
      if (!res.ok) {
        var body = null;
        try { body = await res.json(); } catch (_) {}
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
    authToken = null;
    currentUser = null;
    localStorage.removeItem("authToken");
    showLogin();
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
    if (!authToken) { showLogin(); return; }
    try {
      var user = await apiFetch(API_AUTH + "/me");
      if (!user) return;
      currentUser = user;
      await initApp();
    } catch (_) {
      showLogin();
    }
  }

  function initGoogleSignIn() {
    if (typeof google === "undefined" || !google.accounts) {
      setTimeout(initGoogleSignIn, 200);
      return;
    }
    fetch(API_AUTH + "/config")
      .then(function (res) { return res.json(); })
      .then(function (config) {
        if (!config.client_id) {
          loginError.textContent = t("error_client_id");
          loginError.hidden = false;
          return;
        }
        google.accounts.id.initialize({ client_id: config.client_id, callback: handleGoogleCredential });
        googleSigninBtn.innerHTML = "";
        google.accounts.id.renderButton(googleSigninBtn, { theme: "outline", size: "large", width: 280, text: "signin_with" });
      })
      .catch(function () {
        loginError.textContent = t("error_auth_config");
        loginError.hidden = false;
      });
  }


  async function initApp() {
    await loadUserSettings();
    ValiumCommon.init({
      appName: t("gym"),
      user: currentUser,
      currentLang: currentLang,
      onSignOut: signOut,
      onLanguageChange: async function (lang) {
        await apiFetch("/api/user/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang }),
        });
        localStorage.setItem("lang", lang);
        location.reload();
      },
    });
    showApp();
    // Restore tab from URL hash
    var hashParts = location.hash.slice(1).split("/");
    var hashTab = hashParts[0] || "programs";
    var validTabs = ["programs", "workout", "history", "progress"];
    gymCurrentTab = validTabs.indexOf(hashTab) !== -1 ? hashTab : "programs";
    switchGymTab(gymCurrentTab);
  }

  // ---------- Utilities ----------

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    return d.toLocaleDateString(LOCALES[currentLang] || "fi-FI", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
  }

  function relativeDay(dateStr) {
    if (!dateStr) return "";
    var then = new Date(dateStr);
    var now = new Date();
    var thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
    var nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diffDays = Math.round((nowDay - thenDay) / 86400000);
    if (diffDays === 0) return t("last_session_today");
    if (diffDays === 1) return t("last_session_yesterday");
    return t("last_session_days_ago").replace("{n}", diffDays);
  }

  function formatGymSeconds(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  // ========== GYM MODULE ==========

  // Gym state
  var gymExerciseLibrary = [];
  var gymActiveSession = null;
  var gymActiveExercises = [];
  var gymSetsDone = {};
  var gymExerciseTimers = {};
  var gymExerciseStates = {};
  var gymWorkoutWeights = {};
  var gymWorkoutRests = {};
  var gymCurrentTab = "programs";
  var gymPrograms = [];
  var selectedProgramId = null;
  var gymFailedExercises = new Set();

  // Tab buttons
  var gymTabButtons = document.querySelectorAll(".sidebar-gym-btn");

  // Gym DOM elements — sections
  var gymProgramsSection = document.getElementById("gym-programs");
  var gymWorkoutSection = document.getElementById("gym-workout");
  var gymHistorySection = document.getElementById("gym-history");
  var gymProgressSection = document.getElementById("gym-progress");

  // Gym DOM elements — programs
  var programsListEl = document.getElementById("programs-list");
  var programDetailEl = document.getElementById("program-detail");
  var gymSectionActionsEl = document.querySelector("#gym-programs .gym-section-actions");
  var exerciseLibraryEl = document.querySelector("#gym-programs .exercise-library");
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
  var lastSessionInfoEl = document.getElementById("last-session-info");
  var startWorkoutBtn = document.getElementById("start-workout-btn");
  var completeWorkoutBtn = document.getElementById("complete-workout-btn");
  var cancelWorkoutBtn = document.getElementById("cancel-workout-btn");
  var activeProgramNameEl = document.getElementById("active-program-name");
  var workoutStartTimeEl = document.getElementById("workout-start-time");
  var activeExercisesEl = document.getElementById("active-exercises");

  // Gym DOM elements — history
  var sessionsListEl = document.getElementById("sessions-list");

  // Gym DOM elements — progress
  var progressAccordion = document.getElementById("progress-accordion");
  var progressCharts = {};
  var progressData = {};

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
  var gymDeloadMode = document.getElementById("gym-deload-mode");
  var gymResetGroup = document.getElementById("gym-reset-group");
  var gymFailureThreshold = document.getElementById("gym-failure-threshold");
  var gymModalProgramFields = document.getElementById("gym-modal-program-fields");
  var gymModalConfigFields = document.getElementById("gym-modal-config-fields");
  var gymModalMode = "add";

  gymAutoincEnabled.addEventListener("change", function () {
    gymAutoincSettings.hidden = !gymAutoincEnabled.checked;
  });

  gymDeloadMode.addEventListener("change", function () {
    gymResetGroup.hidden = gymDeloadMode.value === "percent";
  });

  // ---------- Tab switching ----------

  gymTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchGymTab(btn.dataset.gymTab);
    });
  });

  function switchGymTab(tab) {
    gymCurrentTab = tab;
    location.hash = tab;
    gymTabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.gymTab === tab);
    });
    gymProgramsSection.hidden = tab !== "programs";
    gymWorkoutSection.hidden = tab !== "workout";
    gymHistorySection.hidden = tab !== "history";
    gymProgressSection.hidden = tab !== "progress";
    if (tab === "programs") loadGymPrograms();
    else if (tab === "workout") loadWorkoutTab();
    else if (tab === "history") loadGymHistory();
    else if (tab === "progress") loadGymProgress();
  }

  // ---------- Programs ----------

  async function loadExerciseLibrary() {
    try {
      var exs = await apiFetch(GYM_API + "/exercises");
      if (exs) { gymExerciseLibrary = exs; renderExerciseLibrary(); }
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
      var weightInfo = ex.auto_increment
        ? ex.weight + "\u00a0kg" + (ex.consecutive_failures > 0 ? " \u00b7 " + ex.consecutive_failures + "/" + ex.failure_threshold + " ep." : "")
        : ex.weight + "\u00a0kg";
      row.innerHTML =
        '<div class="library-exercise-info">' +
        '<span class="library-exercise-name">' + escapeHtml(ex.name) + "</span>" +
        '<span class="library-exercise-meta">' + weightInfo + "</span>" +
        "</div>" +
        '<div class="library-exercise-btns">' +
        '<button class="btn btn-icon btn-sm" data-action="configure-exercise" data-id="' + ex.id +
        '" data-name="' + escapeHtml(ex.name) + '">' + t("edit_exercise_btn") + '</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete-library-exercise" data-id="' + ex.id + '">' + t("delete_btn") + '</button>' +
        "</div>";
      libraryExercisesListEl.appendChild(row);
    });
  }

  libraryExercisesListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "configure-exercise") {
      var ex = gymExerciseLibrary.find(function (e) { return e.id === id; });
      if (ex) openGymModal("config", { exerciseId: ex.id, exerciseName: ex.name, weight: ex.weight, auto_increment: ex.auto_increment, increment_kg: ex.increment_kg, reset_increment_kg: ex.reset_increment_kg, deload_mode: ex.deload_mode, failure_threshold: ex.failure_threshold });
    } else if (btn.dataset.action === "delete-library-exercise") {
      if (confirm(t("delete_exercise_confirm"))) deleteLibraryExercise(id);
    }
  });

  addLibraryExerciseBtn.addEventListener("click", function (e) {
    e.preventDefault();
    exerciseLibraryEl.open = true;
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

  async function updateExerciseConfig(id, data) {
    try {
      await apiFetch(GYM_API + "/exercises/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await loadExerciseLibrary();
      await loadGymPrograms();
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
      if (selectedProgramId) {
        var prog = gymPrograms.find(function (p) { return p.id === selectedProgramId; });
        if (prog) showProgramDetail(prog);
        else { showProgramList(); renderProgramsList(); }
      } else {
        renderProgramsList();
      }
    } catch (_) {}
  }

  function showProgramList() {
    selectedProgramId = null;
    programDetailEl.hidden = true;
    programsListEl.hidden = false;
    gymSectionActionsEl.hidden = false;
    exerciseLibraryEl.hidden = false;
    addProgramFormWrap.hidden = true;
  }

  function showProgramDetail(program) {
    selectedProgramId = program.id;
    gymSectionActionsEl.hidden = true;
    exerciseLibraryEl.hidden = true;
    addProgramFormWrap.hidden = true;
    programsListEl.hidden = true;
    renderProgramDetail(program);
    programDetailEl.hidden = false;
  }

  function renderProgramsList() {
    programsListEl.innerHTML = "";
    if (gymPrograms.length === 0) {
      programsListEl.innerHTML = '<p class="empty-state">' + t("no_programs_empty") + '</p>';
      return;
    }
    gymPrograms.forEach(function (program) {
      var row = document.createElement("div");
      row.className = "program-row";
      row.dataset.id = program.id;
      row.innerHTML =
        '<div class="program-row-info">' +
        '<span class="program-name">' + escapeHtml(program.name) + '</span>' +
        '<span class="program-badge ' + (program.is_active ? "active" : "archived") + '">' +
        (program.is_active ? t("badge_active") : t("badge_archived")) + '</span>' +
        '</div>' +
        '<span class="program-row-chevron">›</span>';
      programsListEl.appendChild(row);
    });
  }

  function buildExercisesHtml(program) {
    if (!program.exercises || program.exercises.length === 0) {
      return '<p class="exercise-empty">' + t("no_exercises_program") + '</p>';
    }
    return program.exercises.map(function (ex) {
      var lastPerfStr = ex.last_performance
        ? ' · ' + t("last_perf_abbrev") + ex.last_performance.weight_used + 'kg\u00d7' + ex.last_performance.reps_done
        : '';
      var failStr = (ex.auto_increment && ex.consecutive_failures > 0)
        ? ' · <span class="failure-badge">' + ex.consecutive_failures + '/' + ex.failure_threshold + ' ep.</span>'
        : '';
      return (
        '<div class="exercise-row" data-ex-id="' + ex.id + '">' +
        '<div class="exercise-info">' +
        '<span class="exercise-name">' + escapeHtml(ex.exercise_name) + '</span>' +
        '<span class="exercise-meta">' + ex.weight + '\u00a0kg \u00d7 ' + ex.reps + ' \u00d7 ' + ex.sets + '\u00a0' + t("sets_label") + ' \u00b7 ' + t("rest_short") + ex.rest_seconds + 's' + lastPerfStr + failStr + '</span>' +
        '</div>' +
        '<div class="exercise-btns">' +
        '<button class="btn btn-icon btn-sm" data-action="edit-exercise"' +
        ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '"' +
        ' data-ex-exercise-name="' + escapeHtml(ex.exercise_name) + '"' +
        ' data-ex-sets="' + ex.sets + '" data-ex-reps="' + ex.reps +
        '" data-ex-rest="' + ex.rest_seconds + '">' + t("edit_exercise_btn") + '</button>' +
        '<button class="btn btn-danger btn-sm" data-action="delete-exercise"' +
        ' data-ex-id="' + ex.id + '" data-program-id="' + program.id + '">' + t("delete_btn") + '</button>' +
        '</div></div>'
      );
    }).join("");
  }

  function renderProgramDetail(program) {
    programDetailEl.innerHTML =
      '<div class="program-detail-back">' +
      '<button class="btn btn-secondary btn-sm" id="program-back-btn">&#8592; ' + t("back") + '</button>' +
      '</div>' +
      '<div class="program-card' + (program.is_active ? '' : ' archived') + '">' +
      '<div class="program-card-header">' +
      '<div class="program-title-row">' +
      '<h3 class="program-name">' + escapeHtml(program.name) + '</h3>' +
      '<span class="program-badge ' + (program.is_active ? 'active' : 'archived') + '">' +
      (program.is_active ? t("badge_active") : t("badge_archived")) + '</span>' +
      '</div>' +
      '<div class="program-header-btns">' +
      '<button class="btn btn-icon btn-sm" data-action="rename-program" data-id="' + program.id +
      '" data-name="' + escapeHtml(program.name) + '">' + t("rename_btn") + '</button>' +
      (program.is_active
        ? '<button class="btn btn-secondary btn-sm" data-action="archive-program" data-id="' + program.id + '">' + t("archive_btn") + '</button>'
        : '<button class="btn btn-secondary btn-sm" data-action="restore-program" data-id="' + program.id + '">' + t("restore_btn") + '</button>') +
      '<button class="btn btn-danger btn-sm" data-action="delete-program" data-id="' + program.id + '">' + t("delete_btn") + '</button>' +
      '</div></div>' +
      '<div class="exercises-list">' + buildExercisesHtml(program) + '</div>' +
      '<button class="btn btn-icon btn-sm add-exercise-btn" data-action="add-exercise" data-program-id="' + program.id + '">' + t("add_exercise_btn") + '</button>' +
      '</div>';
  }

  programsListEl.addEventListener("click", function (e) {
    var row = e.target.closest(".program-row");
    if (!row) return;
    var id = parseInt(row.dataset.id, 10);
    var prog = gymPrograms.find(function (p) { return p.id === id; });
    if (prog) showProgramDetail(prog);
  });

  programDetailEl.addEventListener("click", function (e) {
    if (e.target.id === "program-back-btn" || e.target.closest("#program-back-btn")) {
      showProgramList();
      renderProgramsList();
      return;
    }
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
      var pname = programDetailEl.querySelector(".program-name").textContent;
      if (confirm(tf("delete_program_confirm", { name: pname }))) {
        selectedProgramId = null;
        deleteProgram(id);
      }
    } else if (action === "add-exercise") {
      openGymModal("add", { programId: parseInt(btn.dataset.programId, 10) });
    } else if (action === "edit-exercise") {
      openGymModal("edit", {
        programId: parseInt(btn.dataset.programId, 10),
        exerciseId: parseInt(btn.dataset.exId, 10),
        exerciseName: btn.dataset.exExerciseName,
        sets: parseInt(btn.dataset.exSets, 10),
        reps: parseInt(btn.dataset.exReps, 10),
        rest_seconds: parseInt(btn.dataset.exRest, 10),
      });
    } else if (action === "delete-exercise") {
      var programId = parseInt(btn.dataset.programId, 10);
      var exerciseId = parseInt(btn.dataset.exId, 10);
      var exRow = btn.closest(".exercise-row");
      var ename = exRow ? exRow.querySelector(".exercise-name").textContent : t("fallback_exercise");
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
      await apiFetch(GYM_API + "/programs/" + programId + "/exercises/" + exerciseId, { method: "DELETE" });
      await loadGymPrograms();
    } catch (_) {}
  }

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
    gymModalMode = mode;
    gymModalProgramId.value = data.programId || "";
    gymModalExerciseId.value = data.exerciseId || "";
    gymExSetsInput.value = data.sets || 3;
    gymExRepsInput.value = data.reps || 10;
    gymExRestInput.value = data.rest_seconds !== undefined ? data.rest_seconds : 90;
    gymExWeightInput.value = data.weight !== undefined ? data.weight : 0;
    gymAutoincEnabled.checked = !!data.auto_increment;
    gymAutoincSettings.hidden = !data.auto_increment;
    gymAutoincIncrement.value = String(data.increment_kg !== undefined ? data.increment_kg : 2.5);
    gymAutoincReset.value = data.reset_increment_kg !== undefined ? data.reset_increment_kg : 5;
    gymDeloadMode.value = data.deload_mode || "reset";
    gymResetGroup.hidden = (data.deload_mode === "percent");
    gymFailureThreshold.value = data.failure_threshold !== undefined ? data.failure_threshold : 3;

    if (mode === "config") {
      gymModalTitle.textContent = t("gym_modal_edit_heading");
      gymModalProgramFields.hidden = true;
      gymModalConfigFields.hidden = false;
      gymExSelectInput.required = false;
      gymModalSelectGroup.hidden = true;
      gymModalNameDisplay.hidden = false;
      gymModalExerciseNameEl.value = data.exerciseName || "";
      gymModalExerciseNameEl.readOnly = false;
      gymModal.hidden = false;
      gymModalExerciseNameEl.focus();
    } else if (mode === "edit") {
      gymModalTitle.textContent = t("gym_modal_edit_heading");
      gymModalProgramFields.hidden = false;
      gymModalConfigFields.hidden = true;
      gymExSelectInput.required = false;
      gymModalSelectGroup.hidden = true;
      gymModalNameDisplay.hidden = false;
      gymModalExerciseNameEl.value = data.exerciseName || "";
      gymModalExerciseNameEl.readOnly = true;
      gymModal.hidden = false;
      gymExSetsInput.focus();
    } else {
      gymModalTitle.textContent = t("gym_modal_add_heading");
      gymModalProgramFields.hidden = false;
      gymModalConfigFields.hidden = true;
      gymExSelectInput.required = true;
      gymModalSelectGroup.hidden = false;
      gymModalNameDisplay.hidden = true;
      gymExSelectInput.innerHTML = '<option value="">' + t("select_exercise_option") + '</option>';
      gymExerciseLibrary.forEach(function (ex) {
        var opt = document.createElement("option");
        opt.value = ex.id;
        opt.textContent = ex.name;
        gymExSelectInput.appendChild(opt);
      });
      gymModal.hidden = false;
      gymExSelectInput.focus();
    }
  }

  function closeGymModal() {
    gymModal.hidden = true;
    gymModalForm.reset();
  }

  gymModalCancelBtn.addEventListener("click", closeGymModal);
  gymModal.addEventListener("click", function (e) { if (e.target === gymModal) closeGymModal(); });

  gymModalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var exerciseId = gymModalExerciseId.value ? parseInt(gymModalExerciseId.value, 10) : null;

    if (gymModalMode === "config") {
      var configData = {
        name: gymModalExerciseNameEl.value.trim() || undefined,
        weight: parseFloat(gymExWeightInput.value) || 0,
        auto_increment: gymAutoincEnabled.checked,
        increment_kg: parseFloat(gymAutoincIncrement.value) || 2.5,
        reset_increment_kg: parseFloat(gymAutoincReset.value) || 5,
        deload_mode: gymDeloadMode.value || "reset",
        failure_threshold: parseInt(gymFailureThreshold.value, 10) || 3,
      };
      closeGymModal();
      updateExerciseConfig(exerciseId, configData);
    } else if (gymModalMode === "edit") {
      var programId = parseInt(gymModalProgramId.value, 10);
      var layoutData = {
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      };
      closeGymModal();
      updateExercise(programId, exerciseId, layoutData);
    } else {
      var programId = parseInt(gymModalProgramId.value, 10);
      var selectedExId = parseInt(gymExSelectInput.value, 10);
      if (!selectedExId) return;
      var addData = {
        exercise_id: selectedExId,
        sets: parseInt(gymExSetsInput.value, 10) || 3,
        reps: parseInt(gymExRepsInput.value, 10) || 10,
        rest_seconds: parseInt(gymExRestInput.value, 10) || 0,
      };
      closeGymModal();
      createExercise(programId, addData);
    }
  });

  // ---------- Workout ----------

  async function loadWorkoutTab() {
    var sessions;
    try {
      sessions = await apiFetch(GYM_API + "/sessions");
    } catch (_) {}

    lastSessionInfoEl.hidden = true;
    if (sessions) {
      var lastDone = sessions.find(function (s) { return s.completed_at; });
      if (lastDone) {
        var ago = relativeDay(lastDone.completed_at || lastDone.started_at);
        lastSessionInfoEl.innerHTML =
          '<span class="last-session-label">' + t("last_session_label") + ':</span> ' +
          '<strong>' + (lastDone.program_name || "–") + '</strong>' +
          '<span class="last-session-ago"> · ' + ago + '</span>';
        lastSessionInfoEl.hidden = false;
      }
    }

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

    // Resume any incomplete session automatically
    if (sessions) {
      var incomplete = sessions.find(function (s) { return !s.completed_at; });
      if (incomplete) {
        await restoreWorkoutSession(incomplete);
        return;
      }
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
            var pe = gymActiveExercises.find(function (ex) { return ex.exercise_id === s.exercise_id; });
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
      gymExerciseStates = {};
      gymWorkoutWeights = {};
      gymWorkoutRests = {};
      gymFailedExercises.clear();
      var exercises = await apiFetch(GYM_API + "/programs/" + programId + "/exercises");
      gymActiveExercises = exercises || [];
      renderActiveWorkout();
    } catch (_) {}
  });

  function renderActiveWorkout() {
    if (!gymActiveSession) return;
    activeProgramNameEl.textContent = gymActiveSession.program_name || "";
    var started = new Date(gymActiveSession.started_at);
    workoutStartTimeEl.textContent = t("workout_started") + started.toLocaleTimeString(LOCALES[currentLang] || "fi-FI", { hour: "2-digit", minute: "2-digit" });
    activeExercisesEl.innerHTML = "";
    gymActiveExercises.forEach(function (ex) {
      activeExercisesEl.appendChild(createExerciseWorkoutCard(ex));
      if ((gymSetsDone[ex.id] || 0) >= ex.sets) transitionToDone(ex.id);
    });
    workoutIdleEl.hidden = true;
    workoutActiveEl.hidden = false;
  }

  function createExerciseWorkoutCard(ex) {
    var card = document.createElement("div");
    card.className = "exercise-workout-card";
    card.dataset.exId = ex.id;

    var weight = gymWorkoutWeights[ex.id] !== undefined ? gymWorkoutWeights[ex.id] : ex.weight;
    var restSecs = gymWorkoutRests[ex.id] !== undefined ? gymWorkoutRests[ex.id] : ex.rest_seconds;
    var done = gymSetsDone[ex.id] || 0;

    var lastPerfHtml = ex.last_performance
      ? '<span class="ewc-last-perf">' + t("last_perf_prefix") + ex.last_performance.weight_used + "kg\u00d7" + ex.last_performance.reps_done + t("reps_suffix") + '</span>'
      : '';

    var autoincBadge = ex.auto_increment ? ' <span class="autoinc-badge">' + t("autoinc_badge") + '</span>' : '';

    card.innerHTML =
      '<div class="ewc-header">' +
      '<span class="ewc-name">' + escapeHtml(ex.exercise_name) + autoincBadge + '</span>' +
      lastPerfHtml +
      '</div>' +
      '<div class="ewc-weight-static">' + weight + ' kg \u00d7 ' + ex.reps + t("reps_suffix") + '</div>' +
      '<div class="ewc-rest-static">' + t("rest_countdown_label") + ': ' + restSecs + 's</div>' +
      '<div class="ewc-progress">' + t("sets_progress") + '<span class="ewc-sets-done">' + done + '</span>/' + ex.sets + '</div>' +
      '<div class="ewc-rest-info" hidden>' +
      '<span class="ewc-rest-label">' + t("rest_countdown_label") + ': </span>' +
      '<span class="ewc-countdown" id="countdown-' + ex.id + '">00:00</span>' +
      '</div>' +
      '<div class="ewc-done-banner" hidden>' + t("all_sets_done_text") + '</div>' +
      '<div class="ewc-actions">' +
      '<button class="btn ewc-log-btn" data-ex-id="' + ex.id + '">' + t("log_set_btn") + '</button>' +
      '<button class="btn ewc-skip-btn" data-ex-id="' + ex.id + '" hidden>' + t("skip_rest_btn") + '</button>' +
      (ex.auto_increment ? '<button class="btn ewc-fail-btn" data-ex-id="' + ex.id + '">' + t("fail_btn") + '</button>' : '') +
      (ex.auto_increment && ex.consecutive_failures > 0
        ? '<span class="ewc-fail-streak" title="' + ex.consecutive_failures + '/' + ex.failure_threshold + '">\u2717\u00a0' + ex.consecutive_failures + '\u00a0/\u00a0' + ex.failure_threshold + '</span>'
        : '') +
      '</div>';

    gymExerciseStates[ex.id] = gymExerciseStates[ex.id] || "idle";
    return card;
  }

  function transitionToIdle(exId) {
    gymExerciseStates[exId] = "idle";
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.querySelector(".ewc-log-btn").hidden = false;
    card.querySelector(".ewc-skip-btn").hidden = true;
    card.querySelector(".ewc-rest-info").hidden = true;
    card.classList.remove("resting");
  }

  function transitionToResting(exId) {
    var ex = gymActiveExercises.find(function (e) { return e.id === exId; });
    var restSecs = ex ? (gymWorkoutRests[exId] !== undefined ? gymWorkoutRests[exId] : ex.rest_seconds) : 90;
    gymExerciseStates[exId] = "resting";
    var card = activeExercisesEl.querySelector('[data-ex-id="' + exId + '"]');
    if (!card) return;
    card.querySelector(".ewc-log-btn").hidden = true;
    card.querySelector(".ewc-skip-btn").hidden = false;
    card.querySelector(".ewc-rest-info").hidden = false;
    card.classList.add("resting");
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

    // Auto-complete: if all exercises done, trigger completion flow
    if (gymActiveExercises.length > 0 && gymActiveExercises.every(function (ex) {
      return gymExerciseStates[ex.id] === "done";
    })) {
      completeWorkoutBtn.click();
    }
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
    Object.keys(gymExerciseTimers).forEach(function (exId) { stopGymTimer(exId); });
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

  activeExercisesEl.addEventListener("click", async function (e) {
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
            exercise_id: exercise.exercise_id,
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
      } catch (_) {}
      return;
    }

    var skipBtn = e.target.closest(".ewc-skip-btn");
    if (skipBtn) {
      var exId = parseInt(skipBtn.dataset.exId, 10);
      transitionToIdle(exId);
    }

    var failBtn = e.target.closest(".ewc-fail-btn");
    if (failBtn) {
      var exId = parseInt(failBtn.dataset.exId, 10);
      var nowFailed;
      if (gymFailedExercises.has(exId)) {
        gymFailedExercises.delete(exId);
        failBtn.textContent = t("fail_btn");
        failBtn.classList.remove("ewc-failed");
        nowFailed = false;
      } else {
        gymFailedExercises.add(exId);
        failBtn.textContent = t("failed_label");
        failBtn.classList.add("ewc-failed");
        nowFailed = true;
      }
      var ex = gymActiveExercises.find(function (e) { return e.id === exId; });
      if (ex && ex.auto_increment) {
        var card = activeExercisesEl.querySelector('.exercise-workout-card[data-ex-id="' + exId + '"]');
        if (card) {
          var actionsEl = card.querySelector(".ewc-actions");
          var streakEl = actionsEl ? actionsEl.querySelector(".ewc-fail-streak") : null;
          var projected = (ex.consecutive_failures || 0) + (nowFailed ? 1 : 0);
          var threshold = ex.failure_threshold || 3;
          if (projected > 0) {
            var streakText = "\u2717\u00a0" + projected + "\u00a0/\u00a0" + threshold;
            if (streakEl) {
              streakEl.textContent = streakText;
              streakEl.title = projected + " / " + threshold;
            } else if (actionsEl) {
              var newStreak = document.createElement("span");
              newStreak.className = "ewc-fail-streak";
              newStreak.title = projected + " / " + threshold;
              newStreak.textContent = streakText;
              actionsEl.appendChild(newStreak);
            }
          } else if (streakEl) {
            streakEl.remove();
          }
        }
      }
    }
  });

  function calcNextWeight(ex) {
    if (!ex.auto_increment) return null;
    var failed = gymFailedExercises.has(ex.id);
    if (!failed) return Math.round((ex.weight + ex.increment_kg) * 100) / 100;
    var newFailures = (ex.consecutive_failures || 0) + 1;
    if (newFailures >= (ex.failure_threshold || 3)) {
      if (ex.deload_mode === "percent") return Math.floor(ex.weight * 0.9 / 2.5) * 2.5;
      else return Math.round(((ex.base_weight || 0) + (ex.reset_increment_kg || 5)) * 100) / 100;
    }
    return ex.weight;
  }

  completeWorkoutBtn.addEventListener("click", function () {
    if (!gymActiveSession) return;
    var summaryEl = document.getElementById("cwm-summary-list");
    summaryEl.innerHTML = "";
    gymActiveExercises.forEach(function (ex) {
      var currentW = gymWorkoutWeights[ex.id] !== undefined ? gymWorkoutWeights[ex.id] : ex.weight;
      var nextW = calcNextWeight(ex);
      var row = document.createElement("div");
      row.className = "cwm-row";
      var nextHtml = "";
      if (nextW !== null) {
        var diff = Math.round((nextW - currentW) * 100) / 100;
        if (diff > 0) nextHtml = '<span class="cwm-next cwm-up">→ ' + nextW + ' kg ↑</span>';
        else if (diff < 0) nextHtml = '<span class="cwm-next cwm-down">→ ' + nextW + ' kg ↓ <em>' + t("cwm_deload_label") + '</em></span>';
        else nextHtml = '<span class="cwm-next cwm-same">→ ' + nextW + ' kg <em>' + t("cwm_same_label") + '</em></span>';
      }
      row.innerHTML =
        '<span class="cwm-name">' + escapeHtml(ex.exercise_name) + '</span>' +
        '<span class="cwm-weights"><strong>' + currentW + ' kg</strong>' + nextHtml + '</span>';
      summaryEl.appendChild(row);
    });
    document.getElementById("complete-workout-modal").hidden = false;
  });

  function closeCompleteWorkoutModal() {
    document.getElementById("complete-workout-modal").hidden = true;
  }

  document.getElementById("cwm-confirm").addEventListener("click", doCompleteWorkout);
  document.getElementById("cwm-cancel").addEventListener("click", closeCompleteWorkoutModal);

  async function doCompleteWorkout() {
    document.getElementById("complete-workout-modal").hidden = true;
    try {
      await apiFetch(GYM_API + "/sessions/" + gymActiveSession.id + "/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failed_exercise_ids: Array.from(gymFailedExercises) }),
      });
      gymFailedExercises.clear();
      stopAllGymTimers();
      gymActiveSession = null;
      gymActiveExercises = [];
      gymSetsDone = {};
      gymExerciseStates = {};
      workoutActiveEl.hidden = true;
      workoutIdleEl.hidden = false;
      await loadWorkoutTab();
    } catch (_) {}
  }

  cancelWorkoutBtn.addEventListener("click", async function () {
    if (!gymActiveSession) return;
    if (!confirm(t("cancel_workout_confirm"))) return;
    try {
      await apiFetch(GYM_API + "/sessions/" + gymActiveSession.id, { method: "DELETE" });
      gymFailedExercises.clear();
      stopAllGymTimers();
      gymActiveSession = null;
      gymActiveExercises = [];
      gymSetsDone = {};
      gymExerciseStates = {};
      workoutActiveEl.hidden = true;
      workoutIdleEl.hidden = false;
      await loadWorkoutTab();
    } catch (_) {}
  });

  // ---------- History ----------

  async function loadGymHistory() {
    try {
      var sessions = await apiFetch(GYM_API + "/sessions");
      if (sessions) renderGymSessionsList(sessions);
    } catch (_) {
      sessionsListEl.innerHTML = '<p class="empty-state">' + t("sessions_load_error") + '</p>';
    }
  }

  function renderGymSessionsList(sessions) {
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
        '<div class="session-header-actions">' +
        '<button class="btn btn-danger btn-xs" data-action="delete-session" data-id="' + s.id + '">\u2715</button>' +
        '<span class="session-toggle-icon">\u25bc</span>' +
        "</div>" +
        "</div>" +
        '<div class="session-sets" hidden></div>';

      sessionsListEl.appendChild(item);
    });
  }

  sessionsListEl.addEventListener("click", async function (e) {
    var deleteBtn = e.target.closest("[data-action='delete-session']");
    if (deleteBtn) {
      e.stopPropagation();
      if (!confirm(t("delete_session_confirm"))) return;
      var sessionId = parseInt(deleteBtn.dataset.id, 10);
      try {
        await apiFetch(GYM_API + "/sessions/" + sessionId, { method: "DELETE" });
        var item = deleteBtn.closest(".session-item");
        if (item) item.remove();
        if (!sessionsListEl.querySelector(".session-item")) {
          sessionsListEl.innerHTML = '<p class="empty-state">' + t("no_sessions_text") + '</p>';
        }
      } catch (_) {}
      return;
    }

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
        if (!byExercise[key]) { byExercise[key] = []; exerciseOrder.push(key); }
        byExercise[key].push(s);
      });
      var html = exerciseOrder.map(function (exName) {
        var exSets = byExercise[exName];
        var setsStr = exSets.map(function (s) { return s.weight_used + "\u00a0kg\u00d7" + s.reps_done; }).join(", ");
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

  // ---------- Progress ----------

  var progressRangeMonths = null;
  var progressExercises = null;

  var progressRangeBtns = document.querySelectorAll("[data-progress-range]");
  progressRangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      progressRangeBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      progressRangeMonths = btn.dataset.progressRange === "all" ? null : parseInt(btn.dataset.progressRange, 10);
      progressAccordion.querySelectorAll("details").forEach(function (det) {
        var exId = parseInt(det.dataset.exerciseId, 10);
        if (progressData[exId]) renderExerciseChartOnly(det, exId, progressData[exId]);
      });
    });
  });

  async function loadGymProgress() {
    if (progressExercises) return;
    var allTableEl = document.getElementById("progress-all-table");
    progressAccordion.innerHTML = '<p class="empty-state">\u2026</p>';

    try {
      var exercises = await apiFetch(GYM_API + "/exercises");
      if (!exercises || exercises.length === 0) {
        progressAccordion.innerHTML = '<p class="empty-state">' + t("progress_no_exercises") + '</p>';
        return;
      }
      progressExercises = exercises;

      var results = await Promise.all(exercises.map(function (ex) {
        return apiFetch(GYM_API + "/exercises/" + ex.id + "/progress")
          .then(function (d) { return { ex: ex, data: d || [] }; })
          .catch(function () { return { ex: ex, data: [] }; });
      }));

      results.forEach(function (r) { progressData[r.ex.id] = r.data; });
      renderAllExercisesTable(allTableEl, results);

      progressAccordion.innerHTML = "";
      results.forEach(function (r) {
        var det = document.createElement("details");
        det.className = "progress-ex-details";
        det.dataset.exerciseId = r.ex.id;
        det.open = true;
        var sum = document.createElement("summary");
        sum.className = "progress-ex-summary";
        sum.textContent = r.ex.name;
        det.appendChild(sum);
        var body = document.createElement("div");
        body.className = "progress-ex-body";
        det.appendChild(body);
        progressAccordion.appendChild(det);
        renderExerciseChartOnly(det, r.ex.id, r.data);
      });
    } catch (_) {
      progressAccordion.innerHTML = '<p class="empty-state">' + t("progress_load_error") + '</p>';
    }
  }

  function renderAllExercisesTable(tableEl, results) {
    if (!tableEl) return;
    var locale = LOCALES[currentLang] || "fi-FI";
    function fd(d) { return new Date(d).toLocaleDateString(locale, { day: "numeric", month: "numeric", year: "2-digit" }); }
    var rows = "";
    results.forEach(function (r) {
      if (!r.data.length) return;
      var byReps = {};
      r.data.forEach(function (point) {
        point.sets.forEach(function (s) {
          var rep = s.reps;
          if (!byReps[rep]) {
            byReps[rep] = { min: { weight: s.weight, date: point.date }, max: { weight: s.weight, date: point.date } };
          } else {
            if (s.weight < byReps[rep].min.weight) byReps[rep].min = { weight: s.weight, date: point.date };
            if (s.weight > byReps[rep].max.weight) byReps[rep].max = { weight: s.weight, date: point.date };
          }
        });
      });
      var repsList = Object.keys(byReps).map(Number).sort(function (a, b) { return a - b; });
      repsList.forEach(function (rep, i) {
        var rec = byReps[rep];
        rows += "<tr" + (i === 0 ? ' class="ex-first-row"' : "") + ">" +
          (i === 0 ? '<td class="ex-name" rowspan="' + repsList.length + '">' + escapeHtml(r.ex.name) + "</td>" : "") +
          "<td>" + rep + "\u00d7</td>" +
          "<td>" + rec.min.weight + "\u00a0kg</td><td class='stats-date'>" + fd(rec.min.date) + "</td>" +
          "<td>" + rec.max.weight + "\u00a0kg</td><td class='stats-date'>" + fd(rec.max.date) + "</td>" +
          "</tr>";
      });
    });
    if (!rows) { tableEl.hidden = true; return; }
    tableEl.hidden = false;
    tableEl.querySelector("tbody").innerHTML = rows;
  }

  function filterByRange(data) {
    if (progressRangeMonths === null) return data;
    var cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - progressRangeMonths);
    return data.filter(function (p) { return new Date(p.date) >= cutoff; });
  }

  function renderExerciseChartOnly(det, exerciseId, allData) {
    var body = det.querySelector(".progress-ex-body");
    var filtered = filterByRange(allData);
    var canvasId = "progress-chart-" + exerciseId;

    var existingChart = body.querySelector(".progress-chart-wrap");
    if (!existingChart) {
      body.innerHTML = '<div class="progress-chart-wrap"><canvas id="' + canvasId + '"></canvas></div>';
    } else {
      existingChart.innerHTML = '<canvas id="' + canvasId + '"></canvas>';
    }

    if (!filtered.length) {
      body.querySelector(".progress-chart-wrap").innerHTML = '<p class="empty-state">' + t("progress_no_data") + '</p>';
      return;
    }

    var isDark = document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
    var gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)";
    var labelColor = isDark ? "#ccc" : "#555";
    var locale = LOCALES[currentLang] || "fi-FI";

    if (progressCharts[exerciseId]) {
      progressCharts[exerciseId].destroy();
      delete progressCharts[exerciseId];
    }

    progressCharts[exerciseId] = new Chart(document.getElementById(canvasId), {
      type: "line",
      data: {
        labels: filtered.map(function (p) {
          return new Date(p.date).toLocaleDateString(locale, { month: "short", day: "numeric" });
        }),
        datasets: [
          {
            label: t("progress_chart_weight"),
            data: filtered.map(function (p) { return p.max_weight; }),
            borderColor: "#4a90d9",
            backgroundColor: "rgba(74,144,217,0.12)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.25,
            fill: true,
            yAxisID: "yWeight",
          },
          {
            label: t("progress_sets_label") + " (reps)",
            data: filtered.map(function (p) { return p.total_reps; }),
            borderColor: "#6dbf7e",
            borderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.25,
            borderDash: [5, 4],
            fill: false,
            yAxisID: "yReps",
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: labelColor, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              afterBody: function (items) {
                var idx = items[0].dataIndex;
                var point = filtered[idx];
                return point.sets.map(function (s) {
                  return "  " + s.set_number + ". " + s.weight + "\u00a0kg \u00d7 " + s.reps;
                });
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: labelColor, font: { size: 11 }, maxTicksLimit: 12 },
            grid: { color: gridColor },
          },
          yWeight: {
            position: "left",
            title: { display: true, text: t("progress_chart_weight"), color: labelColor },
            ticks: { color: labelColor },
            grid: { color: gridColor },
          },
          yReps: {
            position: "right",
            title: { display: true, text: "Reps", color: labelColor },
            ticks: { color: labelColor },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }

  // ---------- Bootstrap ----------

  applyTranslations();
  initGoogleSignIn();
  checkAuthAndInit();

})();
