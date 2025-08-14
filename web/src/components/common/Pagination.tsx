import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = () => {
  return (
    <nav className="flex items-center justify-center space-x-2 py-8">
      <button
        className="rounded-md p-2 transition-colors hover:bg-neutral-100 disabled:opacity-50"
        disabled
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button className="h-9 w-9 rounded-md bg-primary text-sm font-semibold text-primary-foreground">
        1
      </button>
      <button className="h-9 w-9 rounded-md text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100">
        2
      </button>
      <button className="rounded-md p-2 transition-colors hover:bg-neutral-100">
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
};
