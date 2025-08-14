import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = () => {
  return (
    <nav className="flex items-center justify-center space-x-2 py-8">
      <button className="p-2 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50" disabled>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button className="w-9 h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm">
        1
      </button>
      <button className="w-9 h-9 rounded-md hover:bg-neutral-100 font-semibold text-sm text-neutral-700 transition-colors">
        2
      </button>
      <button className="p-2 rounded-md hover:bg-neutral-100 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};