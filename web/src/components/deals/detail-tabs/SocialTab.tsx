// web/src/components/deals/detail-tabs/SocialTab.tsx
import { useState } from 'react';
import { Users, DollarSign, Calendar, Star, Target, Crown, ChefHat, Briefcase, User } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface SocialTabProps {
  deal: DetailedDeal;
}

const INFLUENCER_TYPES = [
  { id: 'all', label: 'All Influencers' },
  { id: 'owners', label: 'Restaurant Owners' },
  { id: 'chefs', label: 'Chefs' },
  { id: 'staff', label: 'Staff Members' },
  { id: 'community', label: 'Community Members' },
];

const MOCK_INFLUENCERS = [
  {
    id: 1,
    name: 'Marcus Chen',
    title: 'Owner & Founder',
    role: 'OWNER',
    rating: 4.9,
    followers: 125000,
    growth: 8.5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    services: [
      { name: 'Social Media Shoutout', price: 500 },
      { name: 'Event Appearance', price: 2500 },
      { name: 'Product/Service Review', price: 750 },
      { name: 'Video Consultation', price: 300 },
      { name: 'Birthday Video Greeting', price: 150 },
    ],
  },
  {
    id: 2,
    name: 'Chef Isabella Rodriguez',
    title: 'Executive Chef',
    role: 'CHEF',
    rating: 5.0,
    followers: 89000,
    growth: 12.3,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
    services: [
      { name: 'Recipe Feature', price: 400 },
      { name: 'Cooking Class Call', price: 200 },
      { name: 'Kitchen Product Review', price: 600 },
      { name: 'Birthday Video Greeting', price: 120 },
      { name: 'Anniversary/Occasion Greeting', price: 140 },
    ],
  },
  {
    id: 3,
    name: 'Sarah Thompson',
    title: 'Food Enthusiast & Regular',
    role: 'CUSTOMER',
    rating: 4.8,
    followers: 45000,
    growth: 15.7,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    services: [
      { name: 'Restaurant Feature', price: 250 },
      { name: 'Honest Food Review', price: 350 },
      { name: 'Birthday Video Greeting', price: 80 },
      { name: 'Anniversary/Special Occasion Greeting', price: 100 },
      { name: 'Custom Request - Pitch Anything', price: 0 },
    ],
  },
  {
    id: 4,
    name: 'James Martinez',
    title: 'Head Sommelier',
    role: 'STAFF',
    rating: 4.9,
    followers: 32000,
    growth: 9.8,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    services: [
      { name: 'Wine/Beverage Feature', price: 300 },
      { name: 'Wine Consultation', price: 150 },
      { name: 'Wine/Spirit Review', price: 400 },
      { name: 'Birthday Video Greeting', price: 110 },
      { name: 'Anniversary/Special Occasion Greeting', price: 130 },
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Choose Influencer',
    description: 'Browse profiles and select the perfect match for your brand',
  },
  {
    step: 2,
    title: 'Select Service',
    description: 'Pick from shoutouts, appearances, reviews, or consultations',
  },
  {
    step: 3,
    title: 'Book & Pay',
    description: 'Schedule your service and complete secure payment',
  },
  {
    step: 4,
    title: 'Get Results',
    description: 'Receive your content or service as agreed',
  },
];

export const SocialTab = ({ deal }: SocialTabProps) => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'previous-works'>('services');

  const filteredInfluencers = selectedType === 'all'
    ? MOCK_INFLUENCERS
    : MOCK_INFLUENCERS.filter(inf => {
        const typeMap: Record<string, string> = {
          owners: 'OWNER',
          chefs: 'CHEF',
          staff: 'STAFF',
          community: 'CUSTOMER',
        };
        return inf.role === typeMap[selectedType];
      });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return Crown;
      case 'CHEF':
        return ChefHat;
      case 'STAFF':
        return Briefcase;
      default:
        return User;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The influencer marketplace feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">Influencer Marketplace</h1>
          <p className="text-purple-100 max-w-2xl">
            Connect with our restaurant influencers for social media promotions, event appearances, product reviews, and expert consultations. Everyone's an influencer - book personalized services from our owner, chef, staff, and community members.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Easy Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="text-sm">Verified Influencers</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="text-sm">Targeted Reach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Influencer Type Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {INFLUENCER_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              selectedType === type.id
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold mb-2">How It Works</h3>
        <p className="text-sm text-neutral-600 mb-6">Simple steps to collaborate with our influencers</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
        {filteredInfluencers.map((influencer) => {
          const RoleIcon = getRoleIcon(influencer.role);
          return (
            <div
              key={influencer.id}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1">
                    <RoleIcon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{influencer.name}</h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                      {influencer.role}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{influencer.title}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{influencer.rating}</span>
                    </div>
                    <div>
                      <span className="font-semibold">{(influencer.followers / 1000).toFixed(0)}K</span> followers
                    </div>
                    <div className="text-green-600">
                      {influencer.growth}% growth
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-neutral-200">
                <button
                  onClick={() => setActiveTab('services')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'services'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('previous-works')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'previous-works'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  Previous Works
                </button>
              </div>

              {/* Services List */}
              {activeTab === 'services' && (
                <div className="space-y-2">
                  {influencer.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                      </div>
                      <div className="text-right">
                        {service.price === 0 ? (
                          <span className="text-sm font-semibold text-green-600">Free</span>
                        ) : (
                          <span className="text-sm font-semibold">${service.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Previous Works */}
              {activeTab === 'previous-works' && (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No previous works available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

