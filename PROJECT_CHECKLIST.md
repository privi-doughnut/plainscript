# Production-readiness checklist

A reusable checklist distilled from everything requested while building Plainscript — a
public, medical-adjacent web app. Paste this into a fresh Claude Code session on any
project and ask it to work through the checklist.

Every item here came from a real instruction and caught at least one real defect. Items
marked **🩺** matter most for health, finance, or anything where being wrong hurts
someone; skip them for a landing page.

---

## How to use this

> **Prompt to paste alongside it:**
> "Work through PROJECT_CHECKLIST.md against this codebase. For each item: verify it
> yourself rather than assuming, and report PASS / FAIL / N-A with evidence — a file:line,
> a measured number, or a command output. Don't mark anything PASS you haven't actually
> checked. Fix what you find, and tell me what you couldn't verify."

Two rules that made the difference on Plainscript:
- **Measure, don't eyeball.** Every contrast, count and ratio below should be a number
  produced by running something, not an impression.
- **Verify the fix bites.** After adding a test or a guard, deliberately break the thing
  it protects and confirm it fails. A passing suite proves nothing on its own.

---

## 1. Security

- [ ] **Inventory every endpoint** an attacker can reach: public API routes, proxies,
      serverless functions, database policies, storage buckets, webhooks.
- [ ] **Any unauthenticated proxy to a paid API?** If a public URL forwards to something
      billed to you, someone can run up your bill. Set a hard spend cap at the provider,
      restrict by origin, and rate-limit.
- [ ] **Can the client influence a server-side prompt, model, or token budget?** For LLM
      proxies: confirm the system prompt is locked server-side and every client-supplied
      field is whitelisted, not passed through.
- [ ] **Row-level security on every table**, scoped to the authenticated user. Verify one
      user genuinely cannot read another's rows — test it, don't read the policy and assume.
- [ ] **`SECURITY DEFINER` / elevated functions**: pinned `search_path`, and returning the
      narrowest column set possible.
- [ ] **Secrets**: none in the repo, none in client bundles, none in git history. Confirm
      which "public" keys are genuinely safe to publish and why.
- [ ] **Capability tokens** (share links, invites, resets): sufficient entropy, revocable,
      expiring, and **never sent to a third party** — including as a query parameter to an
      image or QR generator. *(This was a real finding: share URLs containing live access
      tokens were being handed to a third-party QR service on every panel open.)*
- [ ] **XSS**: every user-controlled value reaching an HTML sink is escaped. Verify the
      escape helper itself is correct, then spot-check the newest code — recently added
      features are where the gaps are.
