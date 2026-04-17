import type { Substitute } from '../types';

interface ResultCardProps {
  original: string;
  substitute: Substitute;
}

const tagColorMap: Record<string, string> = {
  'dairy-free': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'gluten-free': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'vegan': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'nut-free': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'egg-free': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'soy-free': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'low-fat': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'low-sugar': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  'paleo': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  'whole30': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export default function ResultCard({ original, substitute }: ResultCardProps) {
  return (
    <article
      className="bg-white dark:bg-[#252525] rounded-xl border border-gray-200/60 dark:border-gray-700/60
                 p-5 transition-shadow hover:shadow-sm"
    >
      {/* Heading: Original → Substitute */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
        <span className="capitalize">{original}</span>
        <span className="mx-2 text-gray-400 dark:text-gray-500">→</span>
        <span>{substitute.name}</span>
      </h3>

      {/* Ratio badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold
                         bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {substitute.ratio}
        </span>

        {/* Diet/allergy tags */}
        {substitute.tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
              ${tagColorMap[tag] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Notes */}
      {substitute.notes && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
          {substitute.notes}
        </p>
      )}

      {/* Best for */}
      {substitute.bestFor && substitute.bestFor.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Best for: {substitute.bestFor.join(', ')}
        </p>
      )}
    </article>
  );
}
