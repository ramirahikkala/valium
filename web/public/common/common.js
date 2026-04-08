/* Valium — shared header component
 * Usage:
 *   ValiumCommon.init({ appName, user, currentLang, onSignOut, onLanguageChange })
 * Call after login, passing current user object and callbacks.
 */
var ValiumCommon = (function () {
  "use strict";

  var _onSignOut = null;
  var _onLanguageChange = null;

  function init(opts) {
    _onSignOut = opts.onSignOut || function () {};
    _onLanguageChange = opts.onLanguageChange || function () {};

    _renderHeader(opts.appName || "");
    _updateUser(opts.user);
    _setLang(opts.currentLang || localStorage.getItem("lang") || "fi");
    _wire();
  }

  function updateUser(user) {
    var nameEl = document.getElementById("ch-user-name");
    var avatarEl = document.getElementById("ch-user-avatar");
    if (nameEl) nameEl.textContent = user ? user.name || "" : "";
    if (avatarEl) {
      if (user && user.picture) {
        avatarEl.src = user.picture;
        avatarEl.hidden = false;
      } else {
        avatarEl.hidden = true;
      }
    }
  }

  function _updateUser(user) { updateUser(user); }

  function _setLang(lang) {
    var sel = document.getElementById("ch-lang-select");
    if (sel) sel.value = lang;
  }

  function _renderHeader(appName) {
    var existing = document.getElementById("common-header");
    if (existing) existing.remove();

    var header = document.createElement("header");
    header.id = "common-header";
    header.innerHTML =
      '<div class="header-content">' +
        '<div class="header-left">' +
          '<h1>' + _esc(appName) + '</h1>' +
        '</div>' +
        '<div class="header-right">' +
          '<button class="ch-hamburger" id="ch-hamburger" aria-label="Valikko">&#9776;</button>' +
        '</div>' +
      '</div>' +
      // Overlay
      '<div class="ch-overlay" id="ch-overlay"></div>' +
      // Drawer
      '<div class="ch-drawer" id="ch-drawer">' +
        '<div class="ch-drawer-header">' +
          '<img id="ch-user-avatar" class="ch-avatar" src="" alt="" hidden>' +
          '<span id="ch-user-name" class="ch-user-name"></span>' +
          '<button class="ch-drawer-close" id="ch-drawer-close">&#10005;</button>' +
        '</div>' +
        '<div class="ch-drawer-body">' +
          '<div class="ch-setting-row">' +
            '<label class="ch-setting-label" for="ch-lang-select">Kieli / Language</label>' +
            '<select id="ch-lang-select" class="ch-lang-select">' +
              '<option value="fi">Suomi</option>' +
              '<option value="en">English</option>' +
            '</select>' +
          '</div>' +
          '<button class="btn ch-signout-btn" id="ch-signout-btn">Kirjaudu ulos</button>' +
        '</div>' +
      '</div>';

    // Insert before first child of body
    document.body.insertBefore(header, document.body.firstChild);
  }

  function _wire() {
    var hamburger = document.getElementById("ch-hamburger");
    var overlay = document.getElementById("ch-overlay");
    var drawer = document.getElementById("ch-drawer");
    var closeBtn = document.getElementById("ch-drawer-close");
    var langSel = document.getElementById("ch-lang-select");
    var signoutBtn = document.getElementById("ch-signout-btn");

    function openDrawer() {
      drawer.classList.add("open");
      overlay.classList.add("visible");
    }
    function closeDrawer() {
      drawer.classList.remove("open");
      overlay.classList.remove("visible");
    }

    if (hamburger) hamburger.addEventListener("click", openDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    if (langSel) {
      langSel.addEventListener("change", async function () {
        var lang = this.value;
        closeDrawer();
        await _onLanguageChange(lang);
      });
    }

    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        closeDrawer();
        _onSignOut();
      });
    }
  }

  function _esc(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  return { init: init, updateUser: updateUser };
})();
