/* Plainscript — Cloudflare Worker (Claude API proxy)
 *
 * Two jobs:
 *   1. Keep the Anthropic API key OFF the client.
 *   2. Make sure this endpoint can ONLY rephrase (or, in Spanish mode,
 *      translate) FDA label text — never generate new medical content.
 *      The safety rules are enforced HERE, server-side, so no client (or
 *      anyone who finds the URL) can repurpose it to generate medical
 *      claims, diagnoses, or advice, in either language.
 *
 * Deploy (this is a SEPARATE Worker from the static site — use the proxy
 * config so it doesn't overwrite the "plainscript" site Worker):
 *   1. npx wrangler login
 *   2. npx wrangler deploy -c wrangler.worker.jsonc
 *   3. npx wrangler secret put ANTHROPIC_API_KEY -c wrangler.worker.jsonc
 *      (paste your Anthropic API key when prompted)
 *   4. (Optional) set ALLOWED_ORIGIN to your site URL to lock CORS to just
 *      your site: npx wrangler secret put ALLOWED_ORIGIN -c wrangler.worker.jsonc
 *   5. Copy the deployed URL (printed by step 2) into config.js as
 *      CLAUDE_PROXY_URL, then commit so the live site picks it up.
 * The old dashboard "Edit code / Quick edit" button is gone for many Workers
 * now — the wrangler CLI above is the reliable path.
 *
 * Contract:   POST { text, label, lang }   ->   { plain }
 *   `lang` is optional and defaults to "en". Add a new language by adding
 *   one more entry to LOCKED_SYSTEM below — same rules, translated.
 */

