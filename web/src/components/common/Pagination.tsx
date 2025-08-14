import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = () => {
  return (
    <nav className="flex items-center justify-center space-x-2 py-6">
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="h-9 w-9 p-0 rounded-xl"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        className="h-9 w-9 p-0 rounded-xl text-sm font-semibold"
      >
        1
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-9 w-9 p-0 rounded-xl text-sm font-semibold"
      >
        2
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 rounded-xl"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
