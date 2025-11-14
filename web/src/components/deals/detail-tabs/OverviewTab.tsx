// web/src/components/deals/detail-tabs/OverviewTab.tsx
import { Star, Award, ThumbsUp, Wifi, UtensilsCrossed, Users, Car, Music, Shield, ChefHat, CreditCard, Apple, CheckCircle } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  deal: DetailedDeal;
}

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const OverviewTab = ({ deal }: OverviewTabProps) => {
  const merchant = deal.merchant;
  const hasLocation = merchant.latitude && merchant.longitude;

  // Use real social proof data from deal
  const totalSaves = deal.socialProof?.totalSaves || 0;
  const totalCheckIns = deal.socialProof?.totalCheckIns || 0;
  const totalEngagement = totalSaves + totalCheckIns;

  // Amenities - placeholder for future backend support
  // TODO: Replace with actual merchant amenities when backend supports it
  const amenities = [
    { icon: Wifi, label: 'Free WiFi' },
    { icon: UtensilsCrossed, label: 'Full Bar' },
    { icon: Users, label: 'Private Dining' },
    { icon: CreditCard, label: 'All Payment Methods' },
    { icon: Apple, label: 'Dietary Options' },
    { icon: Car, label: 'Valet Parking' },
    { icon: Music, label: 'Live Music' },
    { icon: CheckCircle, label: 'Wheelchair Accessible' },
    { icon: Shield, label: 'Health & Safety Certified' },
    { icon: ChefHat, label: "Chef's Table Experience" },
  ];

  // Hours - placeholder for future backend support
  // TODO: Replace with actual merchant operating hours when backend supports it
  const hours = null; // Will be null until backend provides this data

  // Ratings - placeholder for future backend support
  // TODO: Replace with actual reviews/ratings when backend supports it
  const ratings = null; // Will be null until backend provides this data

  return (
    <div className="space-y-8">
      {/* Why guests love section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why guests love {merchant.businessName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Star className="h-8 w-8 text-yellow-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">Guest favorite</h3>
            <p className="text-neutral-600 text-sm">
              One of the most loved restaurants in San Francisco
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Award className="h-8 w-8 text-amber-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">Verified Merchant</h3>
            <p className="text-neutral-600 text-sm">
              {merchant.totalDeals > 0 
                ? `${merchant.totalDeals} active deal${merchant.totalDeals !== 1 ? 's' : ''}`
                : 'Trusted business partner'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <ThumbsUp className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">
              {totalEngagement > 0 ? totalEngagement.toLocaleString() : 'New'}
            </h3>
            <p className="text-neutral-600 text-sm">
              {totalEngagement > 0 
                ? `${totalSaves} saves • ${totalCheckIns} check-ins`
                : 'Be the first to save this deal!'}
            </p>
          </div>
        </div>
      </div>

      {/* About this restaurant */}
      <div>
        <h2 className="text-2xl font-bold mb-4">About this restaurant</h2>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4 text-neutral-700">
          <p>
            {merchant.description || `${merchant.businessName} is a contemporary American fine dining restaurant in the heart of San Francisco's culinary district. Our award-winning team creates innovative seasonal menus that celebrate the finest locally-sourced ingredients from regional farmers and artisan producers.`}
          </p>
          <p>
            Since opening, we've been committed to providing an unforgettable dining experience that combines culinary artistry with warm hospitality. Our space features floor-to-ceiling windows, an open kitchen concept, and an intimate 12-seat chef's counter where guests can watch our culinary team in action.
          </p>
          <p>
            Whether you're here for our signature tasting menu, weekend brunch, or happy hour cocktails, we strive to make every visit special. We also offer private dining spaces perfect for celebrations, corporate events, and intimate gatherings.
          </p>
        </div>
      </div>

      {/* What this place offers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">What this place offers</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {amenities.map((amenity, idx) => {
            const Icon = amenity.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border border-neutral-200 flex flex-col items-center text-center"
              >
                <Icon className="h-6 w-6 text-neutral-600 mb-2" />
                <span className="text-sm font-medium text-neutral-700">{amenity.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hours */}
      {hours ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Hours</h2>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="space-y-3">
              {hours.map((hour, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                  <span className="font-medium text-neutral-900">{hour.day}</span>
                  <span className="text-neutral-600">{hour.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold">Open now</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reviews Summary - Hidden until backend supports ratings/reviews */}
      {/* TODO: Uncomment when backend provides ratings/reviews data */}
      {/* {ratings ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold">{ratings.overall}</div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= Math.floor(ratings.overall)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-neutral-300'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-600">
                  Based on {ratings.totalReviews.toLocaleString()} reviews
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {ratings.categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= Math.floor(category.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-neutral-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 w-8 text-right">
                      {category.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null} */}

      {/* Location */}
      {hasLocation && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Where you'll dine</h2>
          <div className="bg-white rounded-xl overflow-hidden border border-neutral-200">
            <div className="p-4 border-b border-neutral-200">
              <p className="font-semibold text-neutral-900">{merchant.address}</p>
              <p className="text-sm text-neutral-600">
                {merchant.stores?.[0]?.city?.name}, {merchant.stores?.[0]?.city?.state}
              </p>
            </div>
            <div className="h-80">
              <MapContainer
                center={[merchant.latitude!, merchant.longitude!]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[merchant.latitude!, merchant.longitude!]}>
                  <Popup>{merchant.businessName}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Contact</h2>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-3">
          {merchant.phoneNumber && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <span className="text-neutral-600">📞</span>
              </div>
              <a
                href={`tel:${merchant.phoneNumber}`}
                className="text-neutral-900 hover:text-neutral-600"
              >
                {merchant.phoneNumber}
              </a>
            </div>
          )}
          {/* Email - Only show if merchant has email in backend (currently not available) */}
          {/* TODO: Add merchant email field to backend and display here */}
        </div>
      </div>
    </div>
  );
};

