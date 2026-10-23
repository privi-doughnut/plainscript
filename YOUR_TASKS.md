# PLAINSCRIPT — Privi's complete guide

Today is **Fri Oct 23**. **Deadline: Monday Oct 26, 12:00 PM EDT.** 3 days left.

You don't have to understand everything. You have to do ONE small task, see it work, and
save it. Thursday was a genuinely strong solo day — 9 tasks pushed, including writing your
real homepage story. Keep going one task at a time.

## How this guide works

Every edit has the same five parts:

- **Goal** — what changes for the user.
- **Find it** — the exact text to search for (Cmd+F).
- **Example** — a *different* example done the same way, so you see the pattern without me
  handing you the answer.
- **Hint** — read only if you're stuck.
- **Check + Commit** — how to see it work, and the message to save it with.

The real answers are in `ANSWER_KEY.md`, but you said you'd rather not use it — good, that's
the better way. Only open it after 10 stuck minutes, and if you do, say so in the AI
disclosure ("with step-by-step help" is true and fine; "alone" would not be).

After every task, say out loud in one sentence what you changed and why. That's what judges
ask about.

## Contents

1. What Plainscript is (the project in one page)
2. Setup and the every-time routine
3. Coding tasks 1–5
4. Writing tasks (homepage, README, legal, contest answers) — these matter most
5. More code edits (bonus)
6. Feature ideas
7. The contest: rules, the video, the script, the AI disclosure
8. Schedule, checklist, and judge questions

---

# 1 · WHAT PLAINSCRIPT IS

**One sentence:** a free web app that turns the FDA's own drug labels into plain English and
checks whether your medicines interact — and it never makes anything up.

**Why it exists:** the National Library of Medicine shut down its free drug-interaction API
in **January 2024**. The free, authoritative way to check interactions mostly disappeared.
Plainscript rebuilds a safe version from public sources.

**Who it's for:** older adults, caregivers managing several people's medicines, non-native
English speakers, anyone with low health literacy.

## The four tools in the app

| Tab | What it does |
|---|---|
| **Decode** | Type a drug → what it is, what it treats, side effects, from its real FDA label |
| **Check** | Enter 2+ drugs → severity-rated, plain-English interaction warnings with a source |
| **My Cabinet** | Save your medicines (sign in or guest mode), see a summary |
| **Cabinet Scan** | Every medicine checked against every other one, shown as a heatmap |

(Plus Symptoms: an emergency red-flag list and over-the-counter category lookup. It does
*not* diagnose.)

## How it works under the hood

```
You type "warfarin" ──► RxNorm (NIH)  : fixes spelling, finds the official drug ID
                   ├──► openFDA        : the real FDA label text
                   └──► INTERACTIONS   : 17 hand-checked rules, each with a severity
                                         │
              (optional) Claude ◄────────┘ rewrites ONLY the retrieved label text
                                           in simpler words. It can't add claims.
```

- **openFDA** = the FDA's public label database. **RxNorm** = NIH's official drug names.
- **INTERACTIONS** = a list inside `index.html`. Each rule names two drugs, a severity
  (`major` / `moderate` / `minor`), and three plain sentences: *what* happens, *why*, and
  *what to do about it*. **This list is the source of truth for severity.**
- **The AI (Claude)** is used in exactly one place: rephrasing label text that was already
  fetched. A Cloudflare Worker (`worker.js`) holds the locked prompt, so even a hacker
  can't make it say new medical things.
- **Supabase** = login + saved cabinets, with Row-Level Security (each user can only see
  their own rows).

## The files

| File | What it is |
|---|---|
| `index.html` | **The whole app** (~14,000 lines: HTML + CSS + JavaScript). You'll edit this. |
| `tests/engine.test.js` | 78 automated checks that the interaction engine behaves |
| `worker.js` | Cloudflare Worker: the locked AI proxy |
| `sw.js` | Service worker: makes the app work offline (also why you must "Unregister" it) |
| `privacy.html`, `terms.html` | Legal pages (two blanks for you to fill) |
| `README.md` | Public overview on GitHub (has a blank for your story) |
| `CAC_SUBMISSION.md` | Drafts of your contest answers + the video script |
| `config.js` | Public URLs. Contains no secrets. |

## Safety rules (these are the point — judges respect them)

1. **Never invent a medical fact.** Every claim comes from openFDA, RxNorm, or a rule you
   verified against a real label.
2. **The AI only rephrases.** It never decides if drugs interact.
3. **Never show a green "safe."** "Nothing found" does *not* mean safe, and the app says so.
4. **Every claim shows its source.**
5. **Red/orange/amber colors are only for interaction severity**, so an alarming color always
   means something alarming.
6. **Never diagnoses, never doses, never says start/stop a medicine.**

## Words you'll hear (cheat sheet)

- **Repo / repository** — the project folder on GitHub.
- **Commit** — a saved checkpoint with a message. **Push** — upload checkpoints to GitHub.
- **Deploy** — GitHub pushes automatically update the live site (a minute or two).
- **PWA** — a website that installs like an app.
- **i18n** — "internationalization": the 13-language system. `t("key")` fetches text for the
  current language.
- **RLS** — Row-Level Security: the database rule that keeps users' data separate.
- **Regex** — a search pattern (`\d` means "any digit").
- **Severity scale, least to greatest:** `minor` → `moderate` → `major`. Colors follow the
  same order: amber → orange → red. These words are the only three the app is allowed to
  use for severity — never anything softer or stronger.

---

# 2 · SETUP AND THE EVERY-TIME ROUTINE

## One-time setup: already done

I installed **Visual Studio Code** for you (the code editor). It lives in
`~/Applications`. Nothing for you to install.

## Every time you sit down

**A. Open Terminal.** Cmd+Space, type `Terminal`, Enter. A window with a blinking cursor.
You type a command, press Enter, it runs.

**B. Go to the project folder.**
```sh
cd ~/plainscript-remote
```
(`cd` = "go into this folder". Type `ls` + Enter to see the files.)

**C. Start your private copy of the site.**
```sh
python3 -m http.server 8899
```
The cursor just sits there. **That's correct.** Don't close it. If it says
`Address already in use`, it's already running — skip this.

**D. Open a second tab.** Cmd+T, then `cd ~/plainscript-remote` again. Use this tab for
everything else.

