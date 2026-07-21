# Plainscript — Build Roadmap

*A plain-English medication reference that doesn't just beat the alternatives — it makes them irrelevant.*

**North star:** the fastest, clearest, most trustworthy way for a normal person to understand what they're taking and whether it's safe together — sourced from FDA/NIH data, never faking what it doesn't know.

**Hard deadline anchor:** Congressional App Challenge — **Oct 26, 2026**. Everything through Phase 3 is the CAC-worthy core. Resist piling breadth on before the flagship works.

---

## Status legend
✅ done · 🔨 in progress · ⬜ planned · 🚩 flagship · 🔬 needs research

---

## Phase 0 — Foundation ✅ *(shipped)*
- ✅ **Decode a medication** — live openFDA label pull: what it treats, how it works, side effects, drug class, brand/generic, RxCUI, boxed warnings. Typo rescue via RxNorm.
- ✅ **Interaction checker (hybrid)** — curated severity-rated set (~17 textbook interactions) + FDA-label cross-reference. Handles 2+ drugs.
- ✅ **Safety spine** — persistent disclaimer, 911 / Poison Control, never a green "safe," collapsible methodology + honest-limitations section.
- ✅ **Dark theme** — sober clinical dark, light by default, accessible toggle.
- ✅ Mobile-first, accessible, single-file, GitHub-Pages-ready.

## Phase 1 — Plain-English layer + comprehension polish ⬜
*Turn primary-source authority into something a scared 60-year-old actually understands.*
- ⬜ **Plain-English mode** via your Cloudflare Worker (Claude as *rephraser only* — grounded in retrieved FDA text, adds nothing, original always one tap away). Hook already wired; needs the Worker URL.
- ⬜ **"Explain it simpler" toggle** — 8th-grade vs "explain like I'm 10" on any result.
- ⬜ **Plain-language glossary tooltips** — tap a scary word ("hepatic," "contraindicated") for a one-line plain definition.

## Phase 2 — Accounts + My Cabinet (Supabase) ✅ *(code complete — lights up when the Supabase URL + anon key land in `config.js`)*
*The thing that turns a lookup tool into something people come back to.*
- ✅ Supabase auth — Google OAuth + passwordless email magic link (no GitHub — this audience doesn't have developer accounts). Google needs enabling in the Supabase dashboard (setup steps at the top of `supabase/schema.sql`); email sign-in is on by default, no dashboard step needed. Dependency-free: the app talks straight to Supabase's auth + REST APIs with `fetch` — no supabase-js.
- ✅ **My Cabinet** — save meds from a decoded card or by typing a name; every save resolves against the real FDA label so the row carries sourced identifiers (generic, brand, RxCUI, class), with RxCUI-based duplicate detection.
- ✅ Per-med personal notes ("morning, with food").
- ✅ Theme persists — localStorage for everyone, plus the Supabase profile when signed in, so dark mode follows you across devices.
- ✅ Row-level security so a user only ever sees their own cabinet (`supabase/schema.sql`).
- ✅ ~~Bonus: one-tap "check my whole cabinet for interactions" pours the saved list into the checker~~ — superseded by the real Phase 3 view below.

## Phase 3 — 🚩 Cabinet Scan (the flagship) ✅ *(code complete — same engine as Phase 0's Check tab, just run across the whole cabinet)*
*This is the feature Google structurally cannot do. Build this before any breadth.*
- ✅ **Whole-cabinet interaction matrix** — one tap scans every drug against every other drug (N×N), not just a pair. The "Scan my whole cabinet" button in My Cabinet reuses the exact curated + FDA-label engine, just applied to every pair instead of one.
- ✅ **Readable severity summary** — "2 major, 1 moderate to ask a pharmacist about" at the top; an all-clear scan still says "that isn't the same as safe," never green.
- ✅ **Cabinet map** — every saved med in one scannable chip row (name + drug class).
- ✅ **"What to ask your pharmacist" generator** — up to 4 questions, worst severity first, built only from what the scan actually found — never advice about what to do.

## Phase 4 — Depth & teaching ✅ *(complete)*
*Own the "why," which is where you obliterate content-farm pages.*
- ✅ **Full FDA label details** — the Decode overview card now has a second card below it: active/inactive ingredients, who shouldn't take it (contraindications), warnings, precautions, what it interacts with (the label's own prose), dosage & administration, and pregnancy/nursing info, exactly as printed on the label. Same sourcing rule as everything else — verbatim FDA text, never a calculated dose or personalized recommendation.
- ✅ **Similar & related medications** — a "🔎 Similar & related meds" button on the Decode card opens a popup with 3 tabs, all openFDA-sourced: **same drug class**, **other forms & strengths**, and **in combination products** (flags accidental double-dosing risk).
- ✅ **"Did you mean" spelling suggestions** — up to 5 similarly-spelled RxNorm matches shown as clickable chips instead of one silent guess.
- ✅ **Mechanism explainers** — a "Why do drug interactions happen at all?" methodology entry connects every interaction's individual "Why" line back to the handful of recurring mechanisms (CYP450/liver-enzyme competition, additive effects, electrolyte shifts, absorption interference).
- ✅ **Drug-class explainers (narrative)** — plain-English explainers for 16 common classes (NSAIDs, SSRIs, statins, ACE inhibitors, benzodiazepines, opioids, PPIs, macrolides, etc.), shown on Decode whenever a match is found.
- ✅ **Food & alcohol interactions** — a curated set (warfarin+vitamin K, MAOIs+tyramine, statins+grapefruit, alcohol+opioids/benzos/metronidazole/acetaminophen), shown on Decode.
- ✅ **Allergy / cross-sensitivity flags** — penicillin/cephalosporin, sulfa, and NSAID/aspirin sensitivity notes, same card.
- ✅ **Side effects sorted** — relabeled "Common side effects" and "Warnings" to explicitly frame mild-vs-serious, without inventing a new severity classification from unstructured text.
- ✅ **Pregnancy / breastfeeding label info** — factual label data (`pregnancy`, `nursing_mothers` fields), shown only when openFDA actually has it for that drug.
- 🔬 **Symptom checker** — requested 2026-07-21; conflicts directly with the Non-goals below ("No diagnosis or symptom-checker"). Declined; built the Symptoms tab (red-flag checklist + OTC-category lookup) as the safer alternative instead — see Phase 3.5 note in `PROGRESS.md`.

