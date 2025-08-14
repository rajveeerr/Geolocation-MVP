import { Search } from "lucide-react";

interface NavbarSearchProps {
  onClick: () => void;
}

export const NavbarSearch = ({ onClick }: NavbarSearchProps) => {
  return (
    <button 
        onClick={onClick}
        className="w-full max-w-md mx-auto bg-white rounded-full border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer text-left"
        aria-label="Open search"
    >
        <div className="flex items-center justify-between pl-6 pr-2 py-2">
            <div className="flex items-center divide-x divide-neutral-200/90">
                <div className="pr-4">
                    <p className="text-sm font-semibold text-neutral-800">Search deals</p>
                </div>
                <div className="px-4">
                    <p className="text-sm text-neutral-500">Any week</p>
                </div>
                <div className="px-4">
                    <p className="text-sm text-neutral-500">Add guests</p>
                </div>
            </div>
            <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
        </div>
    </button>
  );
};