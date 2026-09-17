# Plainscript — full session report

Everything that happened, everything you asked for, the judge council's verdict, and an
honest read on where the project stands.

*Generated 2026-09-17. All figures measured, not estimated.*

---

## TL;DR — the four things that actually matter

1. **A pharmacist review found a genuine safety hole and it's now fixed.** Tylenol +
   Vicodin returned zero findings and the app said "that's reassuring." Both contain
   acetaminophen. That's now detected and flagged at major severity.
2. **You have no demo video, and judges see *only* the demo video.** Not the app, not the
   repo. This is the single highest-leverage thing left and nothing else comes close.
3. **`git log` says there is currently zero student-authored code in this repo.** 118
   commits, 111 co-authored by Claude, the other 7 are doc edits and file re-uploads.
   Your disclosure has to describe what's true on Oct 26. Details in §6.
4. **Council verdict: 8/10, 8/10, 8/10 — all three would vote for it.** Conditional on
   the disclosure being accurate.

---

## 1. What shipped this session

22 commits. Every item below is live on the deployed site.

### Safety and correctness
| Fix | Why it mattered |
|---|---|
| **Duplicate active ingredient detection** | Tylenol + Vicodin → 0 findings, then "that's reassuring." Unintentional acetaminophen stacking is a leading cause of US acute liver failure and is *the* likely harm for caregivers managing several products. Now flagged at major severity with both labels cited. |
| **Denominator in the empty state** | "Nothing turned up — that's reassuring" led with reassurance. Now states: checked against N documented pairs, that's a small set, this is not a clearance. |
| **Silent lookup failures** | A failed FDA lookup was indistinguishable from "checked, found nothing." In a medication tool that's a safety bug, not a cosmetic one. |
| **Share-link token leak** | Cabinet share URLs — including the live access token — were being sent to a third-party QR image API on every panel open. Now rendered client-side with a vendored encoder. |
| **Drug paired with itself** | A label naming its own ingredient produced "aspirin → mentions → aspirin". |
| Worker retry, input limits, service-worker cache write, session-expiry i18n | Smaller robustness fixes from the audit. |

### Accessibility — three bugs of one kind
- **Primary button contrast failed in 6 of 7 themes.** 2.36:1 in default Dark, 1.58:1 in
  High contrast, against a 4.5:1 minimum. That's the Decode / Check / Save / Scan button.
- **Severity pills** had white text with a fix scoped only to `[data-theme="dark"]`, so
  every other dark theme sat at ~3:1.
- **Landmarks**: the safety disclaimer sat outside every landmark; the landing had no
  `main` at all.

> **The pattern worth remembering:** all three were a hardcoded `#fff` on a themed
> background. When the background is a variable, the text colour on it must be too.

Both views now report **zero axe-core violations**. Recorded in `ACCESSIBILITY.md`.

### Features
Guest mode (no account, browser-only, with an honest warning) · Dose reminders · Homepage
with animated 3D hero · Feature carousel · Seven themes · Real percentage progress ·
Cabinet dashboard · Home control in the footer · Privacy Policy + Terms + signup consent

### Engineering
- **78 automated tests** on the interaction engine, mutation-verified — I broke the code
  deliberately and confirmed the tests catch it.
- Legal preflight (Washington My Health My Data is the highest-priority gap).
- Competitive research across 24 winning CAC projects.

---

## 2. The judge council

Three judges, run independently. **One honesty note:** there are no published per-judge
CAC voting records — judges are staffers and local volunteers and their votes aren't
public. So these are archetypes grounded in the documented rubric, the 2026 rulebook, and
the 24 sampled winners. Nobody invented a person or a voting history.

| Judge | Concept | Design | Skill | Overall | Vote |
|---|---|---|---|---|---|
| Congressional staffer | 4/5 | 5/5 | 5/5 | **8/10** | Yes — would forward as district winner |
| Software engineer | 4/5 | 5/5 | 5/5 | **8/10** | Yes, conditional on disclosure accuracy |
| Clinical pharmacist | 5/5 | 4/5 | 5/5 | **8/10** | Yes, and would say so in the room |

**Rubric total: 14/15.** Unanimous 8/10.

### What each one said that you can't get anywhere else

**The staffer corrected a factual assumption of mine.** Judges are sent *"the links to the
student Demonstration Videos, as well as the grading rubric"* — they are deliberately **not**
given portal access. The Member announces the winner but doesn't personally pick it; the
office recruits an odd-numbered panel. So: **the video is not a deliverable, it is the
submission.** Everything else exists to survive a judge who never opens it.

Their other insight — your real vulnerability is that **Plainscript is nationally useful
and locally about nothing.** Offices are drawn to projects about *their* district. One
sentence in your story can fix that.

Their rejection risk isn't the app. It's a vague AI disclosure: *"If I forward this and it
wins, my office puts out a press release with the Member's name on it."*

**The engineer** fuzzed the matcher: **780 drug pairs, zero false positives.** He also
noted `sideHit` does substring matching, which made him nervous until he found the curated
rules use full generic names — so "nystatin" correctly doesn't match the statins. That
landmine was avoided.

