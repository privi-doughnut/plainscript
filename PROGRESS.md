# Plainscript — Progress & Status

*Last updated: 2026-08-18*

> ⚠️ **The live site is one commit behind, and that commit is the important one.**
> `main` locally is ahead of `origin/main` by `56b1959` ("Fix blank-label first visit
> + real mobile layout bugs") — verified 2026-08-18 that the deployed site byte-for-byte
> matches `origin/main`, so **the first-visit blank-label bug is still live**: anyone
> opening plainscript for the first time (fresh browser, nothing in localStorage —
> i.e. every CAC judge) sees no tab labels, no button text, no FAQ, and a blank safety
> disclaimer. Fix is written and committed locally; it just needs `git push` + a deploy.
> There is also one uncommitted one-line fix in `index.html` (hide the language selector
> in the printable cabinet one-pager). **Push + deploy is the top priority next session.**

**The app is essentially feature-complete and polished.** We're past building core features — what remains is (1) Congressional App Challenge submission packaging, (2) a few content/dashboard items only Privi can do, and (3) optional polish + a planned security sweep. **CAC deadline: Oct 26, 2026.**

Companion docs: `CLAUDE.md` = architecture + safety rules · `PLAINSCRIPT_ROADMAP.md` = original phased plan · git history = full change log. Live site: https://plainscript.its-the-prithivi-show.workers.dev/

---

## 1. Only Privi can do these
- [ ] **"Why I built this"** — fill the `[PRIVI: voice this]` placeholder in `README.md`, in your own voice.
- [ ] **CAC demo video** — required for the submission.
- [ ] **Enable Google sign-in** — Supabase → Authentication → Providers → Google: toggle on + Client ID/Secret from Google Cloud Console (OAuth "Web application"); set that client's Authorized redirect URI to `https://rxwbyyhukmxsknmhhzsn.supabase.co/auth/v1/callback`. (Magic-link already works, so this is optional-ish.)
- [ ] **Check Cloudflare Workers Builds** — the git auto-deploy stalled on 2026-08-03/04. Fallback that works reliably: `npx wrangler deploy -c wrangler.jsonc` run from `~/plainscript-remote` (NOT `~` — the config path is repo-relative). Worth confirming the pipeline is healthy.

## 2. Next up when we resume (the "post-limit" list)
- [X] **Security sweep — DONE (2026-08-07).** RLS, share-link function, XSS, secrets, and `.git` all verified/clean; one low finding fixed (`handle_new_user` search_path). One open item for you: the proxy Worker is open/unauthenticated (API-budget abuse risk) → set an Anthropic spend cap + `ALLOWED_ORIGIN`. Full write-up in §4.
- [X] **CAC written description — DONE (2026-08-07).** Draft at `CAC_SUBMISSION.md` (excluded from the public site); factual parts written, personal-voice bits marked `[PRIVI: …]`.
- [X] **Symptom-explanation translations — DONE (2026-08-08).** The 26 `SYMPTOM_EXPLAIN` definitions + `explain_aria` now in all 13 languages (2 committed batches, parity verified). No English fallback remains.
- [X] **Reference-panel skeletons — DONE.** Recalls/shortages/FAERS sub-loaders now use mini-skeletons; the spinner→skeleton sweep is complete app-wide.
- [X] **First-visit blank-label bug — FIXED in code (2026-08-14), NOT YET LIVE.** `applyTranslations()`
  is only reachable via `applyLang()`, and boot used to call it only when a language was already
  saved. Boot now calls it unconditionally, defaulting to English (`index.html:10441-10453`).
  Shipped alongside real mobile fixes: tab strip overflow at 320-360px, three sub-16px controls
  that made iOS Safari auto-zoom on focus, cabinet stat tiles 3→2 columns on narrow phones, and
  no more mono/letter-spacing on non-Latin labels. **Needs push + deploy — see the callout up top.**
- [X] **Smoothness pass (2026-08-12).** Dropped modal backdrop-blur; hover-pill listeners are O(1) via `matches()`.
- [ ] **Remaining live visual QA (optional)** — Hindi/Tamil rendering; spot-check of skeletons + dialog animations; narrow-phone header wrapping; printable one-pager print-preview; share-a-cabinet end-to-end in incognito. (Main features already verified in-browser this session.)

## 3. Deferred / decided-against (don't rebuild without a reason)
- **Interaction timing timeline** — marginal over the existing schedule strip; the novel part (spacing conflicts) needs timing data that isn't structured. Recommend skipping.
- **Traveling-with-meds helper** — overlaps the (already printable + multilingual) regimen story. Low priority.
- **Adherence streak / check-ins** — nudge/habit feature; leans toward the nagging the app deliberately avoids. Low priority.
- **OCR point-and-decode** — decided against: the barcode scanner already covers type-free input; OCR needs a ~2 MB dependency that breaks the offline/CSP design. Made the scanner more discoverable instead.
- **Pill / imprint identifier** — blocked: no free imprint/image API since NLM's RxImage was deprecated.
- **Analytics** — low priority; plenty of CAC/ISEF entries ship without any.
- **React component libraries (shadcn / 21st.dev / skiper-ui)** — architectural mismatch: Plainscript is vanilla, single-file, no build step. Use only as *visual inspiration*; the polish is hand-built to match.

## 4. Security sweep (done 2026-08-07)

**Solid / verified clean:**
- **RLS** on `profiles`, `medications`, `cabinet_shares` — every policy scoped to `auth.uid()`; a user can only ever read/write their own rows.
- **Share links** — `get_shared_cabinet()` is `SECURITY DEFINER` with a locked `search_path`, returns only `generic/brand/drug_class/notes` (never id/user_id/rxcui), checks `revoked_at`, keyed by a 122-bit random token; anon has zero direct table access.
- **XSS** — 322 `esc()` calls across 70 `innerHTML` sites; spot-check of user-controlled sinks (notes, person, allergies) all escaped.
- **Secrets** — `config.js` holds only the public Supabase anon key; the Anthropic key exists only as a Worker secret; no secrets in git history.
- **`.git` exposure** (2026-08-03) — was briefly served during a manual full-tree deploy; fixed in `.assetsignore` (`/.git/*` → 404, public files still serve).

**Fixed this sweep:**
- `handle_new_user()` now sets an explicit `search_path` (defense-in-depth). ⚠️ **Requires re-running `supabase/schema.sql`** to take effect (idempotent, low priority).

**Open finding — [Medium] the Claude proxy Worker is open + unauthenticated:**
- CORS defaults to `*` and there's no auth/rate-limit, so anyone with the (public) proxy URL can send rephrase/qa requests and **burn the Anthropic API budget**. Per-call cost is capped (input ≤6000 chars, max_tokens 400/700) and it can only rephrase/extract — no data-breach — but volume abuse is possible.
- **Recommended mitigations (cheap → thorough):** (1) set an **Anthropic account spend cap** (caps the financial blast radius no matter what — do this first); (2) `npx wrangler secret put ALLOWED_ORIGIN -c wrangler.worker.jsonc` = your site origin (stops cross-site browser abuse); (3) add Cloudflare rate-limiting on the worker route if abuse ever appears.

---

## 5. What's built (summary)
- **Decode** — type a drug → plain-English monograph from its real FDA label (indications, mechanism, side effects, warnings, full label details), with readability bullets, barcode scanner, voice input, and a "Similar & related" lookup.
- **Check interactions** — 2+ meds → severity-rated, sourced, plain-English warnings (curated set + FDA-label cross-reference). Never shows a green "safe."
- **My Cabinet** (Supabase auth: Google + passwordless email) — save meds, personal notes, dosing schedule, multi-person, printable one-pager, wallet card, insights, **share a read-only cabinet** (link/QR), **whole-cabinet Scan** with an **N×N interaction heatmap**, **regimen story**, and **refill/expiry reminders**.
- **Symptoms** — emergency red-flag checklist + curated symptom→OTC-category lookup (no diagnosis) + **"?" hover explanations** for non-obvious terms.
- **Plain-English mode** (safety-locked Cloudflare Worker proxy) — rephrases retrieved FDA text; **"Ask the label"** answers questions using only verbatim label sentences (two-condition double-checker + "not AI-written" badge).
- **13 languages** — full UI + curated medical content (en, es, zh, vi, ar [RTL], fr, ko, ru, pt, de, ja, hi, ta).
- **Pictogram "Understand Mode"**, **PWA** (installable, offline app-shell), **dark theme**, an accessibility pass (WCAG contrast, focus states, reduced-motion), and an anti-slop **design polish** pass (active-press feedback, tabular numerals, balanced headings, spring dialog entrances, deterministic skeletons).

**Safety invariants (never violate):** every fact comes from openFDA / RxNorm / the curated set; the LLM only rephrases retrieved text, never generates medical claims; no green "safe"; every claim shows its source; disclaimers stay persistent. No diagnosis, no dosing advice, no "should I take this."
