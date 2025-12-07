// web/src/components/deals/detail-tabs/ReviewsTab.tsx
import { useState } from 'react';
import { Star, MessageSquare, CheckCircle, Filter, Eye } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface ReviewsTabProps {
  deal: DetailedDeal;
}

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Sarah M.',
    date: 'November 2024',
    rating: 5,
    meal: 'Dinner',
    verified: true,
    title: 'Absolutely Outstanding Experience',
    text: 'This was hands down one of the best dining experiences I\'ve had in San Francisco. The tasting menu was perfectly paced, each dish more impressive than the last. The sommelier\'s wine pairings were spot on. Service was attentive without being overbearing. The ambiance is sophisticated yet comfortable. Can\'t wait to come back!',
    categoryRatings: {
      food: 5,
      service: 5,
      ambiance: 5,
      value: 5,
    },
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
    ],
    helpful: 42,
    restaurantResponse: {
      date: 'Nov 11, 2024',
      text: 'Thank you so much, Sarah! We\'re thrilled you enjoyed your tasting menu experience. We look forward to welcoming you back soon!',
      author: 'Luminara Team',
    },
  },
  {
    id: 2,
    name: 'Michael R.',
    date: 'October 2024',
    rating: 5,
    meal: 'Private Dining',
    verified: true,
    title: 'Best restaurant in SF hands down',
    text: 'The ambiance is sophisticated yet welcoming, perfect for a special occasion. Chef\'s creativity really shines through in every dish.',
    categoryRatings: {
      food: 5,
      service: 5,
      ambiance: 5,
      value: 4,
    },
  },
  {
    id: 3,
    name: 'Emily K.',
    date: 'October 2024',
    rating: 5,
    meal: 'Happy Hour',
    verified: true,
    title: 'Great happy hour value!',
    text: 'The happy hour menu is such a great value! Great cocktails and the small plates are perfect for sharing. Love the vibe here.',
    categoryRatings: {
      food: 4,
      service: 4,
      ambiance: 5,
      value: 5,
    },
  },
];

const CATEGORY_RATINGS = [
  { name: 'Food Quality', rating: 4.8 },
  { name: 'Service', rating: 4.7 },
  { name: 'Ambiance', rating: 4.9 },
  { name: 'Value', rating: 4.5 },
];

export const ReviewsTab = ({ deal }: ReviewsTabProps) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most-recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const overallRating = 4.5;
  const totalReviews = 8;
  const verifiedReviews = 6;

  // Star distribution (mock data)
  const starDistribution = [
    { stars: 5, count: 5, percentage: 62.5 },
    { stars: 4, count: 2, percentage: 25 },
    { stars: 3, count: 1, percentage: 12.5 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <MessageSquare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The reviews feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-neutral-600" />
          <h1 className="text-3xl font-bold">Reviews & Feedback</h1>
        </div>
        <p className="text-neutral-600">
          See what our guests are saying and share your own experience.
        </p>
      </div>

      {/* Overall Rating */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <div className="flex items-center gap-6 mb-6">
          <div>
            <div className="text-5xl font-bold mb-1">{overallRating}</div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-6 w-6',
                    star <= Math.floor(overallRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : star === Math.ceil(overallRating) && overallRating % 1 !== 0
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'text-neutral-300'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-600">Based on {totalReviews} reviews</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">{verifiedReviews} verified reviews</span>
            </div>
          </div>
          <div className="flex-1">
            {starDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium w-12">{dist.stars} stars</span>
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-600 w-8 text-right">{dist.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold mb-4">Category Ratings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_RATINGS.map((category) => (
            <div key={category.name}>
              <p className="text-sm font-medium text-neutral-700 mb-2">{category.name}</p>
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
                <span className="text-sm font-semibold">{category.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Your Experience */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold mb-2">Share Your Experience</h3>
        <p className="text-neutral-600 mb-4">
          Help others by sharing your feedback about {deal.merchant.businessName}.
        </p>
        <Button variant="primary" disabled className="opacity-50 cursor-not-allowed">
          Write a Review
        </Button>
      </div>

      {/* Filter and Sort */}
      <div className="flex items-center gap-4 flex-wrap opacity-50 pointer-events-none">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            disabled
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            disabled
            className="opacity-50"
          />
          <span className="text-sm text-neutral-700">Verified Only</span>
        </label>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-neutral-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            disabled
          >
            <option value="most-recent">Most Recent</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="lowest-rated">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 opacity-50 pointer-events-none">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.name}</span>
                    {review.verified && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {review.date} • {review.meal}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-5 w-5',
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-300'
                    )}
                  />
                ))}
              </div>
            </div>
            <h4 className="font-bold text-lg mb-2">{review.title}</h4>
            <p className="text-neutral-700 mb-4">{review.text}</p>
            {review.categoryRatings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-neutral-200">
                {Object.entries(review.categoryRatings).map(([category, rating]) => (
                  <div key={category}>
                    <p className="text-xs text-neutral-600 mb-1 capitalize">{category}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-3 w-3',
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-neutral-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review ${idx + 1}`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            {review.restaurantResponse && (
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">Restaurant Response</span>
                  <span className="text-xs text-neutral-500">{review.restaurantResponse.date}</span>
                </div>
                <p className="text-sm text-neutral-700 mb-1">{review.restaurantResponse.text}</p>
                <p className="text-xs text-neutral-500">— {review.restaurantResponse.author}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button className="text-sm text-neutral-600 hover:text-neutral-900">
                Helpful ({review.helpful || 0})
              </button>
              <button className="text-sm text-neutral-600 hover:text-neutral-900">Reply</button>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full" disabled>
          Show all 6 reviews
        </Button>
      </div>
    </div>
  );
};

