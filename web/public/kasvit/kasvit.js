(function () {
  "use strict";

  // ---------- i18n ----------

  var STRINGS = {
    fi: {
      // Kirjautuminen
      sign_out: "Kirjaudu ulos",
      error_generic: "Jotain meni pieleen",
      error_login_failed: "Kirjautuminen epäonnistui: ",
      error_client_id: "Google-kirjautumista ei ole konfiguroitu palvelimelle",
      error_auth_config: "Kirjautumisasetuksia ei voitu ladata",

      // Yleiset
      cancel: "Peruuta",
      cancel_btn: "Peruuta",
      save: "Tallenna",
      save_btn: "Tallenna",
      back: "Takaisin",
      back_btn: "← Takaisin",
      add_btn: "Lisää",
      edit_btn: "Muokkaa",
      delete_btn: "Poista",
      rename_btn: "Nimeä",
      rename_prompt: "Uusi nimi:",
      confirm_delete: "Poistetaanko?",

      // Kasvit — navigaatio
      plants_tab: "Kasvit",
      plants_list_tab: "Kasvit",
      plants_locations_tab: "Sijainnit",
      plants_notes_tab: "Muistiinpanot",
      plants_notes_heading: "Muistiinpanot",
      new_note_placeholder: "Otsikko...",
      no_notes: "Ei muistiinpanoja",
      new_note_text_placeholder: "Muistiinpano...",
      plants_guides_tab: "Kasvatusohjeet",
      plants_guides_heading: "Kasvatusohjeet",
      plants_add_guide_btn: "+ Uusi ohje",
      plants_guide_ai_ph: "Kasvin nimi (hae AI:lla)...",
      plants_guide_ai_btn: "✨ Täytä AI:lla",
      plants_guide_plant_name_label: "Kasvin nimi (suomi)",
      plants_guide_latin_name_label: "Tieteellinen nimi",
      plants_guide_text_label: "Kasvatusohje",
      no_guides: "Ei kasvatusohjeita",

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

      // Kasvit — muokkaus
      plant_modal_add_heading: "Lisää kasvi",
      plant_modal_edit_heading: "Muokkaa kasvia",
      plant_add_continue_btn: "Jatka →",
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

      // Kasvit — ryhmittely ja näkymät
      plants_group_by_none: "Ei ryhmittelyä",
      plants_group_by_category: "Kategorian mukaan",
      plants_group_by_location: "Sijainnin mukaan",
      plants_group_by_status: "Tilan mukaan",
      plants_view_grid: "Kortit",
      plants_view_list: "Lista",
      plants_back_btn: "← Takaisin",
      back_to_list_btn: "← Takaisin",

      // Kasvit — sijainnit
      plants_locations_heading: "Sijainnit",
      new_location_placeholder: "Uusi sijainti...",
      no_locations: "Ei sijainteja. Lisää yllä.",
      delete_location_confirm: "Poistetaanko sijainti \"{name}\"? Kasvit säilyvät ilman sijaintia.",

      // Kasvit — kuvat
      plant_image_upload_btn: "🖼 Galleria",
      plant_image_camera_btn: "📷 Kamera",
      plant_image_set_primary: "Aseta pääkuvaksi",
      plant_image_delete_confirm: "Poistetaanko kuva?",
      plant_image_caption_ph: "Kuvateksti...",
      plant_uploading: "Ladataan...",
      plant_image_source: "Kuvan lähde",
      plant_edit_images_heading: "Kuvat",

      // Kasvit — AI
      plant_ai_search_ph: "Hae kasvia...",
      plant_ai_search_btn: "✨ Hae",
      plant_ai_searching: "Haetaan...",
      plant_ai_summary_heading: "AI-yhteenveto",
      plant_clear_btn: "Tyhjennä",
      plant_scan_btn: "📷 Lue nimilappu",
      plant_scan_reading: "Luetaan...",
      plant_ai_fill_btn: "✨ Täydennä AI:lla",
      plant_ai_summary_btn: "✨ Luo AI-yhteenveto",
      plant_ai_regenerate_btn: "✨ Luo uudelleen",
      plant_ai_summarizing: "Luodaan...",
      plant_ai_fetch_image_btn: "🔍 Hae kuva verkosta",
      plant_ai_fetching_image: "Haetaan...",
      plant_edit_btn: "✎ Muokkaa",
      plant_edit_delete_btn: "Poista kasvi",
      delete_plant_confirm: "Poistetaanko kasvi? Tätä ei voi peruuttaa.",

      // Jako
      share_collection_title: "Jaa kokoelma",
      share_collection_btn: "👥 Jaa kokoelma",
      share_perm_read: "Luku",
      share_perm_write: "Muokkaus",
      share_add_btn: "Jaa",
      share_added: "Lisätty.",
      share_remove_btn: "Poista",
      share_self_error: "Ei voi jakaa itselle.",
      share_not_found: "Käyttäjää ei löydy.",
    },
    en: {
      // Login
      sign_out: "Sign out",
      error_generic: "Something went wrong",
      error_login_failed: "Sign-in failed: ",
      error_client_id: "Google Sign-In not configured on server",
      error_auth_config: "Could not load auth configuration",

      // Common
      cancel: "Cancel",
      cancel_btn: "Cancel",
      save: "Save",
      save_btn: "Save",
      back: "Back",
      back_btn: "\u2190 Back",
      add_btn: "Add",
      edit_btn: "Edit",
      delete_btn: "Delete",
      rename_btn: "Rename",
      rename_prompt: "New name:",
      confirm_delete: "Delete?",

      // Plants — navigation
      plants_tab: "Plants",
      plants_list_tab: "Plants",
      plants_locations_tab: "Locations",
      plants_notes_tab: "Notes",
      plants_notes_heading: "Notes",
      new_note_placeholder: "Title...",
      no_notes: "No notes",
      new_note_text_placeholder: "Note...",
      plants_guides_tab: "Growing guides",
      plants_guides_heading: "Growing guides",
      plants_add_guide_btn: "+ New guide",
      plants_guide_ai_ph: "Plant name (AI fill)...",
      plants_guide_ai_btn: "✨ Fill with AI",
      plants_guide_plant_name_label: "Plant name (Finnish)",
      plants_guide_latin_name_label: "Scientific name",
      plants_guide_text_label: "Growing guide",
      no_guides: "No growing guides",

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

      // Plants — edit
      plant_modal_add_heading: "Add plant",
      plant_modal_edit_heading: "Edit plant",
      plant_add_continue_btn: "Continue \u2192",
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

      // Plants — grouping and views
      plants_group_by_none: "No grouping",
      plants_group_by_category: "By category",
      plants_group_by_location: "By location",
      plants_group_by_status: "By status",
      plants_view_grid: "Cards",
      plants_view_list: "List",
      plants_back_btn: "\u2190 Back",
      back_to_list_btn: "\u2190 Back",

      // Plants — locations
      plants_locations_heading: "Locations",
      new_location_placeholder: "New location...",
      no_locations: "No locations. Add one above.",
      delete_location_confirm: "Delete location \"{name}\"? Plants will remain without a location.",

      // Plants — images
      plant_image_upload_btn: "\uD83D\uDDBC Gallery",
      plant_image_camera_btn: "\uD83D\uDCF7 Camera",
      plant_image_set_primary: "Set as primary",
      plant_image_delete_confirm: "Delete photo?",
      plant_image_caption_ph: "Caption...",
      plant_uploading: "Uploading...",
      plant_image_source: "Image source",
      plant_edit_images_heading: "Photos",

      // Plants — AI
      plant_ai_search_ph: "Search plant...",
      plant_ai_search_btn: "\u2728 Search",
      plant_ai_searching: "Searching...",
      plant_ai_summary_heading: "AI summary",
      plant_clear_btn: "Clear",
      plant_scan_btn: "\uD83D\uDCF7 Read name tag",
      plant_scan_reading: "Reading...",
      plant_ai_fill_btn: "\u2728 Fill with AI",
      plant_ai_summary_btn: "\u2728 Generate summary",
      plant_ai_regenerate_btn: "\u2728 Regenerate",
      plant_ai_summarizing: "Generating...",
      plant_ai_fetch_image_btn: "\uD83D\uDD0D Search image online",
      plant_ai_fetching_image: "Searching...",
      plant_edit_btn: "\u270E Edit",
      plant_edit_delete_btn: "Delete plant",
      delete_plant_confirm: "Delete this plant? This cannot be undone.",

      // Sharing
      share_collection_title: "Share collection",
      share_collection_btn: "\uD83D\uDC65 Share collection",
      share_perm_read: "Read",
      share_perm_write: "Edit",
      share_add_btn: "Share",
      share_added: "Shared.",
      share_remove_btn: "Remove",
      share_self_error: "Cannot share with yourself.",
      share_not_found: "User not found.",
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
  var PLANTS_API = "/api/plants";

  var loginScreen = document.getElementById("login-screen");
  var loginError = document.getElementById("login-error");
  var googleSigninBtn = document.getElementById("google-signin-btn");
  var appContainer = document.getElementById("app-container");
  var errorEl = document.getElementById("error-message");

  var authToken = localStorage.getItem("authToken") || null;
  var currentUser = null;

  function showError(msg) {
    if (!errorEl) return;
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

  function renderMarkdown(text) {
    var html = escapeHtml(text);
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^# (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)(\n<li>|$)/g, "$1$2");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
    html = html.replace(/\n\n+/g, "</p><p>");
    html = html.replace(/([^>\n])\n([^<\n])/g, "$1<br>$2");
    return "<p>" + html + "</p>";
  }

  // ========== PLANTS MODULE ==========

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
  var plantsListScrollTop = 0;   // saved scroll position when entering detail/edit
  var plantsCurrentDetail = null;

  // Plants DOM elements
  var plantsTabButtons = document.querySelectorAll(".sidebar-plants-btn");
  var plantsListSection = document.getElementById("plants-list-section");
  var plantsLocationsSection = document.getElementById("plants-locations-section");
  var plantsNotesSection = document.getElementById("plants-notes-section");
  var plantsNotesListEl = document.getElementById("plants-notes-list");
  var plantsGuidesSection = document.getElementById("plants-guides-section");
  var plantsGuideDetailSection = document.getElementById("plants-guide-detail-section");
  var plantsGuideEditSection = document.getElementById("plants-guide-edit-section");
  var plantsGuidesGridEl = document.getElementById("plants-guides-grid");
  var plantsGuidesSearchEl = document.getElementById("plants-guides-search");
  var addNoteForm = document.getElementById("add-note-form");
  var newNoteTitleInput = document.getElementById("new-note-title");
  var newNoteTextInput = document.getElementById("new-note-text");
  var plantsDetailSection = document.getElementById("plants-detail-section");
  var plantsEditSection = document.getElementById("plants-edit-section");
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
  var plantsDetailAiSummarySection = document.getElementById("plants-ai-summary-section");
  var plantsDetailAiSummaryEl = document.getElementById("plants-detail-ai-summary");
  var plantsImageGallery = document.getElementById("plants-image-gallery");
  var plantLightbox = document.getElementById("plant-image-lightbox");
  var plantLightboxImg = document.getElementById("plant-lightbox-img");
  var plantLightboxClose = document.getElementById("plant-lightbox-close");
  var addLocationForm = document.getElementById("add-location-form");
  var newLocationNameInput = document.getElementById("new-location-name");
  var locationsListEl = document.getElementById("locations-list");

  // Plant edit section elements
  var plantsEditBackBtn = document.getElementById("plants-edit-back-btn");
  var plantsEditDeleteBtn = document.getElementById("plants-edit-delete-btn");
  var plantEditScanBtn = document.getElementById("plant-edit-scan-btn");
  var plantEditScanInput = document.getElementById("plant-edit-scan-input");
  var plantEditAiFillBtn = document.getElementById("plant-edit-ai-fill-btn");
  var plantEditForm = document.getElementById("plant-edit-form");
  var plantEditIdInput = document.getElementById("plant-edit-id");
  var plantEditLatinNameInput = document.getElementById("plant-edit-latin-name");
  var plantEditCommonNameInput = document.getElementById("plant-edit-common-name");
  var plantEditCultivarInput = document.getElementById("plant-edit-cultivar");
  var plantEditCategoryInput = document.getElementById("plant-edit-category");
  var plantEditStatusInput = document.getElementById("plant-edit-status");
  var plantEditLostYearGroup = document.getElementById("plant-edit-lost-year-group");
  var plantEditLostYearInput = document.getElementById("plant-edit-lost-year");
  var plantEditLocationInput = document.getElementById("plant-edit-location");
  var plantEditYearAcquiredInput = document.getElementById("plant-edit-year-acquired");
  var plantEditSourceInput = document.getElementById("plant-edit-source");
  var plantEditOwnSeedsInput = document.getElementById("plant-edit-own-seeds");
  var plantEditNotesInput = document.getElementById("plant-edit-notes");
  var plantEditCancelBtn = document.getElementById("plant-edit-cancel-btn");
  var plantsEditGallery = document.getElementById("plants-edit-gallery");
  var plantsEditImageUpload = document.getElementById("plants-edit-image-upload");
  var plantsEditImageCamera = document.getElementById("plants-edit-image-camera");
  var plantsEditWikiImageBtn = document.getElementById("plants-edit-wiki-image-btn");
  var plantsEditAiSummarySection = document.getElementById("plants-edit-ai-summary-section");
  var plantsEditAiSummaryEl = document.getElementById("plants-edit-ai-summary");
  var plantsEditAiSummaryBtn = document.getElementById("plants-edit-ai-summary-btn");

  // Plant add/edit state
  var plantsEditIsNew = false;
  var plantsEditImagesSection = document.querySelector(".plants-edit-images-section");
  var plantsEditAiSection = document.querySelector(".plants-edit-ai-section");
  var plantsEditHeading = document.getElementById("plants-edit-heading");
  var plantEditExtraFields = document.getElementById("plant-edit-extra-fields");
  var plantEditSubmitBtn = document.getElementById("plant-edit-submit-btn");

  // ---------- Plants tab switching ----------

  plantsTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchPlantsTab(btn.dataset.plantsTab);
    });
  });

  function switchPlantsTab(tab) {
    plantsCurrentTab = tab;
    plantsCurrentDetail = null;
    location.hash = tab;
    plantsTabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.plantsTab === tab);
    });
    plantsListSection.hidden = tab !== "list";
    plantsDetailSection.hidden = true;
    plantsEditSection.hidden = true;
    plantsLocationsSection.hidden = tab !== "locations";
    plantsNotesSection.hidden = tab !== "notes";
    plantsGuidesSection.hidden = tab !== "guides";
    plantsGuideDetailSection.hidden = true;
    plantsGuideEditSection.hidden = true;
    if (tab === "list") loadPlants();
    else if (tab === "locations") { loadLocations(); }
    else if (tab === "notes") { loadPlantNotes(); }
    else if (tab === "guides") { loadPlantGuides(); }
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
    var emptyOpt = '<option value="">' + t("plant_no_location") + "</option>";
    plantEditLocationInput.innerHTML = emptyOpt;
    plantsLocations.forEach(function (loc) {
      var opt = document.createElement("option");
      opt.value = loc.id;
      opt.textContent = loc.name;
      plantEditLocationInput.appendChild(opt);
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

  // ---------- Plant notes ----------

  var plantsNotesData = [];

  async function loadPlantNotes() {
    try {
      var notes = await apiFetch(PLANTS_API + "/notes");
      if (!notes) return;
      plantsNotesData = notes;
      renderPlantNotes();
    } catch (_) {}
  }

  function renderPlantNotes() {
    if (!plantsNotesListEl) return;
    plantsNotesListEl.innerHTML = "";
    if (!plantsNotesData.length) {
      plantsNotesListEl.innerHTML = '<p class="library-empty">' + t("no_notes") + "</p>";
      return;
    }
    plantsNotesData.forEach(function (note) {
      var card = document.createElement("div");
      card.className = "plant-note-card";
      card.innerHTML =
        '<div class="plant-note-view">' +
          '<h3 class="plant-note-title">' + escapeHtml(note.title) + "</h3>" +
          '<p class="plant-note-text">' + escapeHtml(note.text) + "</p>" +
          '<div class="plant-note-actions">' +
            '<button class="btn btn-secondary btn-sm" data-action="edit">' + t("edit_btn") + "</button>" +
            '<button class="btn btn-danger btn-sm" data-action="delete">' + t("delete_btn") + "</button>" +
          "</div>" +
        "</div>" +
        '<form class="plant-note-edit-form" hidden>' +
          '<input type="text" class="plant-note-edit-title" value="' + escapeHtml(note.title) + '">' +
          '<textarea class="plant-note-edit-text" rows="6">' + escapeHtml(note.text) + "</textarea>" +
          '<div class="plant-note-edit-actions">' +
            '<button type="submit" class="btn btn-primary btn-sm">' + t("save_btn") + "</button>" +
            '<button type="button" class="btn btn-secondary btn-sm" data-action="cancel">' + t("cancel_btn") + "</button>" +
          "</div>" +
        "</form>";

      var view = card.querySelector(".plant-note-view");
      var editForm = card.querySelector(".plant-note-edit-form");

      card.querySelector('[data-action="edit"]').addEventListener("click", function () {
        view.hidden = true;
        editForm.hidden = false;
        editForm.querySelector(".plant-note-edit-title").focus();
      });

      card.querySelector('[data-action="cancel"]').addEventListener("click", function () {
        view.hidden = false;
        editForm.hidden = true;
      });

      editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        var title = editForm.querySelector(".plant-note-edit-title").value.trim();
        var text = editForm.querySelector(".plant-note-edit-text").value;
        if (!title) return;
        try {
          await apiFetch(PLANTS_API + "/notes/" + note.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title, text: text }),
          });
          loadPlantNotes();
        } catch (_) {}
      });

      card.querySelector('[data-action="delete"]').addEventListener("click", async function () {
        if (!confirm(t("confirm_delete"))) return;
        try {
          await apiFetch(PLANTS_API + "/notes/" + note.id, { method: "DELETE" });
          loadPlantNotes();
        } catch (_) {}
      });

      plantsNotesListEl.appendChild(card);
    });
  }

  if (addNoteForm) {
    addNoteForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var title = newNoteTitleInput.value.trim();
      if (!title) return;
      try {
        await apiFetch(PLANTS_API + "/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title, text: newNoteTextInput ? newNoteTextInput.value : "" }),
        });
        newNoteTitleInput.value = "";
        if (newNoteTextInput) newNoteTextInput.value = "";
        loadPlantNotes();
      } catch (_) {}
    });
  }

  // ---------- Plant growing guides ----------

  var plantsGuidesData = [];
  var plantsGuidesSearchQuery = "";
  var plantsCurrentGuide = null;

  async function loadPlantGuides() {
    try {
      var guides = await apiFetch(PLANTS_API + "/guides");
      if (!guides) return;
      plantsGuidesData = guides;
      renderPlantGuidesList();
    } catch (_) {}
  }

  function renderPlantGuidesList() {
    if (!plantsGuidesGridEl) return;
    var filtered = plantsGuidesData.filter(function (g) {
      if (!plantsGuidesSearchQuery) return true;
      var q = plantsGuidesSearchQuery.toLowerCase();
      return g.plant_name.toLowerCase().includes(q) || g.latin_name.toLowerCase().includes(q);
    });
    if (!filtered.length) {
      plantsGuidesGridEl.innerHTML = '<p class="plants-count">' + t("no_guides") + "</p>";
      return;
    }
    plantsGuidesGridEl.innerHTML = filtered.map(function (g) {
      var preview = g.guide_text ? g.guide_text.slice(0, 100) + (g.guide_text.length > 100 ? "\u2026" : "") : "";
      return "<div class='plant-guide-card' data-id='" + g.id + "'>" +
        "<div class='plant-guide-card-name'>" + escapeHtml(g.plant_name) + "</div>" +
        (g.latin_name ? "<div class='plant-guide-card-latin'><em>" + escapeHtml(g.latin_name) + "</em></div>" : "") +
        (preview ? "<div class='plant-guide-card-preview'>" + escapeHtml(preview) + "</div>" : "") +
        "</div>";
    }).join("");
    plantsGuidesGridEl.querySelectorAll(".plant-guide-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var guide = plantsGuidesData.find(function (g) { return g.id === parseInt(card.dataset.id); });
        if (guide) openPlantGuideDetail(guide);
      });
    });
  }

  if (plantsGuidesSearchEl) {
    plantsGuidesSearchEl.addEventListener("input", function () {
      plantsGuidesSearchQuery = plantsGuidesSearchEl.value;
      renderPlantGuidesList();
    });
  }

  function openPlantGuideDetail(guide) {
    plantsCurrentGuide = guide;
    plantsGuidesSection.hidden = true;
    plantsGuideDetailSection.hidden = false;
    plantsGuideEditSection.hidden = true;
    var content = document.getElementById("plants-guide-detail-content");
    if (content) {
      content.innerHTML =
        "<h2 class='plant-guide-detail-name'>" + escapeHtml(guide.plant_name) + "</h2>" +
        (guide.latin_name ? "<p class='plant-guide-detail-latin'><em>" + escapeHtml(guide.latin_name) + "</em></p>" : "") +
        "<div class='plant-guide-detail-text'>" + escapeHtml(guide.guide_text).replace(/\n/g, "<br>") + "</div>";
    }
    window.scrollTo(0, 0);
  }

  function openPlantGuideEdit(guide) {
    plantsCurrentGuide = guide;
    plantsGuidesSection.hidden = true;
    plantsGuideDetailSection.hidden = true;
    plantsGuideEditSection.hidden = false;
    document.getElementById("guide-edit-plant-name").value = guide ? guide.plant_name : "";
    document.getElementById("guide-edit-latin-name").value = guide ? guide.latin_name : "";
    document.getElementById("guide-edit-text").value = guide ? guide.guide_text : "";
    var errEl = document.getElementById("guide-ai-error");
    if (errEl) errEl.hidden = true;
    window.scrollTo(0, 0);
  }

  document.getElementById("guide-detail-back-btn").addEventListener("click", function () {
    plantsCurrentGuide = null;
    plantsGuideDetailSection.hidden = true;
    plantsGuidesSection.hidden = false;
  });

  document.getElementById("guide-edit-btn").addEventListener("click", function () {
    if (plantsCurrentGuide) openPlantGuideEdit(plantsCurrentGuide);
  });

  document.getElementById("guide-delete-btn").addEventListener("click", async function () {
    if (!plantsCurrentGuide) return;
    if (!confirm(t("confirm_delete"))) return;
    try {
      await apiFetch(PLANTS_API + "/guides/" + plantsCurrentGuide.id, { method: "DELETE" });
      plantsCurrentGuide = null;
      plantsGuideDetailSection.hidden = true;
      plantsGuidesSection.hidden = false;
      await loadPlantGuides();
    } catch (_) {}
  });

  document.getElementById("guide-edit-back-btn").addEventListener("click", function () {
    if (plantsCurrentGuide) {
      openPlantGuideDetail(plantsCurrentGuide);
    } else {
      plantsGuideEditSection.hidden = true;
      plantsGuidesSection.hidden = false;
    }
  });

  document.getElementById("guide-edit-save-btn").addEventListener("click", async function () {
    var plantName = document.getElementById("guide-edit-plant-name").value.trim();
    var latinName = document.getElementById("guide-edit-latin-name").value.trim();
    var guideText = document.getElementById("guide-edit-text").value;
    if (!plantName) return;
    try {
      var body = { plant_name: plantName, latin_name: latinName, guide_text: guideText };
      var result;
      if (plantsCurrentGuide) {
        result = await apiFetch(PLANTS_API + "/guides/" + plantsCurrentGuide.id, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        result = await apiFetch(PLANTS_API + "/guides", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }
      if (result) {
        await loadPlantGuides();
        plantsCurrentGuide = plantsGuidesData.find(function (g) { return g.id === result.id; }) || result;
        openPlantGuideDetail(plantsCurrentGuide);
      }
    } catch (_) {}
  });

  document.getElementById("add-guide-btn").addEventListener("click", function () {
    plantsCurrentGuide = null;
    openPlantGuideEdit(null);
  });

  // AI fill for guide
  document.getElementById("guide-ai-fill-btn").addEventListener("click", async function () {
    var query = document.getElementById("guide-edit-latin-name").value.trim() ||
                document.getElementById("guide-edit-plant-name").value.trim();
    var errEl = document.getElementById("guide-ai-error");
    if (!query) return;
    var btn = document.getElementById("guide-ai-fill-btn");
    btn.disabled = true;
    btn.textContent = "\u2026";
    if (errEl) errEl.hidden = true;
    try {
      var result = await apiFetch("/api/ai/plants/fill-guide?query=" + encodeURIComponent(query));
      if (result) {
        if (result.plant_name) document.getElementById("guide-edit-plant-name").value = result.plant_name;
        if (result.latin_name) document.getElementById("guide-edit-latin-name").value = result.latin_name;
        if (result.guide_text) document.getElementById("guide-edit-text").value = result.guide_text;
      }
    } catch (e) {
      if (errEl) { errEl.textContent = e.message || t("error_generic"); errEl.hidden = false; }
    }
    btn.disabled = false;
    btn.textContent = t("plants_guide_ai_btn");
  });

  // ---------- Plants list ----------

  async function loadPlants() {
    try {
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
      updatePlantsWriteUI();
    } catch (_) {}
  }

  function updatePlantsWriteUI() {
    var addBtn = document.getElementById("add-plant-btn");
    if (addBtn) addBtn.hidden = false;
    var detailEditBtn = document.getElementById("plants-detail-edit-btn");
    var editDeleteBtn = document.getElementById("plants-edit-delete-btn");
    if (detailEditBtn) detailEditBtn.hidden = false;
    if (editDeleteBtn) editDeleteBtn.hidden = false;
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

    var searchTerm = plantsSearchInput.value.trim().toLowerCase();
    if (!plantsGroupBy) {
      plants.forEach(function (p) {
        plantsGridEl.appendChild(plantsViewMode === "list" ? createPlantRow(p, searchTerm) : createPlantCard(p, searchTerm));
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
        plantsGridEl.appendChild(plantsViewMode === "list" ? createPlantRow(p, searchTerm) : createPlantCard(p, searchTerm));
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

  function createPlantRow(plant, searchTerm) {
    var row = document.createElement("div");
    row.className = "plant-list-row";
    row.dataset.id = plant.id;
    var name = '<span class="plant-card-latin" style="font-style:italic">' + escapeHtml(plant.latin_name) + "</span>" +
      (plant.cultivar ? ' <span class="plant-card-cultivar">\u2018' + escapeHtml(plant.cultivar) + "\u2019</span>" : "") +
      (plant.common_name ? ' <span class="plant-list-common">\u2013 ' + escapeHtml(plant.common_name) + "</span>" : "");
    var showSource = searchTerm && plant.source && plant.source.toLowerCase().includes(searchTerm);
    row.innerHTML = '<span class="plant-list-name">' + name + "</span>" +
      (showSource ? '<span class="plant-list-source">' + escapeHtml(plant.source) + "</span>" : "") +
      (plant.status !== "active"
        ? '<span class="plant-badge plant-status-' + plant.status + '">' + escapeHtml(plantStatusLabel(plant.status)) + "</span>"
        : "");
    return row;
  }

  function createPlantCard(plant, searchTerm) {
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
      meta.push('<span class="plant-location-tag">\uD83D\uDCCD ' + escapeHtml(plant.location_name) + "</span>");
    }
    if (plant.year_acquired) {
      meta.push('<span class="plant-year-tag">' + plant.year_acquired + "</span>");
    }
    if (searchTerm && plant.source && plant.source.toLowerCase().includes(searchTerm)) {
      meta.push('<span class="plant-source-tag">\uD83C\uDFEA ' + escapeHtml(plant.source) + "</span>");
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
      '<div class="plant-card-meta">' + meta.join("") + "</div>";

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
      if (plant) openPlantEdit(plant);
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
    images.forEach(function (img) {
      var url = "/api/plant-images/" + img.filename;
      var thumb = document.createElement("div");
      thumb.className = "plant-thumb";
      var sourceHtml = img.source_url
        ? '<a class="plant-thumb-source" href="' + escapeHtml(img.source_url) + '" target="_blank" rel="noopener" title="' + t("plant_image_source") + '">\uD83D\uDD17</a>'
        : "";
      thumb.innerHTML = '<img src="' + escapeHtml(url) + '" alt="">' + sourceHtml;
      thumb.querySelector("img").addEventListener("click", function () {
        plantLightboxImg.src = url;
        plantLightbox.hidden = false;
      });
      plantsImageGallery.appendChild(thumb);
    });
  }

  function renderEditGallery(images) {
    plantsEditGallery.innerHTML = "";
    images.forEach(function (img, idx) {
      var url = "/api/plant-images/" + img.filename;
      var thumb = document.createElement("div");
      thumb.className = "plant-thumb" + (idx === 0 ? " is-primary" : "");
      var sourceHtml = img.source_url
        ? '<a class="plant-thumb-source" href="' + escapeHtml(img.source_url) + '" target="_blank" rel="noopener" title="' + t("plant_image_source") + '">\uD83D\uDD17</a>'
        : "";
      thumb.innerHTML =
        '<img src="' + escapeHtml(url) + '" alt="">' +
        sourceHtml +
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
      plantsEditGallery.appendChild(thumb);
    });
  }

  async function reloadCurrentDetail() {
    if (!plantsCurrentDetail) return;
    await loadPlants();
    var updated = plantsData.find(function (p) { return p.id === plantsCurrentDetail.id; });
    if (updated) {
      history.replaceState({ valiumPage: "plant-detail", id: updated.id }, "");
      _renderPlantDetail(updated);
    }
  }

  async function reloadCurrentEdit() {
    if (!plantsCurrentDetail) return;
    await loadPlants();
    var updated = plantsData.find(function (p) { return p.id === plantsCurrentDetail.id; });
    if (updated) {
      history.replaceState({ valiumPage: "plant-edit", id: updated.id }, "");
      _renderPlantEdit(updated);
    }
  }

  function _renderPlantDetail(plant) {
    plantsCurrentDetail = plant;
    plantsListSection.hidden = true;
    plantsEditSection.hidden = true;
    plantsDetailSection.hidden = false;
    updatePlantsWriteUI();

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
      plantsDetailAiSummaryEl.innerHTML = renderMarkdown(plant.ai_summary);
      plantsDetailAiSummarySection.hidden = false;
    } else {
      plantsDetailAiSummaryEl.innerHTML = "";
      plantsDetailAiSummarySection.hidden = true;
    }
  }

  function openPlantDetail(plant) {
    plantsListScrollTop = window.scrollY;
    history.pushState({ valiumPage: "plant-detail", id: plant.id }, "");
    _renderPlantDetail(plant);
    plantsDetailSection.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function _renderPlantEdit(plant) {
    plantsListSection.hidden = true;
    plantsDetailSection.hidden = true;
    plantsEditSection.hidden = false;

    if (plant === null) {
      plantsCurrentDetail = null;
      plantEditIdInput.value = "";
      plantEditLatinNameInput.value = "";
      plantEditCommonNameInput.value = "";
      plantEditCultivarInput.value = "";
      plantEditCategoryInput.value = "perennial";
      plantEditStatusInput.value = "active";
      plantEditLostYearGroup.hidden = true;
      plantEditLostYearInput.value = "";
      plantEditLocationInput.value = "";
      plantEditYearAcquiredInput.value = new Date().getFullYear();
      plantEditSourceInput.value = "";
      plantEditOwnSeedsInput.checked = false;
      plantEditNotesInput.value = "";
      plantsEditDeleteBtn.hidden = true;
      plantsEditImagesSection.hidden = true;
      plantsEditAiSection.hidden = true;
      plantEditExtraFields.hidden = true;
      plantEditCancelBtn.textContent = t("plant_clear_btn");
      plantsEditHeading.textContent = t("plant_modal_add_heading");
      plantEditSubmitBtn.textContent = t("plant_add_continue_btn");
    } else {
      plantsCurrentDetail = plant;
      plantEditIdInput.value = plant.id;
      plantEditLatinNameInput.value = plant.latin_name || "";
      plantEditCommonNameInput.value = plant.common_name || "";
      plantEditCultivarInput.value = plant.cultivar || "";
      plantEditCategoryInput.value = plant.category || "perennial";
      plantEditStatusInput.value = plant.status || "active";
      plantEditLostYearGroup.hidden = plant.status !== "lost";
      plantEditLostYearInput.value = plant.lost_year || "";
      plantEditLocationInput.value = plant.location_id || "";
      plantEditYearAcquiredInput.value = plant.year_acquired || "";
      plantEditSourceInput.value = plant.source || "";
      plantEditOwnSeedsInput.checked = !!plant.own_seeds;
      plantEditNotesInput.value = plant.notes || "";
      plantsEditDeleteBtn.hidden = false;
      plantsEditImagesSection.hidden = false;
      plantsEditAiSection.hidden = false;
      plantEditExtraFields.hidden = false;
      plantEditCancelBtn.textContent = t("cancel");
      plantsEditHeading.textContent = t("plant_modal_edit_heading");
      plantEditSubmitBtn.textContent = t("save");

      renderEditGallery(plant.images || []);

      if (plant.ai_summary) {
        plantsEditAiSummaryEl.innerHTML = renderMarkdown(plant.ai_summary);
        plantsEditAiSummarySection.hidden = false;
      } else {
        plantsEditAiSummaryEl.innerHTML = "";
        plantsEditAiSummarySection.hidden = true;
      }

      plantsEditAiSummaryBtn.textContent = summaryBtnLabel();
    }
  }

  function openPlantAdd() {
    plantsEditIsNew = true;
    _renderPlantEdit(null);
    history.pushState({ valiumPage: "plant-add" }, "");
    window.scrollTo(0, 0);
    plantEditLatinNameInput.focus();
  }

  function openPlantEdit(plant, replace) {
    plantsEditIsNew = false;
    var state = { valiumPage: "plant-edit", id: plant.id };
    if (replace) history.replaceState(state, "");
    else history.pushState(state, "");
    _renderPlantEdit(plant);
    window.scrollTo(0, 0);
  }

  function closePlantDetail() {
    plantsDetailSection.hidden = true;
    plantsEditSection.hidden = true;
    plantsListSection.hidden = false;
    plantsCurrentDetail = null;
    requestAnimationFrame(function () { window.scrollTo(0, plantsListScrollTop); });
  }

  // Back/cancel buttons delegate to browser history
  plantsDetailBackBtn.addEventListener("click", function () { history.back(); });
  plantsEditBackBtn.addEventListener("click", function () { history.back(); });
  plantEditCancelBtn.addEventListener("click", function () {
    if (plantsCurrentDetail) {
      history.back();
    } else {
      plantEditLatinNameInput.value = "";
      plantEditCommonNameInput.value = "";
      plantEditCultivarInput.value = "";
      plantEditCategoryInput.value = "perennial";
      plantEditStatusInput.value = "active";
      plantEditLostYearInput.value = "";
      plantEditLocationInput.value = "";
      plantEditYearAcquiredInput.value = new Date().getFullYear();
      plantEditSourceInput.value = "";
      plantEditOwnSeedsInput.checked = false;
      plantEditNotesInput.value = "";
    }
  });

  plantsDetailEditBtn.addEventListener("click", function () {
    if (plantsCurrentDetail) openPlantEdit(plantsCurrentDetail);
  });

  // Handle browser back/forward within plants navigation
  window.addEventListener("popstate", function (e) {
    var state = e.state;
    if (state && state.valiumPage === "plant-detail") {
      var plant = plantsData.find(function (p) { return p.id === state.id; });
      if (plant) _renderPlantDetail(plant);
      return;
    }
    if (state && state.valiumPage === "plant-edit") {
      var plant = plantsData.find(function (p) { return p.id === state.id; });
      if (plant) { plantsEditIsNew = false; _renderPlantEdit(plant); }
      return;
    }
    if (state && state.valiumPage === "plant-add") {
      plantsEditIsNew = true;
      _renderPlantEdit(null);
      return;
    }
    // Went back past all plant detail states — show list
    if (!plantsDetailSection.hidden || !plantsEditSection.hidden) {
      closePlantDetail();
    }
  });

  plantsEditDeleteBtn.addEventListener("click", async function () {
    if (!plantsCurrentDetail) return;
    if (!confirm(t("delete_plant_confirm"))) return;
    var id = plantsCurrentDetail.id;
    try {
      await apiFetch(PLANTS_API + "/" + id, { method: "DELETE" });
      plantsCurrentDetail = null;
      plantsEditSection.hidden = true;
      plantsListSection.hidden = false;
      await loadPlants();
    } catch (_) {}
  });

  plantEditStatusInput.addEventListener("change", function () {
    var isLost = this.value === "lost";
    plantEditLostYearGroup.hidden = !isLost;
    if (isLost && !plantEditLostYearInput.value) {
      plantEditLostYearInput.value = new Date().getFullYear();
    }
  });

  // ---------- Image upload (edit section) ----------

  async function uploadPlantImage(file, triggerInput) {
    if (!file) return;
    if (!plantsCurrentDetail) {
      showError("Tallenna kasvi ensin ennen kuvan lisäämistä.");
      return;
    }
    var labels = document.querySelectorAll(".plants-upload-btn");
    labels.forEach(function (l) { l.classList.add("plants-upload-btn--loading"); });
    var fd = new FormData();
    fd.append("file", file);
    try {
      await apiFetch(PLANTS_API + "/" + plantsCurrentDetail.id + "/images", { method: "POST", body: fd });
      await reloadCurrentEdit();
    } finally {
      labels.forEach(function (l) { l.classList.remove("plants-upload-btn--loading"); });
      if (triggerInput) triggerInput.value = "";
    }
  }

  plantsEditImageUpload.addEventListener("change", async function () {
    var file = this.files[0];
    await uploadPlantImage(file, this);
  });

  plantsEditImageCamera.addEventListener("change", async function () {
    var file = this.files[0];
    await uploadPlantImage(file, this);
  });

  plantsEditGallery.addEventListener("click", async function (e) {
    var btn = e.target.closest("[data-img-action]");
    if (!btn || !plantsCurrentDetail) return;
    var id = plantsCurrentDetail.id;
    var imgId = btn.dataset.imgId;
    if (btn.dataset.imgAction === "primary") {
      try {
        await apiFetch(PLANTS_API + "/" + id + "/images/" + imgId + "/set-primary", { method: "POST" });
        await reloadCurrentEdit();
      } catch (_) {}
    } else if (btn.dataset.imgAction === "delete") {
      if (!confirm(t("plant_image_delete_confirm"))) return;
      try {
        await apiFetch(PLANTS_API + "/" + id + "/images/" + imgId, { method: "DELETE" });
        await reloadCurrentEdit();
      } catch (_) {}
    }
  });

  // ---------- AI: fill missing fields (edit section) ----------

  plantEditScanBtn.addEventListener("click", function () {
    plantEditScanInput.value = "";
    plantEditScanInput.click();
  });

  plantEditScanInput.addEventListener("change", async function () {
    var file = plantEditScanInput.files[0];
    if (!file) return;
    plantEditScanBtn.disabled = true;
    plantEditScanBtn.textContent = t("plant_scan_reading");
    try {
      var form = new FormData();
      form.append("image", file);
      var res = await apiFetch("/api/ai/plants/read-label", { method: "POST", body: form });
      if (res) {
        if (res.latin_name) plantEditLatinNameInput.value = res.latin_name;
        if (res.common_name) plantEditCommonNameInput.value = res.common_name;
        if (res.cultivar) plantEditCultivarInput.value = res.cultivar;
        if (res.category) plantEditCategoryInput.value = res.category;
      }
    } finally {
      plantEditScanBtn.disabled = false;
      plantEditScanBtn.textContent = t("plant_scan_btn");
    }
  });

  plantEditAiFillBtn.addEventListener("click", async function () {
    var query = plantEditLatinNameInput.value.trim() || plantEditCommonNameInput.value.trim();
    if (!query) return;
    plantEditAiFillBtn.disabled = true;
    plantEditAiFillBtn.textContent = t("plant_ai_searching");
    try {
      var res = await apiFetch("/api/ai/plants/fill-name?query=" + encodeURIComponent(query), { method: "POST" });
      if (res) {
        if (!plantEditLatinNameInput.value.trim() && res.latin_name) plantEditLatinNameInput.value = res.latin_name;
        if (!plantEditCommonNameInput.value.trim() && res.common_name) plantEditCommonNameInput.value = res.common_name;
        if (!plantEditCategoryInput.value && res.category) plantEditCategoryInput.value = res.category;
      }
    } catch (err) {
      plantEditAiFillBtn.textContent = err.message || "Virhe";
      setTimeout(function () { plantEditAiFillBtn.textContent = t("plant_ai_fill_btn"); }, 4000);
    }
    plantEditAiFillBtn.disabled = false;
    plantEditAiFillBtn.textContent = t("plant_ai_fill_btn");
  });

  // ---------- AI: plant summary (edit section) ----------

  function summaryBtnLabel() {
    return plantsCurrentDetail && plantsCurrentDetail.ai_summary
      ? t("plant_ai_regenerate_btn")
      : t("plant_ai_summary_btn");
  }

  plantsEditAiSummaryBtn.addEventListener("click", async function () {
    if (!plantsCurrentDetail) return;
    plantsEditAiSummaryBtn.disabled = true;
    plantsEditAiSummaryBtn.textContent = t("plant_ai_summarizing");
    try {
      var updated = await apiFetch(
        "/api/ai/plants/" + plantsCurrentDetail.id + "/summary", { method: "POST" });
      if (updated && updated.ai_summary) {
        plantsEditAiSummaryEl.innerHTML = renderMarkdown(updated.ai_summary);
        plantsEditAiSummarySection.hidden = false;
        plantsCurrentDetail = updated;
      }
    } catch (err) {
      plantsEditAiSummaryBtn.textContent = err.message || "Virhe";
      setTimeout(function () { plantsEditAiSummaryBtn.textContent = summaryBtnLabel(); }, 4000);
    }
    plantsEditAiSummaryBtn.disabled = false;
    plantsEditAiSummaryBtn.textContent = summaryBtnLabel();
  });

  // ---------- AI: image fetch (edit section) ----------

  plantsEditWikiImageBtn.addEventListener("click", async function () {
    if (!plantsCurrentDetail) return;
    plantsEditWikiImageBtn.disabled = true;
    plantsEditWikiImageBtn.textContent = t("plant_ai_fetching_image");
    try {
      await apiFetch(
        "/api/ai/plants/" + plantsCurrentDetail.id + "/fetch-image", { method: "POST" });
      await reloadCurrentEdit();
    } catch (err) {
      plantsEditWikiImageBtn.textContent = err.message || "Virhe";
      setTimeout(function () { plantsEditWikiImageBtn.textContent = t("plant_ai_fetch_image_btn"); }, 4000);
    }
    plantsEditWikiImageBtn.disabled = false;
    plantsEditWikiImageBtn.textContent = t("plant_ai_fetch_image_btn");
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
    openPlantAdd();
  });

  // Edit/add form submit
  plantEditForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var latinName = plantEditLatinNameInput.value.trim() || null;
    var commonName = plantEditCommonNameInput.value.trim() || null;
    if (!latinName && !commonName) {
      alert("Anna vähintään tieteellinen tai suomalainen nimi.");
      return;
    }
    var payload = {
      latin_name: latinName,
      common_name: commonName,
      cultivar: plantEditCultivarInput.value.trim() || null,
      category: plantEditCategoryInput.value,
      status: plantEditStatusInput.value,
      lost_year: plantEditStatusInput.value === "lost" && plantEditLostYearInput.value ? parseInt(plantEditLostYearInput.value, 10) : null,
      location_id: plantEditLocationInput.value ? parseInt(plantEditLocationInput.value, 10) : null,
      year_acquired: plantEditYearAcquiredInput.value ? parseInt(plantEditYearAcquiredInput.value, 10) : null,
      source: plantEditSourceInput.value.trim() || null,
      own_seeds: plantEditOwnSeedsInput.checked,
      notes: plantEditNotesInput.value.trim() || null,
    };
    plantEditSubmitBtn.disabled = true;
    var origLabel = plantEditSubmitBtn.textContent;
    plantEditSubmitBtn.textContent = "...";
    try {
      if (plantsEditIsNew) {
        var created = await apiFetch(PLANTS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await loadPlants();
        if (created) {
          var fresh = plantsData.find(function (p) { return p.id === created.id; });
          if (fresh) openPlantEdit(fresh, true);
        }
      } else {
        var id = plantEditIdInput.value;
        if (!id) return;
        await apiFetch(PLANTS_API + "/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await loadPlants();
        var updated = plantsData.find(function (p) { return p.id === parseInt(id, 10); });
        if (updated) {
          history.replaceState({ valiumPage: "plant-detail", id: updated.id }, "");
          _renderPlantDetail(updated);
        } else {
          plantsEditSection.hidden = true;
          plantsListSection.hidden = false;
          plantsCurrentDetail = null;
        }
      }
    } finally {
      plantEditSubmitBtn.disabled = false;
      plantEditSubmitBtn.textContent = origLabel;
    }
  });

  // ---------- initApp ----------

  async function initApp() {
    await loadUserSettings();
    ValiumCommon.init({
      appName: t("plants_tab"),
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
    // Restore tab from hash
    var hashParts = location.hash.slice(1).split("/");
    var hashTab = hashParts[0] || "list";
    var validTabs = ["list", "locations", "notes", "guides"];
    plantsCurrentTab = validTabs.indexOf(hashTab) !== -1 ? hashTab : "list";
    switchPlantsTab(plantsCurrentTab);
  }

  // ---------- Bootstrap ----------

  applyTranslations();
  initGoogleSignIn();
  checkAuthAndInit();

})();
