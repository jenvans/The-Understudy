export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 animate-pulse">
      {/* Heading skeleton */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />

      {/* Ratio + tags skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-16" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-14" />
      </div>

      {/* Notes skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  );
}
