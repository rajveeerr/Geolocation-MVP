export const ReferralCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6 w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-neutral-200 animate-pulse" />
        <div className="h-4 w-56 rounded-md bg-neutral-200 animate-pulse" />
        <div className="mt-2 flex items-center gap-3">
          <div className="h-12 w-44 rounded-xl bg-neutral-200 animate-pulse" />
          <div className="h-12 w-12 rounded-xl bg-neutral-200 animate-pulse" />
        </div>
      </div>

      <div className="h-12 rounded-md bg-neutral-200 animate-pulse" />

      <div className="border-t border-neutral-100 pt-6">
        <div className="flex items-center justify-center gap-4">
          <div className="h-12 w-12 rounded-full bg-neutral-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-16 rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-neutral-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
