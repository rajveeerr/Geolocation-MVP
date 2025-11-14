// web/src/components/deals/detail-tabs/PodcastTab.tsx
import { useState } from 'react';
import { Mic, Play, Plus } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface PodcastTabProps {
  deal: DetailedDeal;
}

const PODCAST_CATEGORIES = [
  { id: 'chefs-table', label: 'The Chef\'s Table Talk', active: true },
  { id: 'wine-dine', label: 'Wine & Dine' },
  { id: 'sweet-talk', label: 'Sweet Talk' },
  { id: 'cocktail', label: 'Cocktail Chronicles' },
  { id: 'insider', label: 'Restaurant Insider' },
  { id: 'sustainable', label: 'Sustainable Kitchen' },
];

const MOCK_EPISODES = [
  {
    id: 1,
    title: 'Episode 1',
    subtitle: 'The Art of Seasoning',
    description: 'Master the foundation of flavor with proper seasoning techniques that elevate any dish.',
    date: 'Nov 1 2024',
    duration: '32:15',
    plays: '2.1K',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
  },
  {
    id: 2,
    title: 'Episode 2',
    subtitle: 'Wine Pairing Basics',
    description: 'Learn how to pair wines with different dishes to enhance your dining experience.',
    date: 'Nov 8 2024',
    duration: '28:45',
    plays: '1.8K',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
  },
];

export const PodcastTab = ({ deal }: PodcastTabProps) => {
  const [selectedCategory, setSelectedCategory] = useState('chefs-table');

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Mic className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The podcast feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Mic className="h-8 w-8 text-neutral-600" />
          <h1 className="text-3xl font-bold">Luminara Podcasts</h1>
        </div>
        <p className="text-neutral-600">
          Listen to our team of experts share their knowledge, stories, and passion for exceptional dining.
        </p>
      </div>

      {/* Podcast Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {PODCAST_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2',
              selectedCategory === category.id
                ? 'bg-black text-white border-2 border-black'
                : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Featured Podcast */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600"
              alt="Chef's Table Talk"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm opacity-90 mb-2 block">Podcast</span>
            <h2 className="text-3xl font-bold mb-2">The Chef's Table Talk</h2>
            <p className="text-sm opacity-90 mb-2">Hosted by Chef Marcus Santos</p>
            <p className="text-sm opacity-90 mb-4">
              Executive Chef Marcus Santos shares culinary secrets, cooking techniques, and stories from 20 years in fine dining.
            </p>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span>Episodes: 24</span>
              <span>Followers: 8,542</span>
            </div>
            <Button
              variant="secondary"
              disabled
              className="bg-white text-neutral-900 hover:bg-neutral-100 opacity-50 cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subscribe $4.99/mo
            </Button>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Episodes</h3>
          <select className="px-4 py-2 border border-neutral-200 rounded-lg text-sm">
            <option>Season 1: Fundamentals (2024)</option>
          </select>
        </div>
        <div className="space-y-4 opacity-50 pointer-events-none">
          {MOCK_EPISODES.map((episode) => (
            <div
              key={episode.id}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-neutral-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                <img
                  src={episode.image}
                  alt={episode.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{episode.title}</h4>
                <h5 className="font-semibold text-neutral-900 mb-2">{episode.subtitle}</h5>
                <p className="text-sm text-neutral-600 mb-2">{episode.description}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{episode.date}</span>
                  <span>•</span>
                  <span>{episode.duration}</span>
                  <span>•</span>
                  <span>{episode.plays}</span>
                </div>
              </div>
              <button
                className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                disabled
              >
                <Play className="h-6 w-6 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

