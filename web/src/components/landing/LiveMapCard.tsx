import { Map } from 'lucide-react';

export const LiveMapCard = () => (
  <div className="relative flex h-full w-full flex-col items-start justify-end gap-2 p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-900 to-gray-900" />
    <Map className="absolute right-4 top-4 h-8 w-8 text-white/30" />
    <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-accent-urgent animate-ping" />
    <div className="absolute left-1/3 top-2/3 h-1 w-1 rounded-full bg-accent-secondary animate-ping" />
    <div className="absolute right-1/4 bottom-1/4 h-1.5 w-1.5 rounded-full bg-accent-gamification animate-ping" />
    <h3 className="text-2xl font-semibold text-white">Your City, Live.</h3>
    <p className="max-w-xs text-sm text-white/80">
      See a real-time view of every deal, happy hour, and secret offer around you.
    </p>
  </div>
);