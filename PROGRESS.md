# Plainscript — Progress & Status

*Last updated: 2026-07-21 (after the "let's finish this app" build session)*

**Completion: ~71% of the full roadmap · Phases 0–5 are code-complete (Phase 5 has 2 items left); only Phase 6's launch polish and a couple of deliberately-deferred bigger features remain.**
**97 days to the Congressional App Challenge deadline (Oct 26, 2026).**

This file is the quick status view. `PLAINSCRIPT_ROADMAP.md` has the full phased plan and reasoning; `CLAUDE.md` has the architecture and safety rules.

---

## 1. Things you need to do

**Supabase** (unlocks My Cabinet + Cabinet Scan):
- [ ] Run `supabase/schema.sql` in the Supabase SQL Editor — confirmed not run yet.
- [ ] Enable Google as an OAuth provider (Authentication → Providers → Google) with a client ID/secret from Google Cloud Console — confirmed currently off. (Email magic-link needs nothing — it's on by default.)
- [ ] Allow-list redirect URLs (Authentication → URL Configuration) — add `http://localhost:8000` and `https://plainscript.its-the-prithivi-show.workers.dev`.

**Cloudflare:**
- [ ] Confirm which Worker is which — you mentioned making a Cloudflare Worker; I need to know if that's `worker.js` (the Claude-proxy for Phase 1's plain-English mode, needs `ANTHROPIC_API_KEY`) or a separate thing from the static-site hosting Worker. Once confirmed, its URL goes into `config.js` as `CLAUDE_PROXY_URL`.
- [ ] Decide whether to close PR #1 (`cloudflare/workers-autoconfig` → `main`) — redundant now.

**Content — the one thing only you can do:**
- [ ] Write the "Why I built this" section in `README.md` — left as a clearly marked placeholder on purpose. This is genuinely the single remaining roadmap item that can't be done by anyone but you.
- [ ] Review the "Report an error" link in the footer — it points to a pre-filled GitHub Issues form rather than a personal email, to avoid putting a real, spammable Gmail address in public page source. Swap it if you'd rather use something else.

**Worth a visual check when you get a chance (no live browser this session):**
- [ ] Header wrapping on a narrow phone (4 tabs + theme toggle + account chip).
- [ ] The severity-pill and `.eyebrow` color changes from the accessibility pass — I computed the contrast math but haven't visually confirmed them.
- [ ] The printable cabinet one-pager (`🖨️ Print / save as PDF` in My Cabinet) — CSS print styling is notoriously browser-inconsistent; worth a real print-preview check.

---

## 2. Recommendations — what's left

**Deliberately deferred this session (bigger or riskier — flagging rather than rushing):**
- **Share a read-only cabinet via link/QR.** This needs new backend design — a share-token table and RLS policy that grants anonymous read access to a subset of one user's medications without leaking anything else. Getting RLS wrong here means leaking private health data, so I didn't want to rush it in the same pass as everything else. Say the word and I'll build it carefully as its own focused piece.
- **Spanish plain-English mode.** Buildable as an extension of the existing Phase 1 Worker call (add a language parameter to the locked system prompt), but Phase 1 itself is still unverified end-to-end (waiting on your Worker URL) — makes more sense once that's confirmed working.
- **Light, privacy-respecting analytics.** Lower priority; several zero-cost options exist (a simple Supabase page-view counter, or just skipping this — plenty of CAC/ISEF submissions don't have any analytics at all).
- **CAC packaging** (demo video, written description, deploy checklist) — the video obviously needs you; I can draft the written description once the app is closer to final, and the "deploy check" is really just re-running through this file's to-do list.

**Everything else on the original roadmap is now built.** See the build log below.

---

## 3. Everything already built (build log)

### 2026-07-21 — a full build session ("let's finish this app")
Starting from ~43% complete (Phases 0–3 done, Phase 4 partial), this session:

**Phase 4 (Depth & teaching) — completed:**
- Drug-class explainers (16 common classes: NSAIDs, SSRIs, statins, ACE inhibitors, benzodiazepines, opioids, PPIs, macrolides, etc.)
- Food & alcohol interactions (warfarin+vitamin K, MAOIs+tyramine, statins+grapefruit, alcohol+opioids/benzos/metronidazole/acetaminophen)
- Allergy/cross-sensitivity notes (penicillin/cephalosporin, sulfa, NSAID/aspirin sensitivity)
- Pregnancy/nursing-mothers label fields
- A general "why do interactions happen" mechanism explainer, connecting every interaction's individual "Why" line back to the handful of recurring mechanisms (CYP450 competition, additive effects, electrolyte shifts, absorption interference)
- Side-effect labeling clarity (mild-vs-serious framing, without inventing a new severity classifier)
- **Declined:** a full ranked-differential-diagnosis symptom checker (conflicts with the app's own "no diagnosis" rule) — built the Symptoms tab (red-flag checklist + OTC-category lookup) instead, in an earlier part of this same session.

**Accessibility pass:**
- Computed actual WCAG contrast ratios for every core color pair in both themes and fixed real failures: `--ink-faint` (2.88:1 in light theme, failing), severity-pill text (0 of 4 severities passed in dark theme with white text)
- Fixed a real pre-existing bug: the My Cabinet remove button had zero CSS applied (wrong selector scope)
- Added missing focus-visible states (`.ghost`, `.expand`, `.rm` all had `appearance:none`, which also strips the native focus ring)
- Fixed ARIA roles on the similar/related modal's tabs

**Phase 5 (Breadth & reach) — mostly complete:**
- PWA: manifest, hand-generated icons (no Pillow available — wrote a minimal PNG encoder, verified via zlib round-trip + independent CRC check + a visual render), a service worker (network-first for the app shell only, never touches API calls), and an offline-cached fallback for My Cabinet
- Voice input: a mic button (Web Speech API, feature-detected) on Decode, Check, and My Cabinet's inputs
- Printable caregiver one-pager: a "Print / save as PDF" button in My Cabinet, scoped so it can't affect any other tab
- Not built: Spanish mode, share-cabinet-via-link/QR (see recommendations above)

**Phase 6 (Trust & launch polish) — mostly complete:**
- FAQ (6 new questions in the existing methodology accordion)
- "Report an error" — a footer link to a pre-filled GitHub Issues form
- "Why I built this" — explicitly-marked placeholder in README.md for Privi to fill in himself
- Not built: analytics, CAC packaging (demo video needs you)

### Earlier the same day
- Discovered the real project lived on GitHub (`privi-doughnut/plainscript`), consolidated, and fast-forward merged everything into `main`.
- Built Phase 2 (Supabase auth + My Cabinet) verification, Phase 3 (Cabinet Scan), and the initial Symptoms tab.
- Swapped GitHub OAuth for Google + passwordless email after you flagged it didn't fit the audience.
- Merged in Cloudflare Workers static-assets config so the site deploys cleanly.

### Phase 0 — Foundation (shipped before this session)
- Decode, hybrid interaction checker, persistent safety frame, dark theme, mobile-first & accessible.
