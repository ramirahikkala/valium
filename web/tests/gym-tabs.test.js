/**
 * Gym tab switching tests — Node.js + jsdom, no extra test runner.
 *
 * Tests that clicking Treeni / Ohjelmat / Historia in the sidebar
 * actually changes which gym section is visible in the main content area.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM, ResourceLoader } = require("jsdom");

// ─── Tiny test runner ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

// ─── Setup DOM from real HTML + JS ────────────────────────────────────────────

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "public", "index.html"), "utf8");

// We need a DOM where app.js can run. We stub out:
//  - fetch  (apiFetch will fail gracefully; we only test UI logic)
//  - google sign-in
//  - localStorage
function buildDOM() {
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost:3000",
    beforeParse(window) {
      // Stub fetch so API calls don't blow up
      window.fetch = () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) });

      // Stub Google sign-in
      window.google = {
        accounts: { id: { initialize: () => {}, renderButton: () => {} } },
      };

      // Stub localStorage (jsdom provides it; just clear it)
      window.localStorage.clear();
    },
  });

  // Inline app.js so scripts run in the same window context
  const appJs = fs.readFileSync(path.join(ROOT, "public", "app.js"), "utf8");
  dom.window.eval(appJs);

  return dom;
}

// ─── Helper: find a gym tab button by its data-gym-tab value ─────────────────

function gymBtn(doc, tab) {
  return doc.querySelector(`.sidebar-gym-btn[data-gym-tab="${tab}"]`);
}

function isVisible(el) {
  return !el.hidden;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

section("Gym tab switching");

let dom, doc;
try {
  dom = buildDOM();
  doc = dom.window.document;
} catch (e) {
  console.error("FATAL: Could not initialise DOM:", e.message);
  process.exit(1);
}

// First navigate to gym view by clicking the Sali button
const saliBtn = doc.getElementById("view-tab-gym");
saliBtn.click();

// After clicking Sali, programs should be the default visible section
const programsSection = doc.getElementById("gym-programs");
const workoutSection  = doc.getElementById("gym-workout");
const historySection  = doc.getElementById("gym-history");

assert(isVisible(programsSection), "After clicking Sali: gym-programs is visible by default");
assert(!isVisible(workoutSection),  "After clicking Sali: gym-workout is hidden by default");
assert(!isVisible(historySection),  "After clicking Sali: gym-history is hidden by default");

// ── Click Treeni ──
gymBtn(doc, "workout").click();

assert(!isVisible(programsSection), "After Treeni click: gym-programs is hidden");
assert(isVisible(workoutSection),   "After Treeni click: gym-workout is visible");
assert(!isVisible(historySection),  "After Treeni click: gym-history is hidden");

// ── Click Historia ──
gymBtn(doc, "history").click();

assert(!isVisible(programsSection), "After Historia click: gym-programs is hidden");
assert(!isVisible(workoutSection),  "After Historia click: gym-workout is hidden");
assert(isVisible(historySection),   "After Historia click: gym-history is visible");

// ── Click Ohjelmat ──
gymBtn(doc, "programs").click();

assert(isVisible(programsSection),  "After Ohjelmat click: gym-programs is visible");
assert(!isVisible(workoutSection),  "After Ohjelmat click: gym-workout is hidden");
assert(!isVisible(historySection),  "After Ohjelmat click: gym-history is hidden");

// ── Active class follows the selected tab ──
section("Active class on gym tab buttons");

gymBtn(doc, "workout").click();
assert(gymBtn(doc, "workout").classList.contains("active"),  "Treeni button has active class");
assert(!gymBtn(doc, "programs").classList.contains("active"), "Ohjelmat button loses active class");
assert(!gymBtn(doc, "history").classList.contains("active"),  "Historia button has no active class");

gymBtn(doc, "history").click();
assert(!gymBtn(doc, "workout").classList.contains("active"),  "Treeni button loses active class");
assert(gymBtn(doc, "history").classList.contains("active"),   "Historia button has active class");

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
