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

[PRIVI: 2–3 sentences on the personal spark — who you saw struggle with a
label, or the moment you realized this was worth building. This is the part
judges remember. Keep it real and specific.]

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
[PRIVI: pick 2–3 real ones in your own words. Strong candidates from the build:]
- Designing an AI feature that is *useful* but *cannot* fabricate medical
  claims — the two-condition verbatim guardrail on "Ask the label."
- Handling the loss of a free interaction API by building and reviewing a
  curated interaction set responsibly.
- Making one interface genuinely usable across 13 languages, right-to-left
  layouts, and low-literacy users.
- [PRIVI: what was hardest for *you*, and what you'd do differently.]

## What's next
Google sign-in, a demo video, and continued security hardening; the framework
is built so new languages and features are additive, not rewrites.

## Links
- Live app: https://plainscript.its-the-prithivi-show.workers.dev/
- Source: https://github.com/privi-doughnut/plainscript
- Demo video: [PRIVI: add link]
