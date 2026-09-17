# Privi's task list

Work you write yourself, ordered easiest → hardest. Each task says **what** to do and
**what you need to know** — deliberately not the finished code, because the point is that
you wrote it. If you get stuck on one, ask me and I'll explain the concept rather than
hand you the answer.

Nothing here is busywork. Every task is real, was on the actual to-do list, and I left it
for you on purpose.

---

## First: how to run and check your work

```sh
cd ~/plainscript-remote
python3 -m http.server 8899          # then open http://localhost:8899/index.html
node --test tests/*.test.js          # 69 tests — run before AND after every change
```

If the tests pass before your change and fail after, you broke something. That's the
whole point of having them. `git diff` shows exactly what you changed.

**Service worker gotcha:** the app caches itself for offline use, so your changes may not
show up on reload. Open DevTools → Application → Service Workers → Unregister, then
hard-reload. This bit me too.

---

## Python → JavaScript, the parts you'll actually need

You know Python from AP CSP. Almost everything transfers; the syntax is just noisier.

| Python | JavaScript |
|---|---|
| `x = 5` | `const x = 5;` (or `let x = 5;` if it changes) |
| `print(x)` | `console.log(x);` |
| `f"I have {n} meds"` | `` `I have ${n} meds` `` (backticks, not quotes) |
| `len(items)` | `items.length` |
| `[m for m in meds if m.notes]` | `meds.filter(m => m.notes)` |
| `[m.name for m in meds]` | `meds.map(m => m.name)` |
| `def f(a): return a + 1` | `function f(a){ return a + 1; }` |
| `if a and not b:` | `if (a && !b) {` |
| `# comment` | `// comment` |
| dict `{"a": 1}` | object `{a: 1}` — access with `obj.a` |

Three rules that will save you an hour each:
1. **Semicolons end statements**, braces `{}` group them. Python's indentation means nothing here.
2. `===` compares, `=` assigns. Always use `===`, never `==`.
3. `m => m.notes` is just a mini-function: "given m, give back m.notes". Same as a Python lambda.

---

# TIER 1 — CSS only (no logic, hard to break)

### TASK 1 — Make small buttons thumb-friendly
**File:** `index.html`, the `.mini{` rule at about line 423.

Those buttons come out about 32px tall. Apple's guidance is 44px minimum for anything you
tap with a thumb, and ours are under it — annoying on a phone, and it's a real
accessibility point you can defend to a judge.

**What to know:** the rule already has `padding:8px 13px`. You want the *total* height to
reach 44px. You can either increase the vertical padding or add a `min-height`. `min-height`
is the more honest fix because padding also affects the text position.

**Check it:** DevTools → inspect a `.mini` button → the box model shows computed height.

---

### TASK 2 — Kill the fake font sizes
**File:** `index.html`, the `<style>` block.

Search the CSS for `13.5px`, `14.5px`, `15.5px`, `12.5px`, `11.5px`, `10.5px`. The design
rule is that each step in a type scale should be at least ~1.25× the one below it, or the
human eye can't tell them apart. A jump from 14px to 14.5px is 1.03× — literally nobody
can see it, so it buys zero hierarchy while making the file inconsistent.

**What to do:** round each one to the nearest "real" size already used nearby (12, 13, 14,
15, 16, 18). Change one, reload, look at it. If it looks the same — that's the point, it
proves the half-pixel was doing nothing.

**Careful:** do these one at a time and look after each. If something looks worse, put it back.

---

### TASK 3 — Spacing tokens (the biggest visual-polish win available)
**File:** `index.html`, the `:root{` block near line 32, then the CSS below it.

Right now the stylesheet uses **27 different spacing values** (2, 3, 4, 5, 6, 7, 8, 9, 10,
11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 30, 40…). Professional stylesheets pick about
eight and never freehand a number again. That single difference is most of what makes a
design feel deliberate instead of assembled.

**Step 1:** in `:root{`, next to the existing colour variables, add your own scale:
```
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;
```
**Step 2:** pick ONE section of CSS (start with `.lp-` homepage rules — newest, lowest risk)
and replace hardcoded values with `var(--space-N)`, rounding to the nearest. `13px` → `var(--space-3)`.

**What to know:** `var(--name)` just substitutes the value you defined. Look at how the file
already does this with `var(--radius)` and `var(--accent)`.

Do one section, reload, confirm nothing moved much, commit. Then the next. **Do not attempt
the whole file in one go.**

---

# TIER 2 — HTML content (your words, your homepage)

These are the `[PRIVI - TASK n]` comments sitting in the homepage in `index.html`. Search
for `[PRIVI` to find them. Copy the structure of the section I already wrote
(`<section class="lp-limits">`) — same `<div class="wrap">`, same heading pattern.

### TASK 6 — "The problem"
Why this app needs to exist. Two things, in this order: **your personal story** (who you
watched struggle with a label — this is the single highest-value paragraph in the entire
project, every CAC winner I researched had one), then the structural fact: the National
Library of Medicine shut off its free public drug-interaction API in January 2024, so the
free, authoritative way to check this mostly disappeared.

Keep it under about 120 words. Don't dress it up. The plain version is stronger.

### TASK 7 — "What it does"
Three or four short blocks: Decode, Check interactions, My Cabinet, Symptoms. One sentence
each, describing what it *actually* does. Do not invent a feature that isn't built.

