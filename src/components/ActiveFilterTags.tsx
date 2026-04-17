import type { DietaryFilter } from '../types';

interface ActiveFilterTagsProps {
  filters: DietaryFilter[];
  onRemove: (filter: DietaryFilter) => void;
}

export default function ActiveFilterTags({ filters, onRemove }: ActiveFilterTagsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Active filters">
      {filters.map((f) => (
        <span
          key={f}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                     bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:bg-[var(--color-accent)]/20"
        >
          {f}
          <button
            onClick={() => onRemove(f)}
            aria-label={`Remove ${f} filter`}
            className="hover:text-[var(--color-accent-light)] transition-colors focus:outline-none
                       focus:ring-1 focus:ring-[var(--color-accent)] rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
