import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppTab, DietaryFilter, DrinkFilter, SortOption, Substitute } from './types';
import { useSubstitutions } from './hooks/useSubstitutions';
import { useDrinkSubstitutions } from './hooks/useDrinkSubstitutions';
import { fetchAISubstitutions } from './api/gemini';
import SearchBar from './components/SearchBar';
import TabBar from './components/TabBar';
import FilterPills from './components/FilterPills';
import DrinkFilterPills from './components/DrinkFilterPills';
import ActiveFilterTags from './components/ActiveFilterTags';
import ResultCard from './components/ResultCard';
import EmptyState from './components/EmptyState';
import AISearchPrompt from './components/AISearchPrompt';
import SkeletonCard from './components/SkeletonCard';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('understudy-dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('understudy-dark', String(dark));
  }, [dark]);

  return [dark, setDark] as const;
}

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [tab, setTab] = useState<AppTab>('kitchen');
  const [search, setSearch] = useState('');
  const [kitchenFilters, setKitchenFilters] = useState<DietaryFilter[]>([]);
  const [drinkFilters, setDrinkFilters] = useState<DrinkFilter[]>([]);
  const [sort, setSort] = useState<SortOption>('best-match');

  // AI state
  const [aiResults, setAiResults] = useState<Substitute[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSearchedTerm, setAiSearchedTerm] = useState('');
  const [aiSearchedTab, setAiSearchedTab] = useState<AppTab>('kitchen');
  const abortRef = useRef<AbortController | null>(null);

  // Active filters for current tab
  const activeFilters = tab === 'kitchen' ? kitchenFilters : drinkFilters;

  const kitchenResult = useSubstitutions(
    tab === 'kitchen' ? search : '',
    kitchenFilters,
    sort,
  );
  const drinkResult = useDrinkSubstitutions(
    tab === 'bar' ? search : '',
    drinkFilters,
    sort,
  );

  const result = tab === 'kitchen' ? kitchenResult : drinkResult;

  // Reset AI results when search or tab changes
  useEffect(() => {
    setAiResults([]);
    setAiError(null);
    setAiSearchedTerm('');
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [search, tab]);

  const handleAISearch = useCallback(async () => {
    const term = search.trim();
    if (!term) return;

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAiLoading(true);
    setAiError(null);
    setAiResults([]);

    try {
      const subs = await fetchAISubstitutions(term, activeFilters, tab, controller.signal);
      // Tag each result as AI-sourced
      const tagged = subs.map((s) => ({ ...s, source: 'ai' as const }));
      setAiResults(tagged);
      setAiSearchedTerm(term);
      setAiSearchedTab(tab);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setAiError(err instanceof Error ? err.message : 'AI search failed — try again');
    } finally {
      setAiLoading(false);
    }
  }, [search, activeFilters, tab]);

  const handleTabChange = (newTab: AppTab) => {
    setTab(newTab);
    setSearch('');
    setSort('best-match');
  };

  const toggleKitchenFilter = (f: DietaryFilter) => {
    setKitchenFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const toggleDrinkFilter = (f: DrinkFilter) => {
    setDrinkFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const removeFilter = (f: string) => {
    if (tab === 'kitchen') {
      setKitchenFilters((prev) => prev.filter((x) => x !== f));
    } else {
      setDrinkFilters((prev) => prev.filter((x) => x !== f));
    }
  };

  // Determine what to render
  const hasSearch = search.trim().length > 0;
  const hasResults = result.substitutes.length > 0;
  const hasMessage = !!result.message;
  const hasAiResults = aiResults.length > 0 && aiSearchedTerm === search.trim() && aiSearchedTab === tab;
  const showAiPrompt = hasSearch && !hasResults && !aiLoading && !hasAiResults;

  const placeholder = tab === 'kitchen'
    ? 'Search an ingredient (e.g. butter, eggs, milk)...'
    : 'Search a drink ingredient (e.g. bourbon, triple sec, lime juice)...';

  const emptyInitialMsg = tab === 'kitchen'
    ? 'Search an ingredient to get started'
    : 'Search a drink ingredient to get started';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              The Understudy
            </h1>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Tab bar */}
        <TabBar active={tab} onChange={handleTabChange} />

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder={placeholder} />

        {/* Filters — swap based on tab */}
        {tab === 'kitchen' ? (
          <FilterPills active={kitchenFilters} onToggle={toggleKitchenFilter} />
        ) : (
          <DrinkFilterPills active={drinkFilters} onToggle={toggleDrinkFilter} />
        )}

        {/* Active filter tags */}
        <ActiveFilterTags filters={activeFilters} onRemove={removeFilter} />

        {/* Sort dropdown */}
        {hasSearch && hasResults && (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                Sort:
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-xs bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700
                           rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="best-match">Best match</option>
                <option value="a-z">A–Z</option>
                <option value="ratio-1-1">1:1 ratio first</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <div role="region" aria-label="Substitution results" aria-live="polite">
          {/* Result cards */}
          {hasResults && (
            <div className="grid gap-4">
              {result.substitutes.map((sub, index) => (
                <ResultCard
                  key={`${sub.name}-${index}`}
                  original={result.original}
                  substitute={sub}
                />
              ))}
            </div>
          )}

          {/* Empty states */}
          {!hasResults && !hasSearch && (
            <EmptyState type="initial" message={emptyInitialMsg} />
          )}

          {!hasResults && hasSearch && hasMessage && !hasAiResults && (
            <EmptyState type="no-results" message={result.message} />
          )}

          {/* AI search prompt — shown when local has no results */}
          {showAiPrompt && (
            <AISearchPrompt
              searchTerm={search.trim()}
              onSearch={handleAISearch}
              isLoading={aiLoading}
              error={aiError}
            />
          )}

          {/* AI loading skeletons */}
          {aiLoading && (
            <div className="grid gap-4 mt-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* AI results */}
          {hasAiResults && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI-powered results
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  — results may not be 100% accurate
                </span>
              </div>
              <div className="grid gap-4">
                {aiResults.map((sub, index) => (
                  <ResultCard
                    key={`ai-${sub.name}-${index}`}
                    original={search.trim()}
                    substitute={sub}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 pb-8 pt-4">
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          The Understudy — Find ingredient substitutions instantly.
        </p>
      </footer>
    </div>
  );
}
