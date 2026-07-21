/* Plainscript — Cloudflare Worker (Claude API proxy)
 *
 * Two jobs:
 *   1. Keep the Anthropic API key OFF the client.
 *   2. Make sure this endpoint can ONLY rephrase FDA label text into plain
 *      English. The safety rules are enforced HERE, server-side, so no client
 *      (or anyone who finds the URL) can repurpose it to generate medical
 *      claims, diagnoses, or advice.
 *
 * Deploy:
 *   1. Create a Worker at dash.cloudflare.com, or `npx wrangler deploy`.
 *   2. Add a secret named ANTHROPIC_API_KEY:
 *        `npx wrangler secret put ANTHROPIC_API_KEY`
 *      (or Dashboard → Worker → Settings → Variables → add secret)
 *   3. (Optional) set ALLOWED_ORIGIN to your GitHub Pages URL to lock CORS
 *      down to just your site.
 *   4. Copy the deployed URL into config.js as CLAUDE_PROXY_URL.
 *
 * Contract:   POST { text, label }   ->   { plain }
 */

const LOCKED_SYSTEM = `You rewrite excerpts of official FDA drug-label text into plain English at about an 8th-grade reading level.
Follow these rules exactly:
1. Use ONLY information present in the provided text.
2. Do NOT add any drug names, numbers, conditions, or claims that are not in the text.
3. Do NOT give advice, recommendations, or reassurance.
4. Keep it to 2-3 short sentences.
5. If the text does not clearly state something, leave it out.
Return only the rewritten text, nothing else.`;

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "invalid JSON" }, 400, cors); }

    // Cap and sanitize input — this proxy only ever sees label text.
    const text  = (body.text  || "").toString().slice(0, 6000);
    const label = (body.label || "section").toString().slice(0, 80);
    if (!text) return json({ plain: "" }, 200, cors);

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 400,
          system: LOCKED_SYSTEM, // enforced here — client cannot override it
          messages: [{ role: "user", content: `Section: ${label}\n\nText:\n${text}` }],
        }),
      });
      const data = await r.json();
      const plain = (data.content || []).map(b => b.text || "").join("").trim();
      return json({ plain }, 200, cors);
    } catch (e) {
      return json({ error: "upstream error" }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
