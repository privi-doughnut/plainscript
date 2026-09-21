# Privi's tasks — step by step

Written assuming you've never done this before. Every task tells you the exact line, what
you're looking at, and what to change. The one thing I don't give you is the finished line
itself — you type that. That's the whole difference between this being your work and mine.

If you get stuck for more than ten minutes on any of these, stop and ask me. Being stuck is
information, not failure.

---

## Every single time you sit down

```sh
cd ~/plainscript-remote
python3 -m http.server 8899
```
Leave that running. Open `http://localhost:8899/index.html`.

**Then unregister the service worker, or your changes won't show up:**
DevTools (`Cmd+Option+I`) → **Application** tab → **Service Workers** → **Unregister** → `Cmd+Shift+R`.

**Before you change anything:**
```sh
node --test tests/*.test.js
```
Should say `# pass 78`. That's your "before" photo.

**When you're done with a task:**
```sh
node --test tests/*.test.js      # still 78? good
git add index.html
git commit -m "describe what you changed"
git push origin main
```

**If you break something and want out:**
```sh
git diff                 # shows exactly what you changed
git checkout index.html  # throws it all away, back to last commit
```
You cannot permanently break anything that's committed.

---

# TASK 1 — Bigger tap targets
**Time: 10 minutes. Difficulty: lowest. Do this one first.**

**Go to line 747** of `index.html`. (In most editors: `Ctrl+G` then type 747. Or `Cmd+F`
and search for `.mini{`.)

You'll see this:

```css
  .mini{
    appearance:none; cursor:pointer; font-family:var(--mono); font-size:12px; letter-spacing:.03em;
    padding:8px 13px; border:1px solid var(--line); border-radius:20px;
    background:var(--card); color:var(--ink-soft);
    transition:transform .12s ...;
  }
```

**What this is:** the styling for every small button in the app. `padding:8px 13px` means
8 pixels of space above and below the text, 13 left and right. With a 12px font, that adds
up to roughly 32px tall.

**The problem:** Apple's guidance is that anything you tap with a thumb should be at least
44px tall. Ours is 32. On a phone that's fiddly, and it's a real accessibility point.

**What to do:** add ONE new property inside that block — a rule that sets a minimum height
of 44 pixels. The property is called `min-height`. CSS properties are written
`name:value;` — so you want the name, a colon, `44px`, and a semicolon, on its own line
inside the braces.

**Why `min-height` and not bigger padding?** Padding also pushes the text around. Minimum
height leaves the text where it is and only grows the box if it needs to.

**Check it worked:** reload, right-click any small button (like "Close" on a popup) →
**Inspect**. The box at the bottom of DevTools shows the computed size. It should say 44.

**Commit message suggestion:** `Raise small button tap targets to 44px minimum`

---

# TASK 2 — Delete the invisible font sizes
**Time: 30 minutes. Difficulty: low, but do it slowly.**

**The idea first:** a type scale should have steps you can actually see. The rule of thumb
is each step should be at least 1.25× the one below. We have `14px` and `14.5px` sitting
next to each other — that's 1.03×. Nobody on earth can see that difference, so it buys zero
hierarchy while making the file inconsistent.

**Here is every one of them, with its line number.** Work top to bottom.

| Line | Currently | Round to |
|---|---|---|
| 272 | `font-size:15.5px` | 15px or 16px |
| 439 | `font-size:12.5px` | 12px or 13px |
| 478 | `font-size:15.5px` | 15px or 16px |
| 506 | `font-size:16.5px` | 16px or 17px |
| 524 | `font-size:11.5px` | 11px or 12px |
| 556 | `font-size:15.5px` | 15px or 16px |
| 652 | `font-size:11.5px` | 11px or 12px |
| 656 | `font-size:12.5px` | 12px or 13px |
| 662 | `font-size:12.5px` | 12px or 13px |
| 664 | `font-size:10.5px` | 10px or 11px |
| 665 | `font-size:14.5px` | 14px or 15px |
| 666 | `font-size:13.5px` | 13px or 14px |
| 709 | `font-size:14.5px` | 14px or 15px |
| 736 | `font-size:14.5px` | 14px or 15px |
| 739 | `font-size:12.5px` | 12px or 13px |
| 744 | `font-size:11.5px` | 11px or 12px |
| 773 | `font-size:14.5px` | 14px or 15px |
| 776 | `font-size:14.5px` | 14px or 15px |
| 790 | `font-size:14.5px` | 14px or 15px |
| 817 | `font-size:11.5px` | 11px or 12px |

