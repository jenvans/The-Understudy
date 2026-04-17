import type { Substitute, DietaryFilter } from '../types';

export async function fetchAISubstitutions(
  searchTerm: string,
  filters: DietaryFilter[],
  signal?: AbortSignal,
): Promise<Substitute[]> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchTerm, filters }),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'AI search failed');
  }

  const data = await response.json();
  return data.substitutes as Substitute[];
}
