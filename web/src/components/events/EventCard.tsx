// web/src/components/events/EventCard.tsx
// ─── Shared immersive Event Card (reused across EventsTab & DiscoverEventsPage) ───

import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    TrendingUp,
    ArrowUpRight,
    Heart,
    Ticket,
    Sparkles,
    Globe,
    ExternalLink,
} from 'lucide-react';
import type { EventDetail } from '@/hooks/useEventDetail';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatEventDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function formatEventTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function getLowestPrice(event: EventDetail | HybridEvent): string {
    if ('isFreeEvent' in event && event.isFreeEvent) return 'FREE';
    if ('ticketTiers' in event) {
        const activeTiers = event.ticketTiers?.filter((t) => t.isActive) ?? [];
        if (activeTiers.length === 0) return 'FREE';
        const min = Math.min(...activeTiers.map((t) => t.price));
        return `$${min.toFixed(2)}`;
    }
    // Ticketmaster price
    if ('priceRanges' in event && (event as any).priceRanges?.[0]) {
        return `$${(event as any).priceRanges[0].min}+`;
    }
    return 'FREE';
}

function getTotalAvailable(event: EventDetail | HybridEvent): number {
    if ('ticketTiers' in event) {
        return (event.ticketTiers ?? []).reduce(
            (sum, t) => sum + Math.max(0, t.totalQuantity - t.soldQuantity - t.reservedQuantity),
            0,
        );
    }
    return -1; // unknown for hybrid
}

/* ─── Constants ────────────────────────────────────────────────── */

export const EVENT_TYPE_LABELS: Record<string, string> = {
    PARTY: 'Party',
    BAR_CRAWL: 'Bar Crawl',
    FESTIVAL: 'Festival',
    RSVP_EVENT: 'RSVP Event',
    CONCERT: 'Concert',
    COMEDY: 'Comedy',
    NIGHTLIFE: 'Nightlife',
    SPORTS: 'Sports',
    SPORTS_TOURNAMENT: 'Tournament',
    FOOD_AND_DRINK: 'Food & Drink',
    ARTS: 'Arts',
    NETWORKING: 'Networking',
    WORKSHOP: 'Workshop',
    WAGBT: 'WAGBT',
    OTHER: 'Event',
};

export const EVENT_TYPE_DOT_COLORS: Record<string, string> = {
    PARTY: 'bg-pink-500',
    BAR_CRAWL: 'bg-amber-500',
    FESTIVAL: 'bg-purple-500',
    RSVP_EVENT: 'bg-blue-500',
    CONCERT: 'bg-[#B91C1C]',
    COMEDY: 'bg-yellow-500',
    NIGHTLIFE: 'bg-indigo-500',
    SPORTS: 'bg-emerald-500',
    FOOD_AND_DRINK: 'bg-orange-500',
};

/* ─── Hybrid event type (for DiscoverEventsPage mixed data) ───── */

export interface HybridEvent {
    id: string | number;
    title?: string;
    name?: string;
    coverImageUrl?: string | null;
    images?: { url: string; width: number }[];
    eventType?: string;
    startDate?: string;
    dates?: { start?: { localDate?: string; dateTime?: string } };
    venueName?: string | null;
    _embedded?: { venues?: { name: string }[] };
    isFreeEvent?: boolean;
    isSoldOut?: boolean;
    currentAttendees?: number;
    maxAttendees?: number | null;
    shortDescription?: string | null;
    description?: string | null;
    trendingScore?: number;
    socialProofCount?: number;
    tags?: string[];
    ticketTiers?: EventDetail['ticketTiers'];
    source?: 'local' | 'ticketmaster';
    url?: string;
    priceRanges?: { min: number; max: number; currency: string }[];
}

/* ─── Card Props ───────────────────────────────────────────────── */

interface EventCardProps {
    /** Pass a full EventDetail OR a hybrid event object */
    event: EventDetail | HybridEvent;
    /** Optional: override the aspect ratio. Default = 3/5 (tall card) */
    aspectRatio?: string;
}

/* ─── The Card ─────────────────────────────────────────────────── */

