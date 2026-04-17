import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchTerm, filters } = req.body as {
    searchTerm: string;
    filters?: string[];
  };

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).json({ error: 'Missing searchTerm' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const dietaryNote =
    filters && filters.length > 0
      ? `The user has these dietary restrictions: ${filters.join(', ')}. Only return substitutes that meet ALL of these restrictions.`
      : 'No specific dietary restrictions.';

  const prompt = `You are a culinary expert. A user needs substitutions for the ingredient: "${searchTerm}".
${dietaryNote}

Return ONLY a valid JSON array (no markdown fences, no explanation, no extra text). Each element must be:
{
  "name": string (the substitute ingredient),
  "ratio": string (e.g. "1:1" or "1 tbsp per 1 tsp"),
  "tags": string[] (from: "dairy-free","gluten-free","vegan","nut-free","egg-free","soy-free","low-fat","low-sugar","paleo","whole30"),
  "notes": string (one sentence of practical advice),
  "bestFor": string[] (2-3 use cases)
}

Return 3-5 substitutes. Be accurate with ratios and dietary tags.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);

      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit reached — please wait a minute and try again' });
      }
      if (response.status === 400) {
        return res.status(502).json({ error: 'API key issue — check Vercel environment variables' });
      }
      // Include first 200 chars of Google's error so we can debug
      const snippet = errBody.slice(0, 200);
      return res.status(502).json({ error: `AI service error (${response.status}): ${snippet}` });
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown fences if present
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    let substitutes: any;
    try {
      substitutes = JSON.parse(cleaned);
    } catch {
      // If JSON is truncated, try to salvage by closing the array
      const salvaged = cleaned.replace(/,\s*$/, '') + ']';
      substitutes = JSON.parse(salvaged);
    }

    if (!Array.isArray(substitutes)) {
      return res.status(502).json({ error: 'Unexpected AI response format' });
    }

    return res.status(200).json({ substitutes });
  } catch (err: any) {
    console.error('Gemini handler error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `AI error: ${msg.slice(0, 300)}` });
  }
}
