# Plainscript — Congressional App Challenge submission draft

*Draft technical + narrative write-up. Adapt to the official CAC form fields.
Sections marked `[PRIVI: …]` need your own voice — don't ship the placeholder.
Not part of the public site (excluded via `.assetsignore`).*

---

## One-liner
Plainscript turns confusing medication labels into plain language anyone can
understand — and checks whether your medicines interact — using only
authoritative FDA and NIH data, never invented medical claims.

## The problem
Prescription and over-the-counter drug labels are written for clinicians, not
patients. People routinely take medications without really understanding what
they do, what the side effects are, or whether two of them are dangerous
together — and the free, official tools to check that mostly disappeared when
the U.S. National Library of Medicine shut down its public drug-interaction API
in January 2024. The people most affected are exactly those least served by
clinical jargon: older adults, caregivers managing several people's medicines,
non-native English speakers, and anyone with limited health literacy.

My cousin died from a medication interaction nobody ever warned him about. He
was on blood thinners and had no idea how they'd interact with everything
else he was taking, and a small cut turned fatal because of it. That's the
moment this stopped being a coding idea and became something I had to
actually finish.

## What Plainscript does
- **Decode** — type any drug (brand or generic) and get a plain-English
  breakdown from its real FDA label: what it treats, how it works, side
  effects, warnings, and the full label details — laid out as scannable bullets
  instead of walls of text.
- **Check interactions** — enter two or more medicines and get severity-rated,
  plain-English, *sourced* interaction warnings.
- **My Cabinet** — save the medicines you actually take (private, per-account),
  add personal notes and dosing times, manage medicines for more than one
  person, and re-scan the whole cabinet for interactions at once — shown as a
  visual severity heatmap.
- **Symptoms** — an emergency red-flag checklist plus a guide from everyday
  symptoms to the common over-the-counter category (never a diagnosis), with
  plain-language "what is this?" explanations for unfamiliar terms.
- **Accessibility & reach** — 13 languages (including right-to-left Arabic),
  a low-literacy pictogram mode, read-aloud, an easy-read mode, and it installs
  as an app and works offline.

## How it works (and why you can trust it)
Every fact comes from an authoritative source, shown with its provenance:
- **openFDA drug label API** — the real approved label for each drug.
- **NIH/NLM RxNorm** — name resolution and typo rescue.
- **A hand-curated, clinically-reviewed interaction set** — the source of truth
  for interaction *severity*, since no free comprehensive API exists anymore.

The one place AI is used is deliberately constrained: an optional
"plain-English mode" that **only rephrases retrieved FDA text** — it can never
generate a new medical claim. That rule is enforced server-side in a locked
Cloudflare Worker. The "Ask the label" feature goes further: it answers
questions using *only* verbatim sentences from the label, verified
word-for-word on the client before display, with a "not AI-written" badge — so
nothing on screen is ever invented.

**Deliberate safety limits:** Plainscript never diagnoses, never calculates or
recommends a dose, never says a combination is "safe" (it shows a cautious
"nothing found ≠ safe" instead), and always routes emergencies to 911 / Poison
Control. Knowing what a tool should *refuse* to do is part of the design.

## Tech stack
- **Frontend:** a single self-contained `index.html` — vanilla JavaScript, no
  framework, no build step, no runtime dependencies. Deploys as one file.
- **Backend/data:** openFDA + RxNorm (keyless, called from the browser);
  Supabase (Postgres) for accounts + saved cabinet, with row-level security so
  a user can only ever see their own data; a Cloudflare Worker proxy for the
  safety-locked plain-English mode.
- **Hosting:** Cloudflare (static site + Worker); installable PWA with an
  offline service worker.

## Challenges & what I learned
- Designing an AI feature that is *useful* but *cannot* fabricate medical
  claims — the two-condition verbatim guardrail on "Ask the label."
- Handling the loss of a free interaction API by building and reviewing a
  curated interaction set responsibly.
- Making one interface genuinely usable across 13 languages, right-to-left
  layouts, and low-literacy users.
- The hardest part for me personally wasn't any of that, it was just learning
  JavaScript well enough to actually direct this project instead of only
  reviewing it. I came in as a Python coder, and functions especially never
  clicked for me until I was forced to use them constantly here. If I did it
  again, I'd start the translation work earlier instead of leaving most of it
  for the final few days, which is exactly when a judge reviewing the project
  found real gaps in it that I had to scramble to fix.

## What's next
Google sign-in, a demo video, and continued security hardening; the framework
is built so new languages and features are additive, not rewrites.

## Links
- Live app: https://plainscript.its-the-prithivi-show.workers.dev/
- Source: https://github.com/privi-doughnut/plainscript
- Demo video: [PRIVI: add link]

---
---

# Demo video script

The 2026 rulebook calls the video **"the most critical component"** of the submission,
and judges are congressional staffers rather than engineers — so the video carries the
story and the repo carries the depth. Target **2:30**, hard cap 3:00.

Record the demo on the **live public URL** and say so out loud. Almost nothing in the
published record of past winners suggests competitors do this, and judges are entitled
to verify a working app.

