# Plainscript — Progress & Status

*Last updated: 2026-07-21 (after the Spanish localization pass)*

**Completion: ~76% of the full roadmap · Phases 0–5 are fully code-complete, including Spanish. Only Phase 6's analytics + CAC packaging remain, both low-priority/deferred — see below.**
**97 days to the Congressional App Challenge deadline (Oct 26, 2026).**

**New: Spanish is live** — a 🌐 toggle in the header switches the entire UI, the full curated medical content (interactions, food/alcohol notes, allergy notes, drug-class explainers, symptom categories), and (once the Phase 1 Worker is configured) live FDA label text too. Built as a proper i18n framework, not a one-off — the next language Privi wants is "add a dictionary column," not a rebuild. See the build log below for what's covered.

This file is the quick status view. `PLAINSCRIPT_ROADMAP.md` has the full phased plan and reasoning; `CLAUDE.md` has the architecture and safety rules.

---

## 1. Things you need to do

**Supabase** (unlocks My Cabinet + Cabinet Scan + the share-a-cabinet feature):
- [X] Run `supabase/schema.sql` in the Supabase SQL Editor — it's grown since you last saw it (now includes `cabinet_shares` + `get_shared_cabinet()` for link/QR sharing); the whole file is idempotent, safe to re-run start to finish.
- [ ] Enable Google as an OAuth provider (Authentication → Providers → Google) with a client ID/secret from Google Cloud Console — confirmed currently off. (Email magic-link needs nothing — it's on by default.)
- [X] Allow-list redirect URLs (Authentication → URL Configuration) — add `http://localhost:8000` and `https://plainscript.its-the-prithivi-show.workers.dev`.

**Cloudflare:**
- [ ] Confirm which Worker is which — you mentioned making a Cloudflare Worker; I need to know if that's `worker.js` (the Claude-proxy for Phase 1's plain-English mode, needs `ANTHROPIC_API_KEY`) or a separate thing from the static-site hosting Worker. Once confirmed, its URL goes into `config.js` as `CLAUDE_PROXY_URL`.
- [ ] Decide whether to close PR #1 (`cloudflare/workers-autoconfig` → `main`) — redundant now.

**Content — the one thing only you can do:**
- [ ] Write the "Why I built this" section in `README.md` — left as a clearly marked placeholder on purpose. This is genuinely the single remaining roadmap item that can't be done by anyone but you.
- [X] Review the "Report an error" link in the footer — it points to a pre-filled GitHub Issues form rather than a personal email, to avoid putting a real, spammable Gmail address in public page source. Swap it if you'd rather use something else. (its fine the way it is - privi)

**Next up (roadmap items remaining after the localization push):**
- [ ] **Tamil curated pass** — Tamil ships as a full 334-key UI dictionary, but its curated *medical* arrays (interactions, food/alcohol, symptoms, drug-class explainers) currently fall back to English via `pickLang`. Author the Tamil curated translations to bring it to full parity with Hindi. Big authoring job — best done with credits to spare. Same follow-up applies to any other language you want fully medical-localized.
- [ ] **Live-verify the DB features** — run `supabase/schema.sql` in the dashboard (idempotent) to unlock My Cabinet, share links, schedule + multi-person.
- [ ] **"Why I built this"** — the `[PRIVI: voice this]` placeholder in `README.md`. You-only, in your voice.
- [ ] **CAC packaging** (deadline Oct 26) — demo video (needs you) + written description.

**Worth a visual/live check when you get a chance (no live browser this session):**
- [ ] **Visual QA the localization**, especially **Arabic RTL** and the newer Hindi/Tamil rendering, in a real browser.
- [ ] Header wrapping on a narrow phone (4 tabs + theme toggle + account chip).
- [ ] The severity-pill and `.eyebrow` color changes from the accessibility pass — computed the contrast math but haven't visually confirmed them.
- [ ] The printable cabinet one-pager — CSS print styling is notoriously browser-inconsistent; worth a real print-preview check.
- [ ] The share-a-cabinet feature end to end, once the schema is re-run: create a link, open it in an incognito window, confirm it shows the right (and only the right) data, then revoke it and confirm the link stops working.
- [ ] Click through the app in Spanish (🌐 toggle in the header) — I validated the dictionary programmatically (every key resolves in both languages, no missing translations) but haven't seen it render in a live browser this session.