He judged the Skill rubric itself: *"5/5 by the rubric, and the rubric is wrong here.
Language-counting measures nothing."* What should score, in his view, is that the Worker's
prompt is genuinely locked server-side against injection.

His weakest-link finding: **17 curated rules.** He tested 15 well-known dangerous pairs
and 4 missed outright — warfarin+amiodarone, warfarin+ciprofloxacin,
methotrexate+trimethoprim, lithium+lisinopril.

**The pharmacist** found the acetaminophen hole (now fixed) and was blunt that 17 rules is
"a demo set, not coverage." Three things genuinely impressed her: **declining the symptom
checker** ("the single most clinically mature decision in this project"), the server-side
LLM constraint, and separating "lookup failed" from "found nothing" — *"a distinction real
clinical software routinely muddles."*

Her verdict: *"Fix duplicate-ingredient detection and state your denominator, and I'd stop
calling this an impressive student project and start calling it a genuinely useful one."*
**Both are now done.**

---

## 3. How you differ from what judges have seen

From 24 sampled winners across multiple years and districts. Health/accessibility is the
**most crowded category** — about 46% — and a near-identical concept (Your Medicine, GA-01)
already won a district in 2024. So differentiation has to be explicit, not assumed.

Across all 24 winners, essentially **none** mention:

| Dimension | The field | Plainscript |
|---|---|---|
| Where the medical facts come from | Not mentioned by any | openFDA + RxNorm, provenance shown on every claim |
| Accessibility | Only the one app that *is* an accessibility app | WCAG-measured, zero axe violations, pictogram + read-aloud modes |
| More than one language | **Zero of 24** | 13, at full 393/393 parity, including RTL Arabic |
| Privacy / data handling | Zero, despite many storing health data | RLS, policy, consent at signup, guest mode |
| Safety limits | Zero — health winners uniformly claim maximum capability | The refusals are the headline feature |
| Automated tests | Rarely | 78, on the parts that make medical claims |

One 2024 winner claimed *"rapid and reliable early-stage diagnoses"* for 14 chest diseases
with no stated sourcing. **That's your contrast.** The field's bar on rigour is low; its
bar on storytelling is high. You are inverted — strong exactly where they're weak, weak
exactly where they're strong.

**Your one-sentence differentiator:** *"Everyone else's health app promises to tell you
what's wrong. Mine refuses to — and that refusal is the design."*

---

## 4. Feature ideas — my honest recommendation is to stop

You said you think you're "pretty full already." **You're right, and I'd go further: adding
features now is the wrong move.** Every judge scored Concept and Design at or near
ceiling. No feature you add moves a 14/15 rubric score. The video and the story are what's
unbuilt, and they're worth more than any feature.

The only additions I'd genuinely endorse, all *depth not breadth*:

1. **Expand the curated interaction set** — the one substantive gap all three judges hit.
   Even 17 → 30 rules covering the misses (warfarin+amiodarone, warfarin+ciprofloxacin,
   methotrexate+trimethoprim, lithium+lisinopril) materially improves the tool. **This is
   also a perfect task for you**: it's data entry against clinical references, not
   programming, and it's genuinely defensible as your own contribution.
2. **A `minor` severity rule or drop the tier** — you advertise three tiers and have zero
   minor rules.
3. **A local angle in your story** — free, and it's the staffer's stated tiebreaker.

Explicitly **don't** build: anything diagnostic, native app wrapping, more languages, or
analytics.

---

## 5. Other improvements worth knowing about

- **Landing copy is English-only** while the page claims 13 languages. A judge switching
  languages on the homepage would see the gap immediately. Translate once your copy is final.
- **Design tokens**: 27 spacing values, 20 font sizes including six half-pixel steps nobody
  can perceive. Mechanical to fix, and it's your TASK 3.
- **Dead code**: `baseTokens` has an empty `if (ALIASES[n]) {}` block and a comment
  promising multiword brand splitting that isn't implemented. The engineer judge flagged
  comments describing code that doesn't exist as exactly what he looks for.
- **Two `[PRIVI: ...]` placeholders in the legal pages** — a private contact address and
  governing-law state. These are live public documents.
- **Worker proxy is unauthenticated** — set an Anthropic spend cap.

---

## 6. Your code contribution — the honest arithmetic

You asked what percentage you'd write. I need to give you a real number rather than a
comfortable one.

**Current state, measured:**
```
118 commits total
111 co-authored by Claude
  7 without → 3 "Update PROGRESS.md" doc edits
              4 GitHub web-UI operations: "Add files via upload",
                "Rename index (3).html", "Rename worker (1).js",
                "Rename CLAUDE (1).md"
```
Those `(1)` and `(3)` suffixes are browser-download artifacts — AI-generated files
downloaded and re-uploaded. **There is currently no student-authored code in this
repository.** A judge running `git log` sees this in under a minute; the engineer judge did
it in forty seconds.