**E. Look at the site.** In Chrome go to **http://localhost:8899/index.html**.
**Once per session:** Cmd+Option+I → **Application** → **Service Workers** → **Unregister**,
then Cmd+Shift+R. (Otherwise Chrome shows you the old saved version.)

**F. Check nothing is broken before you start.**
```sh
node --test tests/*.test.js
```
Look for `# pass 78`. If it says `bad option: --test`, use:
```sh
/Users/privivijayakumar/.nvm/versions/node/v22.23.1/bin/node --test tests/*.test.js
```

**G. Open the code.**
```sh
open -a "Visual Studio Code" index.html
```
- Jump to a line: **Ctrl+G**, type the number, Enter.
- Find text: **Cmd+F** (Enter = next match).
- Don't use the Antigravity editor for your edits — it has built-in AI that would write the
  code for you, and then it isn't yours.

**H. One change at a time.** Edit → **Cmd+S** to save → Chrome → **Cmd+R** → look → run the
tests again. Still `pass 78`? Good.

**I. Save it to GitHub.** One line at a time, Enter after each:
```sh
git add index.html
git commit -m "Raise small button tap targets to 44px"
git push origin main
```
(Change the message in quotes to match the task.) The live site updates by itself in a
minute or two.

**Made a mess?** Undo everything since your last save:
```sh
git checkout index.html
```
You cannot break what's already pushed. Worst case: undo and redo that one task.

**Page went blank?** Cmd+Option+I → **Console**. The red line is the error. Screenshot it
and send it to me.

**Tell me when you push.** I review what you pushed, an hour after.

---

# 3 · CODING TASKS 1–5

## ✅ TASK 1 — DONE — Bigger buttons · 10 min · one line

**Goal:** small buttons are 32px tall; phone guidelines say 44px, so they're hard to tap.

**Find it:** Cmd+F → `.mini{` (about line 747). You'll see CSS properties, one per line,
like `padding:6px 10px;`.

**Example (a different property, same pattern).** To stop text wrapping inside a class:
```css
.badge{
  padding:4px 8px;
  white-space:nowrap;   /* <- the line you add: property:value; */
}
```
A CSS line is always `property:value;`. Don't forget the semicolon.

**Your line:**
```css
min-____:__px;
```
**Hint:** the property sets a *minimum height*, in pixels. The number is the phone
guideline: 44.

**Check:** reload, right-click a small button → Inspect → look for 44 in the box diagram.
**Commit:** `Raise small button tap targets to 44px`

## ✅ TASK 2 — DONE — Round the half-pixel font sizes · 30 min

**Goal:** sizes like `14.5px` are invisible differences that make the CSS messy. Round
every one **down**.

**Find it:** turn on regex search (the `.*` icon in the Cmd+F box) and search
`font-size:\d+\.5px`. About 35 matches.

**Example:** `font-size:13.5px;` becomes `font-size:13px;`. Delete the `.5` only —
nothing else on the line.

**Hint:** press Enter to jump to the next match, fix, Enter again. Do five, reload, glance
at the page, repeat. If a match is part of something odd (like inside `clamp(...)`),
skip it and mention it to me.

**Commit:** `Round half-pixel font sizes down`

## ✅ TASK 3 — DONE — Delete 3 dead translation keys · 30 min

**Goal:** three text entries exist in all 13 languages and the app never uses them. Dead
code makes the file harder to read.

**Prove they're dead first:**
```sh
grep -c "food_allergy_combo_note" index.html
```
It must print **13** (one per language). Repeat for `signed_in_as` and `ref_checking`.
**If any prints something else, stop and tell me.**

**Example:** a translation entry looks like one line: `some_key: "some text",`. Deleting
a whole line in VS Code: click the line, press **Cmd+Shift+K**.

**Hint:** Cmd+F the key name; the match is on the line you delete; press Enter in the
search box to jump to the next of the 13. A key can be spread over two lines — if the line
before the next key doesn't end in `",`, you've left half behind. After all 13, run grep
again: it must print `0`. Reload, switch a couple of languages, click around.

**Commit:** `Remove three unused translation keys`

## ✅ TASK 4 — DONE — Tell people the underlined words are tappable · 45 min · first real code

**Goal:** drug results underline hard medical words; tapping one shows a plain meaning.
Nobody is told that. The sentence already exists in all 13 languages as `glossary_hint`.

**Find it:** Cmd+F → `applyGlossary(box);` — it's in the `decode` function. You add your
line directly **under** it.

**Python version of what you're writing:**
```python
if results.contains_any_underlined_word:
    results.append(a_small_note)
```

**Example (same shape, different feature).** "If the box has a warning banner, add a
footnote":
```js
if (box.querySelector(".banner")) box.insertAdjacentHTML("beforeend", `<p class="status">${esc(t("banner_footnote"))}</p>`);
```
Breaking it down:
- `box.querySelector(".banner")` — "is there anything with class `banner` inside the box?"
  (Empty = false, found = true.)
- `insertAdjacentHTML("beforeend", ...)` — "put this HTML at the end of the box."
- `` `...${...}...` `` — a template string; `${}` drops a value in.
- `t("key")` — the translated text for the key. `esc()` — makes text safe to show.

**Your blanks:** which class do underlined words have? Look at `applyGlossary` a few lines
below the `decode` function — the code that builds them has `class="..."`. And the key is
`glossary_hint`.

**Hint:** copy the example exactly, swap `.banner` for the class name (keep the dot) and
`banner_footnote` for the key (no dot, quotes stay).

**Check:** decode `metformin`, scroll to the bottom of the result for the note, switch
language, check again.
**Commit:** `Show the glossary hint when results have tappable terms`

## ✅ TASK 5 — DONE — A fourth stat tile · 1 hr

**Goal:** My Cabinet shows three summary counts. Add one: how many medicines have dosing
times set.

**Find it:** Cmd+F → `function dashboardSummaryHTML`. Four small steps:

**Step 1 — a new count.** Under the line `const noted = meds.filter(m => m.notes).length;`
add one in the same style. The test for "has dosing times" is `parseTimes(m.schedule).length`.

*Example for a different count (medicines with a nickname):*
```js
const nicknamed = meds.filter(m => m.nickname).length;
```
Read it as Python: `len([m for m in meds if m.nickname])`.

**Step 2 — a new tile.** Under the third `<div class="stat-tile">…` line, copy that line,
change the variable, and the label to `t("insights_scheduled")`.