---

## 2. Recommendations — what's left

**Deliberately not built — explaining why rather than silently skipping:**
- **Light, privacy-respecting analytics.** Genuinely low priority — plenty of CAC/ISEF submissions ship with none at all. A simple Supabase page-view counter is the cheapest option if you want it later.
- **CAC packaging** (demo video, written description, deploy checklist) — the video needs you regardless. I can draft a technical written description once you want one, but I don't know the exact official CAC submission form fields, so I didn't want to guess and hand you something that doesn't match what they actually ask for.
- **A third language** — you mentioned wanting a couple more, each as its own pass. The framework is ready (add a language object to `I18N`, add `{lang}` fields to the 5 curated data arrays, add one more `LOCKED_SYSTEM` entry in `worker.js`) — just say which language and I'll do the same careful pass Spanish got.

**Everything else on the original roadmap is now built.** See the build log below.

### Fresh ideas for future additions & improvements
Five new directions worth considering once the current batch lands:

1. **Refill & expiry reminders.** Track when each cabinet med was filled and gently flag when it's about to run out or pass its expiry — turns the cabinet from a static list into something that actively helps you stay on top of your meds. Pure Supabase + a date field per row; no new data sources.
2. **"Traveling with meds" helper.** A printable card that shows each med's *generic* name (and, using the i18n work, its name/label in the destination country's language), plus a short plain-English summary of common carry-on rules for medication. Leans directly on the multilingual + generic-resolution work already done.
3. **Opt-in adherence streak / gentle check-ins.** A strictly optional "did you take today's meds?" tracker with a streak counter, for people who want the nudge — no nagging, no dark patterns, fully privacy-respecting and off by default. Complements the dosing-schedule feature.
4. **Cabinet Scan severity heatmap.** A visual N×N grid of the whole-cabinet scan — each cell colored by the worst interaction severity found for that pair — so a dense cabinet's risk pattern is scannable at a glance instead of read as a list. Uses only what the scan already computes; a natural home for the dataviz skill.
5. **Pill / imprint identifier.** Identify a loose pill by its imprint code, shape, and color. High user value, but **needs research first**: NLM's free RxImage API was deprecated, so this is blocked until a current free imprint/image source is confirmed — flagging it rather than promising it.

---

## 3. Everything already built (build log)

### 2026-07-21 — Spanish localization ("take a full pass at spanish")
- Built a real i18n framework: 230-key `I18N` dictionary (English + Spanish), `t()`/`pickLang()` lookup, `applyTranslations()` DOM-attribute pass, a 🌐 header toggle persisted via localStorage + a new `lang` profile column (same pattern as theme).
- Translated every static UI string, every JS-rendered dynamic string, and all 5 curated medical data arrays (INTERACTIONS, FOOD_INTERACTIONS, CROSS_SENSITIVITY, DRUG_CLASS_EXPLAINERS, SYMPTOM_CATEGORIES) — real reviewed translations, not machine-translated on the fly.
- `worker.js` now supports a `lang` parameter for translating live FDA text (still constrained to "use only the provided text," in either language); without the Worker configured, Spanish mode shows FDA text in English with a visible explanatory note rather than looking broken.
- Found and fixed two latent bugs while doing this: two functions (`enhanceRows`, `loadProfile`) each had a local variable literally named `t` that would have silently shadowed the global translation function the moment either tried to call it.
- Framework built so the next language (Privi wants a couple more, each its own pass) is "add a dictionary column," not a rebuild.

