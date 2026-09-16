"use strict";
/*
 * engine.test.js — tests for Plainscript's interaction engine.
 *
 * Scope note, deliberately narrow: these cover the functions that decide whether
 * two medicines interact and how that gets reported. That is the part of the app
 * that makes medical claims, so it is the part where being wrong can hurt someone.
 * UI, network, auth and DOM behaviour are NOT covered here — see README.md.
 *
 * Run: node --test tests/
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadEngine, drug } = require("./extract.js");

const engine = loadEngine();
const {
  sameDrug, sideHit, baseTokens, labelMentions, analyzeDrugPairs,
  renderUnverifiedWarning, renderResults, INTERACTIONS, ALIASES, NSAIDS,
} = engine;

/* ------------------------------------------------------------------ *
 * Curated data sanity — these also fail loudly if the rule set is
 * corrupted or accidentally emptied, which would silently disarm the
 * whole interaction checker.
 * ------------------------------------------------------------------ */
test("curated data", async (t) => {
  await t.test("the interaction rule set is non-empty", () => {
    assert.ok(INTERACTIONS.length > 0, "INTERACTIONS must not be empty");
  });

  await t.test("every rule is well-formed", () => {
    for (const rule of INTERACTIONS) {
      assert.ok(Array.isArray(rule.a) && rule.a.length, `rule missing 'a' tokens: ${JSON.stringify(rule.a)}`);
      assert.ok(Array.isArray(rule.b) && rule.b.length, `rule missing 'b' tokens`);
      assert.ok(["major", "moderate", "minor"].includes(rule.severity),
        `unexpected severity: ${rule.severity}`);
      assert.ok(rule.what && rule.what.en, "rule missing English 'what' text");
      assert.ok(rule.why && rule.why.en, "rule missing English 'why' text");
      assert.ok(rule.mgmt && rule.mgmt.en, "rule missing English 'mgmt' text");
    }
  });

  await t.test("rule matching tokens are lowercase (they compare against openFDA values)", () => {
    for (const rule of INTERACTIONS) {
      for (const tok of [...rule.a, ...rule.b]) {
        assert.equal(tok, tok.toLowerCase(), `rule token not lowercase: ${tok}`);
      }
    }
  });

  await t.test("the warfarin + NSAID major rule is present", () => {
    const found = INTERACTIONS.some((r) =>
      (r.a.includes("warfarin") && r.b.includes("ibuprofen")) ||
      (r.b.includes("warfarin") && r.a.includes("ibuprofen")));
    assert.ok(found, "the textbook warfarin/NSAID bleeding interaction is missing");
  });
});

/* ------------------------------------------------------------------ *
 * sameDrug — stops one medicine being analysed against itself.
 * ------------------------------------------------------------------ */
test("sameDrug", async (t) => {
  await t.test("matches the same name typed twice, ignoring case and whitespace", () => {
    assert.equal(sameDrug(drug("aspirin"), drug("  Aspirin ")), true);
  });

  await t.test("matches a brand against its own generic via shared rxcui", () => {
    const bayer = drug("bayer", { rxcui: "1191" });
    const aspirin = drug("aspirin", { generic: "aspirin", rxcui: "1191" });
    assert.equal(sameDrug(bayer, aspirin), true);
  });

  await t.test("matches two different brands of the same generic", () => {
    const advil = drug("advil", { generic: "ibuprofen" });
    const motrin = drug("motrin", { generic: "ibuprofen" });
    assert.equal(sameDrug(advil, motrin), true);
  });

  await t.test("treats genuinely different drugs as different", () => {
    const warfarin = drug("warfarin", { generic: "warfarin sodium", rxcui: "11289" });
    const aspirin = drug("aspirin", { generic: "aspirin", rxcui: "1191" });
    assert.equal(sameDrug(warfarin, aspirin), false);
  });

  await t.test("falls back to name comparison when neither has label data", () => {
    assert.equal(sameDrug(drug("aspirin"), drug("warfarin")), false);
    assert.equal(sameDrug(drug("aspirin"), drug("aspirin")), true);
  });

  await t.test("handles one side having no label at all", () => {
    const unresolved = drug("mystery");
    const resolved = drug("aspirin", { generic: "aspirin", rxcui: "1191" });
    assert.equal(sameDrug(unresolved, resolved), false);
  });

  await t.test("handles a label present but generic/rxcui missing", () => {
    const partial = drug("thing", { interactionsText: "some text" });
    assert.equal(sameDrug(partial, drug("other")), false);
    assert.equal(sameDrug(partial, drug("thing")), true, "should still fall back to the name");
  });

  /*
   * SAFETY CASE. Taking Vicodin (hydrocodone + acetaminophen) alongside Tylenol
   * (acetaminophen) is a real and common way people overdose on acetaminophen.
   * The dedup added to stop "aspirin vs aspirin" nonsense must never swallow
   * this pair, because that would hide a genuine danger.
   */
  await t.test("does NOT dedup a combination product against one of its own ingredients", () => {
    const vicodin = drug("vicodin", {
      generic: "hydrocodone bitartrate and acetaminophen", rxcui: "857001",
    });
    const tylenol = drug("tylenol", { generic: "acetaminophen", rxcui: "161" });
    assert.equal(sameDrug(vicodin, tylenol), false,
      "combination product and its own ingredient must remain a real pair");
  });
});

