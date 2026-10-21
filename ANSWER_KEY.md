# Answer key — only after trying for 10 minutes

If you use one of these, say so in your AI disclosure (e.g. "I got stuck on X and used a
worked example"). Then in your own words, say what it does.

**Task 1:** `min-height:44px;`

**Task 4:**
```js
if (box.querySelector(".gloss")) box.insertAdjacentHTML("beforeend", `<p class="status">${esc(t("glossary_hint"))}</p>`);
```
Why: `.gloss` is the class on every underlined word, and `glossary_hint` is the existing key.

**Task 5, step 1:** name it `scheduled`:
```js
const scheduled = meds.filter(m => parseTimes(m.schedule).length).length;
```
Step 2 (the tile):
```js
<div class="stat-tile"><div class="stat-num">${scheduled}</div><div class="stat-lbl">${esc(t("insights_scheduled"))}</div></div>
```

**Feature 1:** the blanks are for you to write from the label. I won't write the medical
sentences for you, and neither should anyone else; they must match the label. Example of
the *shape* only, using a rule that already exists:
`severity:"major"` and a `mgmt` ending "...confirm with a pharmacist."

**Feature 2, step 2:** `INTERACTIONS.length`
