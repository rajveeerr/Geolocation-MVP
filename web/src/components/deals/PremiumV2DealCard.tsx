// web/src/components/deals/PremiumV2DealCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { AvatarStack } from '@/components/common/AvatarStack';

// A small, reusable component for colored tags
const DealTag = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
    {children}
  </div>
);

// Define an extended type for this component to understand new optional fields
interface PremiumDeal extends Deal {
  images?: string[];
  offers?: { title: string; time: string }[];
  tapInCount?: number;
}

// Mock data for new features until the backend provides it
const mockOffers = [
    { title: "2-for-1 Cocktails", time: "5-7 PM" },
    { title: "50% Off Appetizers", time: "5-6 PM" },
    { title: "$5 Draft Beers", time: "All Night" },
];

export const PremiumV2DealCard = ({ deal }: { deal: PremiumDeal }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [offersVisible, setOffersVisible] = useState(false);

  // Smartly handle single or multiple images.
  // If `deal.images` exists use it, otherwise create an array from the single `deal.image`.
  const imagesToShow = (deal.images && deal.images.length > 0) ? deal.images : [deal.image];

  return (
    <div className="group w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
      {/* --- Image Slider & Overlays --- */}
      <div className="relative aspect-[4/3]">
        <div className="scrollbar-hide absolute inset-0 flex overflow-x-auto snap-x snap-mandatory">
          {imagesToShow.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              alt={`${deal.name} view ${index + 1}`}
              className="h-full w-full flex-shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        
    <Button variant="ghost" size="sm" className="absolute left-3 top-3 h-9 w-9 bg-black/30 text-white hover:bg-black/50 hover:text-white rounded-full">
          <Phone className="h-4 w-4" />
        </Button>
        <Button 
            onClick={() => setIsLiked(!isLiked)}
            variant="ghost" 
      size="sm" 
            className="absolute right-3 top-3 h-9 w-9 bg-black/30 text-white hover:bg-red-500/80 hover:text-white rounded-full">
          <Heart className={cn("h-4 w-4 transition-all", isLiked && "fill-current text-red-500")} />
        </Button>
      </div>

      {/* --- Main Content --- */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-neutral-900 line-clamp-2">{deal.name}</h3>
        <p className="mt-1 text-base text-neutral-600">{deal.location}</p>

        {/* Dynamic Tags from deal data */}
        <div className="mt-3 flex items-center gap-2">
            {deal.dealType && <DealTag>{deal.dealType}</DealTag>}
            {deal.dealValue && <DealTag>{deal.dealValue}</DealTag>}
            <DealTag>$5 Kickback</DealTag> 
        </div>

        {/* Social Proof with AvatarStack */}
        <div className="mt-4">
            <AvatarStack count={deal.tapInCount || 342} />
        </div>
      </div>
      
      {/* --- Actions & Expandable Offers --- */}
      <div className="px-4 pb-4">
        <button 
            onClick={() => setOffersVisible(!offersVisible)}
            className="flex items-center justify-center w-full mb-3 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-800"
        >
            <span>View All Offers</span>
            <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", offersVisible && "rotate-180")} />
        </button>
        <AnimatePresence>
        {offersVisible && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
            >
                <div className="scrollbar-hide flex gap-3 pb-2 overflow-x-auto">
                    {(deal.offers || mockOffers).map(offer => (
                        <div key={offer.title} className="flex-shrink-0 w-36 rounded-lg border p-3 text-center bg-neutral-50">
                           <p className="font-bold text-sm text-neutral-800">{offer.title}</p>
                           <p className="text-xs text-neutral-500 mt-1">{offer.time}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Primary CTA with new text and color */}
        <Button size="lg" className="w-full bg-accent-resy-orange font-bold text-white hover:bg-accent-resy-orange/90">
          Tap in
        </Button>
      </div>
    </div>
  );
};
