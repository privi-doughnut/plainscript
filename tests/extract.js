"use strict";
/*
 * extract.js — load Plainscript's interaction engine out of index.html for testing.
 *
 * Plainscript ships as one self-contained index.html with no build step and no
 * module system, and that is a deliberate design constraint we do not want tests
 * to erode. So instead of refactoring the app to make it importable, these tests
 * parse index.html, lift the engine functions out by source, and evaluate them in
 * a sandbox with stubbed dependencies.
 *
 * Upside: tests run against the exact source that ships — there is no second copy
 * of the logic to drift out of sync.
 * Cost: extraction is coupled to how the source is written. If someone renames a
 * function or converts one to an arrow const, extraction throws loudly rather than
 * silently testing nothing.
 *
 * ⚠️ CROSS-REALM GOTCHA. vm.createContext() builds a separate JS realm, so arrays
 * and objects the engine creates have that realm's prototypes, not this one's.
 * assert.deepEqual/deepStrictEqual compare prototypes, so they FAIL on otherwise
 * identical values with "same structure but are not reference-equal". Either
 * assert on values (.length, individual fields) or bring the value across with
 * Array.from()/spread first. Array.isArray() is safe — it checks an internal slot.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* PLAINSCRIPT_HTML lets the suite run against a modified copy — used to verify
   the tests actually fail when the engine is broken (mutation testing). Defaults
   to the real index.html. */
const HTML_PATH = process.env.PLAINSCRIPT_HTML || path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(HTML_PATH, "utf8");

/*
 * Index of the bracket closing the one at `open`, skipping string literals and
 * comments. A naive depth counter is not safe here: the curated interaction set
 * is prose in 13 languages, and the render functions are template literals full
 * of ${...}.
 *
 * Known limitation: regex literals are not tracked, so a regex containing an
 * unbalanced quote or brace inside an extracted range would confuse this. None of
 * the extracted ranges contain one — and `esc`/`titlecase`, whose regexes DO
 * contain a quote character, are grabbed by line rather than by bracket matching
 * for exactly that reason.
 */
function matchBracket(src, open) {
  const pairs = { "{": "}", "[": "]" };
  const opener = src[open];
  const closer = pairs[opener];
  if (!closer) throw new Error(`matchBracket: not an opening bracket at ${open}: ${opener}`);

  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];

    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      if (nl < 0) break;
      i = nl;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const close = src.indexOf("*/", i + 2);
      if (close < 0) break;
      i = close + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === quote) break;
        i++;
      }
      continue;
    }

    if (c === opener) depth++;
    else if (c === closer) {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error(`matchBracket: unbalanced bracket opened at ${open}`);
}

/* Lift a `function name(...) {...}` / `async function name(...) {...}` declaration. */
function grabFunction(name) {
  const re = new RegExp(`\\n((?:async\\s+)?function\\s+${name}\\s*\\()`);
  const m = re.test(html) ? re.exec(html) : null;
  if (!m) throw new Error(`grabFunction: no declaration found for ${name}() in index.html`);
  const declStart = m.index + 1;
  const parenIdx = declStart + m[1].length - 1;
  const brace = html.indexOf("{", matchBracketParen(html, parenIdx));
  const end = matchBracket(html, brace);
  return html.slice(declStart, end + 1);
}

/* Parens need their own tiny matcher (argument lists can contain defaults). */
function matchBracketParen(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") { depth--; if (depth === 0) return i; }
  }
  throw new Error(`matchBracketParen: unbalanced paren at ${open}`);
}

/* Lift a `const NAME = {...};` or `const NAME = [...];` block declaration. */
function grabConstBlock(name) {
  const re = new RegExp(`\\nconst\\s+${name}\\s*=\\s*([\\[{])`);
  const m = re.test(html) ? re.exec(html) : null;
  if (!m) throw new Error(`grabConstBlock: no block declaration found for ${name} in index.html`);
  const declStart = m.index + 1;
  const bracketIdx = m.index + m[0].length - 1;
  const end = matchBracket(html, bracketIdx);
  return html.slice(declStart, end + 1) + ";";
}

/* Lift a single-line `const NAME = ...;` declaration. */
function grabConstLine(name) {
  const re = new RegExp(`\\n(const\\s+${name}\\s*=[^\\n]*)`);
  const m = re.test(html) ? re.exec(html) : null;
  if (!m) throw new Error(`grabConstLine: no line declaration found for ${name} in index.html`);
  return m[1];
}

/* Names of the curated class-group constants the INTERACTIONS rules reference. */
const CLASS_GROUPS = ["NSAIDS", "SSRIS", "MAOIS", "STATINS", "NITRATES", "PDE5",
  "OPIOIDS", "BENZOS", "ACE", "KSPARE", "AZOLES", "MACRO", "THIAZ"];

/*
 * Build a sandbox containing the engine. Every dependency the engine reaches for
 * that lives outside it (network, i18n, DOM) is stubbed by the caller, so each
 * test controls exactly what the engine sees.
 */
function loadEngine(stubs = {}) {
  const parts = [
    grabConstLine("esc"),
    grabConstLine("titlecase"),
    // the REAL curated data, so a corrupted rule set fails these tests
    grabConstBlock("ALIASES"),
    ...CLASS_GROUPS.map(grabConstLine),
    grabConstBlock("INTERACTIONS"),
    // the engine itself
    grabFunction("baseTokens"),
    grabFunction("sideHit"),
    grabFunction("sameDrug"),
    grabFunction("sharedIngredients"),
    grabFunction("resolveAll"),
    grabFunction("labelMentions"),
    grabFunction("analyzeDrugPairs"),
    grabFunction("renderUnverifiedWarning"),
    grabFunction("renderResults"),
    grabFunction("renderDuplicates"),
    // `function` declarations land on the sandbox object automatically, but
    // `const` bindings are script-scoped and would otherwise be invisible to
    // tests. Re-export the curated data explicitly.
    `globalThis.INTERACTIONS = INTERACTIONS;
     globalThis.ALIASES = ALIASES;
     globalThis.esc = esc;
     globalThis.titlecase = titlecase;
     ${CLASS_GROUPS.map((g) => `globalThis.${g} = ${g};`).join("\n     ")}`,
  ];

  const sandbox = {
    t: stubs.t || ((k) => k),
    pickLang: stubs.pickLang || ((field) => (field && field.en) || ""),
    resolveForAnalysis: stubs.resolveForAnalysis || (async (name) => ({
      name, display: name, tokens: new Set([name.toLowerCase()]),
      label: null, labelUnverified: false,
    })),
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(parts.join("\n\n"), sandbox, { filename: "plainscript-engine.js" });
  return sandbox;
}

/*
 * Build the { name, display, tokens, label, labelUnverified } shape that
 * resolveForAnalysis() produces, so tests read like the real data flow.
 */
function drug(name, opts = {}) {
  const { generic = null, rxcui = null, interactionsText = null,
          tokens = null, labelUnverified = false, display = null } = opts;
  const hasLabel = generic || rxcui || interactionsText;
  return {
    name,
    display: display || name,
    tokens: new Set(tokens || [name.trim().toLowerCase()]),
    label: hasLabel ? { generic, rxcui, interactionsText } : null,
    labelUnverified,
  };
}

module.exports = { loadEngine, drug, HTML_PATH };