export function EventCard({ event, aspectRatio = 'aspect-[3/5]' }: EventCardProps) {
    const navigate = useNavigate();

    // ── Normalize fields across both event shapes ──
    const title = ('title' in event && event.title) || ('name' in event && event.name) || 'Event';
    const coverImage =
        event.coverImageUrl ||
        (event as HybridEvent).images?.find((i) => i.width > 400)?.url ||
        (event as HybridEvent).images?.[0]?.url ||
        null;
    const eventType = event.eventType ?? '';
    const startDateStr =
        ('startDate' in event && event.startDate) ||
        (event as HybridEvent).dates?.start?.dateTime ||
        (event as HybridEvent).dates?.start?.localDate ||
        '';
    const venue =
        event.venueName ||
        (event as HybridEvent)._embedded?.venues?.[0]?.name ||
        null;
    const trendingScore = ('trendingScore' in event ? event.trendingScore : 0) ?? 0;
    const socialProofCount = ('socialProofCount' in event ? event.socialProofCount : 0) ?? 0;
    const isTrending = trendingScore > 50 || socialProofCount > 20;
    const currentAttendees = ('currentAttendees' in event ? event.currentAttendees : 0) ?? 0;
    const shortDesc = event.shortDescription || (event as HybridEvent).description || null;
    const isFree = ('isFreeEvent' in event && event.isFreeEvent) || false;
    const isHybridTM = (event as HybridEvent).source === 'ticketmaster';

    const price = getLowestPrice(event as any);
    const available = getTotalAvailable(event as any);

    const typeLabel = EVENT_TYPE_LABELS[eventType] ?? (eventType?.replace(/_/g, ' ') || '');
    const dotColor = EVENT_TYPE_DOT_COLORS[eventType] ?? 'bg-[#B91C1C]';

    const handleClick = () => {
        if (isHybridTM) {
            const tmUrl = (event as HybridEvent).url;
            if (tmUrl) window.open(tmUrl, '_blank', 'noopener,noreferrer');
        } else {
            navigate(PATHS.EVENT_DETAIL.replace(':eventId', String(event.id)));
        }
    };

    const handleCTAClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleClick();
    };

    return (
        <div
            className={cn(
                'relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group',
                aspectRatio,
            )}
            onClick={handleClick}
        >
            {/* Full-bleed cover image */}
            {coverImage ? (
                <div className="absolute inset-0">
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600';
                        }}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                    <Ticket className="h-8 w-8 text-neutral-600" />
                </div>
            )}

            {/* Category badge – top left */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                {isHybridTM ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/80 backdrop-blur-md">
                        <Globe className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Ticketmaster
                        </span>
                    </div>
                ) : typeLabel ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                        <div className={cn('w-2 h-2 rounded-full', dotColor)} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {typeLabel}
                        </span>
                    </div>
                ) : null}
                {!isHybridTM && (event as HybridEvent).source === 'local' && (
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#B91C1C]/80 backdrop-blur-md">
                        <Sparkles className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Local
                        </span>
                    </div>
                )}
            </div>

            {/* Price badge – top right */}
            <div className="absolute top-3.5 right-3.5 z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-sm">
                    {price}
                </span>
            </div>

            {/* Trending badge */}
            {isTrending && (
                <div className="absolute top-14 right-3.5 z-10">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/80 backdrop-blur-md">
                        <TrendingUp className="h-3 w-3 text-white" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            Trending
                        </span>
                    </div>
                </div>
            )}

            {/* Sold out overlay */}
            {available === 0 && !isFree && (
                <div className="absolute top-14 left-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                        Sold Out
                    </span>
                </div>
            )}

            {/* Bottom gradient – smooth progressive fade */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />

            {/* Bottom content – all on top of image */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col">
                {/* Title */}
                <h4 className="text-xl font-black text-white uppercase tracking-wide leading-tight line-clamp-2">
                    {title}
                </h4>

                {/* Date + Time + Venue */}
                {startDateStr && (
                    <div className="mt-1.5 space-y-0.5">
                        <p className="text-[13px] text-white/60 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {formatEventDate(startDateStr)} · {formatEventTime(startDateStr)}
                        </p>
                        {venue && (
                            <p className="text-[13px] text-white/50 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{venue}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Short desc */}
                {shortDesc && (
                    <p className="text-[13px] text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
                        {shortDesc}
                    </p>
                )}

                {/* Spots + attendees info */}
                {(currentAttendees > 0 || (available > 0 && available <= 30)) && (
                    <div className="flex items-center gap-3 mt-2">
                        {currentAttendees > 0 && (
                            <span className="text-[11px] text-white/50 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {currentAttendees} going
                            </span>
                        )}
                        {available > 0 && available <= 30 && (
                            <span className="text-[11px] text-amber-400 font-semibold">
                                {available} spots left
                            </span>
                        )}
                    </div>
                )}

                {/* Action row – matches menu card "Add to Basket" design */}
                <div className="flex items-center gap-2.5 mt-4">
                    {/* View Event – main CTA */}
                    <button
                        onClick={handleCTAClick}
                        className="flex-1 flex items-center justify-between pl-5 pr-1.5 py-1.5 rounded-full bg-white group/cta"
                    >
                        <span className="text-sm font-semibold text-[#1a1a2e] whitespace-nowrap">
                            {isHybridTM ? 'Buy Tickets' : 'View Event'}
                        </span>
                        <span className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0 group-hover/cta:scale-110 transition-transform">
                            {isHybridTM ? (
                                <ExternalLink className="h-[17px] w-[17px] text-white" />
                            ) : (
                                <ArrowUpRight className="h-[17px] w-[17px] text-white" />
                            )}
                        </span>
                    </button>
                    {/* Heart – separate white circle */}
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:bg-neutral-100 transition-colors"
                    >
                        <Heart className="h-[18px] w-[18px] text-[#1a1a2e]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
