# Plainscript — Progress & Status

*Last updated: 2026-07-21*

**Completion: ~43% of the full roadmap · 100% code-complete on the CAC-critical core (Phases 0–3), pending the live setup steps below.**
**97 days to the Congressional App Challenge deadline (Oct 26, 2026).**

This file is the quick status view — what's on you, what's recommended next, and what's already shipped. `PLAINSCRIPT_ROADMAP.md` has the full phased plan and reasoning; `CLAUDE.md` has the architecture and safety rules.

---

## 1. Things you need to do

Nothing further can happen on these without your accounts/access.

**Supabase** (unlocks My Cabinet + Cabinet Scan):
- [ ] Run `supabase/schema.sql` in the Supabase SQL Editor — confirmed not run yet (`medications`/`profiles` tables don't exist server-side).
- [ ] Enable Google as an OAuth provider (Authentication → Providers → Google) using a client ID/secret from Google Cloud Console — confirmed currently off.
- [ ] Allow-list redirect URLs (Authentication → URL Configuration) — add `http://localhost:8000` and `https://plainscript.its-the-prithivi-show.workers.dev`.

**Cloudflare:**
- [ ] Confirm which Worker URL is the Claude-proxy (`worker.js`, unlocks Phase 1's plain-English mode) versus the static-site Worker already hosting the app — they're two different things. Once I have the proxy's URL, it goes into `config.js` as `CLAUDE_PROXY_URL`.
- [ ] Decide whether to close PR #1 (`cloudflare/workers-autoconfig` → `main`) — its changes are already in `main` via the phase-2 branch merge, so it's redundant now.

**Content / review:**
- [ ] Quick visual check of the header on a narrow phone — 4 tabs plus the theme toggle and account chip now share that row, and I don't have a live browser connected this session to confirm it wraps cleanly.
- [ ] A voice pass whenever you're ready to write the About/FAQ copy — `CLAUDE.md` calls out that narrative, user-facing copy should sound like you, not AI.

---

## 2. Recommendations — features & improvements

Roughly ranked by value-per-effort against the Oct 26 deadline.

**High-value, not yet built:**
- Drug-class explainers (narrative prose — "what statins/ACE inhibitors/SSRIs even are") — pairs naturally with the "same drug class" list already built in the Similar & related popup.
- Mechanism explainers — *why* an interaction happens, in plain English (the CYP450 story).
- Food & alcohol interactions, surfaced from FDA labels.
- "Why I built this" + FAQ — cheap once you're ready to write it, and judges respond well to it.

**Lower urgency / post-core (Phase 5–6 on the roadmap):**
- PWA / offline support for the saved cabinet.
- Spanish plain-English mode.
- Printable caregiver one-pager.
- Share a read-only cabinet via link/QR.
- Voice input.
- "Report an error" feedback loop.
- A dedicated accessibility pass (screen reader, contrast, keyboard) — most of this is already in place incrementally, but worth a deliberate pass before submission.
- Light, privacy-respecting analytics.
- CAC packaging: demo video, written description, deploy check.

**New ideas from this session's site review (not on the roadmap yet):**
- Consolidate two near-identical chip-button styles (`.chip-btn` and `.map-chip`) into one shared style — pure cleanup, no user-facing change.
- A short first-time-visitor hint now that there are 4 tabs and several distinct actions (Save to Cabinet, Similar & related, Scan my cabinet, Symptoms) — the app's surface area has grown a lot since Phase 0.

---

## 3. Everything already built (build log)

### 2026-07-21 — Recovery + verification
- Discovered the real project lived on GitHub (`privi-doughnut/plainscript`) rather than a stale local Downloads dump; consolidated and fast-forward merged the full-progress branch into `main`. Everything below is live on `main`.

### Phase 0 — Foundation
- Decode: live openFDA label lookups for what a drug treats, how it works, side effects, class, brand/generic, boxed warnings; typo rescue via RxNorm.
- Interaction checker: curated severity-rated set + FDA-label cross-reference, 2+ drugs.
- Persistent safety frame (911 / Poison Control), methodology + honest-limitations sections, dark theme, mobile-first and accessible.

### Phase 2 — Accounts + My Cabinet
- Supabase auth, dependency-free (direct GoTrue/PostgREST calls, no supabase-js).
- Originally GitHub + Google OAuth; swapped GitHub for **passwordless email magic link** after you flagged that GitHub sign-in didn't fit a general-public audience.
- Save/list/note/remove medications, RxCUI-based duplicate detection, theme synced to your profile, row-level security so a user only ever sees their own cabinet.

### Phase 3 — 🚩 Cabinet Scan (flagship)
- Whole-cabinet N×N interaction matrix, reusing the Check tab's exact engine.
- Severity summary ("2 major, 1 moderate to ask about" — never a green "safe"), cabinet map, and a "what to ask your pharmacist" question generator grounded only in what was found.

### Phase 4 (partial) — Depth
- Full FDA label details on Decode: active/inactive ingredients, contraindications, warnings, precautions, the label's own interactions text, and dosage & administration, shown verbatim.
- Similar & related medications popup: same drug class, other forms & strengths, and combination products containing the same ingredient — all openFDA-sourced.
- "Did you mean" spelling suggestions — up to 5 RxNorm candidates shown as clickable chips instead of one silent guess.
- **Symptoms tab**: an always-visible emergency red-flag checklist, plus a symptom → OTC-category lookup. Built as the safer alternative after a full ranked-differential-diagnosis symptom checker was requested and declined — it directly conflicts with this project's own "no diagnosis or symptom-checker" rule.

### Infrastructure
- Fixed a stale/invalid Claude model id in `worker.js`.
- Merged in Cloudflare Workers static-assets config (`wrangler.jsonc`, `.assetsignore`) so the repo deploys cleanly to the live Worker hosting the site.
- Site review pass: fixed a CSS positioning bug (a hidden checkbox escaping its own chip), a modal focus-trap/listener-leak bug, improved checkbox-group semantics (`fieldset`/`legend`), and strengthened the red-flag box's visual hierarchy to match its actual stakes.
