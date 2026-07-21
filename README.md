# Plainscript

A plain-English medication reference. Decode what a drug actually is, and check whether your medications interact — in language a normal person understands, sourced from FDA and NIH data, and honest about what it doesn't know.

> **Educational reference only. Not medical advice.** Always confirm with a pharmacist or doctor. Emergencies: 911 · Poison Control 1-800-222-1222.

## Why I built this

*[PRIVI: voice this — write it yourself, first person, casual, the way you'd actually explain it to someone. Don't let this get filled in with generic AI copy; a few honest sentences beat a polished paragraph that doesn't sound like you. Things you could touch on, if any of them are true for you:*
- *what got you thinking about this — a moment where a medication label or a drug interaction was confusing (yours, a family member's, anyone's)*
- *why FDA/NIH data specifically, and why it mattered to you to never invent a fact*
- *what you want a CAC/ISEF judge — or just a random visitor — to walk away understanding about the problem*
*]*

## Run it
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`). No build step, no dependencies. Deploys as-is to GitHub Pages or Netlify.

## What works today
- **Decode** — enter a brand or generic name; get what it treats, how it works, side effects, drug class, brand/generic, boxed warnings, and a full FDA label details section (ingredients, warnings, precautions, dosage as printed), pulled live from the drug's FDA label. Misspellings show close RxNorm matches to pick from instead of one silent guess. A "Similar & related meds" popup surfaces other drugs in the same class, other forms/strengths of the same ingredient, and combination products that contain it (so you can spot accidental double-dosing).
- **Check interactions** — enter 2+ meds; get severity-rated, plain-English, sourced warnings from a curated interaction set plus a cross-reference of each drug's FDA label.
- **Light / dark theme** — sober clinical styling; light by default, and your choice survives reloads.
- Mobile-first and accessible.
- **My Cabinet** *(needs the free Supabase setup below)* — sign in with Google or a passwordless email link, save the meds you actually take with your own notes. Your list is protected by row-level security: only you can read it.
- **Cabinet Scan** — one tap scans everything in My Cabinet against everything else (not just a pair), with a severity summary, a scannable cabinet map, and a "what to ask your pharmacist" question list grounded in what was actually found.
- **Symptoms** — an always-visible "seek care now" emergency checklist, plus a symptom → general OTC-category lookup (pain, allergies, cough, etc.) for everyday, non-emergency symptoms. Deliberately not a diagnosis tool — no ranked causes, no severity score.

## Full-feature setup (optional)
1. **Plain-English mode** — deploy `worker.js` to Cloudflare, add your `ANTHROPIC_API_KEY` secret, then put the Worker URL in `config.js`.
2. **Accounts + saved cabinet** — run `supabase/schema.sql` in your Supabase project, then set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `config.js`.

## How it's built
Single-file vanilla JS/HTML/CSS. Data from the [openFDA drug label API](https://open.fda.gov/apis/drug/label/) and [NIH RxNorm](https://lhncbc.nlm.nih.gov/RxNav/APIs/). Interaction severity comes from a hand-curated set (in `index.html` → `INTERACTIONS`), because no free comprehensive interaction API exists.

See **`CLAUDE.md`** for architecture, conventions, and safety rules, **`PLAINSCRIPT_ROADMAP.md`** for the full phased plan, and **`PROGRESS.md`** for current status — what's on you, recommended next steps, and the build log.

---
Uses public data from the U.S. FDA and NIH/NLM. Not affiliated with or endorsed by either.