/* ------------------------------------------------------------------ *
 * sideHit — whether a drug's tokens match one side of a curated rule.
 * ------------------------------------------------------------------ */
test("sideHit", async (t) => {
  await t.test("matches an exact token", () => {
    assert.equal(sideHit(new Set(["ibuprofen"]), ["ibuprofen"]), true);
  });

  await t.test("matches a real class group", () => {
    assert.equal(sideHit(new Set(["ibuprofen"]), NSAIDS), true);
    assert.equal(sideHit(new Set(["naproxen"]), NSAIDS), true);
  });

  await t.test("rejects an unrelated drug", () => {
    assert.equal(sideHit(new Set(["lisinopril"]), NSAIDS), false);
  });

  await t.test("allows a substring match when the rule token is >= 4 chars", () => {
    assert.equal(sideHit(new Set(["acetaminophen"]), ["acet"]), true);
  });

  /*
   * The length guard is what stops a 2-3 letter rule token matching half the
   * pharmacopoeia by substring. Without it, a rule token like "ace" would fire
   * on acetaminophen, acebutolol and anything else containing those letters.
   */
  await t.test("blocks a substring match when the rule token is < 4 chars", () => {
    assert.equal(sideHit(new Set(["acetaminophen"]), ["ace"]), false);
  });

  await t.test("still allows an exact match on a short token", () => {
    assert.equal(sideHit(new Set(["ace"]), ["ace"]), true);
  });

  await t.test("returns false for an empty token set or empty rule side", () => {
    assert.equal(sideHit(new Set(), NSAIDS), false);
    assert.equal(sideHit(new Set(["ibuprofen"]), []), false);
  });
});

/* ------------------------------------------------------------------ *
 * baseTokens + ALIASES — turning a typed name into matchable tokens.
 * ------------------------------------------------------------------ */
test("baseTokens", async (t) => {
  await t.test("trims and lowercases the typed name", () => {
    assert.deepEqual([...baseTokens("  ASPIRIN  ")], ["aspirin"]);
  });

  await t.test("adds the generic for a known brand alias", () => {
    const tokens = [...baseTokens(" Advil ")];
    assert.ok(tokens.includes("advil"), "keeps the typed brand");
    assert.ok(tokens.includes("ibuprofen"), "adds the generic from ALIASES");
  });

  await t.test("returns only the typed name for an unknown drug", () => {
    assert.deepEqual([...baseTokens("zzzznotadrug")], ["zzzznotadrug"]);
  });

  await t.test("alias table maps brands to lowercase generics", () => {
    for (const [brand, generic] of Object.entries(ALIASES)) {
      assert.equal(brand, brand.toLowerCase(), `alias key not lowercase: ${brand}`);
      assert.equal(generic, generic.toLowerCase(), `alias value not lowercase: ${generic}`);
    }
  });

  await t.test("a brand alias resolves into a curated rule match", () => {
    // end-to-end: typing "Advil" must hit the NSAID side of the warfarin rule
    assert.equal(sideHit(baseTokens("Advil"), NSAIDS), true);
  });
});

/* ------------------------------------------------------------------ *
 * labelMentions — the FDA-label cross-reference layer.
 * ------------------------------------------------------------------ */
