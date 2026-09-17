# Accessibility

What has actually been tested, what was found, and what is deliberately not claimed.
Kept on file because a documented good-faith effort is itself risk-reducing — the
legal preflight in `PROGRESS.md` §7 recommends exactly this.

## Automated audit

**Tool:** axe-core 4.10.2, run in-browser against the live DOM (not a static scan).
**Date:** 2026-09-17
**Scope:** both views — the marketing landing and the app itself.

**Result: 0 violations in both views.**

Re-run it any time:

```js
// paste in DevTools console on the running app
await new Promise((res,rej)=>{const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  s.onload=res;s.onerror=rej;document.head.appendChild(s);});
const r = await axe.run(document,{resultTypes:['violations']});
console.table(r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})));
```

Disable animations first (`*{animation:none!important}`) or axe will measure elements
mid-fade during the hero entrance and report transient contrast failures that don't
exist once the animation settles. That is a measurement artifact, not a defect.

## Found and fixed in this audit

| Issue | Impact | Detail |
|---|---|---|
| Primary button contrast | **serious** | `button.go` hardcoded `color:#fff` over `var(--accent)`. Fine in Light, but every dark-ground theme has a bright accent, so white-on-accent failed in **6 of 7 themes** — 2.36:1 in the default Dark theme and 1.58:1 in High contrast, against a 4.5:1 minimum. This is the app's main action button (Decode, Check, Save, Scan). Fixed with a per-theme `--on-accent` token; now 5.65–10.83:1 everywhere. |
| Pressed toggle contrast | serious | Same hardcoded white on `.themetoggle[aria-pressed="true"]`, including its hover and icon. Same fix. |
| Safety bar outside landmarks | moderate | The persistent disclaimer sat outside every landmark in both views. Now an `<aside aria-label="Safety notice">`, which is both the correct element and a landmark. |
| Landing had no main landmark | moderate | In landing mode the app's `<main>` is `display:none`, so the document had no main landmark and none of the landing content sat inside one. The landing now has its own `<main>`; only one of the two is ever visible, so the hidden one is excluded from the accessibility tree. |

Earlier, the same class of bug was fixed on severity pills: text colour was hardcoded
white with a correction scoped only to `[data-theme="dark"]`, so every other
dark-ground theme had white-on-bright-bar at roughly 3:1. Severity pill text now comes
from per-theme `--*-on` tokens.

**The pattern worth remembering:** every one of these was a hardcoded `#fff` on a
themed background. When a background is a variable, the text colour on it has to be a
variable too.

## Contrast

Every text pair in all seven themes is measured, not eyeballed — `--ink`, `--ink-soft`,
`--ink-faint` on `--paper`, `--accent` on `--card`, each severity ink on its background,
and each severity pill's text on its bar.

**Lowest ratio anywhere: 4.8:1.** Zero pairs below WCAG AA. Most body text clears AAA.
High contrast reaches 21:1 on primary text.

## Built in, not bolted on

- 17 `:focus-visible` rules; focus is never removed without a replacement.
- `prefers-reduced-motion` honoured throughout. Animations degrade to their *end state*,
  never to nothing — the hero mark holds a considered angle, the carousel stops on a real
  slide rather than going blank, and it stops auto-advancing entirely.
- Primary tap targets are 44×44px (Apple HIG; clears WCAG 2.2 SC 2.5.8's 24px AA floor).
- ARIA on the tab interface, live regions on async results, `aria-hidden` on decoration.
- 13 languages including right-to-left Arabic, with script-appropriate typography.
- An easy-reading mode, a low-literacy pictogram mode, and read-aloud.
- Severity is never conveyed by colour alone — every severity carries a text label and a
  glyph, which is also why the tightest accent/severity hue pairing (Rose, 26°) is
  defensible.

## Not claimed

- **No screen-reader testing with real assistive technology.** Nothing here has been
  driven with VoiceOver, NVDA or JAWS. Automated tools catch roughly a third of real
  accessibility problems; the rest need a human, ideally one who uses AT daily.
- **No testing with actual users** who have low vision, low literacy, or motor
  impairments — the people this app is explicitly for.
- Zero axe violations means no *automatically detectable* violations. It is a floor,
  not a certificate.

Next most valuable step: one pass with VoiceOver on the Decode → Check → Cabinet flow.
