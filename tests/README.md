# Plainscript engine tests

Automated tests for the part of Plainscript that decides whether two medicines
interact, and how that gets reported.

```sh
node --test tests/*.test.js
```

No dependencies, no build step, no `npm install` — this uses Node's built-in test
runner (`node:test` + `node:assert`). Node 18+ required; developed on Node 22.

> Use `tests/*.test.js`, not `tests/`. Passing the bare directory makes Node try to
> resolve it as a module and fail.

Currently **69 tests, all passing**.

---

## Why these functions and not others

The app is ~12,000 lines of JavaScript. These tests deliberately cover a small
slice of it: the interaction engine. That slice is chosen because it is the part
of Plainscript that **makes medical claims**. Everything else — a misaligned
button, a slow spinner — is a bug. A wrong answer here is a safety problem.

Two real defects lived in exactly this area for months and were both found by
reading code, not by running it:

1. A failed FDA-label lookup was caught and discarded, making "we couldn't reach
   the FDA" indistinguishable from "we checked and found nothing."
2. A medicine could be paired against *itself*, because FDA labels routinely name
   their own ingredient — producing nonsense like "aspirin → mentions → aspirin."

Nothing was watching for either. These tests are what watches now.

## What is covered

| Function | What the tests pin down |
|---|---|
| `sameDrug` | Deduping the same medicine entered twice (by name, by shared RxCUI, by shared generic) — **and not deduping a combination product against its own ingredient**, which must stay a real pair |
| `sideHit` | Curated-rule token matching, including the 4-character guard that stops short rule tokens matching half the pharmacopoeia by substring |
| `baseTokens` / `ALIASES` | Brand → generic resolution, trimming/lowercasing, and that a typed brand resolves far enough to trigger a curated rule |
| `labelMentions` | Finding a drug named in another's FDA interaction text, sentence-bounded snippet extraction, 220-character truncation, and the null cases (no label, no interaction text, token too short) |
| `analyzeDrugPairs` | Every unique pair considered exactly once; curated rules take precedence over label mentions; same-drug pairs skipped; empty and single-drug inputs |
| `resolveAll` | Order preservation, the concurrency cap on openFDA lookups, and empty input |
| `renderUnverifiedWarning` | That an unreachable FDA label is reported as *unverified* and never silently folded into a "nothing found" result; plural/singular wording; HTML escaping |
| `renderResults` | Severity ordering (major above moderate) and that the empty state stays cautious and never asserts a combination is "safe" |
| curated data | That `INTERACTIONS` is non-empty, every rule is well-formed with all three English explanation fields, tokens are lowercase, and the textbook warfarin/NSAID rule still exists |

## What is deliberately NOT covered

Being honest about this matters more than a big number:

- **No DOM, UI or rendering tests.** `renderResults` is exercised only for sort
  order and safety wording, with a fake `box` object. Nothing verifies the app
  looks right or that clicks work.
- **No network tests.** `fetchLabel`, openFDA, RxNorm and the Cloudflare Worker
  are never called; `resolveForAnalysis` is stubbed.
- **No auth, Supabase, RLS, or share-link tests.** Those were reviewed by hand in
  the August 2026 security sweep, not automated.
- **No i18n coverage.** `t()` and `pickLang()` are stubbed. Translation
  completeness is checked separately.
- **No service worker / offline / PWA tests.**
- **This is not proof the medical content is correct.** The tests check that the
  engine applies the curated rules faithfully. Whether a given rule reflects real
  pharmacology is a human review question and always will be.

## How it works

Plainscript ships as a single self-contained `index.html` with no build step and
no module system — a deliberate constraint. Rather than refactor the app to make
it importable, `extract.js` reads `index.html`, lifts the target functions out by
source, and evaluates them in a `vm` sandbox with stubbed dependencies.

That means **the tests run against the exact code that ships**; there is no second
copy to drift out of sync. The trade-off is that extraction depends on how the
source is written — rename a function or convert it to an arrow const and
extraction throws immediately rather than quietly testing nothing.

Two gotchas are documented in `extract.js`: the bracket matcher does not track
regex literals, and the `vm` sandbox is a separate realm, so `assert.deepEqual`
fails on cross-realm arrays even when the values match.

## Verifying the tests actually work

A passing suite proves nothing unless it fails when the code breaks. `extract.js`
honours a `PLAINSCRIPT_HTML` environment variable so the suite can be pointed at a
deliberately broken copy:

```sh
cp index.html /tmp/mutant.html
# ...break something in /tmp/mutant.html...
PLAINSCRIPT_HTML=/tmp/mutant.html node --test tests/*.test.js
```

Seven mutations were tried against this suite — removing the RxCUI check, dropping
the `sideHit` length guard, neutering the unverified-lookup warning, reversing the
severity sort, removing the same-drug skip, removing the concurrency cap, and
dropping HTML escaping. **All seven were caught.**

## If a test fails

Don't weaken the assertion to make it pass. These assertions encode safety
invariants — particularly that nothing-found is never presented as safe, and that
a failed lookup is never presented as a completed check. If behaviour legitimately
changed, change the test deliberately and say why in the commit message.
