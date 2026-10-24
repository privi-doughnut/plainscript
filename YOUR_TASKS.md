# PLAINSCRIPT — Privi's complete guide

Today is **Fri Oct 23**. **Deadline: Monday Oct 26, 12:00 PM EDT.** 3 days left. You said
you think you can get everything below done today, leaving only the video + submitting for
afterward — that's a realistic plan if Feature 1 goes smoothly this morning.

<details>
<summary>📖 Reference — how this guide works, what Plainscript is, setup (click to expand — you probably don't need this anymore)</summary>

## How this guide works

Every edit has the same five parts: **Goal** (what changes for the user), **Find it** (the
exact text to Cmd+F for), **Example** (a closely-related real pattern already working
somewhere in the file, so you see the shape before you write your own), **Hint** (read only
if stuck), **Check + Commit**.

The real answers are in `ANSWER_KEY.md`. Only open it after being genuinely stuck, and if you
do, say so in the AI disclosure ("with step-by-step help" is true and fine; "alone" would not
be).

## What Plainscript is

**One sentence:** a free web app that turns the FDA's own drug labels into plain English and
checks whether your medicines interact — and it never makes anything up.

**Why it exists:** the National Library of Medicine shut down its free drug-interaction API
in **January 2024**. Plainscript rebuilds a safe version from public sources.

**Who it's for:** older adults, caregivers managing several people's medicines, non-native
English speakers, anyone with low health literacy.

**The four tools:** Decode (type a drug → real FDA label in plain English) · Check (2+ drugs
→ severity-rated interaction warnings) · My Cabinet (save your meds) · Cabinet Scan (every
medicine against every other one). Plus Symptoms: an emergency red-flag list + OTC lookup —
never a diagnosis.

**How it flows:** you type "warfarin" → RxNorm (NIH) fixes spelling and finds the official
drug ID → openFDA returns the real label text → `INTERACTIONS` (36 hand-checked rules in
`index.html`, each with a severity) flags anything documented between your drugs. Claude is
used in exactly one optional place: rephrasing label text that was already fetched, in a
locked, rephrase-only prompt on the server (`worker.js`) — it can't add claims.

**Safety rules (the point — judges respect them):** never invent a medical fact · the AI only
rephrases, never decides if drugs interact · never show a green "safe" — "nothing found" ≠
safe · every claim shows its source · severity colors (amber/orange/red) are reserved for
real severity · never diagnoses, doses, or says start/stop a medicine.

**Severity scale, least to greatest:** `minor` → `moderate` → `major`.

**Files:** `index.html` is the whole app (~15,000 lines). `tests/engine.test.js` is 97
automated checks. `worker.js` is the locked AI proxy. `privacy.html`/`terms.html` are the
legal pages. `README.md` is the public overview. `CAC_SUBMISSION.md` has contest-answer
drafts + the video script.

## Setup — every time you sit down

**A.** Terminal → `cd ~/plainscript-remote`.
**B.** `python3 -m http.server 8899` — leave this running, open a **second tab** (Cmd+T,
`cd ~/plainscript-remote` again) for everything else.
**C.** Chrome → `http://localhost:8899/index.html`. Once per session: Cmd+Option+I →
Application → Service Workers → Unregister, then Cmd+Shift+R.
**D.** Before starting: `node --test tests/*.test.js` (or the full nvm path below if that
errors) — look for `# pass 97` or more (started at 78, grew after Feature 1 + Bonus Code 1).
```sh
/Users/privivijayakumar/.nvm/versions/node/v22.23.1/bin/node --test tests/*.test.js
```
**E.** `open -a "Visual Studio Code" index.html`. Ctrl+G jumps to a line number, Cmd+F finds
text. Don't use the Antigravity editor — its built-in AI would write the code for you.
**F.** One change → Cmd+S → Chrome → Cmd+R → look → re-run tests → still passing?
**G.** Save it:
```sh
git add index.html
git commit -m "describe this specific change"
git push origin main
```
**Made a mess?** `git checkout index.html` undoes everything since your last save — you
cannot break what's already pushed.
**Page blank?** Cmd+Option+I → Console, screenshot the red line, send it to me.

</details>

---

# ✅ ALREADY DONE

**Coding tasks 1–5:** bigger tap targets · rounded 35 half-pixel font sizes · removed 3 dead
translation keys · the glossary-hint note · the 4th "dosing times" stat tile.

**Homepage:** Task 6 (heading-consistency CSS fix) · Task 6a, "The problem" — your cousin's
story, live on the homepage.

**Bonus code:** Bonus 2 (you added **~47** glossary words — way past the ~30 target) · Bonus
3 (last-reviewed date line) · Bonus 5 (tab title changes per tool) · Bonus 6 (remembers your
last tab) · Bonus 10 (live drug-count on Check).

**Bonus Code 4 turned out to already be done** — while prepping today's instructions I
searched the whole file for icon-only buttons missing an `aria-label` and found zero. Every
one (carousel arrows, close buttons, remove buttons) already has one. Nothing for you to do
there; it's just been crossed off.

**Features:** Feature 2 ("Checks against N rules" line) · Feature 5 (the standalone glossary
modal — button, keys, `openGlossaryModal()`, and the click wiring, all four pieces written
and connected by you; verified live with zero console errors) · **Feature 1** — 19 new
interaction rules (17 → 36 total), each individually drafted by you, fact-checked against
real FDA/DailyMed sources and standard clinical references, with corrections made where
your severity judgment or wording didn't match the source. Verified live (warfarin +
amiodarone renders correctly as a Major card).

