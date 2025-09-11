export const LeaderboardSkeleton = ({ rows = 6 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-white border-neutral-100">
          <div className="h-6 w-6 rounded bg-neutral-200 animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
          <div className="flex-grow">
            <div className="h-4 w-48 rounded bg-neutral-200 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-12 rounded bg-neutral-200 animate-pulse mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};