test("labelMentions", async (t) => {
  await t.test("finds a drug named in another drug's interaction text", () => {
    const x = drug("drugx", { interactionsText: "Avoid concurrent use with warfarin." });
    const y = drug("warfarin");
    const m = labelMentions(x, y);
    assert.ok(m, "expected a mention");
    assert.equal(m.from, "drugx");
    assert.equal(m.to, "warfarin");
    assert.equal(m.term, "warfarin");
  });

  await t.test("returns null when the source drug has no label", () => {
    assert.equal(labelMentions(drug("nolabel"), drug("warfarin")), null);
  });

  await t.test("returns null when the label has no interaction text", () => {
    const x = drug("drugx", { generic: "drugx" });
    assert.equal(labelMentions(x, drug("warfarin")), null);
  });

  await t.test("returns null when the drug is not named", () => {
    const x = drug("drugx", { interactionsText: "No relevant interactions reported." });
    assert.equal(labelMentions(x, drug("warfarin")), null);
  });

  /*
   * Tokens under 5 characters are skipped to avoid absurd false positives —
   * without this, a short generic name would match inside ordinary English words.
   */
  await t.test("skips candidate tokens shorter than 5 characters", () => {
    const x = drug("drugx", { interactionsText: "Take with tea or water." });
    assert.equal(labelMentions(x, drug("tea")), null);
  });

  await t.test("extracts the surrounding sentence as the snippet", () => {
    const x = drug("drugx", {
      interactionsText: "First sentence here. Take warfarin carefully. Third sentence.",
    });
    const m = labelMentions(x, drug("warfarin"));
    assert.equal(m.snippet, "Take warfarin carefully.");
  });

  await t.test("truncates an over-long snippet and marks it with an ellipsis", () => {
    const longText = "Patients " + "x".repeat(100) + " should avoid warfarin " + "y".repeat(300);
    const m = labelMentions(drug("drugx", { interactionsText: longText }), drug("warfarin"));
    assert.equal(m.snippet.length, 221, "220 chars plus the ellipsis");
    assert.ok(m.snippet.endsWith("…"));
  });

  await t.test("collapses whitespace in the snippet", () => {
    const x = drug("drugx", { interactionsText: "Avoid\n\n  warfarin   entirely." });
    const m = labelMentions(x, drug("warfarin"));
    assert.equal(m.snippet, "Avoid warfarin entirely.");
  });
});

/* ------------------------------------------------------------------ *
 * analyzeDrugPairs — the top-level N x N engine.
 * ------------------------------------------------------------------ */
test("analyzeDrugPairs", async (t) => {
  await t.test("fires the curated warfarin + NSAID rule at major severity", () => {
    const { findings, mentions } = analyzeDrugPairs([drug("warfarin"), drug("ibuprofen")]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].rule.severity, "major");
    assert.equal(mentions.length, 0);
  });

  await t.test("matches the rule regardless of the order the drugs are entered", () => {
    const forward = analyzeDrugPairs([drug("warfarin"), drug("ibuprofen")]);
    const reverse = analyzeDrugPairs([drug("ibuprofen"), drug("warfarin")]);
    assert.equal(forward.findings.length, 1);
    assert.equal(reverse.findings.length, 1);
  });

  /*
   * A curated rule carries a reviewed severity; a label mention does not. When
   * both would fire for a pair, the curated rule must win, or the pair would be
   * downgraded from "major" to an unranked note.
   */
  await t.test("a curated rule takes precedence over a label mention for the same pair", () => {
    const warfarin = drug("warfarin", {
      interactionsText: "Concomitant use with ibuprofen increases bleeding risk.",
    });
    const { findings, mentions } = analyzeDrugPairs([warfarin, drug("ibuprofen")]);
    assert.equal(findings.length, 1, "curated finding recorded");
    assert.equal(mentions.length, 0, "must not also be reported as a mere label mention");
  });

  await t.test("falls back to a label mention when no curated rule matches", () => {
    const alpha = drug("drugalpha", {
      interactionsText: "Avoid using with drugbeta due to additive effects.",
    });
    const { findings, mentions } = analyzeDrugPairs([alpha, drug("drugbeta")]);
    assert.equal(findings.length, 0);
    assert.equal(mentions.length, 1);
    assert.equal(mentions[0].to, "drugbeta");
  });

  await t.test("skips a pair that is really the same medicine twice", () => {
    const { findings, mentions } = analyzeDrugPairs([drug("aspirin"), drug("  Aspirin ")]);
    assert.equal(findings.length, 0);
    assert.equal(mentions.length, 0);
  });

  await t.test("does not let a label naming its own ingredient self-match", () => {
    // an FDA label routinely names its own ingredient ("concurrent use of NSAIDs...")
    const a = drug("aspirin", { interactionsText: "Concurrent use of aspirin may increase risk." });
    const b = drug("aspirin", { interactionsText: "Concurrent use of aspirin may increase risk." });
    const { findings, mentions } = analyzeDrugPairs([a, b]);
    assert.equal(findings.length + mentions.length, 0, "aspirin must not interact with aspirin");
  });

  await t.test("considers every unique pair", () => {
    const { findings } = analyzeDrugPairs([drug("warfarin"), drug("ibuprofen"), drug("naproxen")]);
    // warfarin x ibuprofen and warfarin x naproxen both fire; ibuprofen x naproxen does not
    assert.equal(findings.length, 2);
  });

  await t.test("returns empty results for an empty list", () => {
    const { findings, mentions } = analyzeDrugPairs([]);
    assert.equal(findings.length, 0);
    assert.equal(mentions.length, 0);
  });

  await t.test("returns empty results for a single drug", () => {
    const { findings, mentions } = analyzeDrugPairs([drug("aspirin")]);
    assert.equal(findings.length, 0);
    assert.equal(mentions.length, 0);
  });

  await t.test("reports each interacting pair once, not twice", () => {
    const { findings } = analyzeDrugPairs([drug("warfarin"), drug("ibuprofen")]);
    assert.equal(findings.length, 1, "a pair must not be reported from both directions");
  });
});

