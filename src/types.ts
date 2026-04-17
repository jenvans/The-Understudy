export interface Substitute {
  name: string;
  ratio: string;
  tags: string[];
  notes: string;
  bestFor: string[];
}

export interface SubstitutionEntry {
  original: string;
  substitutes: Substitute[];
}

export type SortOption = "best-match" | "a-z" | "ratio-1-1";

export type DietaryFilter =
  | "dairy-free"
  | "gluten-free"
  | "vegan"
  | "nut-free"
  | "egg-free"
  | "soy-free";

export interface SearchResult {
  original: string;
  substitutes: Substitute[];
  found: boolean;
  message: string | null;
}