| Time | On screen | What you say |
|---|---|---|
| 0:00–0:15 | You, or the homepage | Your name, school, district. "This is Plainscript. It turns the FDA's own drug labels into plain English and checks whether your medicines interact." *Gets three required elements done immediately.* |
| 0:15–0:45 | Homepage, scrolling slowly | **"My cousin died from a medication interaction nobody ever told him about. He was on blood thinners and didn't know how they'd interact with what else he was taking."** Then the structural fact: "In January 2024 the National Library of Medicine shut down its free public drug-interaction API. The authoritative free way to check this mostly disappeared." |
| 0:45–1:00 | "Built for people who get left out" section | Who it's for, explicitly: older adults, caregivers managing several people's medicines, non-native English speakers, anyone with low health literacy. |
| 1:00–1:25 | Decode tab, live | Type a real drug. Point at the source line under a claim: "every fact here shows where it came from." |
| 1:25–1:50 | Check tab, live | **warfarin + aspirin.** Real major interaction. Then do a pair with nothing documented and land on the empty state: "it says nothing was *found* — it never says you're safe. That's deliberate." |
| 1:50–2:05 | Cabinet Scan heatmap | "Every medicine against every other one, not just a pair." The heatmap is your most distinctive visual — hold on it. |
| 2:05–2:25 | Settings / language switcher | Tools and languages (required): JavaScript, SQL, Cloudflare Workers, Supabase/Postgres, openFDA and RxNorm. Switch the language to Arabic on camera — the whole UI flips right-to-left. Then **the AI disclosure, plainly and without apology** (see below). |
| 2:25–2:40 | "What Plainscript will never do" | Close on the refusals. "It never diagnoses, never doses, never says a combination is safe. Knowing what a tool should refuse to do is part of designing it." |

**Do not** narrate the UI ("now I'll click here"). Judges watch dozens of videos that do
that. Say what problem each thing solves.

---

# AI-usage disclosure

The 2026 rules permit AI assistance but require it be **fully disclosed**, that it **not
constitute the entirety of the technical development**, and that you **demonstrate
significant individual contributions and technical understanding.** The repo contains
`CLAUDE.md` and commits co-authored by Claude, and judges may read the source — so this
has to be accurate. Disclosed plainly it is a non-issue and reads as maturity. Discovered
undisclosed, it is disqualifying.

**Draft — edit so every sentence is true of how you actually worked:**

> I built Plainscript with substantial help from an AI coding assistant (Claude), and I
> want to be straightforward about what that means.
>
> I designed the project and made every product and safety decision in it. The rules
> Plainscript follows are mine: that it never diagnoses, never calculates a dose, never
> tells anyone to start or stop a medicine, and never shows a green "safe" — only that
> nothing was found. When I was offered a full symptom-checker feature I turned it down,
> because a tool that guesses what's wrong with you is exactly what I didn't want to
> build. Those constraints are the core of the project and they came from me.
>
> The AI wrote a large share of the code, particularly the interaction engine and the
> database security model. I directed that work, reviewed it, and can explain how it
> works. What I actually wrote myself: the homepage's story about my cousin, around
> fifty glossary terms I checked against MedlinePlus one by one, several entries in the
> drug-interaction list I personally verified against the real FDA label, and a handful
> of interface features — things like the rule-counter and remembering your last tab.
>
> I also asked for the parts that could hurt someone to be tested, and they are: the
> functions that decide whether two medicines interact have 102 automated tests, which is
> in the repository and which I can walk through.
>
> Honestly, the thing that stuck with me most building this: a missing answer and a safe
> answer can look exactly the same if you're not careful — my app almost showed that for
> Tylenol and Vicodin together, because the FDA doesn't even have a label for Vicodin
> anymore. Catching that bug taught me more about what "I don't know" is supposed to mean
> than anything else in this whole project.

**Why this version is strong:** it leads with the decisions that are genuinely yours,
is specific rather than vague, and volunteers the test suite as evidence of engineering
judgement. Vagueness is what reads as hiding something. Do not soften "the AI wrote a
large share of the code" — that sentence is what makes the rest credible.

---

# Written answers — prep notes

**Check the exact question wording on the submission form before writing final answers;
these are prep notes, not verified form fields.** The themes below are what the rulebook
and past winners indicate you'll be asked.

**Why you built it** — your story, then the Jan 2024 API shutdown. Not statistics.
Every winner I researched led with a personal anecdote; none led with numbers.

**What it does** — Decode, Check, Cabinet Scan, Symptoms. One sentence each. Do not
inflate: the restraint is the differentiator.

**Hardest technical problem** — strong candidates, pick one you can defend in depth:
- Designing an AI feature that is useful but *cannot* fabricate a medical claim: the
  "Ask the label" answer is checked word-for-word against the source label on the client
  before it is allowed on screen.
- Losing the free interaction API and having to build and verify a curated set instead.
- Making one interface genuinely work across 13 languages and right-to-left layouts.
- A real bug: a failed FDA lookup used to look identical to "we checked and found
  nothing" — in a medication tool that is a safety bug, not a styling one.

**What you'd do differently** — Start the translation work earlier. A lot of the
13-language work got left for the last few days of the deadline, and a judge
reviewing the project found real gaps in it that I had to scramble to fix. I'd
also lean into JavaScript sooner instead of treating it like a detour from
Python — functions didn't click for me until I had no choice but to use them
constantly.

**Who it's for** — older adults, caregivers managing several people's medicines,
non-native English speakers, people with low health literacy.
