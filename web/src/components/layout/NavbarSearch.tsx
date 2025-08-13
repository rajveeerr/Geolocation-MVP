// web/src/components/layout/NavbarSearch.tsx

import { Button } from "@/components/common/Button";
import { Search } from "lucide-react";

export const NavbarSearch = () => {
  return (
    <div 
        className="w-full max-w-md mx-auto bg-white rounded-full border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
        <div className="flex items-center justify-between pl-6 pr-2 py-2">
            <div className="flex items-center divide-x divide-neutral-200/90">
                <div className="pr-4">
                    <p className="text-sm font-semibold text-neutral-800">Search deals</p>
                </div>
                <div className="px-4">
                    <p className="text-sm font-semibold text-neutral-800">Any week</p>
                </div>
                <div className="pl-4">
                    <p className="text-sm text-neutral-500">Add guests</p>
                </div>
            </div>
            <Button size="sm" className="h-8 w-8 rounded-full p-0 flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
};