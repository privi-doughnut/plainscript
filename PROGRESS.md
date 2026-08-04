# Plainscript — Progress & Status

*Last updated: 2026-08-04*

**The app is essentially feature-complete and polished.** We're past building core features — what remains is (1) Congressional App Challenge submission packaging, (2) a few content/dashboard items only Privi can do, and (3) optional polish + a planned security sweep. **CAC deadline: Oct 26, 2026.**

Companion docs: `CLAUDE.md` = architecture + safety rules · `PLAINSCRIPT_ROADMAP.md` = original phased plan · git history = full change log. Live site: https://plainscript.its-the-prithivi-show.workers.dev/

---

## 1. Only Privi can do these
- [ ] **"Why I built this"** — fill the `[PRIVI: voice this]` placeholder in `README.md`, in your own voice.
- [ ] **CAC demo video** — required for the submission.
- [ ] **Enable Google sign-in** — Supabase → Authentication → Providers → Google: toggle on + Client ID/Secret from Google Cloud Console (OAuth "Web application"); set that client's Authorized redirect URI to `https://rxwbyyhukmxsknmhhzsn.supabase.co/auth/v1/callback`. (Magic-link already works, so this is optional-ish.)
- [ ] **Check Cloudflare Workers Builds** — the git auto-deploy stalled on 2026-08-03/04. Fallback that works reliably: `npx wrangler deploy -c wrangler.jsonc` run from `~/plainscript-remote` (NOT `~` — the config path is repo-relative). Worth confirming the pipeline is healthy.

## 2. Next up when we resume (the "post-limit" list)
- [ ] **Security sweep** — *Privi asked for this; I can do most of it.* Scope:
  - **RLS audit** — confirm every Supabase table's row-level security truly isolates users (cabinet privacy depends on it).
  - **Share-link function** — `get_shared_cabinet()` exposes only the intended narrow columns, token is unguessable, and revoke actually kills access.
  - **XSS audit** — user notes + openFDA text flow into `innerHTML`; verify `esc()` is applied everywhere (the biggest client-side risk).
  - **Worker** — confirm the rephrase/qa modes can't be repurposed to generate content, the API key never leaks, and CORS is scoped (`ALLOWED_ORIGIN`).
  - **Repo/deploy hygiene** — `.git` exposure is fixed (§4); re-confirm no secrets in `config.js` or git history and that `.assetsignore` stays complete.
- [ ] **CAC written description** — I can draft the technical writeup; you adapt it to the official form fields.
- [ ] **Symptom-explanation translations** — the 26 `SYMPTOM_EXPLAIN` "?" definitions + `explain_aria` are English-only (symptom *names* are already localized). One translate pass → full 13-language parity.
- [ ] **Remaining visual QA / minor polish** — Hindi/Tamil rendering; live spot-check of the new skeletons + dialog animations; narrow-phone header wrapping; printable one-pager print-preview; share-a-cabinet end-to-end in an incognito window; reference-panel (recalls/shortages/FAERS) sub-loaders still use small spinners.

## 3. Deferred / decided-against (don't rebuild without a reason)
- **Interaction timing timeline** — marginal over the existing schedule strip; the novel part (spacing conflicts) needs timing data that isn't structured. Recommend skipping.
- **Traveling-with-meds helper** — overlaps the (already printable + multilingual) regimen story. Low priority.
- **Adherence streak / check-ins** — nudge/habit feature; leans toward the nagging the app deliberately avoids. Low priority.
- **OCR point-and-decode** — decided against: the barcode scanner already covers type-free input; OCR needs a ~2 MB dependency that breaks the offline/CSP design. Made the scanner more discoverable instead.
- **Pill / imprint identifier** — blocked: no free imprint/image API since NLM's RxImage was deprecated.
- **Analytics** — low priority; plenty of CAC/ISEF entries ship without any.
- **React component libraries (shadcn / 21st.dev / skiper-ui)** — architectural mismatch: Plainscript is vanilla, single-file, no build step. Use only as *visual inspiration*; the polish is hand-built to match.

## 4. Security note (resolved 2026-08-03)
`.git` was briefly served publicly during a manual full-tree deploy (`.assetsignore` hadn't listed it). Fixed: `.git/`, `PROGRESS.md`, dev docs, and tooling are now excluded; verified `/.git/*` → 404 while public files still serve. No secrets were ever in git history — the Anthropic API key lives only as a Cloudflare Worker secret; `config.js` holds only the public Supabase anon key (RLS-protected). A fuller sweep is queued in §2.

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
