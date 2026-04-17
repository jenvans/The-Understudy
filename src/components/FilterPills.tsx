import type { DietaryFilter } from '../types';

const FILTERS: { label: string; value: DietaryFilter }[] = [
  { label: 'Dairy-free', value: 'dairy-free' },
  { label: 'Gluten-free', value: 'gluten-free' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Nut-free', value: 'nut-free' },
  { label: 'Egg-free', value: 'egg-free' },
  { label: 'Soy-free', value: 'soy-free' },
];

interface FilterPillsProps {
  active: DietaryFilter[];
  onToggle: (filter: DietaryFilter) => void;
}

export default function FilterPills({ active, onToggle }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Dietary filters">
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
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
