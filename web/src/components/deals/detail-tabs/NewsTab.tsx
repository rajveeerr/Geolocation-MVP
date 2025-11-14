// web/src/components/deals/detail-tabs/NewsTab.tsx
import { useState } from 'react';
import { Newspaper, MapPin, BookOpen, Radio } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';

interface NewsTabProps {
  deal: DetailedDeal;
}

const SUB_NAV = [
  { id: 'all', label: 'All Stories' },
  { id: 'city-guide', label: 'City Guide', icon: MapPin },
  { id: 'blog', label: 'Our Blog', icon: BookOpen },
  { id: 'press', label: 'Press & Media', icon: Radio },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'food-drinks', label: 'Food & Drinks' },
  { id: 'services', label: 'Services' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'nightlife', label: 'Nightlife' },
];

const MOCK_ARTICLES = [
  {
    id: 1,
    title: 'Introducing Our New Spring Tasting Menu',
    category: 'menu-updates',
    badge: 'Menu Updates',
    date: 'Nov 10, 2024',
    readTime: '5 min read',
    description: 'Chef Maria Santos unveils a stunning 8-course journey celebrating local spring produce, featuring fresh peas, asparagus, and morel mushrooms from our partner farms.',
    author: 'By Luminara Team',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  },
  {
    id: 2,
    title: 'San Francisco\'s Rising Star: Luminara Named in Michelin Guide',
    category: 'awards',
    badge: 'Awards',
    badgeSecondary: 'Michelin Guide',
    date: 'Nov 8, 2024',
    readTime: '4 min read',
    description: 'The prestigious Michelin Guide has recognized Luminara for its innovative approach to contemporary American cuisine and exceptional service standards.',
    author: 'By Michelin Guide',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
  },
  {
    id: 3,
    title: 'Top 10 Restaurants to Try in San Francisco Right Now',
    category: 'press',
    badge: 'Press',
    badgeSecondary: 'CNN Travel',
    date: 'Nov 1, 2024',
    readTime: '6 min read',
    description: 'CNN Travel features Luminara in their must-visit list, highlighting their seasonal tasting menu and stunning rooftop views...',
    author: 'By CNN Travel',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  },
];

export const NewsTab = ({ deal }: NewsTabProps) => {
  const [selectedSubNav, setSelectedSubNav] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Newspaper className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The news feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-8 w-8 text-neutral-600" />
          <h1 className="text-3xl font-bold">News & Stories</h1>
        </div>
        <p className="text-neutral-600">
          Stay updated with the latest from {deal.merchant.businessName} and see what the world is saying about us.
        </p>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {SUB_NAV.map((nav) => {
          const Icon = nav.icon;
          return (
            <button
              key={nav.id}
              onClick={() => setSelectedSubNav(nav.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2',
                selectedSubNav === nav.id
                  ? 'bg-black text-white border-2 border-black'
                  : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {nav.label}
            </button>
          );
        })}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              selectedCategory === category.id
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
        {MOCK_ARTICLES.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <span className="bg-black text-white px-2 py-1 rounded text-xs font-semibold">
                  {article.badge}
                </span>
                {article.badgeSecondary && (
                  <span className="bg-white text-neutral-700 px-2 py-1 rounded text-xs font-semibold">
                    {article.badgeSecondary}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-neutral-500 mb-2">
                {article.date} • {article.readTime}
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-3">{article.description}</p>
              <p className="text-xs text-neutral-500 mb-3">{article.author}</p>
              <button className="text-sm font-semibold text-neutral-900 hover:text-neutral-600">
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