/* ------------------------------------------------------------------ *
 * resolveAll — concurrency-capped parallel resolution.
 * ------------------------------------------------------------------ */
test("resolveAll", async (t) => {
  /* Build an engine whose resolveForAnalysis stub records concurrency. */
  function instrumented() {
    const state = { calls: 0, inFlight: 0, maxInFlight: 0 };
    const sandbox = loadEngine({
      resolveForAnalysis: async (name) => {
        state.calls++;
        state.inFlight++;
        state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
        await new Promise((r) => setTimeout(r, 3));
        state.inFlight--;
        return { name, display: name, tokens: new Set([name]), label: null, labelUnverified: false };
      },
    });
    return { resolveAll: sandbox.resolveAll, state };
  }

  await t.test("preserves input order even though lookups finish out of order", async () => {
    const names = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
    const { resolveAll } = instrumented();
    const out = await resolveAll(names);
    // Array.from() brings the sandbox array into this realm — see the
    // cross-realm note in extract.js.
    assert.deepEqual(Array.from(out).map((d) => d.name), names);
  });

  await t.test("resolves every entry exactly once", async () => {
    const names = ["a", "b", "c", "d", "e"];
    const { resolveAll, state } = instrumented();
    const out = await resolveAll(names);
    assert.equal(out.length, names.length);
    assert.equal(state.calls, names.length);
    assert.ok(out.every(Boolean), "no holes in the result array");
  });

  /*
   * openFDA is a public, keyless API. Firing a 20-medicine cabinet at it all at
   * once risks being throttled, which would surface as spurious "couldn't check"
   * warnings, so the cap matters for correctness and not just politeness.
   */
  await t.test("never exceeds the concurrency cap", async () => {
    const { resolveAll, state } = instrumented();
    await resolveAll(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]);
    assert.ok(state.maxInFlight <= 5, `expected <= 5 in flight, saw ${state.maxInFlight}`);
  });

  await t.test("honours a custom limit", async () => {
    const { resolveAll, state } = instrumented();
    await resolveAll(["a", "b", "c", "d", "e", "f", "g", "h"], 2);
    assert.ok(state.maxInFlight <= 2, `expected <= 2 in flight, saw ${state.maxInFlight}`);
  });

  await t.test("actually runs in parallel rather than one at a time", async () => {
    const { resolveAll, state } = instrumented();
    await resolveAll(["a", "b", "c", "d", "e", "f"]);
    assert.ok(state.maxInFlight > 1, "expected more than one lookup in flight");
  });

  await t.test("handles fewer names than the limit", async () => {
    const { resolveAll } = instrumented();
    const out = await resolveAll(["x", "y"]);
    assert.equal(out.length, 2);
  });

  await t.test("handles an empty list without hanging", async () => {
    const { resolveAll } = instrumented();
    const out = await resolveAll([]);
    assert.ok(Array.isArray(out), "still returns an array");
    assert.equal(out.length, 0);
  });
});

