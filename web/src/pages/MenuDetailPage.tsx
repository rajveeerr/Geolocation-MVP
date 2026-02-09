import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useDealDetail } from '@/hooks/useDealDetail';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { cn } from '@/lib/utils';
import {
  X, Share2, ChevronLeft, ChevronRight, Star, ThumbsUp,
  Minus, Plus, ShoppingCart,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Placeholder data (backend doesn't support these yet)               */
/* ------------------------------------------------------------------ */
const placeholderAddOns = [
  { id: 1, name: 'Butter', price: 0, calories: 30, quantity: 1 },
  { id: 2, name: 'American Cheese', price: 0.50, calories: 50, quantity: 1 },
  { id: 3, name: 'Sausage', price: 2.50, calories: 190, quantity: 1, isPopular: true },
  { id: 4, name: 'Bacon', price: 2.50, calories: 120, quantity: 1 },
];

const placeholderCustomerClips = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&h=200&fit=crop',
];

const placeholderReviews = [
  {
    id: 1,
    initials: 'CK',
    color: 'bg-emerald-500',
    rating: 5,
    date: '2 days ago',
    text: 'This is hands down the best thing on the menu! The flavors are incredible and the portion size is perfect. I\'ve been coming here for months and it never disappoints.',
    helpful: 23,
  },
  {
    id: 2,
    initials: 'MT',
    color: 'bg-purple-500',
    rating: 4,
    date: '1 week ago',
    text: 'Really solid choice. Great quality ingredients and you can taste the difference. Would definitely order again!',
    helpful: 16,
  },
  {
    id: 3,
    initials: 'BR',
    color: 'bg-amber-500',
    rating: 5,
    date: '2 weeks ago',
    text: 'Wow! Just wow! The BOGO deal makes it even better. Shared with a friend and we were both blown away by how good this was.',
    helpful: 31,
  },
];

/* ------------------------------------------------------------------ */
/*  Stars Component                                                    */
/* ------------------------------------------------------------------ */
const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300',
        )}
        style={{ width: size, height: size }}
      />
    ))}
  </div>
);

