# Plainscript — Progress & Status

*Last updated: 2026-09-16*

> 🚨 **THE DEADLINE IS NOON, NOT MIDNIGHT.** The 2026 rulebook says submissions close
> **12:00 PM EDT on Monday 26 October 2026**. Every earlier note in this repo said
> just "Oct 26" — that is half a day of runway that does not exist.
>
> 🚨 **AI usage must be disclosed in the submission.** The 2026 rules permit AI help but
> require it be "fully disclosed," that it "not constitute the entirety of the technical
> development," and that the student "demonstrate significant individual contributions and
> technical understanding." This repo contains `CLAUDE.md` and commits co-authored by
> Claude, and judges are entitled to demand the source. Disclosed plainly and confidently
> this is a non-issue and arguably reads as maturity; left undisclosed and discovered, it
> is existential. See §10.
>
> ✅ **Deploys are healthy again.** Cloudflare's git auto-deploy picked up the pushed
> commits on its own — verified 2026-09-16 that the live site matches `origin/main`
> byte-for-byte, including the client-side QR fix. `wrangler deploy` is no longer needed
> as a fallback (and is blocked for Claude by the auto-mode classifier anyway).

**The app is essentially feature-complete and polished.** We're past building core features — what remains is (1) Congressional App Challenge submission packaging, (2) a few content/dashboard items only Privi can do, and (3) optional polish + a planned security sweep. **CAC deadline: Oct 26, 2026.**

Companion docs: `CLAUDE.md` = architecture + safety rules · `PLAINSCRIPT_ROADMAP.md` = original phased plan · git history = full change log. Live site: https://plainscript.its-the-prithivi-show.workers.dev/

---

## 0b. Shipped 2026-09-17 (second batch)
- **Guest mode** — a cabinet with no account, stored only in the browser, on web and installed app. Routed inside `db()` so all six medication read/write paths work unchanged. Sharing is unavailable to guests by design (a share link is served by Supabase; nothing local could honour it).
- **Seven themes** — Light, Dark, Blue, Green, Purple, Rose, High contrast, dark by default. Built on one rule: each theme picks an accent hue and tints the whole neutral ramp to it; **severity never re-themes**, and where an accent and a severity hue compete the accent yields. Red ships as Rose because a true red accent sat 18° from the "major" severity bar. Every text pair measured in-browser: zero below WCAG AA.
- **3D animated hero** — the cross logo extruded from 16 stacked DOM layers in CSS 3D (no WebGL, no library), full-bleed stretched wordmark behind it, theme-reactive.
- **Feature carousel**, cross-faded, pauses on hover/focus, off under reduced motion.
- **Real progress readout** on Check and Cabinet Scan — counts lookups that actually returned; no invented progress.
- **Dose reminders** — local notifications at the user's own dosing times, grouped per slot, once per slot per day. Honest limit stated in the UI: no push server, so they only fire while the app is open.
- **Home control** in the app footer (there was previously no route back to the homepage at all).
- Elevation token in all seven themes, press feedback, `text-wrap: balance` on headings.

**Two pre-existing bugs fixed along the way:** severity pill text was hardcoded white with a `[data-theme="dark"]`-scoped correction, so every other dark-ground theme had white-on-bright-bar at ~3:1; and the high-contrast theme's major bar failed at 2.79:1 (caught by verifying the palette rather than trusting it).

**Still open:** homepage sections 6-10 are Privi's (`YOUR_TASKS.md`); landing copy is English-only while the page claims 13 languages — translate once copy is final.

## 0. Shipped 2026-09-16/17 (all live)
- **Homepage** — landing view for signed-out first-time visitors, inside `index.html` (the i18n dictionary and theme machinery live there, so a separate file would have meant duplicating the whole 13-language system). Skipped for `?share=` links, installed PWA, signed-in users, and returning visitors. Content sections deliberately left for Privi — see `YOUR_TASKS.md`.
- **My Cabinet is now a dashboard** — stat tiles promoted out of the Insights modal, Scan as the single primary action. Neutral ink, never green.
- **Bottom navigation app-shell** at phone widths, verified in both themes and Arabic RTL.
- **Privacy Policy + Terms**, footer links in all 13 languages, and a consent moment at signup.
- **69 engine tests** (`node --test tests/*.test.js`), mutation-verified to actually catch regressions.
- All P0/P1/P2 audit bugs fixed.
- **`YOUR_TASKS.md`** — 13 scoped tasks Privi writes himself, easiest to hardest, with a Python→JS cheat sheet.

