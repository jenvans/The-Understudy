import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

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

  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const google = createGoogleGenerativeAI({ apiKey: key });

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
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
      temperature: 0.3,
      maxTokens: 1024,
    });

    // Strip markdown fences if present
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    const substitutes = JSON.parse(cleaned);

    if (!Array.isArray(substitutes)) {
      return res.status(502).json({ error: 'Unexpected AI response format' });
    }

    return res.status(200).json({ substitutes });
  } catch (err) {
    console.error('AI handler error:', err);
    return res.status(500).json({ error: 'Failed to get AI substitutions' });
  }
}
