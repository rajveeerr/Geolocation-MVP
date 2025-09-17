export const ReferralCardSkeleton = () => {
  return (
    <div className="w-full space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-neutral-200" />
        <div className="mt-2 flex items-center gap-3">
          <div className="h-12 w-44 animate-pulse rounded-xl bg-neutral-200" />
          <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-200" />
        </div>
      </div>

      <div className="h-12 animate-pulse rounded-md bg-neutral-200" />

      <div className="border-t border-neutral-100 pt-6">
        <div className="flex items-center justify-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-6 w-16 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