**Step 3 — the English label.** Cmd+F `insights_noted:` — the **first** match is the English
dictionary (the others are other languages). Under it add
`insights_scheduled: "with dosing times",` — copy the line above, same quotes, same comma.

**Step 4 — room for four tiles.** Cmd+F `.stat-tiles{` — the first match says `repeat(3,1fr)`
(three equal columns). Make it `repeat(4,1fr)`.

**Hint:** the only blank is the variable name; use `scheduled`. The same name goes in
steps 1 and 2.

**Check:** you need guest mode or a signed-in cabinet with a medicine that has times.
**Commit:** `Add dosing-times count to the cabinet summary`

---

# 4 · WRITING TASKS (the ones only you can do)

Judges are congressional staffers, not engineers. The code shows skill; **your words show
why it matters.** Yes — you write the homepage paragraphs. Here's exactly how.

## ✅ First, a one-line CSS fix so your new sections look right · Task 6 · 10 min · DONE

**Goal:** headings in some homepage sections aren't styled like the others. Fix once, so your
new sections look right.

**Find it:** Cmd+F → `.lp-limits h2, .lp-end h2{` (line ~472). It styles headings in two
sections.

**Example:** to give `.card` headings the same style as `.panel` headings, you'd change
`.panel h2{` to `.panel h2, .card h2{` — selectors are separated by commas.

**Your edit:** add `.lp-feat h2` to that list. There's a second copy of that rule inside the
mobile section (`@media`, line ~508) — do both.

**Hint:** the list is `.lp-limits h2, .lp-end h2` — add a third, with a comma.
**Check:** the "Four tools, one medicine cabinet." heading should now be serif like the
others. **Commit:** `Style landing feature headings consistently`

## How to write a homepage section (read this once)

1. Open `index.html`, Cmd+F → `[PRIVI - TASK`. You land on one of four HTML comments:
   markers **6, 8, 9, 10**. (There's no 7. The "what it does" section already exists as the
   carousel — ignore any old mention of Task 7.)
2. A comment looks like `<!-- ... -->`. You **add** your section *under* it. You can leave
   the comment or delete it.
3. Copy the skeleton below. The words `____` are yours.
4. **Write plain English only. Don't add `data-i18n`.** That's the translation system, and
   I'll attach it to your final wording and translate it into the other 12 languages in one
   pass.
5. Reload. Done.

### The skeleton (white background, like the carousel section)

```html
<section class="lp-feat"><div class="wrap">
  <span class="eyebrow">____</span>
  <h2>____</h2>
  <p class="lp-sub">____</p>
</div></section>
```

### The skeleton with a shaded background (like "What it will never do")
Same, but `class="lp-limits"`. Use it for every *other* section so they alternate shade.

### Example of the pattern (a different section, not one of yours)

```html
<section class="lp-feat"><div class="wrap">
  <span class="eyebrow">Free forever</span>
  <h2>No account needed to look something up.</h2>
  <p class="lp-sub">Decoding and checking work without signing in. An account only
  matters if you want to save your medicines.</p>
</div></section>
```
- `eyebrow` — the small label above the heading.
- `<h2>` — the big heading. `<p class="lp-sub">` — the paragraph under it.
- Need two paragraphs? Add another `<p class="lp-sub">…</p>` or use
  `<p class="lp-note">…</p>` for small gray print.

## ✅ TASK 6a — DONE — "The problem" (marker 6) · the most important thing you'll write

**Goal:** the first thing a judge reads after the hero. Your real story.

**Find it:** `[PRIVI - TASK 6]` (about line 1282). Use `lp-feat` skeleton.

**Write, in this order, under 120 words:**
1. A specific moment. Who did you watch struggle with a medicine label or a pill bottle?
   What happened? One or two real sentences — not "many people struggle."
2. The fact: in January 2024 the National Library of Medicine shut down its free
   drug-interaction API.
3. One sentence: so you built the version that's honest about where every fact comes from.

**Hint:** write it as if you're telling a friend, as a voice memo, then clean it up. A
true small detail ("my grandma kept three pill bottles in a dish") beats a polished claim.
Don't write it with an AI — that's the whole point of this paragraph, and it's what the
contest's originality clause is about.

**Heading ideas** (pick or replace): "Why I built this" / "A label shouldn't need a pharmacist
to read."

**Commit:** `Write the homepage problem section`

## TASK 8 — "Where every fact comes from" (marker 8)

**Goal:** show judges you didn't invent anything. Three small cards.

**Find it:** `[PRIVI - TASK 8]` (about line 1324). Use the `lp-limits` skeleton plus a list
(copy the style of the "never" list just below it):

```html
<section class="lp-limits"><div class="wrap">
  <span class="eyebrow">Sources</span>
  <h2>____</h2>
  <ul class="lp-never">
    <li><b>openFDA.</b> <span>____ what it gives us ____ — and what it can't do ____</span></li>
    <li><b>RxNorm.</b> <span>____</span></li>
    <li><b>The curated rules.</b> <span>____</span></li>
  </ul>
</div></section>
```
**Hint (the facts, in your words):**
- openFDA = the FDA's real label text. Can't: tell you severity, and some old drugs have
  no label.
- RxNorm = NIH's official drug names; fixes misspellings. Can't: say anything about
  interactions.
- Curated rules = 17 pairs a person checked against FDA labels, each with severity.
  Can't: cover every pair — "nothing found" is not "safe."

Alternate the shade: since the block right under is also `lp-limits`, you may use `lp-feat`
for yours so the two don't look identical.
**Commit:** `Write the homepage sources section`

## TASK 9 — "Built for people who get left out" (marker 9)

**Goal:** who this is *for*, in concrete features.

**Find it:** `[PRIVI - TASK 9]` (~line 1340). Same skeleton with a list. Only claim things
that exist:
- 13 languages, including right-to-left (Arabic flips the whole layout)
- Read-aloud / voice input
- Works offline once opened
- Plain words, with hard terms tappable
- Free, no account to look things up

**Example list item:** `<li><b>Speaks your language.</b> <span>Switch to any of 13 languages; Arabic flips the whole page right-to-left.</span></li>`
**Hint:** open the app and try each one before you write it down. If a feature isn't real,
don't claim it.
**Commit:** `Write the homepage accessibility section`

## TASK 10 — "Who made this" (marker 10)

**Goal:** one paragraph, first person, your voice. A student, a real person.

