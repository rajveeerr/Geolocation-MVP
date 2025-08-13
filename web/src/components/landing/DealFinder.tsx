import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';

export const DealFinder = () => {
  return (
    <div className="mx-auto mt-8 w-full max-w-4xl">
      <div className="flex items-center gap-2 rounded-full border bg-white p-2 shadow-lg">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="What are you looking for? (e.g. Pizza, Tacos...)"
            className="h-14 border-none bg-transparent pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="lg"
            className="h-14 w-14 flex-shrink-0 rounded-full p-0"
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-14 w-14 flex-shrink-0 rounded-full p-0"
          >
            <Clock className="h-5 w-5" />
          </Button>
        </div>
        <Button size="lg" className="h-14 w-14 flex-shrink-0 rounded-full p-0">
          <Search className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
