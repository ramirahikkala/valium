(function () {
  "use strict";

  // ---------- i18n ----------

  var STRINGS = {
    fi: {
      // Navigaatio
      tasks: "Tehtävät",
      gym: "Sali",
      workout_tab: "Treeni",
      programs_tab: "Ohjelmat",
      history_tab: "Historia",
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
      back: "Takaisin",
      save: "Tallenna",

      // Sali — ohjelmat
      programs_heading: "Ohjelmat",
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

      // Admin
      admin_tab: "Admin",
      admin_users_heading: "Käyttäjät",
      admin_invites_heading: "Kutsut",
      admin_invite_placeholder: "sähköposti@esimerkki.fi",
      admin_invite_btn: "Kutsu",
      admin_invite_pending: "Odottaa kirjautumista",
      admin_invite_revoke: "Peruuta",
      admin_no_invites: "Ei odottavia kutsuja.",
      app_tasks_label: "Tehtävät",
      app_gym_label: "Sali",
      app_plants_label: "Kasvit",
      no_apps_available: "Sinulla ei ole käyttöoikeutta mihinkään sovellukseen.",
      feature_enabled: "Käytössä",
      feature_disabled: "Poissa",

      // Kasvit — navigaatio
      plants_tab: "Kasvit",
      plants_list_tab: "Kasvit",
      plants_locations_tab: "Sijainnit",

      // Kasvit — suodattimet
      plants_search_placeholder: "Hae...",
      plants_all_statuses: "Kaikki tilat",
      plants_all_categories: "Kaikki kategoriat",
      plants_all_locations: "Kaikki sijainnit",

      // Kasvit — kategoriat
      plant_cat_perennial: "Monivuotinen",
      plant_cat_annual: "Yksivuotinen",
      plant_cat_shrub: "Pensas",
      plant_cat_tree: "Puu",
      plant_cat_houseplant: "Huonekasvi",
      plant_cat_vegetable: "Vihannes",
      plant_cat_herb: "Yrtti",
      plant_cat_bulb: "Sipulikasvi",
      plant_cat_other: "Muu",

      // Kasvit — tilat
      plant_status_active: "Aktiivinen",
      plant_status_wishlist: "Haluaisin",
      plant_status_lost: "Menetetty",

      // Kasvit — lista
      add_plant_btn: "+ Lisää kasvi",
      plants_empty: "Ei kasveja. Lisää ensimmäinen kasvi!",
      plants_no_results: "Ei tuloksia valituilla suodattimilla.",
      plants_count: "{n} kasvia",

      // Kasvit — modaali
      plant_modal_add_heading: "Lisää kasvi",
      plant_modal_edit_heading: "Muokkaa kasvia",
      plant_label_latin: "Tieteellinen nimi",
      plant_label_common: "Suomalainen nimi",
      plant_label_cultivar: "Lajike",
      plant_label_category: "Kategoria",
      plant_label_status: "Tila",
      plant_label_lost_year: "Menetetty vuonna",
      plant_label_location: "Sijainti",
      plant_label_year_acquired: "Vuosi hankittu",
      plant_label_source: "Lähde / mistä saatu",
      plant_label_own_seeds: "Oma siemenkasvatus",
      plant_label_notes: "Muistiinpanot",
      plant_no_location: "— ei sijaintia —",
      delete_plant_confirm: "Poistetaanko kasvi?",

      // Kasvit — ryhmittely ja näkymät
      plants_group_by_none: "Ei ryhmittelyä",
      plants_group_by_category: "Kategorian mukaan",
      plants_group_by_location: "Sijainnin mukaan",
      plants_group_by_status: "Tilan mukaan",
      plants_view_grid: "Kortit",
      plants_view_list: "Lista",
      plants_back_btn: "← Takaisin",
      plant_no_location: "— ei sijaintia —",

      // Kasvit — sijainnit
      plants_locations_heading: "Sijainnit",
      new_location_placeholder: "Uusi sijainti...",
      no_locations: "Ei sijainteja. Lisää yllä.",
      delete_location_confirm: "Poistetaanko sijainti \"{name}\"? Kasvit säilyvät ilman sijaintia.",

      // Kasvit — kuvat
      plant_image_upload_btn: "+ Lisää kuva",
      plant_image_set_primary: "Aseta pääkuvaksi",
      plant_image_delete_confirm: "Poistetaanko kuva?",
      plant_image_caption_ph: "Kuvateksti...",
      plant_uploading: "Ladataan...",

      // AI
      admin_ai_heading: "AI-asetukset",
      admin_ai_no_providers: "Ei AI-palveluja.",
      admin_ai_delete_confirm: "Poistetaanko provider?",
      plant_ai_search_ph: "Hae kasvia...",
      plant_ai_search_btn: "✨ Hae",
      plant_ai_searching: "Haetaan...",
      plant_ai_summary_btn: "✨ Luo AI-yhteenveto",
      plant_ai_summarizing: "Luodaan...",
      plant_ai_fetch_image_btn: "Hae kuva Wikistä",
      plant_ai_fetching_image: "Haetaan...",
    },
    en: {
      // Navigation
      tasks: "Tasks",
      gym: "Gym",
      workout_tab: "Workout",
      programs_tab: "Programs",
      history_tab: "History",
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
      back: "Back",
      save: "Save",

      // Gym — programs
      programs_heading: "Programs",
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
      deload_mode_label: "Deload type",
      deload_mode_reset: "Base weight + increment",
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
      complete_workout_btn_text: "Workout done!",
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
      cwm_next_label: "Next",
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

      // Admin
      admin_tab: "Admin",
      admin_users_heading: "Users",
      admin_invites_heading: "Invites",
      admin_invite_placeholder: "email@example.com",
      admin_invite_btn: "Invite",
      admin_invite_pending: "Pending sign-in",
      admin_invite_revoke: "Revoke",
      admin_no_invites: "No pending invites.",
      app_tasks_label: "Tasks",
      app_gym_label: "Gym",
      app_plants_label: "Plants",
      no_apps_available: "You don't have access to any apps.",
      feature_enabled: "Enabled",
      feature_disabled: "Disabled",

      // Plants — navigation
      plants_tab: "Plants",
      plants_list_tab: "Plants",
      plants_locations_tab: "Locations",

      // Plants — filters
      plants_search_placeholder: "Search...",
      plants_all_statuses: "All statuses",
      plants_all_categories: "All categories",
      plants_all_locations: "All locations",

      // Plants — categories
      plant_cat_perennial: "Perennial",
      plant_cat_annual: "Annual",
      plant_cat_shrub: "Shrub",
      plant_cat_tree: "Tree",
      plant_cat_houseplant: "Houseplant",
      plant_cat_vegetable: "Vegetable",
      plant_cat_herb: "Herb",
      plant_cat_bulb: "Bulb",
      plant_cat_other: "Other",

      // Plants — statuses
      plant_status_active: "Active",
      plant_status_wishlist: "Wishlist",
      plant_status_lost: "Lost",

      // Plants — list
      add_plant_btn: "+ Add plant",
      plants_empty: "No plants yet. Add the first one!",
      plants_no_results: "No results with the selected filters.",
      plants_count: "{n} plants",

      // Plants — modal
      plant_modal_add_heading: "Add plant",
      plant_modal_edit_heading: "Edit plant",
      plant_label_latin: "Scientific name",
      plant_label_common: "Common name",
      plant_label_cultivar: "Cultivar",
      plant_label_category: "Category",
      plant_label_status: "Status",
      plant_label_lost_year: "Year lost",
      plant_label_location: "Location",
      plant_label_year_acquired: "Year acquired",
      plant_label_source: "Source / where obtained",
      plant_label_own_seeds: "Own seed cultivation",
      plant_label_notes: "Notes",
      plant_no_location: "— no location —",
      delete_plant_confirm: "Delete this plant?",

      // Plants — grouping and views
      plants_group_by_none: "No grouping",
      plants_group_by_category: "By category",
      plants_group_by_location: "By location",
      plants_group_by_status: "By status",
      plants_view_grid: "Cards",
      plants_view_list: "List",
      plants_back_btn: "\u2190 Back",
      plant_no_location: "— no location —",

      // Plants — locations
      plants_locations_heading: "Locations",
      new_location_placeholder: "New location...",
      no_locations: "No locations. Add one above.",
      delete_location_confirm: "Delete location \"{name}\"? Plants will remain without a location.",

      // Plants — images
      plant_image_upload_btn: "+ Add photo",
      plant_image_set_primary: "Set as primary",
      plant_image_delete_confirm: "Delete photo?",
      plant_image_caption_ph: "Caption...",
      plant_uploading: "Uploading...",

      // AI
      admin_ai_heading: "AI settings",
      admin_ai_no_providers: "No AI providers configured.",
      admin_ai_delete_confirm: "Delete provider?",
      plant_ai_search_ph: "Search plant...",
      plant_ai_search_btn: "✨ Search",
      plant_ai_searching: "Searching...",
      plant_ai_summary_btn: "✨ Generate summary",
      plant_ai_summarizing: "Generating...",
      plant_ai_fetch_image_btn: "Fetch image from Wiki",
      plant_ai_fetching_image: "Fetching...",
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
      // Don't set Content-Type for FormData — browser sets it with boundary automatically
      if (options.body instanceof FormData) {
        delete options.headers["Content-Type"];
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
      if (!document.getElementById("complete-workout-modal").hidden) closeCompleteWorkoutModal();
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

  // ---------- Feature flags ----------

  function applyFeatureFlags() {
    var features = (currentUser && currentUser.features) || { tasks: true, gym: true, plants: true };
    var isAdmin = !!(currentUser && currentUser.is_admin);

    // Show/hide nav tabs based on features
    viewTabTasks.hidden = !features.tasks;
    viewTabGym.hidden = !features.gym;
    var plantsSection = document.getElementById("sidebar-section-plants");
    if (plantsSection) plantsSection.hidden = !features.plants;
    var adminSection = document.getElementById("sidebar-section-admin");
    if (adminSection) adminSection.hidden = !isAdmin;

    // Determine first allowed view
    var firstView = null;
    if (features.tasks) firstView = "tasks";
    else if (features.gym) firstView = "gym";
    else if (features.plants) firstView = "plants";
    else if (isAdmin) firstView = "admin";

    if (firstView) {
      switchToView(firstView);
    } else {
      // No apps available — show message
      tasksView.hidden = true;
      gymView.hidden = true;
      adminView.hidden = true;
      plantsView.hidden = true;
      var noAppsEl = document.getElementById("no-apps-message");
      if (noAppsEl) {
        noAppsEl.hidden = false;
        noAppsEl.textContent = t("no_apps_available");
      }
    }
  }

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
    applyFeatureFlags();
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
  var selectedProgramId = null;

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

  // DOM elements — view toggle
  var viewTabTasks = document.getElementById("view-tab-tasks");
  var viewTabGym = document.getElementById("view-tab-gym");
  var viewTabAdmin = document.getElementById("view-tab-admin");
  var viewTabPlants = document.getElementById("view-tab-plants");
  var tasksView = document.getElementById("tasks-view");
  var gymView = document.getElementById("gym-view");
  var adminView = document.getElementById("admin-view");
  var plantsView = document.getElementById("plants-view");
  var gymTabButtons = document.querySelectorAll(".sidebar-gym-btn");

  // Gym DOM elements — sections
  var gymProgramsSection = document.getElementById("gym-programs");
  var gymWorkoutSection = document.getElementById("gym-workout");
  var gymHistorySection = document.getElementById("gym-history");

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

  gymAutoincEnabled.addEventListener("change", function () {
    gymAutoincSettings.hidden = !gymAutoincEnabled.checked;
  });

  gymDeloadMode.addEventListener("change", function () {
    gymResetGroup.hidden = gymDeloadMode.value === "percent";
  });

  // Tracks program_exercise IDs that the user marked as failed during the workout
  var gymFailedExercises = new Set();

  // ---------- View toggle ----------

  viewTabTasks.addEventListener("click", function () { switchToView("tasks"); closeSidebarOnMobile(); });
  viewTabGym.addEventListener("click", function () { switchToView("gym"); });
  viewTabAdmin.addEventListener("click", function () { switchToView("admin"); closeSidebarOnMobile(); });
  viewTabPlants.addEventListener("click", function () { switchToView("plants"); closeSidebarOnMobile(); });

  var sidebarPlantsChildren = document.getElementById("sidebar-plants-children");

  function switchToView(view) {
    // Hide all views
    tasksView.hidden = true;
    gymView.hidden = true;
    adminView.hidden = true;
    plantsView.hidden = true;
    // Remove all active states
    viewTabTasks.classList.remove("active");
    viewTabGym.classList.remove("active");
    viewTabAdmin.classList.remove("active");
    viewTabPlants.classList.remove("active");
    // Hide sub-navs
    sidebarGymChildren.hidden = true;
    if (sidebarPlantsChildren) sidebarPlantsChildren.hidden = true;

    if (view === "gym") {
      gymView.hidden = false;
      viewTabGym.classList.add("active");
      sidebarGymChildren.hidden = false;
      switchGymTab(gymCurrentTab);
    } else if (view === "admin") {
      adminView.hidden = false;
      viewTabAdmin.classList.add("active");
      loadAdminPanel();
    } else if (view === "plants") {
      plantsView.hidden = false;
      viewTabPlants.classList.add("active");
      if (sidebarPlantsChildren) sidebarPlantsChildren.hidden = false;
      switchPlantsTab(plantsCurrentTab);
    } else {
      // Default: tasks
      tasksView.hidden = false;
      viewTabTasks.classList.add("active");
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
      if (selectedProgramId) {
        var prog = gymPrograms.find(function (p) { return p.id === selectedProgramId; });
        if (prog) {
          showProgramDetail(prog);
        } else {
          showProgramList();
          renderProgramsList();
        }
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
        ' data-ex-exercise-name="' + escapeHtml(ex.exercise_name) + '" data-ex-weight="' + ex.weight +
        '" data-ex-sets="' + ex.sets + '" data-ex-reps="' + ex.reps +
        '" data-ex-rest="' + ex.rest_seconds +
        '" data-ex-auto-increment="' + ex.auto_increment +
        '" data-ex-increment-kg="' + ex.increment_kg +
        '" data-ex-reset-increment-kg="' + ex.reset_increment_kg +
        '" data-ex-deload-mode="' + (ex.deload_mode || 'reset') +
        '" data-ex-failure-threshold="' + (ex.failure_threshold || 3) + '">' + t("edit_exercise_btn") + '</button>' +
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
        weight: parseFloat(btn.dataset.exWeight),
        sets: parseInt(btn.dataset.exSets, 10),
        reps: parseInt(btn.dataset.exReps, 10),
        rest_seconds: parseInt(btn.dataset.exRest, 10),
        auto_increment: btn.dataset.exAutoIncrement === "true",
        increment_kg: parseFloat(btn.dataset.exIncrementKg),
        reset_increment_kg: parseFloat(btn.dataset.exResetIncrementKg),
        deload_mode: btn.dataset.exDeloadMode || "reset",
        failure_threshold: parseInt(btn.dataset.exFailureThreshold, 10) || 3,
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
    gymDeloadMode.value = data.deload_mode || "reset";
    gymResetGroup.hidden = (data.deload_mode === "percent");
    gymFailureThreshold.value = data.failure_threshold !== undefined ? data.failure_threshold : 3;
    gymModalTitle.textContent = mode === "edit" ? t("gym_modal_edit_heading") : t("gym_modal_add_heading");

    if (mode === "edit") {
      // Show static exercise name, hide dropdown
      gymExSelectInput.required = false;
      gymModalSelectGroup.hidden = true;
      gymModalNameDisplay.hidden = false;
      gymModalExerciseNameEl.textContent = data.exerciseName || "";
    } else {
      // Populate dropdown from library
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
      deload_mode: gymDeloadMode.value || "reset",
      failure_threshold: parseInt(gymFailureThreshold.value, 10) || 3,
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

  async function loadWorkoutTab() {
    var sessions;
    try {
      sessions = await apiFetch(GYM_API + "/sessions");
    } catch (_) {}

    // Show last completed session info
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

    // Restore active session from localStorage if any
    var savedId = localStorage.getItem("gymActiveSessionId");
    if (savedId) {
      try {
        if (!sessions) sessions = await apiFetch(GYM_API + "/sessions");
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
    var failStreakHtml = (ex.auto_increment && ex.consecutive_failures > 0)
      ? '<span class="ewc-fail-streak" title="' + ex.consecutive_failures + " / " + (ex.failure_threshold || 3) + '">✗ ' +
        ex.consecutive_failures + "\u00a0/\u00a0" + (ex.failure_threshold || 3) + "</span>"
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
      failBtnHtml + failStreakHtml +
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
      // Update the streak display in real-time to show projected count
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
    if (!failed) {
      return Math.round((ex.weight + ex.increment_kg) * 100) / 100;
    }
    var newFailures = (ex.consecutive_failures || 0) + 1;
    if (newFailures >= (ex.failure_threshold || 3)) {
      if (ex.deload_mode === "percent") {
        return Math.floor(ex.weight * 0.9 / 2.5) * 2.5;
      } else {
        return Math.round(((ex.base_weight || 0) + (ex.reset_increment_kg || 5)) * 100) / 100;
      }
    }
    return ex.weight; // failure count building up, weight stays same this time
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
        if (diff > 0) {
          nextHtml = '<span class="cwm-next cwm-up">→ ' + nextW + ' kg ↑</span>';
        } else if (diff < 0) {
          nextHtml = '<span class="cwm-next cwm-down">→ ' + nextW + ' kg ↓ <em>' + t("cwm_deload_label") + '</em></span>';
        } else {
          nextHtml = '<span class="cwm-next cwm-same">→ ' + nextW + ' kg <em>' + t("cwm_same_label") + '</em></span>';
        }
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
        body: JSON.stringify({
          failed_exercise_ids: Array.from(gymFailedExercises),
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
      localStorage.removeItem("gymActiveSessionId");
      workoutActiveEl.hidden = true;
      workoutIdleEl.hidden = false;
      await loadWorkoutTab();
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

  // ========== ADMIN MODULE ==========

  var APP_LABELS = { tasks: "app_tasks_label", gym: "app_gym_label", plants: "app_plants_label" };

  async function loadAdminPanel() {
    var listEl = document.getElementById("admin-users-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    try {
      var users = await apiFetch("/api/admin/users");
      if (!users) return;
      users.forEach(function (u) {
        listEl.appendChild(renderAdminUser(u));
      });
    } catch (_) {
      // error shown by apiFetch
    }
    await loadAdminInvites();
    await loadAdminAiProviders();
  }

  async function loadAdminAiProviders() {
    if (!adminAiProvidersList) return;
    try {
      var providers = await apiFetch("/api/ai/providers");
      if (!providers) return;
      if (!providers.length) {
        adminAiProvidersList.innerHTML = '<p class="empty-state">' + escapeHtml(t("admin_ai_no_providers")) + "</p>";
        return;
      }
      adminAiProvidersList.innerHTML = providers.map(function (p) {
        return '<div class="admin-ai-provider-row">' +
          '<span class="admin-ai-label">' + escapeHtml(p.label || p.provider) + " \u2014 " + escapeHtml(p.model) + "</span>" +
          '<span class="plant-badge ' + (p.enabled ? "plant-cat-badge" : "plant-status-lost") + '">' +
            escapeHtml(p.enabled ? t("feature_enabled") : t("feature_disabled")) + "</span>" +
          '<button class="btn btn-danger btn-sm" data-ai-delete="' + p.id + '">' + escapeHtml(t("delete_btn")) + "</button>" +
          "</div>";
      }).join("");
    } catch (_) {}
  }

  async function loadAdminInvites() {
    var invitesEl = document.getElementById("admin-invites-list");
    if (!invitesEl) return;
    invitesEl.innerHTML = "";
    try {
      var invites = await apiFetch("/api/admin/invites");
      if (!invites) return;
      if (invites.length === 0) {
        invitesEl.innerHTML = '<p class="admin-no-invites">' + t("admin_no_invites") + "</p>";
        return;
      }
      invites.forEach(function (inv) {
        var row = document.createElement("div");
        row.className = "admin-invite-row";

        var emailSpan = document.createElement("span");
        emailSpan.className = "admin-invite-email";
        emailSpan.textContent = inv.email;
        row.appendChild(emailSpan);

        var badge = document.createElement("span");
        badge.className = "admin-invite-badge";
        badge.textContent = t("admin_invite_pending");
        row.appendChild(badge);

        var revokeBtn = document.createElement("button");
        revokeBtn.className = "btn btn-sm btn-danger-outline";
        revokeBtn.textContent = t("admin_invite_revoke");
        revokeBtn.addEventListener("click", async function () {
          revokeBtn.disabled = true;
          try {
            await apiFetch("/api/admin/invites/" + encodeURIComponent(inv.email), { method: "DELETE" });
            await loadAdminInvites();
          } catch (_) {
            revokeBtn.disabled = false;
          }
        });
        row.appendChild(revokeBtn);

        invitesEl.appendChild(row);
      });
    } catch (_) {
      // error shown by apiFetch
    }
  }

  var adminInviteForm = document.getElementById("admin-invite-form");
  if (adminInviteForm) {
    adminInviteForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var emailInput = document.getElementById("admin-invite-email");
      var email = emailInput.value.trim();
      if (!email) return;
      try {
        await apiFetch("/api/admin/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        });
        emailInput.value = "";
        await loadAdminInvites();
      } catch (_) {
        // error shown by apiFetch
      }
    });
  }

  function renderAdminUser(u) {
    var item = document.createElement("div");
    item.className = "admin-user-item";

    // User info row
    var info = document.createElement("div");
    info.className = "admin-user-info";

    if (u.picture) {
      var img = document.createElement("img");
      img.className = "admin-user-avatar";
      img.src = u.picture;
      img.alt = u.name;
      info.appendChild(img);
    }

    var nameBlock = document.createElement("div");
    nameBlock.className = "admin-user-name-block";

    var nameEl = document.createElement("div");
    nameEl.className = "admin-user-name";
    nameEl.textContent = u.name;
    nameBlock.appendChild(nameEl);

    var emailEl = document.createElement("div");
    emailEl.className = "admin-user-email";
    emailEl.textContent = u.email;
    nameBlock.appendChild(emailEl);

    info.appendChild(nameBlock);

    if (u.is_admin) {
      var badge = document.createElement("span");
      badge.className = "admin-badge-admin";
      badge.textContent = "Admin";
      info.appendChild(badge);
    }

    item.appendChild(info);

    // Feature toggles
    var featRows = document.createElement("div");
    featRows.className = "admin-feature-rows";

    Object.keys(APP_LABELS).forEach(function (app) {
      var enabled = u.features[app] !== false; // default true
      var row = document.createElement("div");
      row.className = "admin-feature-row";

      var label = document.createElement("span");
      label.className = "admin-feature-label";
      label.textContent = t(APP_LABELS[app]);
      row.appendChild(label);

      var btn = document.createElement("button");
      btn.className = "btn btn-sm feature-toggle-btn " + (enabled ? "enabled" : "disabled");
      btn.textContent = enabled ? t("feature_enabled") : t("feature_disabled");
      btn.dataset.userId = u.id;
      btn.dataset.app = app;
      btn.dataset.enabled = String(enabled);
      btn.addEventListener("click", function () {
        toggleUserFeature(btn, u.id, app);
      });
      row.appendChild(btn);

      featRows.appendChild(row);
    });

    item.appendChild(featRows);
    return item;
  }

  async function toggleUserFeature(btn, userId, app) {
    var currentEnabled = btn.dataset.enabled === "true";
    var newEnabled = !currentEnabled;
    btn.disabled = true;
    try {
      await apiFetch("/api/admin/users/" + userId + "/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: app, enabled: newEnabled }),
      });
      btn.dataset.enabled = String(newEnabled);
      btn.className = "btn btn-sm feature-toggle-btn " + (newEnabled ? "enabled" : "disabled");
      btn.textContent = newEnabled ? t("feature_enabled") : t("feature_disabled");
    } catch (_) {
      // error shown by apiFetch
    } finally {
      btn.disabled = false;
    }
  }

  // ========== PLANTS MODULE ==========

  var PLANTS_API = "/api/plants";

  // Plants state
  var plantsCurrentTab = "list";
  var plantsLocations = [];
  var plantsData = [];
  var plantsFilterStatus = "";
  var plantsFilterCategory = "";
  var plantsFilterLocation = "";
  var plantsSearchQuery = "";
  var plantsViewMode = "grid";   // "grid" | "list"
  var plantsGroupBy = "";        // "" | "category" | "location" | "status"
  var plantsCurrentDetail = null;

  // Plants DOM elements
  var plantsTabButtons = document.querySelectorAll(".sidebar-plants-btn");
  var plantsListSection = document.getElementById("plants-list-section");
  var plantsLocationsSection = document.getElementById("plants-locations-section");
  var plantsDetailSection = document.getElementById("plants-detail-section");
  var addPlantBtn = document.getElementById("add-plant-btn");
  var plantsSearchInput = document.getElementById("plants-search");
  var plantsFilterStatusEl = document.getElementById("plants-filter-status");
  var plantsFilterCategoryEl = document.getElementById("plants-filter-category");
  var plantsFilterLocationEl = document.getElementById("plants-filter-location");
  var plantsGroupByEl = document.getElementById("plants-group-by");
  var plantsViewGridBtn = document.getElementById("plants-view-grid-btn");
  var plantsViewListBtn = document.getElementById("plants-view-list-btn");
  var plantsGridEl = document.getElementById("plants-grid");
  var plantsCountEl = document.getElementById("plants-count");
  var plantsDetailBackBtn = document.getElementById("plants-detail-back-btn");
  var plantsDetailEditBtn = document.getElementById("plants-detail-edit-btn");
  var plantsDetailLatin = document.getElementById("plants-detail-latin");
  var plantsDetailCultivar = document.getElementById("plants-detail-cultivar");
  var plantsDetailCommon = document.getElementById("plants-detail-common");
  var plantsDetailBadges = document.getElementById("plants-detail-badges");
  var plantsDetailFields = document.getElementById("plants-detail-fields");
  var plantsImageGallery = document.getElementById("plants-image-gallery");
  var plantsImageUpload = document.getElementById("plants-image-upload");
  var plantLightbox = document.getElementById("plant-image-lightbox");
  var plantLightboxImg = document.getElementById("plant-lightbox-img");
  var plantLightboxClose = document.getElementById("plant-lightbox-close");
  var addLocationForm = document.getElementById("add-location-form");
  var newLocationNameInput = document.getElementById("new-location-name");
  var locationsListEl = document.getElementById("locations-list");

  // Plant modal elements
  var plantModal = document.getElementById("plant-modal");
  var plantModalTitle = document.getElementById("plant-modal-title");
  var plantModalForm = document.getElementById("plant-modal-form");
  var plantModalIdInput = document.getElementById("plant-modal-id");
  var plantLatinNameInput = document.getElementById("plant-latin-name");
  var plantCommonNameInput = document.getElementById("plant-common-name");
  var plantCultivarInput = document.getElementById("plant-cultivar");
  var plantCategoryInput = document.getElementById("plant-category");
  var plantStatusInput = document.getElementById("plant-status");
  var plantLostYearGroup = document.getElementById("plant-lost-year-group");
  var plantLostYearInput = document.getElementById("plant-lost-year");
  var plantLocationInput = document.getElementById("plant-location");
  var plantYearAcquiredInput = document.getElementById("plant-year-acquired");
  var plantSourceInput = document.getElementById("plant-source");
  var plantOwnSeedsInput = document.getElementById("plant-own-seeds");
  var plantNotesInput = document.getElementById("plant-notes");
  var plantModalCancelBtn = document.getElementById("plant-modal-cancel");
  var plantAiQueryInput = document.getElementById("plant-ai-query");
  var plantAiSearchBtn = document.getElementById("plant-ai-search-btn");
  var plantsAiSummaryBtn = document.getElementById("plants-ai-summary-btn");
  var plantsAiSummaryEl = document.getElementById("plants-detail-ai-summary");
  var plantsWikiImageBtn = document.getElementById("plants-wiki-image-btn");
  var adminAiProvidersList = document.getElementById("admin-ai-providers-list");
  var adminAiForm = document.getElementById("admin-ai-form");

  if (adminAiForm) {
    adminAiForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var provider = document.getElementById("ai-provider-select").value;
      var model = document.getElementById("ai-model-input").value.trim();
      var api_key = document.getElementById("ai-key-input").value.trim();
      var label = document.getElementById("ai-label-input").value.trim() || null;
      if (!model || !api_key) return;
      try {
        await apiFetch("/api/ai/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: provider, model: model, api_key: api_key, label: label }),
        });
        adminAiForm.reset();
        await loadAdminAiProviders();
      } catch (_) {}
    });
  }

  if (adminAiProvidersList) {
    adminAiProvidersList.addEventListener("click", async function (e) {
      var btn = e.target.closest("[data-ai-delete]");
      if (!btn) return;
      if (!confirm(t("admin_ai_delete_confirm"))) return;
      try {
        await apiFetch("/api/ai/providers/" + btn.dataset.aiDelete, { method: "DELETE" });
        await loadAdminAiProviders();
      } catch (_) {}
    });
  }

  // ---------- Plants tab switching ----------

  plantsTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchPlantsTab(btn.dataset.plantsTab);
      closeSidebarOnMobile();
    });
  });

  function switchPlantsTab(tab) {
    plantsCurrentTab = tab;
    plantsCurrentDetail = null;
    plantsTabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.plantsTab === tab);
    });
    plantsListSection.hidden = tab !== "list";
    plantsDetailSection.hidden = true;
    plantsLocationsSection.hidden = tab !== "locations";
    if (tab === "list") loadPlants();
    else if (tab === "locations") loadLocations();
  }

  // ---------- Locations ----------

  async function loadLocations() {
    try {
      var locs = await apiFetch(PLANTS_API + "/locations");
      if (!locs) return;
      plantsLocations = locs;
      renderLocations();
      populatePlantLocationSelect();
      populateLocationFilter();
    } catch (_) {}
  }

  function renderLocations() {
    locationsListEl.innerHTML = "";
    if (plantsLocations.length === 0) {
      locationsListEl.innerHTML = '<p class="library-empty">' + t("no_locations") + "</p>";
      return;
    }
    plantsLocations.forEach(function (loc) {
      var row = document.createElement("div");
      row.className = "location-row";
      row.innerHTML =
        '<span class="location-name">' + escapeHtml(loc.name) + "</span>" +
        '<div class="location-btns">' +
        '<button class="btn btn-icon btn-sm" data-action="rename-location" data-id="' + loc.id +
        '" data-name="' + escapeHtml(loc.name) + '">' + t("rename_btn") + "</button>" +
        '<button class="btn btn-danger btn-sm" data-action="delete-location" data-id="' + loc.id +
        '" data-name="' + escapeHtml(loc.name) + '">' + t("delete_btn") + "</button>" +
        "</div>";
      locationsListEl.appendChild(row);
    });
  }

  function populatePlantLocationSelect() {
    plantLocationInput.innerHTML = '<option value="">' + t("plant_no_location") + "</option>";
    plantsLocations.forEach(function (loc) {
      var opt = document.createElement("option");
      opt.value = loc.id;
      opt.textContent = loc.name;
      plantLocationInput.appendChild(opt);
    });
  }

  function populateLocationFilter() {
    var current = plantsFilterLocationEl.value;
    plantsFilterLocationEl.innerHTML = '<option value="">' + t("plants_all_locations") + "</option>";
    plantsLocations.forEach(function (loc) {
      var opt = document.createElement("option");
      opt.value = loc.id;
      opt.textContent = loc.name;
      plantsFilterLocationEl.appendChild(opt);
    });
    plantsFilterLocationEl.value = current;
  }

  addLocationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = newLocationNameInput.value.trim();
    if (!name) return;
    apiFetch(PLANTS_API + "/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    }).then(function () {
      newLocationNameInput.value = "";
      loadLocations();
    }).catch(function () {});
  });

  locationsListEl.addEventListener("click", async function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    var id = parseInt(btn.dataset.id, 10);
    var name = btn.dataset.name;
    if (action === "rename-location") {
      var newName = prompt(t("rename_prompt"), name);
      if (!newName || newName.trim() === name) return;
      try {
        await apiFetch(PLANTS_API + "/locations/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        });
        loadLocations();
      } catch (_) {}
    } else if (action === "delete-location") {
      if (!confirm(tf("delete_location_confirm", { name: name }))) return;
      try {
        await apiFetch(PLANTS_API + "/locations/" + id, { method: "DELETE" });
        loadLocations();
        loadPlants();
      } catch (_) {}
    }
  });

  // ---------- Plants list ----------

  async function loadPlants() {
    try {
      // Also refresh locations so filter is current
      var locs = await apiFetch(PLANTS_API + "/locations");
      if (locs) {
        plantsLocations = locs;
        populatePlantLocationSelect();
        populateLocationFilter();
      }
      var params = [];
      if (plantsFilterStatus) params.push("status=" + encodeURIComponent(plantsFilterStatus));
      if (plantsFilterCategory) params.push("category=" + encodeURIComponent(plantsFilterCategory));
      if (plantsFilterLocation) params.push("location_id=" + encodeURIComponent(plantsFilterLocation));
      if (plantsSearchQuery) params.push("search=" + encodeURIComponent(plantsSearchQuery));
      var url = PLANTS_API + (params.length ? "?" + params.join("&") : "");
      var plants = await apiFetch(url);
      if (!plants) return;
      plantsData = plants;
      renderPlants(plants);
    } catch (_) {}
  }

  function plantCategoryLabel(cat) {
    var key = "plant_cat_" + cat;
    var s = t(key);
    return s !== key ? s : cat;
  }

  function plantStatusLabel(status) {
    var key = "plant_status_" + status;
    var s = t(key);
    return s !== key ? s : status;
  }

  function renderPlants(plants) {
    plantsGridEl.innerHTML = "";
    plantsGridEl.className = plantsViewMode === "list" ? "plants-list" : "plants-grid";
    if (plantsCountEl) {
      plantsCountEl.textContent = plants.length > 0 ? tf("plants_count", { n: plants.length }) : "";
    }
    if (plants.length === 0) {
      var hasFilters = plantsFilterStatus || plantsFilterCategory || plantsFilterLocation || plantsSearchQuery;
      plantsGridEl.innerHTML = '<p class="plants-empty">' + t(hasFilters ? "plants_no_results" : "plants_empty") + "</p>";
      return;
    }

    if (!plantsGroupBy) {
      plants.forEach(function (p) {
        plantsGridEl.appendChild(plantsViewMode === "list" ? createPlantRow(p) : createPlantCard(p));
      });
      return;
    }

    // Grouped render
    var groups = Object.create(null);
    var groupOrder = [];
    plants.forEach(function (p) {
      var key = plantGroupKey(p, plantsGroupBy);
      if (!groups[key]) { groups[key] = []; groupOrder.push(key); }
      groups[key].push(p);
    });
    groupOrder.forEach(function (key) {
      var heading = document.createElement("div");
      heading.className = "plants-group-heading";
      heading.textContent = plantGroupLabel(key, plantsGroupBy);
      plantsGridEl.appendChild(heading);
      groups[key].forEach(function (p) {
        plantsGridEl.appendChild(plantsViewMode === "list" ? createPlantRow(p) : createPlantCard(p));
      });
    });
  }

  function plantGroupKey(plant, groupBy) {
    if (groupBy === "category") return plant.category || "other";
    if (groupBy === "location") return plant.location_name || "";
    if (groupBy === "status") return plant.status || "active";
    return "";
  }

  function plantGroupLabel(key, groupBy) {
    if (groupBy === "category") return plantCategoryLabel(key);
    if (groupBy === "status") return plantStatusLabel(key);
    if (groupBy === "location") return key || t("plant_no_location");
    return key;
  }

  function createPlantRow(plant) {
    var row = document.createElement("div");
    row.className = "plant-list-row";
    row.dataset.id = plant.id;
    var name = '<span class="plant-card-latin" style="font-style:italic">' + escapeHtml(plant.latin_name) + "</span>" +
      (plant.cultivar ? ' <span class="plant-card-cultivar">\u2018' + escapeHtml(plant.cultivar) + "\u2019</span>" : "") +
      (plant.common_name ? ' <span class="plant-list-common">\u2013 ' + escapeHtml(plant.common_name) + "</span>" : "");
    row.innerHTML = '<span class="plant-list-name">' + name + "</span>" +
      (plant.status !== "active"
        ? '<span class="plant-badge plant-status-' + plant.status + '">' + escapeHtml(plantStatusLabel(plant.status)) + "</span>"
        : "");
    return row;
  }

  function createPlantCard(plant) {
    var card = document.createElement("div");
    card.className = "plant-card";
    card.dataset.id = plant.id;

    var statusClass = "plant-status-" + plant.status;

    var nameLine = '<div class="plant-card-latin">' + escapeHtml(plant.latin_name) +
      (plant.cultivar ? ' <span class="plant-card-cultivar">\u2018' + escapeHtml(plant.cultivar) + "\u2019</span>" : "") +
      "</div>";
    var commonLine = plant.common_name
      ? '<div class="plant-card-common">' + escapeHtml(plant.common_name) + "</div>"
      : "";

    var meta = [];
    meta.push('<span class="plant-badge plant-cat-badge">' + escapeHtml(plantCategoryLabel(plant.category)) + "</span>");
    if (plant.status !== "active") {
      meta.push('<span class="plant-badge ' + statusClass + '">' + escapeHtml(plantStatusLabel(plant.status)) + "</span>");
    }
    if (plant.location_name) {
      meta.push('<span class="plant-location-tag">📍 ' + escapeHtml(plant.location_name) + "</span>");
    }
    if (plant.year_acquired) {
      meta.push('<span class="plant-year-tag">' + plant.year_acquired + "</span>");
    }
    if (plant.own_seeds) {
      meta.push('<span class="plant-badge plant-own-seeds-badge" title="' + t("plant_label_own_seeds") + '">\uD83C\uDF31</span>');
    }

    var imageHtml = plant.primary_image_url
      ? '<div class="plant-card-image"><img src="' + escapeHtml(plant.primary_image_url) + '" alt="" loading="lazy"></div>'
      : "";

    card.innerHTML =
      imageHtml +
      '<div class="plant-card-header">' + nameLine + commonLine + "</div>" +
      '<div class="plant-card-meta">' + meta.join("") + "</div>" +
      '<div class="plant-card-actions">' +
      '<button class="btn btn-icon btn-sm" data-action="edit-plant" data-id="' + plant.id + '">' + t("task_edit_btn") + "</button>" +
      '<button class="btn btn-danger btn-sm" data-action="delete-plant" data-id="' + plant.id + '">' + t("delete_btn") + "</button>" +
      "</div>";

    return card;
  }

  plantsGridEl.addEventListener("click", async function (e) {
    var btn = e.target.closest("[data-action]");
    var card = e.target.closest(".plant-card, .plant-list-row");
    if (card && !btn) {
      var id = parseInt(card.dataset.id, 10);
      var plant = plantsData.find(function (p) { return p.id === id; });
      if (plant) { openPlantDetail(plant); return; }
    }
    if (!btn) return;
    var action = btn.dataset.action;
    var id = parseInt(btn.dataset.id, 10);
    if (action === "edit-plant") {
      var plant = plantsData.find(function (p) { return p.id === id; });
      if (plant) openPlantModal(plant);
    } else if (action === "delete-plant") {
      if (!confirm(t("delete_plant_confirm"))) return;
      try {
        await apiFetch(PLANTS_API + "/" + id, { method: "DELETE" });
        loadPlants();
      } catch (_) {}
    }
  });

  // ---------- View toggle ----------

  plantsViewGridBtn.addEventListener("click", function () {
    plantsViewMode = "grid";
    plantsViewGridBtn.classList.add("active");
    plantsViewListBtn.classList.remove("active");
    renderPlants(plantsData);
  });

  plantsViewListBtn.addEventListener("click", function () {
    plantsViewMode = "list";
    plantsViewListBtn.classList.add("active");
    plantsViewGridBtn.classList.remove("active");
    renderPlants(plantsData);
  });

  plantsGroupByEl.addEventListener("change", function () {
    plantsGroupBy = this.value;
    renderPlants(plantsData);
  });

  // ---------- Detail view ----------

  function renderImageGallery(images) {
    plantsImageGallery.innerHTML = "";
    images.forEach(function (img, idx) {
      var url = "/api/plant-images/" + img.filename;
      var thumb = document.createElement("div");
      thumb.className = "plant-thumb" + (idx === 0 ? " is-primary" : "");
      thumb.innerHTML =
        '<img src="' + escapeHtml(url) + '" alt="">' +
        '<div class="plant-thumb-actions">' +
          (idx > 0
            ? '<button class="btn-thumb" data-img-action="primary" data-img-id="' + img.id + '">\u2605</button>'
            : '<span class="thumb-primary-badge">\u2605</span>') +
          '<button class="btn-thumb btn-thumb-del" data-img-action="delete" data-img-id="' + img.id + '">\u2715</button>' +
        '</div>';
      thumb.querySelector("img").addEventListener("click", function () {
        plantLightboxImg.src = url;
        plantLightbox.hidden = false;
      });
      plantsImageGallery.appendChild(thumb);
    });
  }

  async function reloadCurrentDetail() {
    if (!plantsCurrentDetail) return;
    await loadPlants();
    var updated = plantsData.find(function (p) { return p.id === plantsCurrentDetail.id; });
    if (updated) openPlantDetail(updated);
  }

  function openPlantDetail(plant) {
    plantsCurrentDetail = plant;
    plantsListSection.hidden = true;
    plantsDetailSection.hidden = false;

    plantsDetailLatin.textContent = plant.latin_name;
    plantsDetailCultivar.textContent = plant.cultivar ? "\u2018" + plant.cultivar + "\u2019" : "";
    plantsDetailCultivar.hidden = !plant.cultivar;
    plantsDetailCommon.textContent = plant.common_name || "";
    plantsDetailCommon.hidden = !plant.common_name;

    var badges = [
      '<span class="plant-badge plant-cat-badge">' + escapeHtml(plantCategoryLabel(plant.category)) + "</span>",
      plant.status !== "active"
        ? '<span class="plant-badge plant-status-' + plant.status + '">' + escapeHtml(plantStatusLabel(plant.status)) + "</span>"
        : "",
      plant.location_name ? '<span class="plant-location-tag">\uD83D\uDCCD ' + escapeHtml(plant.location_name) + "</span>" : "",
      plant.year_acquired ? '<span class="plant-year-tag">' + plant.year_acquired + "</span>" : "",
      plant.own_seeds ? '<span class="plant-badge plant-own-seeds-badge" title="' + t("plant_label_own_seeds") + '">\uD83C\uDF31 ' + escapeHtml(t("plant_label_own_seeds")) + "</span>" : "",
    ].filter(Boolean);
    plantsDetailBadges.innerHTML = badges.join("");

    renderImageGallery(plant.images || []);

    var fields = [];
    if (plant.year_acquired) fields.push([t("plant_label_year_acquired"), plant.year_acquired]);
    if (plant.source) fields.push([t("plant_label_source"), plant.source]);
    if (plant.status === "lost" && plant.lost_year) fields.push([t("plant_label_lost_year"), plant.lost_year]);
    if (plant.notes) fields.push([t("plant_label_notes"), plant.notes]);

    plantsDetailFields.innerHTML = fields.map(function (f) {
      return '<div class="plant-detail-field">' +
        '<span class="plant-detail-label">' + escapeHtml(String(f[0])) + "</span>" +
        '<span class="plant-detail-value">' + escapeHtml(String(f[1])) + "</span>" +
        "</div>";
    }).join("");

    if (plant.ai_summary) {
      plantsAiSummaryEl.textContent = plant.ai_summary;
      plantsAiSummaryEl.hidden = false;
    } else {
      plantsAiSummaryEl.textContent = "";
      plantsAiSummaryEl.hidden = true;
    }
  }

  function closePlantDetail() {
    plantsDetailSection.hidden = true;
    plantsListSection.hidden = false;
    plantsCurrentDetail = null;
  }

  plantsDetailBackBtn.addEventListener("click", closePlantDetail);

  plantsDetailEditBtn.addEventListener("click", function () {
    if (plantsCurrentDetail) openPlantModal(plantsCurrentDetail);
  });

  // ---------- Image upload ----------

  plantsImageUpload.addEventListener("change", async function () {
    var file = this.files[0];
    if (!file || !plantsCurrentDetail) return;
    this.value = "";
    var fd = new FormData();
    fd.append("file", file);
    try {
      await apiFetch(PLANTS_API + "/" + plantsCurrentDetail.id + "/images", { method: "POST", body: fd });
      await reloadCurrentDetail();
    } catch (_) {}
  });

  plantsImageGallery.addEventListener("click", async function (e) {
    var btn = e.target.closest("[data-img-action]");
    if (!btn || !plantsCurrentDetail) return;
    var id = plantsCurrentDetail.id;
    var imgId = btn.dataset.imgId;
    if (btn.dataset.imgAction === "primary") {
      try {
        await apiFetch(PLANTS_API + "/" + id + "/images/" + imgId + "/set-primary", { method: "POST" });
        await reloadCurrentDetail();
      } catch (_) {}
    } else if (btn.dataset.imgAction === "delete") {
      if (!confirm(t("plant_image_delete_confirm"))) return;
      try {
        await apiFetch(PLANTS_API + "/" + id + "/images/" + imgId, { method: "DELETE" });
        await reloadCurrentDetail();
      } catch (_) {}
    }
  });

  // ---------- AI: plant name fill ----------

  plantAiSearchBtn.addEventListener("click", async function () {
    var q = plantAiQueryInput.value.trim();
    if (!q) return;
    plantAiSearchBtn.disabled = true;
    plantAiSearchBtn.textContent = t("plant_ai_searching");
    try {
      var res = await apiFetch("/api/ai/plants/fill-name?query=" + encodeURIComponent(q));
      if (res) {
        if (res.latin_name) plantLatinNameInput.value = res.latin_name;
        if (res.common_name) plantCommonNameInput.value = res.common_name;
        if (res.category) plantCategoryInput.value = res.category;
        if (res.notes) plantNotesInput.value = res.notes;
      }
    } catch (_) {}
    plantAiSearchBtn.disabled = false;
    plantAiSearchBtn.textContent = t("plant_ai_search_btn");
  });

  // ---------- AI: plant summary ----------

  plantsAiSummaryBtn.addEventListener("click", async function () {
    if (!plantsCurrentDetail) return;
    plantsAiSummaryBtn.disabled = true;
    plantsAiSummaryBtn.textContent = t("plant_ai_summarizing");
    try {
      var updated = await apiFetch(
        "/api/ai/plants/" + plantsCurrentDetail.id + "/summary", { method: "POST" });
      if (updated && updated.ai_summary) {
        plantsAiSummaryEl.textContent = updated.ai_summary;
        plantsAiSummaryEl.hidden = false;
        plantsCurrentDetail = updated;
      }
    } catch (_) {}
    plantsAiSummaryBtn.disabled = false;
    plantsAiSummaryBtn.textContent = t("plant_ai_summary_btn");
  });

  // ---------- AI: Wikipedia image ----------

  plantsWikiImageBtn.addEventListener("click", async function () {
    if (!plantsCurrentDetail) return;
    plantsWikiImageBtn.disabled = true;
    plantsWikiImageBtn.textContent = t("plant_ai_fetching_image");
    try {
      await apiFetch(
        "/api/ai/plants/" + plantsCurrentDetail.id + "/fetch-image", { method: "POST" });
      await reloadCurrentDetail();
    } catch (_) {}
    plantsWikiImageBtn.disabled = false;
    plantsWikiImageBtn.textContent = t("plant_ai_fetch_image_btn");
  });

  // ---------- Lightbox ----------

  plantLightboxClose.addEventListener("click", function () { plantLightbox.hidden = true; });
  plantLightbox.addEventListener("click", function (e) {
    if (e.target === plantLightbox) plantLightbox.hidden = true;
  });

  // ---------- Filters ----------

  plantsFilterStatusEl.addEventListener("change", function () {
    plantsFilterStatus = this.value;
    loadPlants();
  });

  plantsFilterCategoryEl.addEventListener("change", function () {
    plantsFilterCategory = this.value;
    loadPlants();
  });

  plantsFilterLocationEl.addEventListener("change", function () {
    plantsFilterLocation = this.value;
    loadPlants();
  });

  var plantsSearchTimer = null;
  plantsSearchInput.addEventListener("input", function () {
    var q = this.value;
    clearTimeout(plantsSearchTimer);
    plantsSearchTimer = setTimeout(function () {
      plantsSearchQuery = q;
      loadPlants();
    }, 300);
  });

  addPlantBtn.addEventListener("click", function () {
    openPlantModal(null);
  });

  // ---------- Plant modal ----------

  plantStatusInput.addEventListener("change", function () {
    plantLostYearGroup.hidden = this.value !== "lost";
  });

  plantModalCancelBtn.addEventListener("click", closePlantModal);

  plantModal.addEventListener("click", function (e) {
    if (e.target === plantModal) closePlantModal();
  });

  function openPlantModal(plant) {
    plantModalIdInput.value = plant ? plant.id : "";
    plantModalTitle.textContent = plant ? t("plant_modal_edit_heading") : t("plant_modal_add_heading");

    plantLatinNameInput.value = plant ? (plant.latin_name || "") : "";
    plantCommonNameInput.value = plant ? (plant.common_name || "") : "";
    plantCultivarInput.value = plant ? (plant.cultivar || "") : "";
    plantCategoryInput.value = plant ? (plant.category || "perennial") : "perennial";
    plantStatusInput.value = plant ? (plant.status || "active") : "active";
    plantLostYearGroup.hidden = !plant || plant.status !== "lost";
    plantLostYearInput.value = plant ? (plant.lost_year || "") : "";
    plantLocationInput.value = plant && plant.location_id ? plant.location_id : "";
    plantYearAcquiredInput.value = plant ? (plant.year_acquired || "") : "";
    plantSourceInput.value = plant ? (plant.source || "") : "";
    plantOwnSeedsInput.checked = plant ? !!plant.own_seeds : false;
    plantNotesInput.value = plant ? (plant.notes || "") : "";

    plantModal.hidden = false;
    plantLatinNameInput.focus();
  }

  function closePlantModal() {
    plantModal.hidden = true;
    plantModalForm.reset();
    plantLostYearGroup.hidden = true;
    // If detail was open when edit was triggered, re-show detail section
    if (plantsCurrentDetail) {
      plantsListSection.hidden = true;
      plantsDetailSection.hidden = false;
    }
  }

  plantModalForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var id = plantModalIdInput.value;
    var payload = {
      latin_name: plantLatinNameInput.value.trim(),
      common_name: plantCommonNameInput.value.trim() || null,
      cultivar: plantCultivarInput.value.trim() || null,
      category: plantCategoryInput.value,
      status: plantStatusInput.value,
      lost_year: plantStatusInput.value === "lost" && plantLostYearInput.value ? parseInt(plantLostYearInput.value, 10) : null,
      location_id: plantLocationInput.value ? parseInt(plantLocationInput.value, 10) : null,
      year_acquired: plantYearAcquiredInput.value ? parseInt(plantYearAcquiredInput.value, 10) : null,
      source: plantSourceInput.value.trim() || null,
      own_seeds: plantOwnSeedsInput.checked,
      notes: plantNotesInput.value.trim() || null,
    };
    try {
      if (id) {
        await apiFetch(PLANTS_API + "/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(PLANTS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      var editingDetail = plantsCurrentDetail && id && parseInt(id, 10) === plantsCurrentDetail.id;
      closePlantModal();
      await loadPlants();
      // If we were editing a plant from its detail view, re-open updated detail
      if (editingDetail) {
        var updated = plantsData.find(function (p) { return p.id === parseInt(id, 10); });
        if (updated) openPlantDetail(updated);
      }
    } catch (_) {}
  });

})();
