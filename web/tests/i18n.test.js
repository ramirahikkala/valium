/**
 * i18n test suite — plain Node.js, no dependencies.
 *
 * Tests:
 *  1. STRINGS.fi and STRINGS.en have identical key sets
 *  2. t() returns correct values and falls back to the key for missing ones
 *  3. tf() interpolates {variables} correctly and handles multiple replacements
 *  4. Every key referenced via t()/tf() in app.js exists in STRINGS
 *  5. Every data-i18n* value in index.html exists in STRINGS
 *  6. No language is missing translations that the other has
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ─── Tiny test runner ────────────────────────────────────────────────────────

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

function assertEqual(a, b, message) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (!ok) {
    assert(false, `${message}  (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
  } else {
    assert(true, message);
  }
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

// ─── Load sources ─────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, "..");
const appJs = fs.readFileSync(path.join(ROOT, "public", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(ROOT, "public", "index.html"), "utf8");

// ─── Extract STRINGS from app.js ──────────────────────────────────────────────
// Evaluate only the STRINGS block by wrapping in a function that returns it.

function extractStrings() {
  // Grab everything from "var STRINGS = {" up to the matching closing brace + ";"
  const start = appJs.indexOf("  var STRINGS = {");
  if (start === -1) throw new Error("Could not find STRINGS in app.js");

  let depth = 0;
  let i = appJs.indexOf("{", start);
  const begin = i;
  for (; i < appJs.length; i++) {
    if (appJs[i] === "{") depth++;
    else if (appJs[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const stringsLiteral = appJs.slice(begin, i + 1);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return ${stringsLiteral};`)();
}

// ─── Reconstruct t() and tf() locally for unit tests ─────────────────────────

function makeI18n(STRINGS) {
  function t(lang, key) {
    return (STRINGS[lang] || STRINGS.fi)[key] || key;
  }
  function tf(lang, key, vars) {
    let str = t(lang, key);
    Object.keys(vars).forEach((k) => {
      str = str.replace("{" + k + "}", vars[k]);
    });
    return str;
  }
  return { t, tf };
}

// ─── Extract all t("key") and tf("key", ...) calls from app.js ───────────────

function extractJsKeys() {
  const keys = new Set();
  // Match t("key") and t('key')
  for (const m of appJs.matchAll(/\bt\(\s*["']([^"']+)["']\s*\)/g)) {
    keys.add(m[1]);
  }
  // Match tf("key", ...) and tf('key', ...)
  for (const m of appJs.matchAll(/\btf\(\s*["']([^"']+)["']/g)) {
    keys.add(m[1]);
  }
  return keys;
}

// ─── Extract all data-i18n* values from index.html ───────────────────────────

function extractHtmlKeys() {
  const keys = new Set();
  for (const m of indexHtml.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)) {
    keys.add(m[1]);
  }
  return keys;
}

// ═════════════════════════════════════════════════════════════════════════════
// TESTS
// ═════════════════════════════════════════════════════════════════════════════

let STRINGS;
try {
  STRINGS = extractStrings();
} catch (e) {
  console.error("FATAL: Could not parse STRINGS from app.js:", e.message);
  process.exit(1);
}

const { t, tf } = makeI18n(STRINGS);
const jsKeys = extractJsKeys();
const htmlKeys = extractHtmlKeys();

const fiKeys = new Set(Object.keys(STRINGS.fi));
const enKeys = new Set(Object.keys(STRINGS.en));

// ─── 1. Key symmetry ──────────────────────────────────────────────────────────

section("1. STRINGS key symmetry (fi ↔ en)");

const inFiNotEn = [...fiKeys].filter((k) => !enKeys.has(k));
const inEnNotFi = [...enKeys].filter((k) => !fiKeys.has(k));

assert(inFiNotEn.length === 0,
  inFiNotEn.length === 0
    ? "All fi keys exist in en"
    : `Keys in fi but NOT en: ${inFiNotEn.join(", ")}`
);
assert(inEnNotFi.length === 0,
  inEnNotFi.length === 0
    ? "All en keys exist in fi"
    : `Keys in en but NOT fi: ${inEnNotFi.join(", ")}`
);
assert(fiKeys.size > 0, `STRINGS has ${fiKeys.size} keys`);

// ─── 2. t() unit tests ───────────────────────────────────────────────────────

section("2. t() function");

assertEqual(t("fi", "tasks"), "Tehtävät", 't("fi", "tasks") = "Tehtävät"');
assertEqual(t("en", "tasks"), "Tasks",    't("en", "tasks") = "Tasks"');
assertEqual(t("fi", "cancel"), "Peruuta", 't("fi", "cancel") = "Peruuta"');
assertEqual(t("en", "cancel"), "Cancel",  't("en", "cancel") = "Cancel"');

// Missing key falls back to the key itself
const missing = t("fi", "nonexistent_key_xyz");
assertEqual(missing, "nonexistent_key_xyz",
  "Missing key falls back to the key string itself");

// Unknown language falls back to fi
const fallback = t("de", "cancel");
assertEqual(fallback, "Peruuta",
  "Unknown language falls back to fi");

// ─── 3. tf() interpolation tests ─────────────────────────────────────────────

section("3. tf() interpolation");

const listConfirmFi = tf("fi", "delete_list_confirm", { name: "Työ" });
assert(listConfirmFi.includes("Työ") && !listConfirmFi.includes("{name}"),
  `tf delete_list_confirm fi: "${listConfirmFi}"`);

const listConfirmEn = tf("en", "delete_list_confirm", { name: "Work" });
assert(listConfirmEn.includes("Work") && !listConfirmEn.includes("{name}"),
  `tf delete_list_confirm en: "${listConfirmEn}"`);

const progConfirmFi = tf("fi", "delete_program_confirm", { name: "Rintalihas" });
assert(progConfirmFi.includes("Rintalihas") && !progConfirmFi.includes("{name}"),
  `tf delete_program_confirm fi: "${progConfirmFi}"`);

const exConfirmEn = tf("en", "delete_exercise_from_program_confirm", { name: "Squat" });
assert(exConfirmEn.includes("Squat") && !exConfirmEn.includes("{name}"),
  `tf delete_exercise_from_program_confirm en: "${exConfirmEn}"`);

// Multiple replacements — none should be left over
const multipleReplacements = tf("fi", "delete_list_confirm", { name: "A & B" });
assert(!multipleReplacements.includes("{"), "No unreplaced placeholders remain");

// ─── 4. All t()/tf() keys in app.js exist in STRINGS ─────────────────────────

section("4. JS code → STRINGS coverage");

const missingFromJs = [...jsKeys].filter((k) => !fiKeys.has(k));
assert(missingFromJs.length === 0,
  missingFromJs.length === 0
    ? `All ${jsKeys.size} keys referenced in app.js exist in STRINGS`
    : `Keys used in app.js but MISSING from STRINGS: ${missingFromJs.join(", ")}`
);

// ─── 5. All data-i18n* keys in index.html exist in STRINGS ───────────────────

section("5. HTML data-i18n* → STRINGS coverage");

const missingFromHtml = [...htmlKeys].filter((k) => !fiKeys.has(k));
assert(missingFromHtml.length === 0,
  missingFromHtml.length === 0
    ? `All ${htmlKeys.size} keys in index.html exist in STRINGS`
    : `Keys in index.html but MISSING from STRINGS: ${missingFromHtml.join(", ")}`
);

// ─── 6. No empty translation values ──────────────────────────────────────────

section("6. No empty translation values");

const emptyFi = Object.entries(STRINGS.fi).filter(([, v]) => !v || v.trim() === "");
const emptyEn = Object.entries(STRINGS.en).filter(([, v]) => !v || v.trim() === "");

assert(emptyFi.length === 0,
  emptyFi.length === 0
    ? "No empty values in fi"
    : `Empty fi values: ${emptyFi.map(([k]) => k).join(", ")}`
);
assert(emptyEn.length === 0,
  emptyEn.length === 0
    ? "No empty values in en"
    : `Empty en values: ${emptyEn.map(([k]) => k).join(", ")}`
);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
