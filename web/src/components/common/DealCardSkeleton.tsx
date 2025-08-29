// src/components/common/DealCardSkeleton.tsx
export const DealCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-neutral-200" />

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-neutral-200" />

        {/* Rating and category */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-neutral-200" />
          <div className="h-4 w-12 rounded bg-neutral-200" />
        </div>

        {/* Location */}
        <div className="h-4 w-1/2 rounded bg-neutral-200" />

        {/* Deal value */}
        <div className="h-6 w-2/3 rounded bg-neutral-200" />

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-20 rounded bg-neutral-200" />
          <div className="h-8 w-16 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};

export const CarouselSkeleton = ({ title }: { title: string }) => {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-2 text-2xl font-bold text-neutral-800 sm:text-3xl">
            {title}
          </h2>
          <div className="h-4 w-48 animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DealCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