**Open gap worth tracking:** homepage copy is English-only while the page itself claims 13 languages. Translate once the copy is final (it's structured for it).

## 1. Only Privi can do these
- [ ] **"Why I built this"** — fill the `[PRIVI: voice this]` placeholder in `README.md`, in your own voice.
- [ ] **`[PRIVI: personal spark]` + `[PRIVI: 2-3 real challenges]`** in `CAC_SUBMISSION.md` — every comparable past CAC winner researched (PillPall, CareCompanion, Your Medicine) had a concrete personal story; this is the biggest lever left on the Concept score.
- [ ] **CAC demo video** — required for the submission per the 2026 rules.
- [ ] **Deploy commit `e6fc0f4`** — `npx wrangler deploy -c wrangler.jsonc` from `~/plainscript-remote` (direct wrangler execution is blocked for Claude by the auto-mode classifier; run with the `!` prefix).
- [ ] **Enable Google sign-in** — Supabase → Authentication → Providers → Google: toggle on + Client ID/Secret from Google Cloud Console (OAuth "Web application"); set that client's Authorized redirect URI to `https://rxwbyyhukmxsknmhhzsn.supabase.co/auth/v1/callback`. (Magic-link already works, so this is optional-ish.)
- [ ] **Check Cloudflare Workers Builds** — the git auto-deploy stalled on 2026-08-03/04. Fallback that works reliably: `npx wrangler deploy -c wrangler.jsonc` run from `~/plainscript-remote` (NOT `~` — the config path is repo-relative). Worth confirming the pipeline is healthy.
- [ ] **Legal/compliance decisions** (full findings in §6 below) — highest priority: publish a real Privacy Policy + Terms and link them from the footer (Washington's My Health My Data Act has no small-app exemption and requires this). Get actual attorney review before wide public launch — not just for CAC.
- [ ] **Mobile scope decided 2026-09-16: PWA app-shell polish now, native app-store wrap only as a post-submission stretch goal** (not started before Oct 26). See §7 for what "polish" means concretely.

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

---

## 6. Bug & graceful-failure audit (2026-09-16)

Full read-through of `index.html`, `worker.js`, `config.js`, `supabase/schema.sql`. P0s below are fixed (commit `e6fc0f4`, needs deploy — see §1); P1/P2 are queued, not yet done.

**Fixed:**
- [X] **Silent FDA-lookup failure looked identical to "nothing found."** `resolveForAnalysis()` now flags a genuine fetch failure (`labelUnverified`) separately from a normal no-match, and both the Check tab and Cabinet Scan show an explicit "couldn't fully check X" warning instead of silently proceeding to the ordinary empty state.
- [X] **Share-link QR leaked the live access token to a third party.** `api.qrserver.com` used to receive the full share URL (token included) every time the Share panel opened. Now rendered entirely client-side via a vendored, dependency-free `qrcode-generator` (MIT; round-trip encode/decode verified in Node before inlining — see the `<script>` block right after `config.js`).

**Queued — not yet fixed:**
- [ ] **P1** — Duplicate/self-matching drug entries aren't deduped in the Check tab; a drug can "interact" with itself if its own label mentions its own generic name (`labelMentions`, `analyzeDrugPairs`).
- [ ] **P1** — Drug resolution in Check/Scan is sequential (`await` in a loop) with no per-drug progress or count cap; a long list reads as hung on a slow connection.
- [ ] **P1** — The Plain-English Worker retry never actually engages because `worker.js` returns HTTP 200 even when the upstream Claude call fails (`data.content` missing → `{plain:""}` at 200). Harmless today (falls back to raw FDA text correctly) but the retry-on-hiccup design silently doesn't fire.
- [ ] **P2** — No client-side max-length check on drug-name/note inputs before hitting openFDA/Supabase; an extreme-length input surfaces a raw "FDA service error (414)" instead of a friendly message.
- [ ] **P2** — Missing i18n keys fall back to the raw key string (e.g. `decode_type_first`) rather than blank — acceptable, worth a lint pass before submission.
- [ ] **P2** — `sw.js` caches a network response without `event.waitUntil`; on fast page-unload the write can silently drop (offline fallback is best-effort here, not the initial app-shell cache).
- Not independently re-verified, already flagged as pending visual QA in §2: Arabic RTL under real content, missing-translation-key visual behavior across all 13 languages, multi-person cabinet with zero people, a share link opened after the sharer's account is deleted.

## 7. Legal/compliance preflight (2026-09-16) — NOT LEGAL ADVICE

Risk-spotting pass only (no legal skill/plugin exists on this machine). Get an actual attorney before wide public launch — many do free/low-cost review for student projects, or ask if CAC/your school has pro-bono legal resources.

| Item | Status | Risk | Recommendation |
|---|---|---|---|
| Privacy Policy + Terms of Service | **Absent** — no page, no footer link | Med | Write and link from the footer next to "Report an error," in all 13 languages eventually. |
| Washington My Health My Data Act (+ similar state consumer-health-data laws) | **Absent protection** | **Med-High, highest priority** | No small-app exemption — "what medications a user takes" is consumer health data. Requires a prominently-linked privacy policy + opt-in consent at signup. Nevada/Connecticut have similar statutes; one well-written policy covers the superset. |
| COPPA | Low real exposure | Low | Not directed at under-13s; no action needed. |
| ADA/WCAG 2.1 AA | Partially addressed, undocumented | Med | Contrast/focus/reduced-motion/ARIA already done per `CLAUDE.md`; run an automated axe/Lighthouse audit and keep the output on file. |
| FDA Software-as-a-Medical-Device / CDS boundary | Likely fine | Low-Med | Current non-goals (no diagnosis, no dosing, never "safe," always sourced, always routes emergencies out) keep it in the low-risk zone. Don't add anything that recommends a course of action. |
| App store requirements (if native/PWA-wrapped later) | Not ready | Med-High, only if pursued | Apple/Google both require a live privacy-policy URL and **in-app self-service account deletion** for account-creating apps — Plainscript has neither yet; deletion needs a service-role-key server function (can't be done from the anon client key). Deferred per the 2026-09-16 mobile-scope decision (PWA-only for CAC). |

## 8. Feature/moving-parts gap-check (2026-09-16)

Checked what's actually wired vs. what `PLAINSCRIPT_ROADMAP.md` claims. Good news: `config.js` already has live Supabase + Worker keys, so accounts, My Cabinet, and Plain-English mode are genuinely live in production — the roadmap doc's ⬜ marks on those are just stale. Glossary tooltips also already exist.

- [ ] **Real gap: dosing reminders are passive-only.** There's an "expiring soon" banner shown only if you happen to open the app — no actual `Notification` API / scheduled local push for "take your 8am dose." No `Notification.`/`pushManager` usage anywhere in the codebase. This is the one functional (non-aesthetic) hole, and it's exactly what a direct CAC competitor (CareCompanion) leans on hardest. Worth adding via feature-detect-and-degrade, same pattern as voice input.
- Everything else on the roadmap is either shipped or a deliberate, already-justified non-goal (symptom checker, pill imprint ID, analytics) — see roadmap §"Deferred / decided-against."

## 10. CAC competitive research (2026-09-16) — sample of 24 winning projects

Sampled 18 district winners from 2025, 2 from 2024, and the 2025 national/regional tier, deliberately including unglamorous districts to find the median rather than the headline.

**What wins:** health/medical/accessibility is the dominant category (~46% of the sample). Framing is a *personal anecdote* essentially universally — not one winner led with statistics. Solo entries are normal (~15 of 24). District-tier technical sophistication is modest (Kanban boards, equipment-rental apps, a middle-school immune-system game); hardware + ML is what escalates you to the national tier. Judging is done by the Member of Congress and their office — **congressional staffers, usually not engineers**.

**What winners systematically lack** — across 24 projects, essentially none mention data provenance, accessibility, internationalization, privacy/data handling, or safety limits. Health winners uniformly claim maximum capability; one 2024 winner claims "rapid and reliable early-stage diagnoses" for 14 chest diseases with no stated sourcing. **The bar on rigor is low; the bar on storytelling is high.**

**Where Plainscript genuinely leads:** live publicly-usable URL + open source (judges may demand exactly this verification); authoritative sourcing with visible per-claim provenance; 13 languages; WCAG/pictogram/read-aloud/offline; and the safety non-goals — which read as markedly more mature than the field *if framed as deliberate design rather than missing features*.

**Where Plainscript is behind or at risk:**
- [ ] **AI disclosure** — see the banner at the top. Needs a deliberate, honest written disclosure, plus Privi genuinely able to defend arbitrary parts of the code. Highest-risk item in the whole submission.
- [ ] **No demo video.** The rules call it *"the most critical component"* of the submission, verbatim.
- [ ] **Personal story still an empty placeholder** while ~100% of winners have one.
- [ ] Four tabs is a lot of surface to explain in under 3 minutes — real risk of a diffuse feature-tour video that lands no single idea.
- [ ] **Direct precedent exists:** "Your Medicine" (GA-01, 2024) is a close concept that already won. Differentiation has to be explicit, not assumed.

**Recommended demo video structure (target 2:30, hard cap 3:00):** 0:00-0:15 name/app/purpose in one sentence · 0:15-0:45 personal story then the Jan-2024 NLM API shutdown · 0:45-1:00 who it's for, stated explicitly · 1:00-2:00 live demo *on the public URL, said out loud* (decode a real drug → warfarin+aspirin → Cabinet Scan heatmap, deliberately showing the "nothing found isn't the same as safe" state and saying why) · 2:00-2:20 tools/languages + the AI disclosure · 2:20-2:40 reach and restraint. Cheapest edge available: demo the real deployed URL and invite verification — almost nothing in the published record suggests competitors do.

**Also:** the six written submission questions are published in the rulebook — pre-draft them instead of writing under deadline pressure.

## 11. Engineering debt worth knowing about (2026-09-16)

Measured, not estimated:
- [ ] **Zero automated tests** across ~12,000 lines of JS and 157 functions — which is why the duplicate-drug and silent-failure bugs survived months. A suite for the interaction engine (`analyzeDrugPairs`, `sameDrug`, `sideHit`, `labelMentions`) is in progress; it's also the most defensible thing to show a judge: *"the parts that could hurt someone have tests."*
- [ ] **Ad-hoc design values:** 27 distinct spacing values, 20 font sizes (including six half-pixel steps like 13.5/14.5/15.5 that are too close to perceive), and 11 border radii despite a `--radius` token existing and being used 17×. Mechanical fix: add spacing/type/radius tokens beside the existing colour tokens and sweep to the nearest. Nothing looks dramatically different in any one spot; the whole thing starts feeling deliberate.
- Already strong and worth not breaking: colour rationing (severity colours mean severity and nothing else), 17 `:focus-visible` rules, computed-and-corrected WCAG contrast, 44×44px primary tap targets. `.mini` buttons compute to ~32px — legal under WCAG AA but under Apple's comfortable-thumb threshold; worth bumping the ones used on phones.

## 9. Mobile/web design direction (decided 2026-09-16)

**Decision: polish the PWA app-shell now (bottom tab nav on mobile widths, native-feeling view transitions, splash screen, safe-area/notch handling), still single-file vanilla JS, no new build tooling. Native app-store wrapping (Capacitor/PWABuilder) is a post-submission stretch goal only** — going straight for native builds now risked the Oct 26 deadline via Xcode/Play Console review lead time. Not started yet.
