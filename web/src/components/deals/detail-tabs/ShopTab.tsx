// web/src/components/deals/detail-tabs/ShopTab.tsx
import { useState } from 'react';
import { ShoppingBag, Gift, Shirt, Wine, ChefHat, Book } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface ShopTabProps {
  deal: DetailedDeal;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'gift-cards', label: 'Gift Cards', icon: Gift },
  { id: 'apparel', label: 'Apparel', icon: Shirt },
  { id: 'wine', label: 'Wine', icon: Wine },
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { id: 'books', label: 'Books', icon: Book },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Luminara Logo T-Shirt',
    description: 'Premium cotton tee with embroidered logo',
    price: 35,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    inStock: true,
  },
  {
    id: 2,
    name: '$50 Gift Card',
    description: 'Perfect for any occasion',
    price: 50,
    category: 'gift-cards',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    inStock: true,
  },
  {
    id: 3,
    name: "Chef's Apron",
    description: 'Professional grade apron with pockets',
    price: 45,
    category: 'kitchen',
    image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400',
    inStock: true,
  },
  {
    id: 4,
    name: 'House Wine - Red',
    description: 'House Wine - Red',
    price: 25,
    category: 'wine',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    inStock: true,
  },
  {
    id: 5,
    name: '$100 Gift Card',
    description: '$100 Gift Card',
    price: 100,
    category: 'gift-cards',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    inStock: true,
  },
  {
    id: 6,
    name: 'Luminara Hoodie',
    description: 'Luminara Hoodie',
    price: 65,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=400',
    inStock: true,
  },
];

export const ShopTab = ({ deal }: ShopTabProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <ShoppingBag className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The shop feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Shop Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="h-8 w-8" />
          <h2 className="text-3xl font-bold">{deal.merchant.businessName} Shop</h2>
        </div>
        <p className="text-purple-100">
          Take home a piece of {deal.merchant.businessName}. From gift cards to merchandise, find the perfect item.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors',
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold">
                {CATEGORIES.find(c => c.id === product.category)?.label}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-lg mb-1">{product.name}</h4>
              <p className="text-sm text-neutral-600 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">${product.price}</p>
                  <p className={cn('text-xs', product.inStock ? 'text-green-600' : 'text-red-600')}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