- [ ] **Sensitive data in URLs, history, or referrers?**
- [ ] **Third parties your client calls directly** — what do they see? (An API called from
      the browser sees the user's IP and their query.) Disclose it.
- [ ] **Local/offline storage**: what's written, does it leak across users on a shared
      device, and is it cleared on sign-out?
- [ ] **`.git` and dev files are not served** by the static host.

## 2. Legal and compliance 🩺

- [ ] **Privacy policy and terms exist, are linked from the footer, and are accurate** —
      written from what the code actually does, not from a template. Read the schema and
      the server code before writing a word of it.
- [ ] **Never promise what the app doesn't do.** If deletion isn't self-service, say so.
- [ ] **Consumer health data laws** apply even to free hobby projects — Washington's My
      Health My Data Act has no small-business exemption, and Nevada and Connecticut have
      similar statutes. Broadly: a prominently linked disclosure and opt-in consent before
      collecting health-adjacent data.
- [ ] **A real consent moment** at signup, not just a policy link in the footer.
- [ ] **Account deletion**: both app stores require in-app self-service deletion for
      account-creating apps. Needed before any store submission.
- [ ] **COPPA** — only if genuinely directed at under-13s. Don't add an age gate reflexively.
- [ ] **Regulatory boundary** 🩺 — for health tools, know which side of the FDA
      software/clinical-decision-support line you're on, and which planned features would
      cross it.
- [ ] **AI disclosure** where an LLM touches user-facing content, especially health or
      finance.
- [ ] **Placeholders are filled** before pages go live. A published policy with
      `[YOUR STATE]` in it is worse than no policy.
- [ ] **An actual attorney reviews it** before wide launch. No AI review substitutes.

## 3. Accessibility

- [ ] **Run a real automated audit** — axe-core against the live DOM, not a static guess:
      ```js
      await new Promise((r,j)=>{const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
        s.onload=r;s.onerror=j;document.head.appendChild(s);});
      const res = await axe.run(document,{resultTypes:['violations']});
      console.table(res.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})));
      ```
      Disable animations first (`*{animation:none!important}`) or you'll get transient
      failures from elements measured mid-fade.
- [ ] **Audit every view**, not just the first — a landing page and the app behind it are
      different documents.
- [ ] **Measure contrast for every text pair in every theme.** Compute ratios; don't trust
      a palette because it looks fine. *(This caught a primary button failing in 6 of 7
      themes, including 1.58:1 in the accessibility theme.)*
- [ ] **No hardcoded colour on a themed background.** If the background is a variable, the
      text colour on it must be too — including hover, pressed and icon states. *(This one
      pattern caused three separate contrast bugs.)*
- [ ] **Landmarks**: one `main` per visible view, and no content outside a landmark.
- [ ] **Visible focus** on everything focusable.
- [ ] **`prefers-reduced-motion` honoured** — and animations degrade to their *end state*,
      never to nothing. A carousel should stop on a real slide, not go blank.
- [ ] **Touch targets ≥ 44×44px** for anything thumb-operated.
- [ ] **Semantics before ARIA** — a real `<button>`, `<aside>`, `<select>` beats a div with
      a role.
- [ ] **Keyboard-only pass** through the primary flow.
- [ ] **State what was NOT tested.** Automated tools catch roughly a third of real problems.
      No screen-reader testing? Say so. Zero violations is a floor, not a certificate.

## 4. UI and design

- [ ] **Design tokens for colour, spacing, type, and radius** — and actually use them.
      Count the distinct hardcoded values; if there are 27 spacing values and 20 font
      sizes, the system exists on paper only.
- [ ] **Type scale steps of ≥ ~1.25×.** Half-pixel steps (14px vs 14.5px) are invisible and
      buy nothing.
- [ ] **Every theme defines every token.** A missing one silently inherits and looks broken
      in a way that's hard to spot.
- [ ] **Semantic colour is separate from brand colour** 🩺 — if red means "danger", the
      accent must never be red. Where an accent and a semantic colour collide, the accent
      yields.
- [ ] **Never a green "all clear"** for something you can't actually guarantee. Colour is a
      claim.
- [ ] **Controls fit their content** — a `<select>` sizes to its *longest* option, not the
      selected one; fix it with measurement if it matters.
- [ ] **Real empty, loading, and error states.** A skeleton says "something is coming"; a
      progress readout says how much has arrived.
- [ ] **Never fake progress.** Only show a percentage you actually know. 🩺 A fake spinner
      on a serious tool is the same overclaiming the product exists to avoid.
- [ ] **Animate only `transform` and `opacity`.** Everything else costs layout or paint.
- [ ] **Two duration regimes**: interactive 200–600ms, ambient 6s+. The 1–3s band reads as
      fidgety.
- [ ] **Text fits its container** — `text-wrap: balance` on headings, `overflow-wrap` on
      unbroken strings, `overflow-x: auto` on wide tables.
- [ ] **Check at 390px, in both themes, and in your longest-text language.** RTL too if you
      ship it.
- [ ] **Service worker gotcha**: your changes won't appear until you unregister it. Budget
      for the confusion.

## 5. Correctness and testing

- [ ] **Test the parts where being wrong causes harm** 🩺 — not everything, but those,
      properly.
- [ ] **Mutation-test the suite**: break the code deliberately, confirm tests fail. A green
      suite proves nothing by itself.
- [ ] **Use the real production data** in tests (the real rule set, the real config) so
      corrupting it fails the build.
- [ ] **Never let a failure look like a successful negative result** 🩺 — "the lookup
      failed" and "we checked and found nothing" are different claims, and conflating them
      is a safety bug, not a cosmetic one.
- [ ] **Empty `catch` blocks are a decision to lie by omission.** The catch block is where
      you decide what the user is told.
- [ ] **Bad input**: empty, whitespace, very long, unicode, emoji, duplicates, and the
      same thing entered twice.
- [ ] **State the denominator** 🩺 — if you checked against 17 rules, say 17. "Nothing
      found" without a denominator reads as reassurance.
- [ ] **Verify third-party output before trusting it.** Including this checklist's own
      findings — re-run the check yourself.

## 6. Honesty and framing 🩺

The category that caught the most real problems.

- [ ] **Does any copy reassure where the system can't actually guarantee?** Check the
      *emphasis*, not just the literal truth — people read the first clause.
- [ ] **Is every limitation stated in the UI**, not just in a code comment or the docs?
- [ ] **Does anything imply computation that isn't happening?**
- [ ] **Do claims on the marketing page survive the same sourcing rule as the app?**
- [ ] **If AI wrote part of it, is the disclosure accurate and checkable?** An
      understatement someone can verify in `git log` is worse than a full admission.
- [ ] **What does the product refuse to do, and is that visible?** Knowing what a tool
      should refuse is part of designing it — and it's usually the most differentiating
      thing about it.

---

## Running order

Security → Legal → Correctness → Accessibility → UI → Honesty.

Security and legal shape architecture, so they come first. Honesty comes last because it's
a review of everything above, and it's the pass most likely to find something that matters.
