interface AISearchPromptProps {
  searchTerm: string;
  onSearch: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AISearchPrompt({
  searchTerm,
  onSearch,
  isLoading,
  error,
}: AISearchPromptProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
        Can't find <span className="font-medium text-gray-700 dark:text-gray-300">"{searchTerm}"</span> in our database?
      </p>

      <button
        onClick={onSearch}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                   bg-purple-600 text-white shadow-md shadow-purple-500/20
                   hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30
                   active:scale-[0.98]
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md
                   transition-all duration-150"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Searching with AI…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Search with AI
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center px-4">
          {error}
        </p>
      )}
    </div>
  );
}
