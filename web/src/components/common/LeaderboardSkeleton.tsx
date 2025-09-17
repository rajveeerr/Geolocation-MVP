export const LeaderboardSkeleton = ({ rows = 6 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4"
        >
          <div className="h-6 w-6 animate-pulse rounded bg-neutral-200" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
          <div className="flex-grow">
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="text-right">
            <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-12 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
