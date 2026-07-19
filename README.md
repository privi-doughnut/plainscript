# Plainscript

A plain-English medication reference. Decode what a drug actually is, and check whether your medications interact — in language a normal person understands, sourced from FDA and NIH data, and honest about what it doesn't know.

> **Educational reference only. Not medical advice.** Always confirm with a pharmacist or doctor. Emergencies: 911 · Poison Control 1-800-222-1222.

## Run it
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`). No build step, no dependencies. Deploys as-is to GitHub Pages or Netlify.

## What works today
- **Decode** — enter a brand or generic name; get what it treats, how it works, side effects, drug class, brand/generic, and boxed warnings, pulled live from the drug's FDA label. Fixes typos via RxNorm.
- **Check interactions** — enter 2+ meds; get severity-rated, plain-English, sourced warnings from a curated interaction set plus a cross-reference of each drug's FDA label.
- **Light / dark theme** — sober clinical styling; light by default, and your choice survives reloads.
- Mobile-first and accessible.
- **My Cabinet** *(needs the free Supabase setup below)* — sign in with GitHub or Google, save the meds you actually take with your own notes, and re-check your whole cabinet for interactions in one tap. Your list is protected by row-level security: only you can read it.

## Full-feature setup (optional)
1. **Plain-English mode** — deploy `worker.js` to Cloudflare, add your `ANTHROPIC_API_KEY` secret, then put the Worker URL in `config.js`.
2. **Accounts + saved cabinet** — run `supabase/schema.sql` in your Supabase project, then set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `config.js`.

## How it's built
Single-file vanilla JS/HTML/CSS. Data from the [openFDA drug label API](https://open.fda.gov/apis/drug/label/) and [NIH RxNorm](https://lhncbc.nlm.nih.gov/RxNav/APIs/). Interaction severity comes from a hand-curated set (in `index.html` → `INTERACTIONS`), because no free comprehensive interaction API exists.

See **`CLAUDE.md`** for architecture, conventions, and safety rules, and **`PLAINSCRIPT_ROADMAP.md`** for what's next.

---
Uses public data from the U.S. FDA and NIH/NLM. Not affiliated with or endorsed by either.
