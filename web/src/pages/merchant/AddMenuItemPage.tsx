import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHappyHour } from '@/context/HappyHourContext';
import type { MenuItem as MenuItemType, SelectedMenuItem } from '@/context/HappyHourContext';
import { Button } from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import MenuItemCard from '@/components/common/MenuItemCard';

// Mock menu data — replace with API call later
const MOCK_MENU: MenuItemType[] = [
  { id: 101, name: 'Spicy Tuna Roll', price: 12.5, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=1' },
  { id: 102, name: 'Crispy Chicken Wings', price: 9.0, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=2' },
  { id: 103, name: 'Truffle Fries', price: 7.5, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=3' },
  { id: 104, name: 'Buffalo Cauliflower', price: 8.5, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=4' },
  { id: 105, name: 'Loaded Nachos', price: 11.0, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=5' },
  { id: 106, name: 'Artisan Cheese Board', price: 16.0, category: 'Bites', imageUrl: 'https://picsum.photos/400/300?random=6' },
  { id: 201, name: 'Old Fashioned', price: 15.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=7' },
  { id: 202, name: 'Margarita on the Rocks', price: 14.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=8' },
  { id: 203, name: 'House Red Wine', price: 10.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=9' },
  { id: 204, name: 'Craft Beer Flight', price: 12.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=10' },
  { id: 205, name: 'Moscow Mule', price: 13.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=11' },
  { id: 206, name: 'Fresh Lemonade', price: 6.0, category: 'Drinks', imageUrl: 'https://picsum.photos/400/300?random=12' },
];

// Using shared MenuItemCard component for consistent premium UI

export const AddMenuItemPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHappyHour();
  const [activeTab, setActiveTab] = useState<'Bites' | 'Drinks'>('Bites');

  const filteredMenu = useMemo(() => MOCK_MENU.filter((item) => item.category === activeTab), [activeTab]);

  const toggleSelectItem = (item: MenuItemType) => {
    const exists = state.selectedMenuItems.some((s) => s.id === item.id);
    const newSelected: SelectedMenuItem[] = exists
      ? state.selectedMenuItems.filter((s) => s.id !== item.id)
      : [...state.selectedMenuItems, { ...item, isHidden: false }];

    dispatch({ type: 'SET_SELECTED_ITEMS', payload: newSelected });
  };

  const handleDone = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full h-10 w-10">
            <ArrowLeft />
          </Button>
          <h2 className="font-bold text-lg">Add Menu Items</h2>
        </div>
      </header>

      <div className="sticky top-[73px] bg-white z-10 border-b">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => setActiveTab('Bites')} className={cn('flex-1 py-3 text-center font-semibold border-b-2', activeTab === 'Bites' ? 'border-brand-primary-600 text-brand-primary-600' : 'border-transparent text-neutral-500')}>
            Bites
          </button>
          <button onClick={() => setActiveTab('Drinks')} className={cn('flex-1 py-3 text-center font-semibold border-b-2', activeTab === 'Drinks' ? 'border-brand-primary-600 text-brand-primary-600' : 'border-transparent text-neutral-500')}>
            Drinks
          </button>
        </div>
      </div>

      <main className="p-4 max-w-4xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMenu.map((item) => {
            const isSelected = state.selectedMenuItems.some((s) => s.id === item.id);
            return (
              <div key={item.id}>
                <MenuItemCard item={item} isSelected={isSelected} onToggle={() => toggleSelectItem(item)} />
              </div>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t p-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleDone} size="lg" className="w-full rounded-lg">
            Confirm {state.selectedMenuItems.length} Selection(s)
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddMenuItemPage;