**Find it:** `[PRIVI - TASK 10]` (just under 9). Use the `lp-feat` skeleton with just an
eyebrow, a short heading, and one `<p class="lp-sub">`.

**Write:** your name, school, district, grade, what you taught yourself building this,
what you'd tell another student. 4–6 sentences.
**Hint:** you don't have to sound impressive. You have to sound like you.
**Commit:** `Write the who-made-this section`

When 6a, 8, 9, 10 are pushed, **tell me** — I translate all of them in one pass.

## BONUS WRITING 1 — Fill the two legal blanks · 10 min

**Goal:** the privacy page and terms page each have a `[PRIVI: …]` blank. They look
unfinished to a judge.

1. `privacy.html` line ~384: replace `[PRIVI: decide contact address]`. Use a real email you
   check. (A separate address you create for the project is smarter than your personal one.)
2. `terms.html` line ~275: replace `[PRIVI: your state]` with the U.S. state you live in.

**Example:** `<span class="placeholder">[PRIVI: your state]</span>` becomes just
`North Carolina`. Delete the whole `<span ...>…</span>`, not only the text.
**Hint:** both are on a single line; Cmd+F `PRIVI:` finds them.
**Commit:** `Fill legal page placeholders`

## BONUS WRITING 2 — README "Why I built this" · 20 min

**Find it:** `README.md`, Cmd+F → `## Why I built this`. Replace everything under the heading
(the italic note and its bullets) with 4–6 sentences in your own voice. Judges can request
the code, and this is the first thing they'd read. Reuse your Task 6a story but don't paste
it. **Commit:** `Write README why-I-built-this`

## BONUS WRITING 3 — Your contest answers

The form asks six questions (listed in section 7). Drafts for the factual ones are in
`CAC_SUBMISSION.md`. The ones only you can answer — **why you built it, what you learned,
what you'd do next** — you write from scratch in a Google Doc first. Aim 80–150 words each.
Send them to me and I'll check them against the rules; I won't rewrite them.

---

# 5 · MORE CODE EDITS (bonus, after Tasks 1–5)

## BONUS CODE 1 — Add a test for a rule · 30 min
**Goal:** a test that fails if someone accidentally deletes a rule. Do this after Feature 1.
**Find it:** open `tests/engine.test.js`, Cmd+F → `the warfarin + NSAID major rule is present`
(line ~53). That's a model test.
**Example** (the pattern, using made-up drug names):
```js
  await t.test("the drugone + drugtwo rule is present", () => {
    const found = INTERACTIONS.some((r) =>
      (r.a.includes("drugone") && r.b.includes("drugtwo")) ||
      (r.b.includes("drugone") && r.a.includes("drugtwo")));
    assert.ok(found, "the drugone/drugtwo rule is missing");
  });
```
Copy it under the existing test, change the two drug names and the message to match the
rule *you* added. **Hint:** the name between the quotes has to match the name in your rule's
`a:` / `b:`.
**Check:** `node --test tests/*.test.js` → `# pass 79` (one more than 78).
**Commit:** `Add test for warfarin + amiodarone rule`

