import { Input } from "@/components/ui/input";
import { Button } from "@/components/common/Button";
import { Search, MapPin, Calendar, Clock } from "lucide-react";

export const DealFinder = () => {
  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-full p-2 shadow-lg flex items-center gap-2 border">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="What are you looking for? (e.g. Pizza, Tacos...)"
            className="pl-12 h-14 bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="lg" className="h-14 w-14 p-0 rounded-full flex-shrink-0">
               <Calendar className="h-5 w-5" />
           </Button>
           <Button variant="secondary" size="lg" className="h-14 w-14 p-0 rounded-full flex-shrink-0">
               <Clock className="h-5 w-5" />
           </Button>
        </div>
        <Button size="lg" className="h-14 w-14 rounded-full p-0 flex-shrink-0">
          <Search className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};