**⚠️ Not committed yet** — you're away from the Mac with no remote access tonight. The
Feature 1 edit is sitting on disk, safe, waiting for your three `git` lines whenever you're
back or have remote access. Nothing is lost by waiting.

**Bonus Code 1** — done, but written by me rather than you: one existence-check test per
new rule (97 tests total, up from 78), pure mechanical substitution of already-decided drug
names into the existing test pattern, no content or judgment involved. Also uncommitted,
same as Feature 1. Worth a short, honest mention in your disclosure's "what Claude wrote"
side if you want to be extra precise, though the blanket statement already covers it.

**Also fixed today, by me, during review** (noting this here so your AI disclosure stays
accurate — this wasn't your work, it was debugging + polish on top of it):
- 3 real bugs from Thursday's commits: an undefined variable that silently broke the rule-count
  line *and* three unrelated re-renders on every language switch; a wrong element id + a
  variable used before its own declaration in the drug-counter; two misspelled glossary keys
  that could never match real label text.
- The homepage background alternation (your Task 6a story and the carousel were both white,
  back to back) — fixed by changing Task 6a's section to the shaded style.
- A collapsible "Read the full story ↓" treatment on Task 6a so it's not a dense wall of text.
- Expanded the feature carousel from 4 slides to 9 (added barcode scan, 13-language/RTL,
  print/share-a-cabinet, the glossary, and offline-install — all things that genuinely exist).
- A pre-existing quote-escaping bug in one carousel slide's English text (found while
  checking the new slides, not something you touched).

---

# 📋 WHAT'S LEFT

## Writing (no code — your words, your voice)

### TASK 8 — "Where every fact comes from" (marker 8)

**Goal:** show judges you didn't invent anything. Three small cards.

**Find it:** Cmd+F → `[PRIVI - TASK 8]`. Use the shaded skeleton (`class="lp-limits"`) —
same class the section already has, since it sits right after the carousel (white) and
needs to contrast with it:
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
**The facts, in your own words:**
- openFDA = the FDA's real label text. Can't: tell you severity, and some old drugs have no
  label.
- RxNorm = NIH's official drug names; fixes misspellings. Can't: say anything about
  interactions.
- Curated rules = 36 pairs a person checked against FDA labels, each with severity. Can't:
  cover every pair — "nothing found" is not "safe."

**Closely related:** look at the "What Plainscript will never do" section right below this
one (Cmd+F `lp_lim_eyebrow`) — same `lp-limits` + `lp-never` list shape you're copying, just
with different content. Yours comes right before it.
**Commit:** `Write the homepage sources section`

### TASK 9 — "Built for people who get left out" (marker 9)

**Goal:** who this is *for*, in concrete, real features.