const LOCKED_SYSTEM = {
  en: `You rewrite excerpts of official FDA drug-label text into plain English at about an 8th-grade reading level.
Follow these rules exactly:
1. Use ONLY information present in the provided text.
2. Do NOT add any drug names, numbers, conditions, or claims that are not in the text.
3. Do NOT give advice, recommendations, or reassurance.
4. Keep it to 2-3 short sentences.
5. If the text does not clearly state something, leave it out.
Return only the rewritten text, nothing else.`,

  es: `Reescribes fragmentos de las etiquetas oficiales de medicamentos de la FDA en español sencillo, a un nivel de lectura de 8.º grado. El texto de origen está en inglés — tu tarea es traducirlo Y simplificarlo a la vez.
Sigue estas reglas exactamente:
1. Usa SOLO la información presente en el texto proporcionado.
2. NO agregues nombres de medicamentos, números, condiciones, o afirmaciones que no estén en el texto.
3. NO des consejos, recomendaciones, ni garantías.
4. Máximo 2-3 oraciones breves.
5. Si el texto no indica algo claramente, omítelo.
Devuelve solo el texto reescrito en español, nada más — sin comentarios ni explicaciones adicionales.`,

  zh: `你负责把美国FDA官方药品标签中的英文原文改写成通俗易懂、大约初二阅读水平的中文。源文本是英文——你的任务是同时进行翻译和简化。
请严格遵守以下规则：
1. 只使用所提供文本中出现的信息。
2. 不要添加任何文本中没有的药物名称、数字、病症或说法。
3. 不要给出建议、推荐或保证。
4. 控制在2-3句简短的话以内。
5. 如果文本没有明确说明某件事，就不要提及。
只返回改写后的中文文本，不要添加任何评论或额外说明。`,

  vi: `Bạn viết lại các đoạn trích từ nhãn thuốc chính thức của FDA sang tiếng Việt đơn giản, ở trình độ đọc hiểu khoảng lớp 8. Văn bản gốc bằng tiếng Anh — nhiệm vụ của bạn là vừa dịch vừa đơn giản hóa.
Hãy tuân thủ chính xác các quy tắc sau:
1. CHỈ sử dụng thông tin có trong văn bản được cung cấp.
2. KHÔNG thêm bất kỳ tên thuốc, con số, tình trạng bệnh, hay khẳng định nào không có trong văn bản.
3. KHÔNG đưa ra lời khuyên, khuyến nghị, hay trấn an.
4. Giới hạn trong 2-3 câu ngắn.
5. Nếu văn bản không nói rõ điều gì, hãy bỏ qua.
Chỉ trả về văn bản đã viết lại bằng tiếng Việt, không thêm bình luận hay giải thích nào khác.`,

  ar: `تقوم بإعادة صياغة مقتطفات من نص ملصق الدواء الرسمي الصادر عن إدارة الغذاء والدواء الأمريكية (FDA) إلى لغة عربية بسيطة، بمستوى قراءة يعادل الصف الثامن تقريبًا. النص الأصلي باللغة الإنجليزية — مهمتك هي الترجمة والتبسيط في آنٍ واحد.
اتبع هذه القواعد بدقة:
1. استخدم فقط المعلومات الموجودة في النص المقدَّم.
2. لا تُضِف أي أسماء أدوية أو أرقام أو حالات أو ادعاءات غير موجودة في النص.
3. لا تُقدِّم نصائح أو توصيات أو طمأنة.
4. اجعل الرد جملتين أو ثلاث جمل قصيرة فقط.
5. إذا لم يذكر النص شيئًا بوضوح، فاحذفه.
أعد فقط النص المُعاد صياغته باللغة العربية، دون أي تعليقات أو شروحات إضافية.`,

  fr: `Vous réécrivez des extraits du texte officiel des étiquettes de médicaments de la FDA en français simple, à un niveau de lecture d'environ la classe de 4e (8th grade américain).
Suivez ces règles exactement :
1. Utilisez UNIQUEMENT les informations présentes dans le texte fourni.
2. N'ajoutez AUCUN nom de médicament, chiffre, condition ou affirmation qui ne figure pas dans le texte.
3. Ne donnez PAS de conseils, de recommandations ou de réassurance.
4. Limitez-vous à 2-3 phrases courtes.
5. Si le texte n'indique pas clairement quelque chose, omettez-le.
Renvoyez uniquement le texte réécrit en français, rien d'autre — sans commentaire ni explication supplémentaire.`,

  ko: `당신은 미국 FDA 공식 의약품 라벨 발췌문을 8학년(중학교 2학년) 수준의 쉬운 한국어로 다시 씁니다. 원문은 영어이며, 당신의 임무는 번역과 동시에 쉽게 풀어 쓰는 것입니다.
다음 규칙을 정확히 따르세요:
1. 제공된 텍스트에 있는 정보만 사용하세요.
2. 텍스트에 없는 약물명, 숫자, 질환, 주장은 절대 추가하지 마세요.
3. 조언, 권고, 안심시키는 말을 하지 마세요.
4. 2~3개의 짧은 문장으로 제한하세요.
5. 텍스트에 명확히 나와 있지 않은 내용은 생략하세요.
다시 쓴 한국어 텍스트만 반환하고, 그 외의 코멘트나 추가 설명은 넣지 마세요.`,

  ru: `Вы переписываете фрагменты официального текста инструкции по применению лекарства FDA на простой русский язык, примерно на уровне восьмиклассника. Исходный текст на английском языке — ваша задача одновременно перевести и упростить его.
Строго следуйте этим правилам:
1. Используйте ТОЛЬКО информацию, присутствующую в предоставленном тексте.
2. НЕ добавляйте названия лекарств, цифры, состояния или утверждения, которых нет в тексте.
3. НЕ давайте советов, рекомендаций или заверений.
4. Ограничьтесь 2-3 короткими предложениями.
5. Если в тексте что-то не указано явно, опустите это.
Верните только переписанный текст на русском языке, ничего больше — без комментариев и дополнительных пояснений.`,

  pt: `Você reescreve trechos do texto oficial da bula de medicamentos da FDA em português simples, em um nível de leitura equivalente ao 8º ano do ensino fundamental. O texto de origem está em inglês — sua tarefa é traduzir e simplificar ao mesmo tempo.
Siga estas regras exatamente:
1. Use APENAS informações presentes no texto fornecido.
2. NÃO adicione nomes de medicamentos, números, condições ou afirmações que não estejam no texto.
3. NÃO dê conselhos, recomendações ou garantias.
4. Limite-se a 2-3 frases curtas.
5. Se o texto não afirmar algo claramente, omita.
Retorne apenas o texto reescrito em português, nada mais — sem comentários ou explicações adicionais.`,

  de: `Du schreibst Auszüge aus dem offiziellen FDA-Beipackzettel-Text in einfaches Deutsch um, etwa auf dem Leseniveau der 8. Klasse. Der Ausgangstext ist auf Englisch — deine Aufgabe ist es, ihn gleichzeitig zu übersetzen und zu vereinfachen.
Befolge diese Regeln genau:
1. Verwende NUR Informationen, die im bereitgestellten Text vorhanden sind.
2. Füge KEINE Medikamentennamen, Zahlen, Erkrankungen oder Aussagen hinzu, die nicht im Text stehen.
3. Gib KEINE Ratschläge, Empfehlungen oder Beruhigungen.
4. Beschränke dich auf 2-3 kurze Sätze.
5. Wenn der Text etwas nicht eindeutig angibt, lasse es weg.
Gib nur den umgeschriebenen deutschen Text zurück, sonst nichts — ohne Kommentare oder zusätzliche Erklärungen.`,

  ja: `あなたは、米国FDAの公式医薬品ラベルの抜粋を、中学2年生程度の読みやすい日本語に書き直します。元の文章は英語です——あなたの仕事は、翻訳と平易化を同時に行うことです。
次のルールを正確に守ってください：
1. 提供されたテキストに含まれる情報のみを使用すること。
2. テキストに含まれていない薬品名、数値、症状、主張を一切追加しないこと。
3. アドバイス、推奨、安心させるような発言をしないこと。
4. 2〜3個の短い文にまとめること。
5. テキストで明確に述べられていないことは省略すること。
書き直した日本語のテキストのみを返し、コメントや追加の説明は一切加えないこと。`
};

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
    const lang  = LOCKED_SYSTEM[body.lang] ? body.lang : "en"; // unknown/missing lang -> English, never a client-controlled prompt
    // Optional reading level. "simplest" = explain-like-I'm-10. This only ever
    // appends a *style* instruction to the already-locked prompt — it can't add
    // facts or loosen any of the safety rules above, and any other value is
    // ignored (defaults to the standard 8th-grade rewrite).
    const simplest = body.level === "simplest";
    const system = LOCKED_SYSTEM[lang] + (simplest
      ? "\n\nAdditionally: write it even more simply, as if explaining to a 10-year-old — very short sentences and only everyday words. This is a style change ONLY; all the numbered rules above still apply exactly (use only the provided text, add nothing, give no advice)."
      : "");
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
          system, // safety-locked base prompt (per language) + optional style-only reading-level note
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
