/**
 * Gym tab switching — Playwright E2E against the real running app.
 *
 * Requires the Docker stack to be up (localhost:3000).
 * Bypasses Google auth by injecting a fake currentUser + authToken
 * directly into the page context, then calling showApp().
 *
 * Run:  node web/tests/gym-tabs.e2e.js
 */

"use strict";

const { chromium } = require("playwright");

// ─── Tiny reporter ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); passed++; }
function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

function assert(condition, message) {
  condition ? ok(message) : fail(message);
}

function section(name) { console.log(`\n── ${name} ──`); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Evaluate JS in page and return the `hidden` property of a DOM element.
 */
async function isHidden(page, selector) {
  return page.evaluate((sel) => {
    const el = document.getElementById(sel);
    return el ? el.hidden : null;
  }, selector);
}

async function clickById(page, id) {
  await page.evaluate((id) => document.getElementById(id).click(), id);
}

async function clickBySelector(page, selector) {
  await page.evaluate((sel) => document.querySelector(sel).click(), selector);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors for debugging
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("  [browser error]", msg.text());
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Bypass Google auth: inject fake auth state and call showApp()
  await page.evaluate(() => {
    // The IIFE exposes nothing globally, but we can reach internal state
    // by patching the DOM directly and triggering the right functions.
    // Easiest: set localStorage token + reload, or fake the auth state.
    // Since currentUser/authToken are IIFE-scoped we can't set them directly.
    // Instead we hide the login screen and show the app container, matching
    // what showApp() does, then set a fake auth header for API calls.

    // Show app without real auth (read-only DOM test)
    const login = document.getElementById("login-screen");
    const app   = document.getElementById("app-container");
    if (login) login.hidden = true;
    if (app)   app.hidden   = false;

    // Show user name so the UI looks logged in
    const nameEl = document.getElementById("user-name");
    if (nameEl) nameEl.textContent = "Test User";
  });

  section("Gym tab switching (E2E)");

  // Navigate to Gym view
  await clickById(page, "view-tab-gym");
  await page.waitForTimeout(100);

  assert(!(await isHidden(page, "gym-view")), "gym-view is visible after clicking Sali");
  assert(!(await isHidden(page, "sidebar-gym-children")), "sidebar gym children are visible");
  assert(!(await isHidden(page, "gym-programs")), "gym-programs visible by default");
  assert(  await isHidden(page, "gym-workout"),  "gym-workout hidden by default");
  assert(  await isHidden(page, "gym-history"),  "gym-history hidden by default");

  // Click Treeni
  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='workout']");
  await page.waitForTimeout(100);

  assert(  await isHidden(page, "gym-programs"), "After Treeni: gym-programs hidden");
  assert(!(await isHidden(page, "gym-workout")), "After Treeni: gym-workout visible");
  assert(  await isHidden(page, "gym-history"),  "After Treeni: gym-history hidden");

  // Click Historia
  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='history']");
  await page.waitForTimeout(100);

  assert(  await isHidden(page, "gym-programs"), "After Historia: gym-programs hidden");
  assert(  await isHidden(page, "gym-workout"),  "After Historia: gym-workout hidden");
  assert(!(await isHidden(page, "gym-history")), "After Historia: gym-history visible");

  // Click Ohjelmat
  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='programs']");
  await page.waitForTimeout(100);

  assert(!(await isHidden(page, "gym-programs")), "After Ohjelmat: gym-programs visible");
  assert(  await isHidden(page, "gym-workout"),   "After Ohjelmat: gym-workout hidden");
  assert(  await isHidden(page, "gym-history"),   "After Ohjelmat: gym-history hidden");

  section("Active class follows selected tab");

  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='workout']");
  await page.waitForTimeout(50);

  const workoutActive = await page.evaluate(() =>
    document.querySelector(".sidebar-gym-btn[data-gym-tab='workout']").classList.contains("active")
  );
  const programsActive = await page.evaluate(() =>
    document.querySelector(".sidebar-gym-btn[data-gym-tab='programs']").classList.contains("active")
  );
  assert(workoutActive,  "Treeni button has active class after click");
  assert(!programsActive, "Ohjelmat button loses active class");

  section("CSS rendering: [hidden] actually hides elements");

  // Switch to history — gym-programs must be visually gone (display:none)
  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='history']");
  await page.waitForTimeout(100);

  const programsComputedDisplay = await page.evaluate(() =>
    getComputedStyle(document.getElementById("gym-programs")).display
  );
  assert(programsComputedDisplay === "none",
    `gym-programs computedStyle.display = "none" when hidden (got "${programsComputedDisplay}")`);

  const historyComputedDisplay = await page.evaluate(() =>
    getComputedStyle(document.getElementById("gym-history")).display
  );
  assert(historyComputedDisplay !== "none",
    `gym-history computedStyle.display != "none" when visible (got "${historyComputedDisplay}")`);

  // Heading rect must be zero when section is hidden
  const programsHeadingHeight = await page.evaluate(() => {
    const h = document.querySelector("#gym-programs .gym-section-heading");
    return h ? h.getBoundingClientRect().height : 0;
  });
  assert(programsHeadingHeight === 0,
    `Programs heading rendered height = 0 when hidden (got ${programsHeadingHeight})`);

  // Switch to programs — workout must now be visually gone
  await clickBySelector(page, ".sidebar-gym-btn[data-gym-tab='programs']");
  await page.waitForTimeout(100);

  const workoutComputedDisplay = await page.evaluate(() =>
    getComputedStyle(document.getElementById("gym-workout")).display
  );
  assert(workoutComputedDisplay === "none",
    `gym-workout computedStyle.display = "none" when hidden (got "${workoutComputedDisplay}")`);

  // ─── Summary ───────────────────────────────────────────────────────────────

  await browser.close();

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Result: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