/* ================================================================== */
/*  MENU DETAIL PAGE                                                   */
/* ================================================================== */
export const MenuDetailPage = () => {
  const { dealId, itemId } = useParams<{ dealId: string; itemId: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDealDetail(dealId || '');

  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addOns, setAddOns] = useState(placeholderAddOns);

  /* Find the specific menu item */
  const menuItem = useMemo(() => {
    if (!deal?.menuItems?.length || !itemId) return null;
    return deal.menuItems.find((m: any) => String(m.id) === itemId) || null;
  }, [deal, itemId]);

  /* Images for gallery — use item image + deal images as fallback */
  const images = useMemo(() => {
    const imgs: string[] = [];
    if (menuItem?.imageUrl) imgs.push(menuItem.imageUrl);
    if (deal?.images?.length) {
      deal.images.forEach((img: string) => {
        if (!imgs.includes(img)) imgs.push(img);
      });
    }
    if (!imgs.length && deal?.imageUrl) imgs.push(deal.imageUrl);
    return imgs.slice(0, 5);
  }, [menuItem, deal]);

  const price = menuItem?.discountedPrice || menuItem?.originalPrice || 0;
  const originalPrice = menuItem?.originalPrice || 0;
  const hasDiscount = menuItem?.discountedPrice && menuItem.discountedPrice < originalPrice;

  const handleAddOnQty = (id: number, delta: number) => {
    setAddOns((prev) =>
      prev.map((a) => (a.id === id ? { ...a, quantity: Math.max(0, a.quantity + delta) } : a)),
    );
  };

  const totalPrice = useMemo(() => {
    const itemTotal = price * quantity;
    const addOnTotal = addOns.reduce((sum, a) => sum + a.price * a.quantity, 0) * quantity;
    return itemTotal + addOnTotal;
  }, [price, quantity, addOns]);

  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length);

  /* ---------- Loading ---------- */
  if (isLoading) return <LoadingOverlay message="Loading item details…" />;

  if (!menuItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20 bg-white">
        <ShoppingCart className="h-12 w-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold text-neutral-800">Item not found</h2>
        <p className="text-sm text-neutral-500 mt-1">
          This menu item may have been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#1a1a2e] text-white text-sm font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="pt-16 pb-28 bg-white min-h-screen">
      <div className="container mx-auto max-w-screen-lg px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>
          <button
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({ title: menuItem.name, url: window.location.href });
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                }
              } catch { /* cancelled */ }
            }}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <Share2 className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        {/* Main layout – side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* ============ LEFT – Image Gallery ============ */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100">
              {images.length > 0 ? (
                <img
                  src={images[imgIdx]}
                  alt={menuItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-neutral-300" />
                </div>
              )}

              {/* Counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold">
                {imgIdx + 1}/{images.length} photos
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-neutral-800" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all',
                      imgIdx === i ? 'ring-2 ring-[#8B1A1A]' : 'opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============ RIGHT – Details ============ */}
          <div className="space-y-6">
            {/* Title + Price */}
            <div>
              <h1 className="text-2xl font-black text-neutral-900">{menuItem.name}</h1>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-neutral-900">
                  ${price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-neutral-400 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {/* Calories placeholder */}
              <p className="text-sm text-neutral-500 mt-0.5">485 Cal</p>
              {/* Most liked badge */}
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-red-50 text-[#B91C1C] text-xs font-bold">
                #2 most liked
              </span>
            </div>

            {/* Description */}
            {menuItem.description && (
              <p className="text-sm text-neutral-700 leading-relaxed">
                {menuItem.description}. A delicious blend of premium ingredients, crafted to perfection.
                This crowd favorite has been featured in multiple food blogs and is a must-try when you visit.
              </p>
            )}

            {/* Most popular combos – placeholder */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Most popular</h3>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900">
                      #1. Ordered by 600+ others
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      Rustic Egg
                    </p>
                  </div>
                </label>
                <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900">
                      #2. Ordered by 200+ others
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      Rustic Egg + Sausage
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Comes With / Add-ons */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  {menuItem.name} Comes With
                </h3>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Choose up to 5
                </span>
              </div>
              <div className="space-y-0 divide-y divide-neutral-100">
                {addOns.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900">{addon.name}</span>
                        {addon.isPopular && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {addon.price > 0 ? `$${addon.price.toFixed(2)}` : ''}{' '}
                        {addon.calories} Cal
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddOnQty(addon.id, -1)}
                        className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center hover:bg-[#252548] transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold text-neutral-900 w-5 text-center tabular-nums">
                        {addon.quantity}
                      </span>
                      <button
                        onClick={() => handleAddOnQty(addon.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center hover:bg-[#252548] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Clips */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span className="text-[#B91C1C]">▸</span>
                  Customer Clips ({placeholderCustomerClips.length})
                </h3>
                <button
                  disabled
                  className="px-3 py-1.5 rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold flex items-center gap-1.5 cursor-not-allowed opacity-70"
                >
                  📷 Upload Your Reel
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {placeholderCustomerClips.map((clip, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <img src={clip} alt="" className="w-full h-full object-cover" />
                    {/* User avatar */}
                    <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-neutral-300">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What people are saying */}
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-4">
                What people are saying
              </h3>
              <div className="space-y-3">
                {placeholderReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-neutral-100 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                          review.color,
                        )}>
                          {review.initials}
                        </div>
                        <Stars rating={review.rating} />
                      </div>
                      <span className="text-[10px] text-neutral-400">{review.date}</span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{review.text}</p>
                    <button
                      disabled
                      className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-500 cursor-not-allowed"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  BOTTOM STICKY BAR                                            */}
      {/* ============================================================ */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-50">
        <div className="container mx-auto max-w-screen-lg px-4 py-3 flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Quantity:</span>
            <div className="flex items-center gap-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-neutral-900 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {/* Add to order */}
          <button
            disabled
            className="px-6 py-2.5 rounded-full bg-[#1a1a2e] text-white text-sm font-bold cursor-not-allowed opacity-80 flex items-center gap-1"
            title="Online ordering coming soon"
          >
            Add {quantity} to order • ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
