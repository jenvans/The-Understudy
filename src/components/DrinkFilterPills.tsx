import type { DrinkFilter } from '../types';

const FILTERS: { label: string; value: DrinkFilter }[] = [
  { label: 'Non-alcoholic', value: 'non-alcoholic' },
  { label: 'Spirit', value: 'spirit' },
  { label: 'Low-ABV', value: 'low-abv' },
  { label: 'Bitter', value: 'bitter' },
  { label: 'Citrus', value: 'citrus' },
  { label: 'Sweetener', value: 'sweetener' },
  { label: 'Vegan', value: 'vegan' },
];

interface DrinkFilterPillsProps {
  active: DrinkFilter[];
  onToggle: (filter: DrinkFilter) => void;
}

export default function DrinkFilterPills({ active, onToggle }: DrinkFilterPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Drink filters">
      {FILTERS.map((f) => {
        const isActive = active.includes(f.value);
        return (
          <button
            key={f.value}
            onClick={() => onToggle(f.value)}
            aria-pressed={isActive}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
              focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1
              dark:focus:ring-offset-[#1a1a1a]
              ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#303030]'
              }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
