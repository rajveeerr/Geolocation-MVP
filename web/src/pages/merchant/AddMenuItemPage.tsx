import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { Button } from '@/components/common/Button';
import { X } from 'lucide-react';

// Mock menu data — replace with API call later
const MOCK_MENU = [
  { id: 1, name: 'Margherita Pizza', price: 12.5, category: 'Bites', imageUrl: '/logo.png' },
  { id: 2, name: 'Chicken Wings', price: 9.0, category: 'Bites', imageUrl: '/logo 2.png' },
  { id: 3, name: 'IPA Beer', price: 6.0, category: 'Drinks', imageUrl: '/logo.png' },
  { id: 4, name: 'House Cocktail', price: 10.0, category: 'Drinks', imageUrl: '/logo 2.png' },
];

export const AddMenuItemPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDealCreation();

  const toggleSelect = (item: any) => {
    const exists = state.selectedMenuItems.find((s) => s.id === item.id);
    let newItems;
    if (exists) {
      newItems = state.selectedMenuItems.filter((s) => s.id !== item.id);
    } else {
      newItems = [...state.selectedMenuItems, { ...item, isHidden: false }];
    }
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: newItems });
  };

  const handleDone = () => {
    navigate('/merchant/deals/create/edit');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold">Add Items From Menu</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm"><X /></Button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {MOCK_MENU.map((item) => {
            const selected = !!state.selectedMenuItems.find((s) => s.id === item.id);
            return (
              <div key={item.id} className={`p-3 border rounded-lg flex items-center gap-3 ${selected ? 'ring-2 ring-indigo-300' : ''}`}>
                <img src={item.imageUrl} className="h-14 w-14 rounded-md object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.category}</p>
                    </div>
                    <div className="text-sm font-medium">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="mt-2">
                    <Button onClick={() => toggleSelect(item)} variant={selected ? 'secondary' : 'primary'} size="sm">
                      {selected ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleDone} className="w-full">Done ({state.selectedMenuItems.length})</Button>
        </div>
      </footer>
    </div>
  );
};

export default AddMenuItemPage;
