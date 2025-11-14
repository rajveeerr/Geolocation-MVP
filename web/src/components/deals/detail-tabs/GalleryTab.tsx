// web/src/components/deals/detail-tabs/GalleryTab.tsx
import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';

interface GalleryTabProps {
  deal: DetailedDeal;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'interior', label: 'Interior' },
  { id: 'behind-scenes', label: 'Behind the Scenes' },
];

// Use deal images or mock images
const getGalleryImages = (deal: DetailedDeal) => {
  if (deal.images && deal.images.length > 0) {
    return deal.images.map((url, idx) => ({
      id: idx,
      url,
      category: idx % 4 === 0 ? 'food' : idx % 4 === 1 ? 'drinks' : idx % 4 === 2 ? 'interior' : 'behind-scenes',
    }));
  }
  // Mock images if none available
  return [
    { id: 1, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', category: 'interior' },
    { id: 2, url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', category: 'food' },
    { id: 3, url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', category: 'drinks' },
    { id: 4, url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600', category: 'interior' },
    { id: 5, url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600', category: 'food' },
    { id: 6, url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', category: 'behind-scenes' },
    { id: 7, url: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=600', category: 'drinks' },
    { id: 8, url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600', category: 'interior' },
    { id: 9, url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', category: 'food' },
  ];
};

export const GalleryTab = ({ deal }: GalleryTabProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images = getGalleryImages(deal);

  const filteredImages = selectedFilter === 'all'
    ? images
    : images.filter(img => img.category === selectedFilter);

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <ImageIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The gallery feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              selectedFilter === filter.id
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-neutral-200 cursor-pointer group"
          >
            <img
              src={image.url}
              alt={`Gallery image ${image.id}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-neutral-300"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