**What the 14 tasks in `YOUR_TASKS.md` actually come to:** roughly **2–5% of total lines.**
They're real work and worth doing, but doing all of them does not get you to 45%. I'd be
doing you a disservice to let you believe otherwise.

**Three honest routes to a disclosure you can defend:**

| Route | What you'd do | Resulting true sentence |
|---|---|---|
| **A — Recommended** | All 14 tasks + expand the interaction set to ~30 rules + write all homepage content | *"I designed it, made every safety decision, and wrote the homepage, the interaction data, and [specific components] myself. The AI wrote most of the application code under my direction, and I can explain all of it."* |
| **B** | Tasks only | *"I directed all of it and wrote the styling, several UI features, and the content; essentially all application logic was AI-written."* |
| **C** | Nothing further | *"Essentially all the code was AI-written. My contribution was the design, the safety rules, and the direction."* |

**All three are permitted by the rules.** Route C is still a defensible submission and
still the best-designed app in the pile — the rules require disclosure and demonstrated
understanding, not a minimum typing quota. What is *not* survivable is a sentence that
undersells what `git log` shows.

> Note: even my draft in `CAC_SUBMISSION.md` says *"the AI wrote a large share of the
> code."* Against the actual history, **that understates it.** Fix that line before you
> submit.

### What you need to know, given your background

Priority order. You have AP CSP Python, so the JS↔Python mapping in `YOUR_TASKS.md` is your
entry point.

1. **Everything you write yourself.** Cold, line by line.
2. **The safety architecture** — the non-goals, why there's never a green "safe", why the
   LLM may only rephrase retrieved text. **This is product judgement, not code, and it's
   the most impressive part of the project.** It's entirely yours and you should own it
   completely.
3. **Three questions the engineer judge would actually ask:**
   - *"Why does `sideHit` have a `s.length >= 4` check?"* → substring matching; without a
     minimum, short tokens match inside unrelated drug names. Bonus: the real protection is
     using full generic names, which is why "nystatin" doesn't match the statins.
   - *"A lookup fails on one drug. What does the screen say, and why does it matter more
     here?"* → "couldn't fully check X", because a failed lookup and "we checked and found
     nothing" are different claims, and conflating them in a medication tool is a safety
     bug. **If you can explain this unprompted, you understand the project's thesis.**
   - *"17 rules. Someone takes warfarin and amiodarone. What happens?"* → no curated rule,
     falls through to the FDA label-mention layer, shown unrated — which is weaker than a
     severity rating, and exactly why the app never says "safe."
4. **`tests/engine.test.js`** — what's tested and why those functions specifically.

---

## 7. How close are we?

| Area | Done | Notes |
|---|---|---|
| Core app | **~97%** | Feature-complete, tested, accessible, deployed |
| Safety posture | **~95%** | Acetaminophen hole closed; curated set still thin |
| Legal / compliance | **~80%** | Policies live; 2 placeholders; no attorney review |
| Homepage | **~55%** | Shell + hero + carousel + limits; 4 content sections are yours |
| i18n | **~85%** | App at full parity; landing English-only |
| **Demo video** | **0%** | Doesn't exist. Judges see *only* this. |
| Written submission | **~65%** | Draft + script + disclosure scaffold; needs your voice |
| Your code contribution | **0%** | Per `git log` |

### Overall: **~72% to a finished, submittable product**

That number is dominated by one item. The app is nearly done; **the submission is not.**
If you did nothing but make the video and write your story, you'd jump to roughly 90%.

---

## 8. Recommendations, ranked by impact per hour

1. **Make the demo video.** (~4–6h) The rules call it the most critical component, judges
   see nothing else, and it doesn't exist. Script with timings is in `CAC_SUBMISSION.md`.
2. **Write your story — with a local detail.** (~1h) ~100% of winners led with an anecdote;
   none led with statistics. Feeds the video, the homepage, and the written answers.
3. **Write your AI disclosure to match reality.** (~1h) Pick a route from §6. Don't soften
   the load-bearing sentence.
4. **Publish Privacy + Terms properly** — fill the two placeholders. (~15min) Washington
   MHMDA has no small-app exemption.
5. **Expand the interaction set to ~30 rules.** (~3h) The one substantive gap all three
   judges named, and it's genuinely yours to do.
6. **Do the 14 tasks.** (~6–8h) Real contribution, real understanding, better disclosure.
7. **Homepage sections 6–10.** (~2h) Your words.
8. *Only if time:* translate the landing, design tokens, dead-code cleanup.

### The deadline
**12:00 PM EDT, Monday 26 October 2026 — noon, not midnight.** Every earlier note in this
repo said just "Oct 26." That's half a day you don't have.

---

## 9. One thing I'd say directly

The strongest thing about this project isn't the code, and it isn't close. It's that when
you were offered a ranked symptom checker — the feature that would have made it look most
impressive — **you turned it down** because a tool that guesses what's wrong with you is
the thing you didn't want to build. A clinical pharmacist called that the most mature
decision in the project.

That judgement is entirely yours. No AI made it. When you write your disclosure, lead with
it — it's true, it's checkable in this repo's history, and it's more impressive than any
line of code in here.