/* ------------------------------------------------------------------ *
 * renderUnverifiedWarning — guards a safety invariant.
 *
 * A failed FDA lookup must never be presented the same way as a completed
 * check that found nothing. "We couldn't check" and "we checked and found
 * nothing" are different claims, and conflating them is how a tool quietly
 * implies safety it has not established.
 * ------------------------------------------------------------------ */
test("renderUnverifiedWarning", async (t) => {
  await t.test("renders nothing when every lookup succeeded", () => {
    assert.equal(renderUnverifiedWarning([drug("aspirin"), drug("warfarin")]), "");
  });

  await t.test("renders nothing for an empty drug list", () => {
    assert.equal(renderUnverifiedWarning([]), "");
  });

  await t.test("names the drug that could not be checked", () => {
    const html = renderUnverifiedWarning([drug("aspirin", { labelUnverified: true })]);
    assert.ok(html.includes("aspirin"), "must name the affected drug");
    assert.ok(html.includes("Couldn't fully check"), "must say the check was incomplete");
  });

  await t.test("distinguishes itself from a 'nothing found' result", () => {
    const html = renderUnverifiedWarning([drug("aspirin", { labelUnverified: true })]);
    assert.ok(html.includes("different from"), "must explicitly contrast with 'nothing found'");
    assert.ok(/nothing found/i.test(html));
  });

  await t.test("uses singular wording for one failure", () => {
    const html = renderUnverifiedWarning([drug("aspirin", { labelUnverified: true })]);
    assert.ok(html.includes("this drug"), "singular phrasing");
    assert.ok(!html.includes("these drugs"));
  });

  await t.test("uses plural wording and names all failures", () => {
    const html = renderUnverifiedWarning([
      drug("aspirin", { labelUnverified: true }),
      drug("warfarin", { labelUnverified: true }),
    ]);
    assert.ok(html.includes("these drugs"), "plural phrasing");
    assert.ok(html.includes("aspirin") && html.includes("warfarin"), "names every failure");
  });

  await t.test("names only the failed lookups, not the successful ones", () => {
    const html = renderUnverifiedWarning([
      drug("aspirin", { labelUnverified: true }),
      drug("warfarin"),
    ]);
    assert.ok(html.includes("aspirin"));
    assert.ok(!html.includes("warfarin"), "a successful lookup must not be listed as failed");
  });

  await t.test("escapes HTML in the drug name", () => {
    const nasty = drug("x", { labelUnverified: true, display: '<script>alert(1)</script>' });
    const html = renderUnverifiedWarning([nasty]);
    assert.ok(!html.includes("<script>"), "must not emit a raw script tag");
    assert.ok(html.includes("&lt;script&gt;"), "must emit the escaped form");
  });
});

/* ------------------------------------------------------------------ *
 * renderResults — severity ordering and the unverified banner.
 * ------------------------------------------------------------------ */
test("renderResults", async (t) => {
  const major = INTERACTIONS.find((r) => r.severity === "major");
  const moderate = INTERACTIONS.find((r) => r.severity === "moderate");

  await t.test("sorts more severe findings first regardless of input order", () => {
    const box = {};
    const A = drug("a"), B = drug("b");
    const findings = [{ A, B, rule: moderate }, { A, B, rule: major }];
    renderResults(box, [], findings, []);
    assert.equal(findings[0].rule.severity, "major");
    assert.ok(box.innerHTML.indexOf("v-major") < box.innerHTML.indexOf("v-moderate"),
      "the major verdict must be rendered above the moderate one");
  });

  await t.test("shows the cautious empty state, never a green all-clear", () => {
    const box = {};
    renderResults(box, [drug("aspirin")], [], []);
    assert.ok(box.innerHTML.includes("nofind"), "expected the cautious empty state");
    assert.ok(!/\bsafe\b/i.test(box.innerHTML),
      "the empty state must never assert that a combination is safe");
  });

  await t.test("puts the unverified-lookup warning above the results", () => {
    const box = {};
    const drugs = [drug("aspirin", { labelUnverified: true }), drug("warfarin")];
    renderResults(box, drugs, [], []);
    assert.ok(box.innerHTML.includes("Couldn't fully check"));
    assert.ok(box.innerHTML.indexOf("Couldn't fully check") < box.innerHTML.indexOf("nofind"),
      "the warning must appear before the empty state it qualifies");
  });
});