**Find it:** Cmd+F → `[PRIVI - TASK 9]`. Use the **white** skeleton this time
(`class="lp-feat"`) — it needs to alternate against Task 8's shaded section right above it:
```html
<section class="lp-feat"><div class="wrap">
  <span class="eyebrow">____</span>
  <h2>____</h2>
  <ul class="lp-never">
    <li><b>____</b> <span>____</span></li>
  </ul>
</div></section>
```
Only claim things that are real — 13 languages incl. right-to-left Arabic, read-aloud/voice
input, offline install, plain words with tappable hard terms, free with no account needed.
**Closely related:** this is the exact same `lp-never` list shape as Task 8 right above it —
copy that structure, swap the content.
**Hint:** open the app and try each feature before you write it down.
**Commit:** `Write the homepage accessibility section`

### TASK 10 — "Who made this" (marker 10)

**Goal:** one paragraph, first person, your voice. A student, a real person.

**Find it:** Cmd+F → `[PRIVI - TASK 10]`. Use the **shaded** skeleton this time
(`class="lp-limits"`) — alternating again from Task 9's white section:
```html
<section class="lp-limits"><div class="wrap">
  <span class="eyebrow">____</span>
  <h2>____</h2>
  <p class="lp-sub">____</p>
</div></section>
```
**Write:** your name, school, district, grade, what you taught yourself building this, what
you'd tell another student. 4–6 sentences.
**Closely related:** you already wrote something in exactly this voice — your Task 6a story,
live on the homepage right now. Same register (first person, plain, a little lowercase), just
much shorter and not about your cousin — about you, right now, as the builder.
**Hint:** you don't have to sound impressive. You have to sound like you.
**Commit:** `Write the who-made-this section`

When 8, 9, 10 are pushed, **tell me** — I translate all three in one pass.

### BONUS WRITING 1 — Fill the two legal blanks · 10 min
`privacy.html` (Cmd+F `PRIVI:`) → replace `[PRIVI: decide contact address]` with a real email
you check (a dedicated project address is smarter than your personal one). `terms.html` →
replace `[PRIVI: your state]` with your U.S. state. Delete the whole
`<span class="placeholder">...</span>`, not just the bracketed text inside it.
**Commit:** `Fill legal page placeholders`

### BONUS WRITING 2 — README "Why I built this" · 20 min
`README.md`, Cmd+F → `## Why I built this`. Replace everything under the heading with 4–6
sentences in your own voice — reuse your Task 6a story's *feeling*, don't paste the text
itself. **Commit:** `Write README why-I-built-this`

### BONUS WRITING 3 — Your contest answers
The submission form asks six questions. Drafts for the factual two are in
`CAC_SUBMISSION.md`. The personal four — why you built it, what was hardest, what you
learned, what you'd build next — write from scratch in a Google Doc first, 80–150 words
each. Send them to me; I'll check them against the contest rules, not rewrite them.

---

## Code — today's priority

### ✅ FEATURE 1 — DONE (uncommitted) — Add real interaction rules

The checker uses 17 hand-written rules. This is the single most useful thing left to do, and
it's reading + writing, not hard code — a JS rule object is just a Python dict with string
keys, and `["drugname"]` is just a one-item Python list.

**Safety rules (non-negotiable):** every rule comes from a real label, never from memory.
Never say a combination is safe. Never tell anyone to start, stop, or change a dose — the
`mgmt` line always ends in some form of "ask a pharmacist or doctor."

**Candidates (well documented, but you verify each) — pick 4–5:**
1. warfarin + amiodarone · 2. warfarin + ciprofloxacin · 3. methotrexate + trimethoprim ·
4. lithium + lisinopril · 5. simvastatin + amiodarone · 6. digoxin + verapamil ·
7. digoxin + clarithromycin · 8. lisinopril + ibuprofen · 9. sertraline + ibuprofen ·
10. tramadol + phenelzine · 11. fluconazole + phenytoin · 12. carbamazepine + warfarin ·
13. phenytoin + warfarin · 14. metformin + topiramate · 15. sildenafil + tamsulosin ·
16. clarithromycin + colchicine · 17. warfarin + itraconazole · 18. methotrexate + omeprazole ·
19. metoprolol + verapamil

