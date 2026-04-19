import { useMemo } from 'react';
import type { Substitute, DrinkFilter, SortOption, SearchResult } from '../types';
import drinkData from '../data/drink-substitutions.json';

interface DrinkEntry {
  original: string;
  substitutes: Substitute[];
}

const localData = drinkData as DrinkEntry[];

function fuzzyMatch(searchTerm: string): DrinkEntry | undefined {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return undefined;

  // Exact match first
  const exact = localData.find((e) => e.original.toLowerCase() === term);
  if (exact) return exact;

  // Search term is contained in original or original is contained in search term
  return localData.find(
    (e) =>
      e.original.toLowerCase().includes(term) ||
      term.includes(e.original.toLowerCase()),
  );
}

function filterSubstitutes(
  substitutes: Substitute[],
  filters: DrinkFilter[],
): Substitute[] {
  if (filters.length === 0) return substitutes;
  return substitutes.filter((sub) =>
    filters.every((f) => sub.tags.includes(f)),
  );
}

function sortSubstitutes(
  substitutes: Substitute[],
  sort: SortOption,
): Substitute[] {
  const sorted = [...substitutes];
  switch (sort) {
    case 'a-z':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'ratio-1-1': {
      return sorted.sort((a, b) => {
        const aIs11 = a.ratio.includes('1:1') ? 0 : 1;
        const bIs11 = b.ratio.includes('1:1') ? 0 : 1;
        return aIs11 - bIs11;
      });
    }
    case 'best-match':
    default:
      return sorted;
  }
}

export function useDrinkSubstitutions(
  searchTerm: string,
  activeFilters: DrinkFilter[],
  sortOption: SortOption,
): SearchResult {
  return useMemo(() => {
    const normalized = searchTerm.toLowerCase().trim();

    if (!normalized) {
      return {
        original: '',
        substitutes: [],
        found: false,
        message: null,
      };
    }

    const localMatch = fuzzyMatch(normalized);

    if (localMatch) {
      const filtered = filterSubstitutes(localMatch.substitutes, activeFilters);
      const sorted = sortSubstitutes(filtered, sortOption);
      return {
        original: localMatch.original,
        substitutes: sorted,
        found: true,
        message: null,
      };
    }

    return {
      original: normalized,
      substitutes: [],
      found: false,
      message: "No substitutions found — try a common name (e.g. 'bourbon', 'triple sec')",
    };
  }, [searchTerm, activeFilters, sortOption]);
}