### TASK 8 — "Where every fact comes from"
Three blocks: openFDA, RxNorm, and the hand-curated interaction set. For each, say what it
*is* and what it *can't* do. The honesty is the selling point — this is the section that
separates you from a content farm.

### TASK 9 — "Built for people who get left out"
13 languages (list a few in their own script: Español · 中文 · Tiếng Việt · العربية), right-to-left
support, pictogram mode, read-aloud, easy-read, installs and works offline. All checkable
facts, no adjectives needed.

### TASK 10 — "Who made this"
One paragraph, signed, first person, your actual voice. Not polished marketing. This is the
part a judge remembers.

---

# TIER 3 — Real JavaScript (small, but genuinely code)

### TASK 11 — Delete four dead translation keys
**File:** `index.html`

`food_allergy_combo_note`, `signed_in_as`, and `ref_checking` are translated into all 13
languages but referenced nowhere in the code — leftovers from removed features. Each
appears exactly 13 times (once per language dictionary) and zero times in actual code.

**What to do:** search for each key and delete its line from all 13 dictionaries.

**What to know:** this teaches you the file's structure better than anything else — you'll
see all 13 language blocks and how they mirror each other. Run the tests after.

**Verify first:** `grep -c "food_allergy_combo_note" index.html` should print `13`. If it
prints more, it IS used somewhere and you should stop and ask me.

### TASK 12 — Surface the glossary hint
**File:** `index.html`

There's a translated string `glossary_hint` — "Underlined words have a plain-English
definition — tap them." It exists in all 13 languages and is **never shown to anyone**. The
glossary tooltips work, but nothing tells users they're tappable.

**What to do:** display it somewhere sensible near content that has glossary terms.

**What to know:** use `t("glossary_hint")` to get the translated text — look at how other
strings do it. Because the translation already exists, this works in all 13 languages the
moment you add it. Free win.

### TASK 13 — Add a fourth stat tile to the dashboard
**File:** `index.html`, `dashboardSummaryHTML()` (search for it).

The dashboard shows three counts: total medications, how many matched an FDA label, how
many have a personal note. Add a fourth: **how many have dosing times set.**

**What to know:** the existing counts are computed like this:
```js
const noted = meds.filter(m => m.notes).length;
```
That's the Python `len([m for m in meds if m.notes])`. The dosing-times field on a
medication is `m.schedule`. Then copy one of the three `<div class="stat-tile">` lines and
adjust it.

**Catch you'll hit:** the tiles are laid out in a 3-column grid (`.stat-tiles` uses
`repeat(3,1fr)`), and on phones it switches to 2 columns. A fourth tile will change how that
looks — go look at it on a narrow window and decide whether the grid needs adjusting. That
judgement call is the actual work here.

**Also:** you'll need a label for it. Every user-facing string in this app goes through the
13 dictionaries — so decide with me whether to add a new translated key or reuse one.

---

## How to commit your work

```sh
git add index.html
git commit -m "Short description of what you changed"
git push origin main
```

Cloudflare auto-deploys from GitHub, so it's live within a minute or two. Check the real
site after pushing.

---

## What to study, for defending this to a judge

Priority order — these are the parts you can genuinely understand in the time available:

1. **Everything you wrote from this list.** Be able to explain any line of it cold.
2. **`dashboardSummaryHTML()` and `medRowHTML()`** — straightforward functions that build
   HTML from data. If you understand `.filter()` and template strings, you understand these.
3. **The i18n system** — `t("key")` looks up a string in the current language's dictionary,
   falling back to English. Simple idea, and the 13-language support is a genuine
   differentiator worth being able to explain.
4. **The safety rules in `CLAUDE.md`** — the non-goals, why there's never a green "safe",
   why the AI may only rephrase retrieved text. You made these calls; own them completely.
   This is the most impressive part of the project and it's *product* judgement, not code.
5. **`tests/engine.test.js`** — what's tested and why those functions specifically.

Be honest about the interaction engine (`analyzeDrugPairs`, `sideHit`, `labelMentions`) and
the Supabase security model: you should be able to explain *what they do and why*, which is
different from claiming you wrote them. "I directed this and I understand how it works, and
here's the part I wrote myself" is a strong, defensible position — and it's true.

---

### TASK 14 — Design a warm "sepia" theme
**File:** `index.html`, find the comment `[PRIVI - TASK 14]` in the `<style>` block.

There are four themes now (Dark, Light, Midnight, High contrast). Add a fifth: a warm,
paper-like sepia that's easy on the eyes for long reading — genuinely useful for the older
readers this app is aimed at.

**What to do:** copy the whole `[data-theme="midnight"]{ ... }` block, rename the selector to
`[data-theme="sepia"]`, and change the colour values. Then add one `<option value="sepia">`
to the theme `<select>` (search for `theme-select`), and add `"sepia"` to the `THEMES` array
in the JavaScript.

**What to know:** every theme must define the *same complete set* of variables — if you miss
one it silently inherits from `:root` and looks broken in a way that's hard to spot. Copy the
whole block and edit values; don't write it from scratch.

**The part that actually matters:** the severity colours (`--major-*`, `--mod-*`, `--minor-*`)
must stay clearly distinguishable from each other and readable on their backgrounds. That's a
safety requirement, not an aesthetic one. Ask me to run the contrast checker on your palette
before you commit — I have a script that measures every pair and tells you if any fall below
WCAG AA.

**You'll also need a translated name** (`theme_sepia`) in all 13 dictionaries — ask me, don't
guess at translations.