**Do this as a batch of 4–5** (not one at a time) — pick that many now, verify and draft each
one fully following the steps below, then send me all the drafts **in one message**, each
with its source paragraph. I check them together, then you commit (one commit per rule, or
all of them in one commit — either's fine).

**How to verify one:** **dailymed.nlm.nih.gov** → search the drug → open its label → find
section **7 · Drug Interactions**. A real label documents interactions with lots of
different drugs at once — ignore everything except the one paragraph naming **your specific
second drug**; that paragraph is your whole source.

Write down what it says and which section. Judge severity from its own words
("contraindicated," "avoid," "monitor closely") against minor < moderate < major. Then write
your `what` / `why` / `mgmt` sentences **yourself, in your own words** — the one part of this
I won't write for you, since it's the content you're submitting as your own work. Send me
your sentences plus the source paragraph before you commit.

**Find it:** Cmd+F → `[PRIVI - FEATURE 1]` — a comment marking exactly where to add your
rule(s), right above the `];` that closes the list.

**Example (made-up shape — not a real rule, don't copy the facts):**
```js
  { a:["drugone"], b:["drugtwo"], severity:"moderate",
    what:{en:"Taking these together can make you more sleepy than usual."},
    why:{en:"Both slow down parts of the brain that control alertness."},
    mgmt:{en:"Ask a pharmacist or doctor before combining them."} },
```
Reading the syntax as Python, this is just:
```python
{"a": ["drugone"], "b": ["drugtwo"], "severity": "moderate",
 "what": {"en": "..."}, "why": {"en": "..."}, "mgmt": {"en": "..."}}
```
— `a`/`b` are one-item lists of lowercase generic names, `severity` is exactly `major`,
`moderate`, or `minor`, and `what`/`why`/`mgmt` are each a dict with one key, `en`, holding
your sentence. The only JS-specific thing is the trailing comma after `},` (every entry in
the list needs one, like a trailing comma in a Python list literal, except JS actually
requires it between items).

**Hint:** read the neighboring rules to copy their tone. Test by typing both drugs in the
Check tab. Run the tests — count should only go up from here, never down.
**Commit (per rule, or for the whole batch):** `Add <drug> + <drug> interaction rule`

### ✅ BONUS CODE 1 — DONE (uncommitted) — Add a test for each rule you added
**Goal:** a test that fails if someone accidentally deletes a rule.
**Find it:** `tests/engine.test.js`, Cmd+F → `[PRIVI - BONUS 1]` — right under the real,
working model test (the warfarin + NSAID one) that does exactly the pattern you need:
```js
  await t.test("the drugone + drugtwo rule is present", () => {
    const found = INTERACTIONS.some((r) =>
      (r.a.includes("drugone") && r.b.includes("drugtwo")) ||
      (r.b.includes("drugone") && r.a.includes("drugtwo")));
    assert.ok(found, "the drugone/drugtwo rule is missing");
  });
```
Copy it under the existing test once per rule you added, swap in your two real drug names
and a matching message. **Hint:** the name between the quotes has to match the name inside
your rule's `a:`/`b:` lists exactly.
**Check:** `node --test tests/*.test.js` → pass count goes up by one per test added.
**Commit:** `Add test for <drug> + <drug> rule`

### ✅ FEATURE 5 — DONE — A standalone glossary reference · Privi's idea

**Goal:** right now the glossary only shows up reactively — tap an underlined word, get a
meaning. Add a "Glossary" button near the theme/language pickers that opens a scrollable
list of every term the app knows.

**The button:** Cmd+F → `[PRIVI - FEATURE 5]` (there are two — one here in the header, by
the theme/language pickers). Copy the `level-toggle` button right above it (same
`themetoggle` class as `reading-toggle`), give it a new `id`, a new icon character, and
label text. You're not toggling anything on/off, so you can drop `aria-pressed`.

**Wiring the click:** Cmd+F → `$("#reading-toggle").addEventListener` — find by id, listen
for a click, call a function you write (e.g. `openGlossaryModal()`).

**The modal itself — closely related real example:** the second `[PRIVI - FEATURE 5]` marker
(Cmd+F it again) sits right after `function applyGlossary` — that's where your new function
goes. Then Cmd+F → `function openCabinetInsights` to read the model: it's short and it's
almost exactly your task already solved for a
different list: it builds an `overlay`, fills a `modal-box` with content built from
**looping over a list and joining the results into one HTML string** (look at how it builds
`bars` from `Object.entries(counts)`), appends the overlay to the page, and wires up
`close()` on Escape and on clicking outside. Copy that whole shape — you don't need anything
about `cabinet`, `meds`, or stat tiles, only the overlay/modal-box/close()/Esc-listener
scaffolding and the "loop over data → build one string of HTML → join()" technique.

**The content:** Cmd+F → `const GLOSSARY` — it's a plain `{term: meaning}` object, exactly
like the `counts` object in `openCabinetInsights` except simpler (no counting, just listing).
```js
const rows = Object.keys(GLOSSARY).sort()
  .map(k => `<li><b>${esc(k)}</b> — ${esc(GLOSSARY[k])}</li>`).join("");
```
Read as Python: `"".join(f"<li>{k} — {v}</li>" for k,v in sorted(glossary.items()))`. Wrap
`rows` in a `<ul>` inside your modal's body.

**Check:** click your new button from any tab — a scrollable alphabetical list of every term
pops up, with a working Close button and Escape key.
**Commit:** `Add a standalone glossary reference modal`
(Optional: add English keys `glossary_btn_label: "Glossary"` and
`glossary_modal_title: "Glossary"` near `check_intro:` — tell me and I'll translate them.)

### BONUS CODE 7 — "/" jumps straight to the Decode search box · 20 min

**Goal:** press `/` anywhere on the page and the Decode search box gets focus — the same
pattern GitHub uses for its search bar.

**Find it:** Cmd+F → `[PRIVI - BONUS 7]` — your new listener goes right there.

**Closely related (the shape, not an exact match):** search `document.addEventListener("keydown"`
elsewhere in the file (mostly inside modals, closing on Escape). They all follow the same
shape: listen on `document`, check `e.key`, act. Yours is the first one that also has to
check *where the keypress happened* before acting — new for this file, but the surrounding
shape (a document-level key listener) is everywhere.

**Step by step:**
1. `document.addEventListener("keydown", e => { ... })` — a function that runs on every
   keypress anywhere on the page, not just inside one input.
2. Inside it: `if (e.key === "/" && ...)`. The second check matters — without it, typing a
   real `/` character while already typing in any text field would hijack the cursor away
   mid-sentence.
3. That second check: `e.target.tagName` tells you what element has focus right now — it's
   the string `"INPUT"` when you're typing in a text box. So: `e.target.tagName !== "INPUT"`.
4. If both are true: `e.preventDefault()` (stops the `/` from actually being typed anywhere)
   then `$("#decode-input").focus()`.

**Full shape, with the blanks already labeled:**
```js
document.addEventListener("keydown", e => {
  if (e.key === "/" && e.target.tagName !== "INPUT"){
    e.preventDefault();
    $("#decode-input").focus();
  }
});
```
That's the whole thing — put it near the other top-level `document.addEventListener` calls
(Cmd+F any of the ones above to find where that neighborhood is).
**Check:** click empty space on the page, press `/` — Decode box focuses. Click into any
text field, type a literal `/` — it types normally, nothing hijacked.
**Commit:** `Add / keyboard shortcut to focus the Decode search box`

### BONUS CODE 8 — A "Copy result" button on Decode · 30 min

**Goal:** let someone copy a drug's plain-English summary to paste into a text or email.

**Find it:** two `[PRIVI - BONUS 8]` markers — one right after `function addReadAloudButton`
(write your new function there), one right after `addReadAloudButton(box);` inside `decode()`
(call your new function there too).

**Closely related — a function that already does almost exactly this:** read
`addReadAloudButton` itself: it creates a button, appends it into the results box, and —
look at the lines building `parts` and joining them into `text` — it already assembles the
*entire* plain-text version of the result. You need that same assembled text; you're just
doing something different with it once you have it.

**The clipboard half — also already used elsewhere (Cmd+F `navigator.clipboard.writeText`,
~line 13471):**
```js
try{
  await navigator.clipboard.writeText(someText);
  btn.textContent = t("share_copied");
  setTimeout(()=>{ btn.textContent = originalLabel; }, 1500);
}catch(e){ /* clipboard blocked — fail quietly */ }
```
**Hint:** write `addCopyButton(box)` — copy `addReadAloudButton`'s button-creation lines and
its `parts`/`text`-building lines verbatim, but on click, instead of starting speech
synthesis, copy `text` to the clipboard and flash the label to "Copied!" using the pattern
above. Call your new function right next to `addReadAloudButton(box)`.
**Check:** decode a drug, click your button, paste (Cmd+V) somewhere — the plain-text
summary appears.
**Commit:** `Add a copy-result button to Decode`

### BONUS CODE 9 — A severity-color legend on the Check tab · 25 min

**Goal:** `major`/`moderate`/`minor` show in amber/orange/red on real results, but nothing
explains the colors until you've already run a check. Add a 3-item legend above the results.

**Closely related — a real result card, not an invented one:** Cmd+F → `class="verdict v-${s}"`
(~line 12554). That's how every real severity card on the Check tab gets its color: a
wrapper `v-major`/`v-moderate`/`v-minor` class controls the colors of anything with class
`pill` inside it (Cmd+F `.lp-limits h2` region or search `.v-major{` to see the CSS rule
itself). You're building a tiny, static version of just that coloring mechanism — no card,
no findings, just the color chip.

**Your legend, built from that same mechanism:**
```html
<span class="v-major"><span class="pill">major</span></span>
<span class="v-moderate"><span class="pill">moderate</span></span>
<span class="v-minor"><span class="pill">minor</span></span>
```
Use the existing `sev_major`/`sev_moderate`/`sev_minor` translation keys for the words
instead of typing them — Cmd+F `sev_major:` to find them — so your legend is already
translated into all 13 languages for free.

**Where it goes:** Cmd+F → `[PRIVI - BONUS 9]` — your three chips go right there. Wrap them
in a flex row: `style="display:flex; gap:10px;"` is enough for something this small.
**Check:** the Check tab shows all three severity colors and words before you've typed
anything.
**Commit:** `Add a severity color legend to the Check tab`

## Decide, don't build yet

**FEATURE 3** — "You entered the same medicine twice." Touches the engine and its tests, so
we do this together, not solo.
**FEATURE 4** — the app advertises a "minor" severity tier with zero minor rules in it.
Either find one real minor interaction from a label, or tell me to drop the tier.

## Backlog — not today

You mentioned wanting the homepage to feel more "alive" — animation beyond the hero. Real
ideas for later, once the core submission is safe: a subtle scroll-reveal fade-in on each
section as it enters view, a number that counts up when the stat tiles first appear, a
slightly more playful hover state on the feature cards. None of this affects judging — it's
pure polish. If there's real time left after Sunday's checklist is clean, tell me and I'll
either build it or walk you through the simplest one (scroll-reveal) as a mini lesson.

**Do not build:** anything that diagnoses, a dose calculator, more languages, analytics.

---

<details>
<summary>🏆 Contest reference — official rules & the six questions (click to expand)</summary>

## The official rules that matter (from the 2026 rulebook)

- **Deadline: Mon Oct 26, 2026, 12:00 PM EDT.** No late entries.
- **One winner per district.** Some offices also award optional local 1st–3rd places.
- **Eligibility:** high school student in your district; individual or team.
- **Video is "the most critical component."** Max **3 minutes**, must be **public** on
  YouTube or Vimeo.
- **Your video must include** (all of these, early): your name(s), the app's name, a
  one-sentence purpose, the target audience, the tools/languages used, a functionality
  showcase.
- **You must submit answers to six questions** in the form (below).
- **Originality:** the app must be your own work. **AI use must be disclosed accurately.**
- **Source code:** judges can **request your source code** (rule 7.3).
- **Judged on:** quality of the idea, quality of the implementation, demonstrated coding
  skill, and how well you communicate it.

## The six questions

Drafts for the factual ones are in `CAC_SUBMISSION.md`; the personal ones you write
(Bonus Writing 3).

1. **What does the app do?** (facts — start from the draft)
2. **Who is it for?** (facts — start from the draft)
3. **Why did you build it?** (**yours** — your story, from Task 6a)
4. **What was hardest, and how did you solve it?** (**yours**)
5. **What did you learn?** (**yours**)
6. **What would you build next?** (**yours**)

</details>

# 🎬 VIDEO, DISCLOSURE & SCHEDULE

## VIDEO PLAN

**Length:** target **2:30**, never over **3:00**. Record the demo on the **live public URL**.

### What you need
- **Screen recording:** Cmd+Shift+5 → "Record Entire Screen" or "Record Selected Portion."
- **Voice:** same menu, your Mac mic. Quiet room. Speak a little slower than normal.
- **Face (optional):** QuickTime → File → New Movie Recording, first 15 seconds.
- **Editing:** iMovie — trim, add title cards, Share → File → 1080p.
- **Upload:** YouTube → Create → Upload → **Public**. Open it logged out to check it plays.

### The script (read aloud once, then say it in your own words)

| Time | On screen | What you say |
|---|---|---|
| 0:00–0:15 | You, or the homepage | Your name, school, district. "This is Plainscript. It turns the FDA's own drug labels into plain English and checks whether your medicines interact." |
| 0:15–0:45 | Homepage, scrolling slowly | Your story, in your words. Then: "In January 2024 the National Library of Medicine shut down its free public drug-interaction API." Optional, if time allows — one sentence on why this isn't just another lookup tool: "What's out there is either built for clinicians, like Epocrates, or doesn't tell you where its answers came from. Plainscript does both — plain English, and every claim is sourced." **This is the first thing to cut if you're running long** — none of the six required video elements depend on it. |
| 0:45–1:00 | "Built for people who get left out" | Who it's for: older adults, caregivers, non-native English speakers, anyone with low health literacy. |
| 1:00–1:25 | **Decode** tab, live | Type a real drug. Point at the source line: "every fact here shows where it came from." |
| 1:25–1:50 | **Check** tab, live | warfarin + aspirin — a real major interaction. Then an undocumented pair, landing on the empty state: "it says nothing was *found* — never that you're safe." |
| 1:50–2:05 | Cabinet Scan heatmap | "Every medicine against every other one, not just a pair." |
| 2:05–2:25 | Settings / language switcher | Tools and languages: "JavaScript, SQL, Cloudflare Workers, Supabase, openFDA, RxNorm." Switch to Arabic on camera. Then the AI disclosure, plainly. |
| 2:25–2:40 | "What Plainscript will never do" | "It never diagnoses, never doses, never says a combination is safe." |

**Rules of thumb:** don't narrate clicks, say what problem each thing solves · 2–3 takes,
use your best · test demo drugs before recording · Do Not Disturb on.

### Full script — read-through reference, not a script to recite word-for-word

Fill in `[your name]` / `[grade]` / `[school]` / `[district]` — I don't have those. ~420
words ≈ 2:30–2:50 spoken.

> Hi, I'm [your name], a [grade]-grader at [school] in [district]. This is Plainscript — it
> turns the FDA's own drug labels into plain English, and checks whether your medicines
> interact.
>
> I've been obsessed with pill bottle labels since I could read — I used to try to decode my
> parents' medicine bottles just to figure out what they did. It bothered me that I never
> could. It bothered me a lot more when my cousin died from complications with his
> medication — he was prescribed blood thinners and was never told how they'd interact with
> what else he was taking. When I found out the National Library of Medicine shut down its
> free drug-interaction API back in January 2024, I realized the honest, free way to check
> this had basically disappeared. What's out there instead is either built for clinicians,
> like Epocrates, or it doesn't tell you where its answer came from. Plainscript does both —
> plain English, and every claim is sourced.
>
> It's built for people clinical language leaves behind — older adults juggling several
> prescriptions, caregivers managing medicine for someone else, non-native English speakers,
> anyone with limited health literacy.
>
> *(Decode tab, live)* Here's Decode. I'll type a real drug... and it pulls the actual FDA
> label and explains it in plain English — what it treats, how it works, side effects — and
> every fact shows exactly where it came from.
>
> *(Check tab, live)* Here's Check. Warfarin and aspirin — a real, documented major
> interaction, severity-rated, sourced. Now a pair with nothing documented... it says nothing
> was found. It never says you're safe. That's deliberate.
>
> *(Cabinet Scan)* This is Cabinet Scan — every medicine in your list checked against every
> other one at once, not just a pair, shown as a heatmap.
>
> I built this with JavaScript, SQL, Cloudflare Workers, Supabase, and the openFDA and
> RxNorm APIs. *(switch language to Arabic)* It also works in thirteen languages — watch what
> happens when I switch to Arabic... the entire layout flips right-to-left.
>
> One more thing, honestly: I built this with a lot of help from an AI coding assistant. It
> wrote most of the code. But every decision about what this app does and doesn't do — that's
> mine. *(point to "What Plainscript will never do")* It never diagnoses, never recommends a
> dose, never tells you to start or stop a medicine, and it never says a combination is safe.
> Knowing what a tool should refuse to do is part of designing it.
>
> That's Plainscript. Thanks for watching.

## THE AI DISCLOSURE (be exact)

> I designed Plainscript, chose what it does and what it will refuse to do, and wrote the
> homepage and project story myself. An AI coding assistant (Claude) wrote most of the
> application's code, working from my direction, and I reviewed it. I personally wrote
> [LIST what you really did]. Inside the app, an AI model is used only to rephrase text
> retrieved from FDA labels, and the server prevents it from adding medical claims.

Fill the bracket with only what you **actually** did. The exact wording is yours.

**This now also lives on the site itself** — `ai-disclosure.html`, linked in the footer next
to Privacy/Terms, same visual theme as both. I drafted its content from the real commit
history; review it (Cmd+F `[PRIVI:` finds the one line only you can write) before it counts
as final. It's a good thing to point the camera at in the video, and a good link to have
ready if a judge asks "what did you write."

## Things judges might ask (practice answering)

1. What does your app do that a Google search doesn't? — sources on every claim, severity
   ratings, never says "safe," 13 languages, one place.
2. How do you know the interactions are right? — each rule checked against an FDA label; the
   AI doesn't decide anything.
3. Can the AI make up a medical fact? — locked server prompt, rephrase-only.
4. What did you write vs the AI? — your honest disclosure.
5. What happens if it finds no interaction? — "nothing found," never "safe."
6. What was hardest? / What would you do next? — your real answers.

---

## SCHEDULE AND CHECKLIST

| Day | Do |
|---|---|
| **Fri Oct 23 (today)** | ✅ Feature 1 (19 rules, verified) and Bonus Code 1 both done — not yet committed, waiting until you're back at the Mac. Whatever else you got to tonight: Bonus Codes 7/8/9, Bonus Writing 1, Tasks 8/9/10. |
| **Sat Oct 24 — target submit day** | Record and edit the video (your stated real bottleneck), finish any writing tasks left over, answer the two remaining contest questions out loud to me, final AI disclosure. I drive the actual submission once the video's ready — see the note below. |
| Sun Oct 25 | Buffer if Saturday slips. |
| Mon Oct 26, before noon | Hard deadline: **12:00 PM EDT.** Do not treat this as the target — it's the wall. |

**On submitting:** you asked me to handle the actual submission. I will — but I need the
real submission form link from you first (I won't guess a government/contest URL), and
once the video + answers are ready, I'll show you the exact filled-out form before I click
anything, since it's a one-shot, no-late-entries, name-and-school-attached government
submission. Same for YouTube: I can drive the upload, but I'll confirm with you at the
moment it goes **public**, not before.

**If time runs out, protect these in order:** the video → your story (6a/8/9/10, README,
contest answers) → the accurate AI disclosure → everything else.

### Before you submit

- [ ] Video is under 3:00, **public**, plays when logged out
- [ ] Video has: name, app name, one-sentence purpose, audience, tools/languages, demo
- [ ] Six answers written (the personal ones by you)
- [ ] AI disclosure is accurate
- [ ] No `[PRIVI:` placeholder left anywhere
- [ ] Live site loads on your phone
- [ ] Source link works: https://github.com/privi-doughnut/plainscript
- [ ] Anthropic spend limit set + Cloudflare rate limit on the Worker
- [ ] Tests still say `# pass 97` (or more)
- [ ] Submitted at least a day before Monday noon