## Phase 5 — Breadth & reach 🔨
- ✅ **PWA** — installable (manifest + icons), a service worker caches the app shell for offline use, and My Cabinet falls back to a locally cached copy (read-only) when offline.
- ⬜ **Multi-language plain English** — Spanish first (huge real-world value; plays to your language work).
- ✅ **Printable caregiver one-pager** — a "🖨️ Print / save as PDF" button in My Cabinet prints a clean, plain black-on-white sheet (name, notes, dosing info) with all the app chrome stripped out — scoped so it never affects printing from any other tab.
- ⬜ **Share a read-only cabinet** via link/QR (for caregivers).
- ✅ **Voice input** — a mic button next to Decode, Check, and My Cabinet's inputs (Web Speech API, feature-detected — silently absent in browsers that don't support it, like Firefox). Decode auto-searches on speech since it's read-only; My Cabinet just fills the field so you can review before saving.

## Phase 6 — Trust & launch polish ⬜
- ⬜ **"Why I built this"** — in *your* voice, first person, not AI copy.
- ⬜ **FAQ** + full **sources/methodology page**.
- ⬜ **"Report an error"** feedback loop (shows humility + gives you a correction pipeline — judges love this).
- ✅ Accessibility pass — computed real WCAG contrast ratios for every core color pair in both themes (found and fixed several failures), added missing focus-visible states, fixed a pre-existing unstyled remove button, corrected ARIA roles on the similar/related modal's tabs.
- ⬜ Light, privacy-respecting analytics.
- ⬜ **CAC packaging** — demo video, written description, deploy check.

## Stretch / investigate 🔬
- 🔬 **Pill imprint identifier** — verify a current free image API exists (NLM's RxImage was deprecated; confirm the replacement before promising it).
- ⬜ Interaction/severity data visualizations.
- ⬜ "Medicine cabinet health score" style summary (framed as educational, not a safety guarantee).

---

## Deliberate NON-goals *(these keep it safe and defensible)*
Plainscript is an **educational reference**, not a clinical tool. It will **not**:
- Diagnose, or check symptoms → possible conditions.
- Calculate or recommend doses.
- Tell anyone to start, stop, or change a medication.
- Say a combination is "safe" — only that nothing *was found*.
- Handle emergencies (always routes to 911 / Poison Control).

Writing these down *is* the project's maturity. An ISEF judge or pharmacist will trust a tool that knows its limits far more than one that pretends it has none.

## Non-negotiable data & safety principles *(carry through every phase)*
1. **Facts come from authoritative sources** (openFDA, RxNorm, your curated set) — never invented by an LLM.
2. **The AI only rephrases** retrieved text; it never generates medical claims, and the original stays visible.
3. **Never a green checkmark.** "Nothing found" ≠ "safe."
4. **Every claim shows its source.** Visible provenance, always.
5. **Bounded honesty beats fake completeness.**

---

## What I need from you to start Phase 2
1. Your **Supabase project URL + anon (public) key** — new project or reuse an existing one?
2. Your **Google OAuth client ID/secret** to enable Google sign-in (email magic-link needs nothing extra).
3. Your **Cloudflare Worker URL** for the Claude proxy whenever you want to flip on Phase 1's plain-English mode.

## Suggested sequence to Oct 26
**0 → 2 → 3** is the spine. Get accounts + the cabinet scan working, because that's the demo that wins. Slot **Phase 1** (plain-English) in alongside 2 since the Worker's already wired. Everything from Phase 4 on is post-core — real value, but not worth risking the deadline for.
