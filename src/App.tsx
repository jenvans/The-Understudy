import { useState, useEffect } from 'react';
import type { DietaryFilter, SortOption } from './types';
import { useSubstitutions } from './hooks/useSubstitutions';
import SearchBar from './components/SearchBar';
import FilterPills from './components/FilterPills';
import ActiveFilterTags from './components/ActiveFilterTags';
import ResultCard from './components/ResultCard';
import EmptyState from './components/EmptyState';

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
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DietaryFilter[]>([]);
  const [sort, setSort] = useState<SortOption>('best-match');

  const result = useSubstitutions(search, filters, sort);

  const toggleFilter = (f: DietaryFilter) => {
    setFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const removeFilter = (f: DietaryFilter) => {
    setFilters((prev) => prev.filter((x) => x !== f));
  };

  // Determine what to render
  const hasSearch = search.trim().length > 0;
  const hasResults = result.substitutes.length > 0;
  const hasMessage = !!result.message;

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
        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Filters */}
        <FilterPills active={filters} onToggle={toggleFilter} />

        {/* Active filter tags */}
        <ActiveFilterTags filters={filters} onRemove={removeFilter} />

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
            <EmptyState type="initial" />
          )}

          {!hasResults && hasSearch && hasMessage && (
            <EmptyState type="no-results" message={result.message} />
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