### 2026-07-21 — a full build session ("let's finish this app")
Starting from ~43% complete (Phases 0–3 done, Phase 4 partial), this session:

**Phase 4 (Depth & teaching) — completed:**
- Drug-class explainers (16 common classes: NSAIDs, SSRIs, statins, ACE inhibitors, benzodiazepines, opioids, PPIs, macrolides, etc.)
- Food & alcohol interactions (warfarin+vitamin K, MAOIs+tyramine, statins+grapefruit, alcohol+opioids/benzos/metronidazole/acetaminophen)
- Allergy/cross-sensitivity notes (penicillin/cephalosporin, sulfa, NSAID/aspirin sensitivity)
- Pregnancy/nursing-mothers label fields
- A general "why do interactions happen" mechanism explainer, connecting every interaction's individual "Why" line back to the handful of recurring mechanisms (CYP450 competition, additive effects, electrolyte shifts, absorption interference)
- Side-effect labeling clarity (mild-vs-serious framing, without inventing a new severity classifier)
- **Declined:** a full ranked-differential-diagnosis symptom checker (conflicts with the app's own "no diagnosis" rule) — built the Symptoms tab (red-flag checklist + OTC-category lookup) instead, earlier the same session.

**Accessibility pass:**
- Computed actual WCAG contrast ratios for every core color pair in both themes and fixed real failures: `--ink-faint` (2.88:1 in light theme, failing), severity-pill text (0 of 4 severities passed in dark theme with white text)
- Fixed a real pre-existing bug: the My Cabinet remove button had zero CSS applied (wrong selector scope)
- Added missing focus-visible states (`.ghost`, `.expand`, `.rm` all had `appearance:none`, which also strips the native focus ring)
- Fixed ARIA roles on the similar/related modal's tabs

**Phase 5 (Breadth & reach) — complete except Spanish:**
- PWA: manifest, hand-generated icons (no Pillow available — wrote a minimal PNG encoder, verified via zlib round-trip + independent CRC check + a visual render), a service worker (network-first for the app shell only, never touches API calls), and an offline-cached fallback for My Cabinet
- Voice input: a mic button (Web Speech API, feature-detected) on Decode, Check, and My Cabinet's inputs
- Printable caregiver one-pager: a "Print / save as PDF" button in My Cabinet, scoped so it can't affect any other tab
- **Share a read-only cabinet via link/QR** — the one feature that needed careful backend design before building. New `cabinet_shares` table + a `get_shared_cabinet()` SECURITY DEFINER function: anon gets zero direct table access at all, the share token is an unguessable random uuid, and the function returns a deliberately narrow, non-identifying column set (no id/user_id/rxcui). Full security rationale is documented in `supabase/schema.sql` §5. QR rendering uses one external free service (goqr.me) as a deliberate, bounded exception to "no dependencies" — the feature still fully works via the copyable link if that service is ever down.
- Not built: Spanish mode (see recommendations above)

**Phase 6 (Trust & launch polish) — complete except analytics/CAC packaging:**
- FAQ (6 new questions in the existing methodology accordion)
- "Report an error" — a footer link to a pre-filled GitHub Issues form
- "Why I built this" — explicitly-marked placeholder in README.md for Privi to fill in himself
- Not built: analytics, CAC packaging (demo video needs you; written description not drafted without knowing the actual submission form)

### Earlier the same day
- Discovered the real project lived on GitHub (`privi-doughnut/plainscript`), consolidated, and fast-forward merged everything into `main`.
- Built Phase 2 (Supabase auth + My Cabinet) verification, Phase 3 (Cabinet Scan), and the initial Symptoms tab.
- Swapped GitHub OAuth for Google + passwordless email after you flagged it didn't fit the audience.
- Merged in Cloudflare Workers static-assets config so the site deploys cleanly.

### Phase 0 — Foundation (shipped before this session)
- Decode, hybrid interaction checker, persistent safety frame, dark theme, mobile-first & accessible.