**How to choose up or down:** look at what's around it. If it's body text, round up. If it's
a small label or caption, round down. When genuinely unsure, round down — smaller text
rarely breaks a layout, bigger text sometimes does.

**Line numbers shift as you edit.** They shift by zero here because you're replacing text
on a line, not adding lines. But if something looks wrong, search for the value instead of
trusting the number.

**Do about five, then reload and look.** If something looks worse, change that one back.

**Commit message suggestion:** `Round half-pixel font sizes to the type scale`

---

# TASK 11 — Delete four dead translation keys
**Time: 30 minutes. Difficulty: low. This one teaches you the file better than any other.**

**Background:** every piece of text in the app exists 13 times, once per language, in 13
big blocks called dictionaries. Three keys in there are translated into all 13 languages
and used absolutely nowhere — leftovers from features that got removed.

**First, prove they're actually dead.** In your terminal:

```sh
grep -c "food_allergy_combo_note" index.html
```
This counts how many times that text appears. **It should print exactly `13`** — once per
dictionary, zero times in real code. Do the same for `signed_in_as` and `ref_checking`.

> **If any of them prints more than 13, STOP and tell me.** That means it IS used somewhere
> and deleting it would break something.

**Then delete them.** Search (`Cmd+F`) for `food_allergy_combo_note`. You'll land on a line
that looks like:

```js
    food_allergy_combo_note: "Some English text here",
```

Delete that whole line. Then hit "find next" and delete the next one. Thirteen times. Then
the same for the other two keys.