## ✅ BONUS CODE 2 — DONE (you added ~47!) — Add glossary words
**Goal:** more hard words become tappable with plain meanings. This one scales well —
each word is the same one-line pattern repeated, so doing 30 is just doing 1 thirty times.
**Find it:** Cmd+F → `"idiopathic":"with no known cause"` (line ~11434). The list above it
is the model — one line per word, `"word":"meaning",`.
**Gotcha:** every entry ends with a comma **except the very last one in the object.** Since
you're adding a whole block under `idiopathic`, put a comma after *its* closing quote, then
every line you add also ends in a comma except your final new line.
**Example:**
```js
  "idiopathic":"with no known cause",
  "nauseated":"feeling like you might throw up",
  "swollen":"puffy or larger than usual from fluid buildup"
```
(Don't use those exact words — pick your own, from the candidate list below.)
**Rules:** words must be lowercase. Meaning is one short plain phrase, **under 8 words if
you can.** **Look up every term at medlineplus.gov** (search the word, use their wording,
in your own simplification) — never write a definition from memory. Pick ones that actually
appear in real labels: decode several drugs across different drug classes (a statin, an
antibiotic, an antidepressant, a blood pressure med, a painkiller) and watch for words that
*aren't* already underlined.

**A candidate pool to pick ~30 from** (none of these are in the glossary yet — verify every
meaning yourself at MedlinePlus, don't trust this list for the *meaning*, only as a starting
point for which *words* are worth adding):
`hematuria`, `arrhythmia`, `anaphylaxis`, `neuropathy`, `photosensitivity`,
`thrombocytopenia`, `hyponatremia`, `leukopenia`, `neutropenia`, `agranulocytosis`,
`angioedema`, `hepatomegaly`, `nephropathy`, `hyperkalemia`, `hypokalemia`,
`hypercalcemia`, `hypocalcemia`, `rhabdomyolysis`, `hepatitis`, `pancreatitis`,
`vasculitis`, `myalgia`, `arthralgia`, `paresthesia`, `tinnitus`, `vertigo`, `insomnia`,
`somnolence`, `cachexia`, `dysphagia`, `dysuria`, `polyuria`, `oliguria`, `anuria`,
`hirsutism`, `gynecomastia`, `xerostomia`, `stomatitis`, `petechiae`, `ecchymosis`,
`jaundice`, `cholestasis`, `nystagmus`, `ataxia`, `dystonia`, `akathisia`.
(That's ~45 — pick whichever ~30 you actually see on real labels, skip the rest.)

**A faster way to work through 30:** open a scratch note, decode 8–10 real drugs across
different classes first and write down every unfamiliar word you see that isn't already
underlined. That gives you a real, label-sourced list before you touch MedlinePlus — faster
than guessing from the pool above and then checking each one is actually used anywhere.
**Check:** after adding all of them, decode a handful of different drugs and confirm the new
words show up underlined. Run the tests (`node --test tests/*.test.js`) — still `# pass 78`.
**Commit:** one commit is fine for the whole batch: `Add ~30 glossary terms from MedlinePlus`

## ✅ BONUS CODE 3 — DONE — "Last reviewed" date · 20 min
**Goal:** the footer or Check tab says when the rule list was last verified. Honest and
judge-friendly.
**Find it:** Cmd+F → `check_intro:` (first hit, English). Add a line under it of your own
design. Keep the date true: today's date, written like `Rules last reviewed Oct 2026.`
**Hint:** same pattern as the Feature 2 keys — you add the English key; I translate.

## BONUS CODE 4 — Accessibility labels · 30 min
**Goal:** screen readers need names on icon-only buttons.
**Find it:** regex search `<button class="mini"[^>]*>[^<]{1,2}</button>` — buttons whose
only content is one or two characters (like `‹`). Each needs `aria-label="..."`, as the
carousel buttons already have (`aria-label="Next"`). **Example:**
`<button class="mini" data-x="y">✕</button>` → `<button class="mini" data-x="y" aria-label="Close">✕</button>`.
If a match already has `aria-label`, skip it. Tell me the list before you commit and I'll
translate the labels.

## ✅ BONUS CODE 5 — DONE — Browser tab title changes with the tool · 20 min

**Goal:** right now the browser tab always says "Plainscript — Medication Reference," even
if you're on the Check tab or Cabinet. A small, real touch: make the tab title reflect
which tool is open.

**Find it:** Cmd+F → `function selectTab`. It's short — a loop that shows the right panel
and marks the right tab button as selected, then one line below it wires every tab button
to call it on click.

**Example (the pattern — updating something else every time a value changes):**
```js
function setVolume(v){
  current = v;
  $("#vol-label").textContent = v + "%";   // <- the line that reacts to the change
}
```
Whatever changes (`v`, or here, `which`) drives a side effect written as its own line
inside the function.

**Hint:** inside `selectTab`, you have a parameter called `which` — it's one of
`"decode"`, `"check"`, `"cabinet"`, `"symptoms"`. Each of those already has a matching
translation key: `tab_decode`, `tab_check`, `tab_cabinet`, `tab_symptoms` (Cmd+F any of
those to see them in the English dictionary). Set `document.title` to something built from
`t("tab_" + which)` plus `" — Plainscript"`.

**Check:** click between tabs and watch the actual browser tab text change (you may need to
widen the window or hover the tab to see the full title). Switch languages and confirm the
title updates too.
**Commit:** `Update the browser tab title to match the active tool`

## ✅ BONUS CODE 6 — DONE — Remember your last tab across reloads · 20 min

**Goal:** right now every reload lands you back on Decode. Remember whichever tab you were
last on.

**Find it:** Cmd+F → `READING_KEY` (~line 12700). Read the two lines right around it — one
saves a value to `localStorage` wrapped in `try/catch`, the other reads it back on load.
That's the whole pattern used everywhere in this file for "remember this between visits."

**Example (the exact pattern, for a different saved value):**
```js
try{ localStorage.setItem("plainscript.lastDrug", name); }catch(e){}
// ...later, on load...
const lastDrug = (()=>{ try{ return localStorage.getItem("plainscript.lastDrug"); }catch(e){ return null; } })();
```
**Hint:** inside `selectTab` (same function as Bonus Code 5), save `which` under a new key
like `"plainscript.lastTab"` every time it's called. Then, near where `TABS.forEach(...)`
wires up the click listeners, read that key back — if it's set and still a valid tab name
(check it's in the `TABS` array), call `selectTab` with it instead of leaving the default.
**Check:** switch to Check or Cabinet, reload the page — it should open on the tab you left.
**Commit:** `Remember the last tab across reloads`

## BONUS CODE 7 — "/" jumps straight to the Decode search box · 20 min

**Goal:** a common pattern on real sites (GitHub does this) — press `/` anywhere on the
page and the main search box gets focus, so you don't have to click it first.

**Find it:** Cmd+F → `addEventListener("keydown", onEsc)` style listeners elsewhere in the
file for the pattern of a page-wide key listener, or simpler: Cmd+F →
`$("#decode-input").addEventListener("keydown"` — that's the input you're giving a shortcut
*to*. You're adding a new, separate listener on `document` (not on the input) that checks
which key was pressed.

**Example (the pattern — a different key, different target):**
```js
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && document.activeElement) document.activeElement.blur();
});
```
**Hint:** your condition needs two checks, not one: the key is `/`, **and** the user isn't
already typing in a text field (otherwise typing a real `/` character anywhere would hijack
it). `e.target.tagName` tells you what's focused — compare it against `"INPUT"` and
`"TEXTAREA"`. If both checks pass, call `e.preventDefault()` (stops the `/` from being typed)
and `.focus()` the decode input.
**Check:** click somewhere empty on the page, press `/` — the Decode box should focus. Type
a `/` while already inside a text field — it should type normally, not hijack focus.
**Commit:** `Add / keyboard shortcut to focus the Decode search box`

## BONUS CODE 8 — A "Copy result" button on Decode · 30 min

**Goal:** let someone copy a drug's plain-English summary to paste into a text or email,
for a family member who isn't looking at the app themselves.

**Find it:** Cmd+F → `function addReadAloudButton` (~line 11327). It's called right next to
where you added Task 4's line, and it does almost exactly what you need: it creates a
button, adds it into the results box, and — look at the lines inside it that build `parts`
and join them into `text` — it already assembles the full plain-text version of the result
for the read-aloud feature. Copying uses the same assembled text.

**Example (the clipboard half of the pattern, used elsewhere for a share link):**
```js
try{
  await navigator.clipboard.writeText(someText);
  btn.textContent = t("share_copied");
  setTimeout(()=>{ btn.textContent = originalLabel; }, 1500);
}catch(e){ /* clipboard blocked — fail quietly */ }
```
**Hint:** write a new function `addCopyButton(box)` modeled on `addReadAloudButton` —
same button-creation lines, same `parts`/`text`-building lines — but instead of starting
speech synthesis on click, it copies `text` to the clipboard and flashes the button's label
to say "Copied!" for a second and a half. Call your new function right next to where
`addReadAloudButton(box)` is already called.
**Check:** decode a drug, click your new button, paste (Cmd+V) into Notes or Messages —
the plain-text summary should appear.
**Commit:** `Add a copy-result button to Decode`

## BONUS CODE 9 — A severity-color legend on the Check tab · 25 min

**Goal:** `major`/`moderate`/`minor` already show in amber/orange/red pills on results, but
nothing explains what the three words and colors mean until you've already run a check.
Add a small legend above the results that shows all three up front.

**Find it:** Cmd+F → `class="panel-intro" data-i18n-html="check_intro"` (~line 1445) — your
legend goes right after that line, before `id="check-results"`. Then Cmd+F → `.v-major{` (a
little above line 691) to see how severity coloring actually works: a wrapping class
(`.v-major`, `.v-moderate`, `.v-minor`) controls the colors of anything with class `.pill`
inside it.

**Example (the pattern — a chip using one of those wrapper classes, outside a real result):**
```html
<span class="v-moderate"><span class="pill">moderate</span></span>
```
**Hint:** write three of those side by side, one per severity, each pill showing its own
word (use the existing `sev_major`/`sev_moderate`/`sev_minor` translation keys you can find
by searching `sev_major:` rather than typing the English words directly — then it's already
translated). Wrap the three in a small flex row (inline `style="display:flex; gap:10px;"`
is fine for something this small).
**Check:** the Check tab shows all three severity colors and words before you've typed
anything.
**Commit:** `Add a severity color legend to the Check tab`

## ✅ BONUS CODE 10 — DONE — Show how many drugs you've added to Check · 15 min

**Goal:** the Check tab caps you at 15 drugs (`MAX_CHECK_ROWS`) but never tells you where
you stand until you hit the limit. Show a running count.

**Find it:** Cmd+F → `function syncAddDrugBtn` (~line 12228). It already runs every time a
row is added — it currently only disables the button at the limit. You're adding one more
line inside it.

**Example (the pattern — a different running count, shown as plain text):**
```js
$("#status-line").textContent = `${done} of ${total} complete`;
```
**Hint:** you need a small element to write into — add
`<span class="status" id="drug-count"></span>` once in the HTML near `id="add-drug"`, then
inside `syncAddDrugBtn`, set its `textContent` using `list.children.length` and
`MAX_CHECK_ROWS` the same way the example does.
**Check:** add and remove rows on the Check tab and watch the count update live.
**Commit:** `Show a running count of drugs added to Check`

---

# 6 · FEATURE IDEAS (what judges notice)

Honest version: judging criteria are **quality of idea, implementation, and demonstrated
coding skill.** Your idea already scores high. Features that show *your* skill and make the
app more useful are worth doing, ranked best first.

## FEATURE 1 — Add real interaction rules · 1–2 hrs per batch · BEST ONE

The checker uses 17 hand-written rules. Adding more is the most useful thing you can do,
and it's reading and writing, not hard code.

**Safety rules (non-negotiable):**
- Every rule comes from a real label. Don't write from memory.
- Never say a combination is safe. Never tell anyone to start, stop, or change a dose. The
  last line is some form of "ask a pharmacist or doctor."

**Candidates (well documented, but you verify each) — pick any one to start:**
1. warfarin + amiodarone
2. warfarin + ciprofloxacin
3. methotrexate + trimethoprim
4. lithium + lisinopril
5. simvastatin + amiodarone
6. digoxin + verapamil
7. digoxin + clarithromycin
8. lisinopril + ibuprofen
9. sertraline + ibuprofen
10. tramadol + phenelzine
11. fluconazole + phenytoin
12. carbamazepine + warfarin
13. phenytoin + warfarin
14. metformin + topiramate
15. sildenafil + tamsulosin
16. clarithromycin + colchicine
17. warfarin + itraconazole
18. methotrexate + omeprazole
19. metoprolol + verapamil

**Doing this as a batch (recommended — 4–5 at once):** this is the one Feature task where
batching genuinely helps, both for your diff and for review. Pick 4–5 pairs from the list
above, verify and draft all of them following the steps below, then send me all 4–5 drafts
**in one message**, each with its source paragraph, instead of five separate messages. I'll
check all of them together Friday, and you commit them (one commit per rule, or all 4–5 in
one commit — either is fine, there's no rule here beyond each rule being correct) once I've
confirmed. Doing them one pair at a time, fully, is what makes this safe to batch — don't
draft all 5 severities/sentences from guessing a pattern across pairs; each one still needs
its own trip to its own label.

**How to verify one:** **dailymed.nlm.nih.gov** → search the drug (say, amiodarone) → open
the label → find section **7 · Drug Interactions**. **A real label documents interactions
with lots of different drugs at once** — amiodarone's label also mentions grapefruit juice,
digoxin, statins, and several others that have nothing to do with your pair. That's normal.
Find the one paragraph that names **your specific second drug** (say, warfarin) and ignore
everything else on the page — that paragraph is your whole source.

Write down what that paragraph says and which section it's in. Judge severity from its own
words ("contraindicated," "avoid," "monitor closely") against the scale above (minor <
moderate < major). Then write your `what` / `why` / `mgmt` sentences **yourself, in your own
words** — this is the one part of this task I won't write for you, since it's the actual
content you're submitting as your own work. **Send me your three sentences plus the source
paragraph before you commit; I'll check your wording against the label**, not write it for
you.

**Find it:** Cmd+F → `Hospitals routinely hold metformin`. That's the last rule. Scroll a
few lines to the line that is just `];`. Click at the end of the line above it (it ends
`},`), press Enter, and add a new rule.

**Example (the pattern, with a made-up shape — NOT a real rule, don't copy the facts):**
```js
  { a:["drugone"], b:["drugtwo"], severity:"moderate",
    what:{en:"Taking these together can make you more sleepy than usual."},
    why:{en:"Both slow down parts of the brain that control alertness."},
    mgmt:{en:"Ask a pharmacist or doctor before combining them."} },
```
**Your template:**
```js
  { a:["____"], b:["____"], severity:"____",
    what:{en:"____"},
    why:{en:"____"},
    mgmt:{en:"____"} },
```
- `a`, `b`: generic names, lowercase, in quotes, in square brackets.
- `severity`: exactly `major`, `moderate`, or `minor`.
- Three sentences, plain English, **no dose advice**, `mgmt` ends with "ask a pharmacist or doctor."
- Every `"` opened must be closed; every line inside ends with a comma except the last
  `mgmt` line, which ends with `},`.

**Hint:** read the neighbouring rules to copy their tone. Test it by typing both drugs in
the Check tab. Run the tests. Only English is needed; I translate the rest.
**Commit:** `Add warfarin + amiodarone interaction rule`

## ✅ FEATURE 2 — DONE — "Checks against N rules" line · 45 min

A real number on the Check tab that grows every time you add a rule.

1. **HTML.** Cmd+F → `data-i18n-html="check_intro"`. Under that line add
   `<p class="status" id="rule-count"></p>`. (An empty paragraph with an id that code can fill.)
2. **JavaScript.** Cmd+F → `function refreshDynamicContentForLang`. Inside it add a line that
   sets that paragraph's text. *Example of the pattern (a different element):*
   ```js
   $("#page-title").textContent = t("title_prefix") + " " + items.length + " " + t("title_suffix");
   ```
   `$()` finds an element; `.textContent =` sets its text; `.length` counts a list.
   **Your blanks:** the id is `rule-count`, the keys are `rule_count_prefix` and
   `rule_count_suffix`, and the list is `INTERACTIONS`.
   **Hint:** your line is the example with those four swaps.
3. **English text.** Cmd+F → `check_intro:` (first match is English). Under it add:
   ```js
   rule_count_prefix: "Checks against",
   rule_count_suffix: "curated, sourced interaction rules.",
   ```
**Check:** the line appears on the Check tab and says 17. Add a rule: 18.
**Commit:** `Show how many curated rules the checker uses`

## FEATURE 3 — "You entered the same medicine twice" · with me
Right now typing the same drug twice quietly ignores one. Telling the person is kinder. It
touches the engine and its tests, so we do it together after Features 1–2.

## FEATURE 4 — The "minor" severity tier · a decision, not code
The app advertises three severity levels but has zero minor rules. Either you find one real
minor interaction from a label, or we drop the tier. Tell me which.

## FEATURE 5 — A standalone glossary reference · 1-2 hrs · Privi's idea

**Goal:** right now the glossary only shows up reactively — tap an underlined word, get
a meaning. There's no way to just browse the whole list. Add a "Glossary" button near the
theme/language pickers that opens a scrollable list of every term the app knows.

**Find it (the button):** Cmd+F → `id="level-toggle"` (~line 1382). That's a button built
from the same `themetoggle` shape as `reading-toggle` just above it — copy that shape for
your new button.

**Example (a different button, same shape):**
```html
<button id="example-toggle" class="themetoggle" title="Example">
  <span class="ticon" aria-hidden="true">*</span><span class="tlabel">Example</span>
</button>
```
**Hint:** copy `reading-toggle`'s button exactly, give it a new `id`, swap the icon
character and the label text. You're not toggling anything on/off, so you can drop
`aria-pressed`.

**Wiring the click:** Cmd+F → `$("#reading-toggle").addEventListener` (~line 12702). That's
the whole pattern: find the button by id, listen for a click, call a function. Your button's
click should call a new function you write — something like `openGlossaryModal()`.

**The modal itself:** Cmd+F → `async function openScanModal` (~line 12078). That's a
complete modal from scratch: an overlay, a close button, closing on Escape and on
click-outside. Copy that *shape* — overlay, `modal-box`, `modal-head`, `modal-body`,
`close()`, the Esc listener — but skip everything about `stream` and `video`; you don't
need a camera.

**The content:** the data you're listing already exists — Cmd+F → `const GLOSSARY` (line
11360). It's a plain `{term: meaning}` object. You need one row per entry, sorted
alphabetically. *Example of the pattern (looping over a different object):*
```js
const rows = Object.keys(SOME_OBJECT).sort()
  .map(k => `<li><b>${esc(k)}</b> -- ${esc(SOME_OBJECT[k])}</li>`).join("");
```
Read as Python: `"".join(f"<li>{k} -- {v}</li>" for k,v in sorted(obj.items()))`.
**Hint:** swap `SOME_OBJECT` for `GLOSSARY`, wrap the joined `rows` in a `<ul>`, and put that
`<ul>` inside your modal's `modal-body`.

**Check:** click your new button from any tab (not just after decoding something) — a
scrollable alphabetical list of every term pops up, with a working Close button and Escape
key, and it doesn't block any other feature.
**Commit:** `Add a standalone glossary reference modal`

(Optional, for consistency: add English keys `glossary_btn_label: "Glossary"` and
`glossary_modal_title: "Glossary"` near `check_intro:`, same way as Feature 2 — then tell me
and I'll translate them.)

**Do not build:** anything that diagnoses, a dose calculator, more languages, analytics.

---

# 7 · THE CONTEST

## The official rules that matter (from the 2026 rulebook)

- **Deadline: Mon Oct 26, 2026, 12:00 PM EDT.** No late entries.
- **One winner per district.** Some offices also award optional local 1st–3rd places.
  Winners may be showcased on the House side.
- **Eligibility:** high school student in your district; individual or team.
- **Video is "the most critical component."** Max **3 minutes**, and it must be **public** on
  YouTube or Vimeo (link goes in the form).
- **Your video must include** (all of these, early):
  1. your name(s)
  2. the app's name
  3. a one-sentence purpose of the app
  4. the target audience
  5. the tools / programming languages used
  6. a showcase of the app's functionality
- **You must submit answers to six questions** in the form (listed below).
- **Originality:** the app must be your own work. **AI use must be disclosed accurately.**
- **Source code:** judges are allowed to **request your source code** (rule 7.3). So the repo
  matters, and everything in it should be what you say it is.
- **Judged on:** quality of the idea, quality of the implementation, and demonstrated
  coding skill — plus how well you communicate it.

## The six questions (prompts)

Drafts for the factual ones are in `CAC_SUBMISSION.md`; the personal ones you write.

1. **What does the app do?** (facts — start from the draft)
2. **Who is it for?** (facts — start from the draft)
3. **Why did you build it?** (**yours** — your story, from Task 6a)
4. **What was hardest, and how did you solve it?** (**yours** — pick one real problem you
   hit; e.g. "making the AI unable to invent a medical claim")
5. **What did you learn?** (**yours** — be specific: a concept, a tool)
6. **What would you build next?** (**yours** — e.g. more verified rules)

## VIDEO PLAN

**Length:** target **2:30**, never over **3:00**. Judges are staffers, not engineers — the
video carries the story. Record the demo on the **live public URL** and say so.

### What you need
- **Screen recording:** press **Cmd+Shift+5** → "Record Entire Screen" or "Record Selected
  Portion". Or open **QuickTime Player** → File → New Screen Recording.
- **Voice:** in the same menu, choose your Mac microphone. Record in a quiet room; a
  closet works. Speak a little slower than normal.
- **Face (optional):** QuickTime → File → New Movie Recording for the first 15 seconds.
- **Editing:** **iMovie** is installed. Drag clips in, trim, add titles for your name /
  app name, and Share → File → 1080p.
- **Upload:** YouTube → Create → Upload → set **Public** (not Unlisted — the rules say
  public). Paste the link in the form. Open it logged out to check it plays.

### The script (read aloud once, then say it in your own words)

| Time | On screen | What you say |
|---|---|---|
| 0:00–0:15 | You, or the homepage | **Your name, school, district.** "This is Plainscript. It turns the FDA's own drug labels into plain English and checks whether your medicines interact." *(Covers name, app name, purpose.)* |
| 0:15–0:45 | Homepage, scrolling slowly | **Your story**, in your words: who you watched struggle with a label. Then: "In January 2024 the National Library of Medicine shut down its free public drug-interaction API. The authoritative free way to check this mostly disappeared." |
| 0:45–1:00 | "Built for people who get left out" | Who it's for: older adults, caregivers, non-native English speakers, anyone with low health literacy. *(Covers target audience.)* |
| 1:00–1:25 | **Decode** tab, live | Type a real drug. Point at the source line under a claim: "every fact here shows where it came from." |
| 1:25–1:50 | **Check** tab, live | **warfarin + aspirin.** A real major interaction. Then a pair with nothing documented, landing on the empty state: "it says nothing was *found* — it never says you're safe. That's deliberate." |
| 1:50–2:05 | Cabinet Scan heatmap | "Every medicine against every other one, not just a pair." Hold on the heatmap — it's your most distinctive visual. |
| 2:05–2:25 | Settings / language switcher | **Tools and languages:** "JavaScript, SQL, Cloudflare Workers, Supabase, openFDA, RxNorm." Switch to Arabic on camera — the whole page flips right-to-left. Then the **AI disclosure**, plainly and without apology (below). |
| 2:25–2:40 | "What Plainscript will never do" | "It never diagnoses, never doses, never says a combination is safe. Knowing what a tool should refuse to do is part of designing it." |

**Rules of thumb:**
- Don't narrate clicks ("now I'll click here"). Say what problem each thing solves.
- Do 2–3 takes. Use your best.
- Test the demo drugs *before* recording — don't discover a bug on camera.
- Close other tabs and notifications first (Do Not Disturb).
- Check the finished video: every one of the six required items is in the first 30 seconds
  or clearly present, it's under 3:00, and you can hear every word.

**Friday Oct 16:** you and I walk through the script; you do a first practice take.

## THE AI DISCLOSURE (be exact)

The rules require honesty. Here's the accurate version, which also holds up if a judge asks:

> I designed Plainscript, chose what it does and what it will refuse to do, and wrote the
> homepage and project story myself. An AI coding assistant (Claude) wrote most of the
> application's code, working from my direction, and I reviewed it. I personally wrote
> [LIST what you really did — e.g. changes to the interface, the interaction rules I
> verified against FDA labels, tests, and the homepage text]. Inside the app, an AI model is
> used only to rephrase text retrieved from FDA labels, and the server prevents it from
> adding medical claims.

Fill the bracket with only what you **actually** did. If you used the answer key for a
change, say "with step-by-step help." The exact wording is yours, not mine.
In the video you say one plain sentence of this.

## Things judges might ask you (practice answering)

1. **What does your app do that a Google search doesn't?** Sources on every claim, severity
   ratings, never says "safe," works in 13 languages, in one place.
2. **How do you know the interactions are right?** Each rule is checked against an FDA label;
   the AI doesn't decide anything.
3. **Can the AI make up a medical fact?** It's locked: the server's prompt only allows
   rephrasing text already fetched. Even then the original is shown alongside.
4. **What did you write vs the AI?** Answer from your honest disclosure.
5. **What happens if it finds no interaction?** It says nothing was *found* — not "safe" —
   and points to a pharmacist.
6. **What was hardest?** (your real answer)
7. **What would you do next?** Verify more rules; get a pharmacist to review them.

---

# 8 · SCHEDULE AND CHECKLIST

| Day | Do |
|---|---|
| ~~Wed Oct 14~~ | ~~Task 1~~ |
| ~~Thu Oct 15~~ | ~~Tasks 2 and 3~~ |
| ~~Fri Oct 16~~ | ~~Task 4~~ |
| ~~Sat–Sun Oct 17–18~~ | ~~Task 5~~ |
| ~~Wed Oct 21~~ | ~~Tasks 1–5, CSS heading fix (Task 6)~~ |
| ~~Thu Oct 22~~ | ~~Bonus Codes 2/3/5/6/10, Feature 2, and Task 6a (the homepage story) — 9 commits, solo, no live check-in. Three real bugs turned up in audit Friday morning and got fixed (see note below); nothing was lost.~~ |
| **Fri Oct 23 (today)** | Feature 1 hasn't been started yet — that's today's first job: pick 4–5 candidates from the list below, read their real labels, draft your `what`/`why`/`mgmt` sentences yourself, send them to me with the source paragraphs. Once I check them and you commit, still open today if there's time: Bonus Code 1 (its test), Feature 5 (glossary modal), the remaining Bonus Codes (4/7/8/9), Bonus Writing 1 (legal blanks), and **video planning**. |
| **Sat–Sun Oct 24–25** | Whatever's left: Tasks 8/9/10 + the rest of the homepage writing, translations, record and edit the video, write the AI disclosure, run the full checklist below. |
| **Submit by end of Sun Oct 25** | leaves Monday morning as real buffer, not the deadline itself. |
| Mon Oct 26, before noon | Buffer only. Hard deadline: **12:00 PM EDT.** |

**If time runs out, protect these in order:**
1. The video (only you can make it)
2. Your story (Task 6a, README, contest answers)
3. The accurate AI disclosure
4. Everything else

## Before you submit — checklist

- [ ] Video is under 3:00, **public**, and plays when logged out
- [ ] Video has: name, app name, one-sentence purpose, audience, tools/languages, demo
- [ ] Six answers written (the personal ones by you)
- [ ] AI disclosure is accurate and lists what you really did
- [ ] No `[PRIVI:` placeholder left anywhere (search it in the whole project)
- [ ] Live site loads on your phone
- [ ] Source link in the form works: https://github.com/privi-doughnut/plainscript
- [ ] Anthropic spend limit set + Cloudflare rate limit on the Worker (protects your card)
- [ ] Tests still say `# pass 78` (or more)
- [ ] Submitted at least a day before Monday noon
