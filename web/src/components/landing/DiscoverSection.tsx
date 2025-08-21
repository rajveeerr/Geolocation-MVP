// src/components/landing/DiscoverSection.tsx
import { motion } from 'framer-motion';
import { Star, Trophy, Clock, TrendingUp } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

interface LeaderboardItem {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  dealValue: string;
  expiresAt: string;
  totalSaved: number;
  usersCount: number;
}

const leaderboardData: LeaderboardItem[] = [
  {
    id: '1',
    name: 'Echoes Living Room',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    rating: 4.8,
    location: 'GTB Nagar',
    dealValue: '2-for-1 Drinks',
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    totalSaved: 25680,
    usersCount: 342
  },
  {
    id: '2',
    name: 'Urban Tapas Bar',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80',
    rating: 4.6,
    location: 'Connaught Place',
    dealValue: '40% OFF Food',
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    totalSaved: 18540,
    usersCount: 298
  },
  {
    id: '3',
    name: 'Rooftop Cafe Delhi',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80',
    rating: 4.5,
    location: 'Khan Market',
    dealValue: '₹200 OFF',
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
    totalSaved: 15230,
    usersCount: 256
  }
];

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(expiresAt);

  return (
    <div className="flex items-center space-x-1 text-xs text-orange-600 font-semibold">
      <Clock className="w-3 h-3" />
      <span>
        {days > 0 && `${days}d `}
        {hours.toString().padStart(2, '0')}:
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const LeaderboardCard = ({ item, rank }: { item: LeaderboardItem; rank: number }) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start space-x-3">
        {/* Rank Badge */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getRankColor(rank)} flex-shrink-0`}>
          {rank <= 3 ? <Trophy className="w-4 h-4" /> : <span className="text-sm font-bold">#{rank}</span>}
        </div>

        {/* Restaurant Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-600">{item.rating}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">{item.location}</span>
              </div>
            </div>
            <CountdownTimer expiresAt={item.expiresAt} />
          </div>

          {/* Deal Info */}
          <div className="mt-2">
            <div className="inline-block bg-brand-primary-100 text-brand-primary-700 px-2 py-1 rounded-md text-xs font-medium">
              {item.dealValue}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>₹{item.totalSaved.toLocaleString()} saved</span>
            </div>
            <span>{item.usersCount} users claimed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const DiscoverSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-primary-100 to-brand-primary-50 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-brand-primary-600" />
            <span className="text-brand-primary-700 font-semibold">Live Deal Leaderboard</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover What's Trending
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See the hottest deals in your city right now. These are the most popular offers that locals are claiming today.
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {leaderboardData.map((item, index) => (
              <LeaderboardCard 
                key={item.id} 
                item={item} 
                rank={index + 1} 
              />
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 text-white font-semibold rounded-lg hover:from-brand-primary-600 hover:to-brand-primary-700 transition-all duration-200 shadow-lg">
              View All Trending Deals
              <TrendingUp className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
