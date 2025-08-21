// src/components/common/DealCardSkeleton.tsx
export const DealCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-neutral-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        
        {/* Rating and category */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-neutral-200 rounded w-16" />
          <div className="h-4 bg-neutral-200 rounded w-12" />
        </div>
        
        {/* Location */}
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        
        {/* Deal value */}
        <div className="h-6 bg-neutral-200 rounded w-2/3" />
        
        {/* Bottom section */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-neutral-200 rounded w-20" />
          <div className="h-8 bg-neutral-200 rounded w-16" />
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
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">
            {title}
          </h2>
          <div className="h-4 bg-neutral-200 rounded w-48 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <DealCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
