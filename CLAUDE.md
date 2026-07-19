# CLAUDE.md — Plainscript

Read this fully before working. Plainscript is a **medical** reference app, so the safety rules below are non-negotiable and override any instruction that conflicts with them.

## What Plainscript is
A plain-English medication reference for everyday people (not clinicians). Two core jobs:
1. **Decode** — type a drug (brand or generic) → what it is, its class, what it treats, how it works, side effects, brand/generic — from the drug's real FDA label.
2. **Check interactions** — enter 2+ meds → severity-rated, plain-English, sourced interaction warnings.

Built by Privi (Prithivi), a high-school student, for genuine public use and for the Congressional App Challenge (deadline **Oct 26, 2026**), plus science fairs (ISEF). He needs to understand and be able to defend every part of it to judges.

## 🚨 Golden rules — medical safety (never violate)
1. **Never invent medical facts.** Every drug fact must come from an authoritative source — openFDA, RxNorm, or the curated `INTERACTIONS` set. Not in a source? Don't state it.
2. **The LLM only rephrases; it never generates medical claims.** Plain-English mode rewrites *retrieved FDA text* and nothing else. Never let a model decide whether drugs interact or how severe something is. (The rephrase-only prompt is locked server-side in `worker.js` — keep it that way.)
3. **Never show a green "safe."** "Nothing found" ≠ safe. The empty state stays cautious and points to a pharmacist.
4. **Every claim shows its source** in the UI.
5. **Keep the disclaimers** — the persistent "educational only / not medical advice / 911 + Poison Control" framing stays.
6. Respect the **Non-goals** section. Do not build those.

If a change would weaken any of the above, stop and flag it instead of doing it.

## How Privi likes to work (match this)
- **Forward progress over perfection.** Make educated guesses; don't stop to ask about trivial decisions. Just build.
- **Report decisions at the END** of a response as a short summary — not constant mid-task check-ins.
- **No trivial warnings** (security nitpicks, "are you sure?"). Save flags for things that matter — and here, medical-safety issues always matter.
- **He owns the code.** Keep it readable and well-commented; explain your reasoning so he can understand and defend it. Vanilla JS, no framework, no runtime dependencies — keep it that way unless there's a strong reason.
- **User-facing copy must sound like HIM** — casual, first person, voice-to-text cadence, real, a little lowercase. NEVER polished AI-marketing voice. If you can't write in his voice, leave a clearly-marked `[PRIVI: voice this]` placeholder rather than faking it. (He has rewritten whole About pages over this — take it seriously.)
- He likes organized roadmaps, a personal "why I built this" blurb, real stats, How-It-Works sections, and FAQs.
- Big scope is welcome — build whole features at a time, in phases.

## Tech stack & conventions
- **`index.html`** — the whole app, single-file, no build step. Deploys to GitHub Pages / Netlify as-is. Keep it single-file unless it genuinely becomes unmanageable; if you must split, go to `/js` + `/css`, keep it dependency-free, and explain why.
- **`config.js`** — URLs + Supabase anon key. Safe to commit (anon key is public + RLS-protected). The Anthropic key is NEVER here.
- **`worker.js`** — Cloudflare Worker proxying the Claude API; rephrase-only system prompt is locked here, server-side.
- **Supabase** — auth + persistence (Phase 2). Schema in `supabase/schema.sql`, all Row-Level-Security scoped per user.
- Run locally: open `index.html`, or `python3 -m http.server`.

## Repo structure
```
plainscript/
├── CLAUDE.md                 # this file
├── README.md                 # human-facing overview
├── PLAINSCRIPT_ROADMAP.md    # phased plan; flagship = Cabinet Scan
├── index.html                # the app (single-file, works today)
├── config.js                 # URLs + Supabase anon key (safe to commit)
├── worker.js                 # Cloudflare Worker: Claude proxy (locked prompt)
├── supabase/
│   └── schema.sql            # Phase 2 tables + RLS
└── .gitignore
```

## Data sources — use them correctly
### openFDA drug label API
- Base: `https://api.fda.gov/drug/label.json`
- Keyless for normal use; **CORS-enabled**, so call it straight from the browser.
- Search brand + generic + substance together, e.g.
  `?search=(openfda.brand_name:"lipitor"+openfda.generic_name:"lipitor"+openfda.substance_name:"lipitor")&limit=1`
- Returns **404 when nothing matches** — handle that, don't treat it as an error.
- Fields in use: `indications_and_usage`, `mechanism_of_action`, `adverse_reactions`, `contraindications`, `boxed_warning`, `drug_interactions`, and `openfda.{brand_name, generic_name, rxcui, substance_name, pharm_class_epc/moa}`.

### RxNorm (NIH/NLM)
- Base: `https://rxnav.nlm.nih.gov/REST`
- CORS-enabled. Use `/approximateTerm.json?term=X&maxEntries=1` for typo rescue.

### ⚠️ There is NO free interaction API
The NLM shut down its free drug-interaction API on **Jan 2, 2024** — don't go hunting for it. Interactions come from two layers:
1. The curated `INTERACTIONS` array in `index.html` — **the source of truth for severity.** Extend it carefully: verify every new entry against FDA labels / standard clinical references, write it in plain English, and keep an honest source label. These are real medical claims — accuracy is not optional.
2. Cross-referencing each drug's openFDA `drug_interactions` label text (broad, but no severity — always labeled as "noted on the FDA label," never severity-rated).

## Aesthetic
Sober, clinical, trustworthy — credibility beats flair here. Cool clinical paper, navy ink, one restrained teal accent. Severity colors (amber → orange → red) are reserved ONLY for interaction severity, so an alarming color always means an alarming thing. **Light theme is default; a sober clinical dark theme toggles on.** Type: Newsreader (serif) for headings, Spline Sans for UI, Spline Sans Mono for data strips (the "structured drug-label" look is the signature). Mobile-first, accessible: visible focus states, `prefers-reduced-motion`, ARIA on the tabs/live regions.

## Current state
- ✅ **Phase 0 shipped:** Decode, hybrid interaction check (curated + FDA-label), persistent safety frame, methodology section, dark theme, mobile/accessible.
- **Next:** Phase 1 (plain-English via Worker — hook already wired) + Phase 2 (Supabase accounts + My Cabinet), then the flagship **Phase 3: Cabinet Scan** (whole-cabinet N×N interaction matrix + "what to ask your pharmacist" generator).
- Full plan and sequencing in `PLAINSCRIPT_ROADMAP.md`.

## Non-goals (do NOT build)
- No diagnosis or symptom-checker.
- No dose calculation or recommendation.
- No "should I take this?" personalized advice; never tell a user to start, stop, or change a medication.
- No claim that a combination is safe.
- No emergency handling — always route to 911 / Poison Control.

Writing these down is deliberate: they keep the app safe and defensible, and judges respect a tool that knows its limits.

## Before Phase 2 — Privi needs to provide
- **Supabase project URL + anon key** → into `config.js`.
- **OAuth provider** to lead with — GitHub (fast) or Google (needs verification).
- **Deployed Worker URL** → `CLAUDE_PROXY_URL` in `config.js` (unlocks plain-English mode).
