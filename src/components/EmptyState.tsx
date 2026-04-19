interface EmptyStateProps {
  type: 'initial' | 'no-results';
  message?: string | null;
}

export default function EmptyState({ type, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {type === 'initial' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        )}
        {type === 'no-results' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Text */}
      {type === 'initial' && (
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {message || 'Search an ingredient to get started'}
        </p>
      )}

      {type === 'no-results' && (
        <p className="text-gray-500 dark:text-gray-400 text-base">
          {message || "No substitutions found — try rephrasing (e.g. 'AP flour' instead of 'all purpose flour')"}
        </p>
      )}
    </div>
  );
}
