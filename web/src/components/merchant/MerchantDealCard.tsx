// src/components/merchant/MerchantDealCard.tsx
import type { Deal } from '@/data/deals';
import { Button } from '@/components/common/Button';
import { Edit, Star, MapPin } from 'lucide-react';

interface MerchantDealCardProps { 
  deal: Deal 
}

export const MerchantDealCard = ({ deal }: MerchantDealCardProps) => {
    const now = new Date();
    const expiresAt = deal.expiresAt ? new Date(deal.expiresAt) : null;
    const isExpired = expiresAt ? expiresAt <= now : false;
    const isLive = !isExpired && expiresAt; // If not expired and has expiry date, it's live

    return (
        <div className="group border border-neutral-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row bg-white shadow-sm hover:shadow-lg hover:border-brand-primary-200 transition-all duration-300">
            <div className="relative">
                <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="w-full h-48 sm:w-56 sm:h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    {isLive && <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200">Live</span>}
                    {isExpired && <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200">Expired</span>}
                    {!expiresAt && <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">No Expiry</span>}
                </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        <h3 className="font-bold text-xl text-neutral-900 mb-2 group-hover:text-brand-primary-600 transition-colors">{deal.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{deal.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-neutral-400" />
                                <span>{deal.location}</span>
                            </div>
                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-medium">{deal.price}</span>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-xl flex-shrink-0 ml-4">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
                
                <div className="flex-grow">
                    <p className="text-base font-semibold text-brand-primary-600 mb-2">{deal.dealValue || 'Special deal available'}</p>
                    <p className="text-sm text-neutral-500 line-clamp-2">{deal.category} deal available</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 font-medium">
                        {expiresAt ? `Expires on ${expiresAt.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}` : 'No expiration date'}
                    </p>
                </div>
            </div>
        </div>
    );
};