**Starting line numbers** (they'll shift as you delete, so use search, not the numbers):
`signed_in_as` ≈ 4083, `ref_checking` ≈ 4176, `food_allergy_combo_note` ≈ 4357.

**After:** `grep -c "food_allergy_combo_note" index.html` should print `0`. Reload the app
and click around — everything should look identical, because nothing was using them.

**Commit message suggestion:** `Remove three unused translation keys`

---

# TASK 12 — Show the glossary hint
**Time: 45 minutes. Difficulty: medium — this is your first real JavaScript.**

**Background:** the app underlines medical words that have a plain-English definition — tap
one and you get an explanation. There's already a translated sentence for this in all 13
languages: `glossary_hint`, which reads *"Underlined words have a plain-English definition —
tap them."*

**It is currently shown to nobody.** The feature works; nothing tells users it exists.

**Your job:** display it somewhere sensible — near content that has underlined terms. The
Symptoms tab is the obvious home.

**What you need to know:** to get translated text in this app you call `t("key_name")`.
So `t("glossary_hint")` gives you that sentence in whatever language the user picked.
You get all 13 languages for free the moment you use it.

**Find a pattern to copy.** Search for `class="status"` — you'll find lines like:

```js
<p class="status">${esc(t("some_key"))}</p>
```

That's the shape: a paragraph, the `status` class for small grey text, `t(...)` for the
translation, and `esc(...)` which makes text safe to put on a page.

**Where to put it:** find where the Symptoms tab renders its content and add a line like
that above the symptom list. Search for `tab_symptoms` or `SYMPTOM_CATEGORIES` to find the
neighbourhood.

**Check it:** switch the language using the picker in the header. Your new line should
change language too. If it does, you did it right.

**Commit message suggestion:** `Show the glossary hint so users know terms are tappable`

---

# TASK 13 — A fourth stat tile
**Time: 1 hour. Difficulty: medium. Real JavaScript.**

**Go to line 14232**, `function dashboardSummaryHTML(meds)`. This builds the summary band at
the top of My Cabinet — the three counts.

You'll see three lines that look like this:

```js
  const total   = meds.length;
  const matched = meds.filter(m => m.generic || m.rxcui).length;
  const noted   = meds.filter(m => m.notes).length;
```

**Read that middle one in Python:** `meds.filter(m => m.notes).length` is exactly
`len([m for m in meds if m.notes])`. Take the list, keep only the ones where `m.notes` has
something in it, count what's left.

**Your job:** add a fourth count — how many medicines have **dosing times** set. The field
is called `m.schedule`.

**Step 1:** add a fourth `const` line following that same pattern.

**Step 2:** below those, find the three `<div class="stat-tile">` lines. Copy one, change it
to use your new count.

**Step 3 — the actual work.** The tiles sit in a 3-column grid (`.stat-tiles` uses
`repeat(3,1fr)`), and on phones it switches to 2. A fourth tile changes how that looks.
Resize your browser narrow and decide whether the grid needs adjusting. **That judgement is
the real task; the counting is the easy part.**

**Step 4:** it needs a label. Every user-facing string goes through the 13 dictionaries —
so come to me and we'll add a translated key together rather than you hardcoding English.

**Commit message suggestion:** `Add a dosing-times count to the cabinet summary`

---

# TASK 3 — Spacing tokens
**Time: 2 hours. Difficulty: medium. Save this for when you're comfortable.**

The stylesheet uses **27 different spacing values**. Professional stylesheets pick about
eight and never freehand a number again. That single difference is most of what makes a
design feel deliberate rather than assembled.

**Step 1:** find `:root{` near line 32. It's a list of named values like `--accent:#11736D;`.
Add your own scale to that list:
```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;
```

**Step 2:** pick ONE section of CSS and replace hardcoded spacing with `var(--space-N)`,
rounding to the nearest. `13px` becomes `var(--space-3)`. Start with the `.lp-` rules — the
homepage — because it's the newest code and lowest risk.

**`var(--name)` just substitutes the value you defined.** The file already does this
everywhere with `var(--radius)` and `var(--accent)`.

**Do one section, reload, confirm nothing moved much, commit. Then the next.**
**Do not attempt the whole file in one go.** You will hate it and you will break something.

---

# TASK 14 — A sepia theme
**Time: 45 minutes. Difficulty: low-medium.**

Find `[PRIVI - TASK 14]` in the style block (around line 211).

**Step 1:** find `[data-theme="midnight"]{` — actually it's gone now, so use
`[data-theme="blue"]{`. Copy the ENTIRE block, from `[data-theme="blue"]{` down to its
closing `}`. Paste it where the TASK 14 comment is.

**Step 2:** change `"blue"` to `"sepia"` in your copy, then change the colour values to a
warm, paper-like palette.

**Step 3:** add `<option value="sepia">` to the theme dropdown — search `theme-select`.

**Step 4:** add `"sepia"` to the `THEMES` array in the JavaScript — search `const THEMES`.

> **Every theme must define the same complete set of variables.** If you miss one it
> silently falls back and looks broken in a way that's genuinely hard to spot. Copy the
> whole block and edit values — don't write it from scratch.

**The part that actually matters:** the severity colours (`--major-*`, `--mod-*`,
`--minor-*`) must stay clearly different from each other and readable on their backgrounds.
That's a safety requirement, not taste. **Ask me to run the contrast checker on your palette
before you commit** — I have a script that measures every pair.

You'll also need a translated name (`theme_sepia`) in all 13 dictionaries — ask, don't guess.

---

# TASKS 6–10 — The homepage, in your words
**Time: ~3 hours total. Difficulty: low (it's writing, not code).**

Search for `[PRIVI - TASK` in `index.html` to find the five empty spots.

**Copy the shape of the section I already wrote.** Look at `<section class="lp-limits">` —
same `<div class="wrap">`, same heading pattern. You're filling in a template.

- **TASK 6 — "The problem."** Your personal story first: who you watched struggle with a
  label. Then the fact: the National Library of Medicine shut off its free public
  drug-interaction API in January 2024. Under 120 words. **This is the single
  highest-value paragraph in the entire project.** Don't dress it up.
- **TASK 7 — "What it does."** Four blocks, one sentence each. Don't invent a feature.
- **TASK 8 — "Where every fact comes from."** openFDA, RxNorm, the curated set — and what
  each one *can't* do. The honesty is the selling point.
- **TASK 9 — "Built for people who get left out."** 13 languages in their own script, RTL,
  pictogram mode, read-aloud, offline. Checkable facts, no adjectives.
- **TASK 10 — "Who made this."** One paragraph, signed, first person, your actual voice.

**Write them in English.** When all five are done, bring them to me and I'll translate the
whole set into the other 12 languages in one pass.

---

## Getting to 13 October

Three weeks from today. The video is the critical path — everything else can slip, that
can't.

| When | What |
|---|---|
| **Week 1** (Sep 21–27) | Tasks 1, 2, 11. **Write your story** (Task 6) — the video needs it. |
| **Week 2** (Sep 28–Oct 4) | Tasks 7–10 (rest of homepage), Task 12, Task 14. **Record the video.** |
| **Week 3** (Oct 5–11) | Tasks 3, 13. Write the AI disclosure. Fill the two legal placeholders. Re-record the video if it needs it. |
| **Oct 12–13** | Buffer. Submit. |

Two things that are not optional and only you can do: **the demo video** and **your story**.
Judges see *only* the video — not the app, not the repo. If everything else slipped and
those two were done, you'd still have a real submission.

**Real deadline is 12:00 PM EDT on 26 October** — targeting the 13th gives you almost two
weeks of slack. That's a good call.
