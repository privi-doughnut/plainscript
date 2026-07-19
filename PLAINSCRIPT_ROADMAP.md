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

## Phase 2 — Accounts + My Cabinet (Supabase) ⬜
*The thing that turns a lookup tool into something people come back to.*
- ⬜ Supabase auth — OAuth sign-in (GitHub is easiest; Google needs the verification dance you did for Rune Script).
- ⬜ **My Cabinet** — save the meds you actually take, once.
- ⬜ Per-med personal notes ("morning, with food").
- ⬜ Persist theme + settings to the user profile (so dark mode survives reloads).
- ⬜ Row-level security so a user only ever sees their own cabinet.

## Phase 3 — 🚩 Cabinet Scan (the flagship) ⬜
*This is the feature Google structurally cannot do. Build this before any breadth.*
- ⬜ **Whole-cabinet interaction matrix** — one tap scans every drug against every other drug (N×N), not just a pair.
- ⬜ **Readable severity summary** — "1 major, 2 moderate to ask about" at the top, details below.
- ⬜ **Cabinet map** — every med decoded in one clean, scannable view.
- ⬜ **"What to ask your pharmacist" generator** — turns the findings into 3–4 specific questions to bring to a real professional (grounded in the findings; never advice).

## Phase 4 — Depth & teaching ⬜
*Own the "why," which is where you obliterate content-farm pages.*
- ⬜ **Mechanism explainers** — *why* an interaction happens, in plain English (the CYP450 story, told like a human).
- ⬜ **Drug-class explainers** — "what statins/ACE inhibitors/SSRIs even are."
- ⬜ **Food & alcohol interactions** — surfaced from FDA labels.
- ⬜ **Allergy / cross-sensitivity flags** — e.g. penicillin-class awareness.
- ⬜ **Side effects sorted** — "common and mild" vs "call your doctor."
- ⬜ **Pregnancy / breastfeeding label info** — factual label data, carefully framed as label info, not advice.

## Phase 5 — Breadth & reach ⬜
- ⬜ **PWA** — installable, works offline for saved cabinet + curated set.
- ⬜ **Multi-language plain English** — Spanish first (huge real-world value; plays to your language work).
- ⬜ **Printable caregiver one-pager** — a clean sheet to hand a pharmacist or an elderly parent.
- ⬜ **Share a read-only cabinet** via link/QR (for caregivers).
- ⬜ **Voice input** — say the drug name (you live in voice-to-text; your users will too).

## Phase 6 — Trust & launch polish ⬜
- ⬜ **"Why I built this"** — in *your* voice, first person, not AI copy.
- ⬜ **FAQ** + full **sources/methodology page**.
- ⬜ **"Report an error"** feedback loop (shows humility + gives you a correction pipeline — judges love this).
- ⬜ Accessibility pass (screen reader, contrast, keyboard).
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
2. Which **OAuth provider** to lead with — GitHub (fast) or Google (needs verification)?
3. Your **Cloudflare Worker URL** for the Claude proxy whenever you want to flip on Phase 1's plain-English mode.

## Suggested sequence to Oct 26
**0 → 2 → 3** is the spine. Get accounts + the cabinet scan working, because that's the demo that wins. Slot **Phase 1** (plain-English) in alongside 2 since the Worker's already wired. Everything from Phase 4 on is post-core — real value, but not worth risking the deadline for.
