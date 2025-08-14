import { Search } from 'lucide-react';

interface NavbarSearchProps {
  onClick: () => void;
}

export const NavbarSearch = ({ onClick }: NavbarSearchProps) => {
  return (
    <button
      onClick={onClick}
      className="mx-auto w-full max-w-md cursor-pointer rounded-full border border-neutral-200/90 bg-white text-left shadow-sm transition-shadow duration-300 hover:shadow-md"
      aria-label="Open search"
    >
      <div className="flex items-center justify-between py-2 pl-6 pr-2">
        <div className="flex items-center divide-x divide-neutral-200/90">
          <div className="pr-4">
            <p className="text-sm font-semibold text-neutral-800">
              Search deals
            </p>
          </div>
          <div className="px-4">
            <p className="text-sm text-neutral-500">Any week</p>
          </div>
          <div className="px-4">
            <p className="text-sm text-neutral-500">Add guests</p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Search className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </button>
  );
};
