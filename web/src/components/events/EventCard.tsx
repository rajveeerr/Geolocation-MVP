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
    CONCERT: 'bg-brand-primary-600',
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
    /** Optional: fixed width in pixels (e.g., 204.75) */
    width?: number;
    /** Optional: fixed height in pixels (e.g., 364) */
    height?: number;
    /** Hide description & visitor count for compact contexts (e.g. deal detail) */
    compact?: boolean;
}

/* ─── The Card ─────────────────────────────────────────────────── */

export function EventCard({ event, aspectRatio = 'aspect-[3/5]', width, height, compact }: EventCardProps) {
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
    const dotColor = EVENT_TYPE_DOT_COLORS[eventType] ?? 'bg-brand-primary-600';

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

    // Use fixed dimensions if provided, otherwise use aspect ratio
    const cardStyle = width && height
        ? { width: `${width}px`, height: `${height}px` }
        : undefined;

    const isFixedSize = width && height;

    return (
        <div
            className={cn(
                'relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group flex-shrink-0',
                !width && !height && aspectRatio,
            )}
            style={cardStyle}
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
            <div className={cn("absolute z-10 flex items-center gap-1.5", isFixedSize ? "top-3 left-3" : "top-3.5 left-3.5")}>
                {isHybridTM ? (
                    <div className={cn("flex items-center gap-1.5 rounded-full bg-blue-600/80 backdrop-blur-md", isFixedSize ? "px-2 py-0.5" : "px-3 py-1.5")}>
                        <Globe className={cn("text-white", isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span className={cn("font-bold text-white uppercase tracking-wider", isFixedSize ? "text-[9px]" : "text-[10px]")}>
                            Ticketmaster
                        </span>
                    </div>
                ) : typeLabel ? (
                    <div className={cn("flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md", isFixedSize ? "px-2 py-0.5" : "px-3 py-1.5")}>
                        <div className={cn("rounded-full", isFixedSize ? "w-1.5 h-1.5" : "w-2 h-2", dotColor)} />
                        <span className={cn("font-bold text-white uppercase tracking-wider", isFixedSize ? "text-[9px]" : "text-[10px]")}>
                            {typeLabel}
                        </span>
                    </div>
                ) : null}
                {!isHybridTM && (event as HybridEvent).source === 'local' && (
                    <div className={cn("flex items-center gap-1 rounded-full bg-brand-primary-600/80 backdrop-blur-md", isFixedSize ? "px-2 py-0.5" : "px-2.5 py-1.5")}>
                        <Sparkles className={cn("text-white", isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span className={cn("font-bold text-white uppercase tracking-wider", isFixedSize ? "text-[9px]" : "text-[10px]")}>
                            Local
                        </span>
                    </div>
                )}
            </div>

            {/* Price badge – top right */}
            <div className={cn("absolute z-10", isFixedSize ? "top-3 right-3" : "top-3.5 right-3.5")}>
                <span className={cn(
                    "rounded-full bg-black/60 backdrop-blur-md text-white font-bold",
                    isFixedSize ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1.5 text-sm"
                )}>
                    {price}
                </span>
            </div>

            {/* Trending badge */}
            {isTrending && (
                <div className={cn("absolute z-10", isFixedSize ? "top-12 right-3" : "top-14 right-3.5")}>
                    <div className={cn("flex items-center gap-1 rounded-full bg-amber-500/80 backdrop-blur-md", isFixedSize ? "px-2 py-0.5" : "px-2.5 py-1")}>
                        <TrendingUp className={cn("text-white", isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span className={cn("font-bold text-white uppercase tracking-wider", isFixedSize ? "text-[8px]" : "text-[9px]")}>
                            Trending
                        </span>
                    </div>
                </div>
            )}

            {/* Sold out overlay */}
            {available === 0 && !isFree && (
                <div className={cn("absolute z-10", isFixedSize ? "top-12 left-3" : "top-14 left-3.5")}>
                    <span className={cn(
                        "rounded-full bg-red-600/80 backdrop-blur-md text-white font-bold uppercase tracking-wider",
                        isFixedSize ? "px-2 py-0.5 text-[8px]" : "px-2.5 py-1 text-[9px]"
                    )}>
                        Sold Out
                    </span>
                </div>
            )}

            {/* Bottom gradient – smooth progressive fade */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />

            {/* Bottom content – all on top of image */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 z-10 flex flex-col",
                isFixedSize ? "p-3" : "p-5"
            )}>
                {/* Title */}
                <h4 className={cn(
                    "font-black text-white uppercase tracking-wide leading-tight line-clamp-2",
                    isFixedSize ? "text-base" : "text-xl"
                )}>
                    {title}
                </h4>

                {/* Date + Time + Venue */}
                {startDateStr && (
                    <div className={cn("space-y-0.5", isFixedSize ? "mt-1" : "mt-1.5")}>
                        <p className={cn(
                            "text-white/60 flex items-center gap-1.5",
                            isFixedSize ? "text-[11px]" : "text-[13px]"
                        )}>
                            <Calendar className={cn("flex-shrink-0", isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                            <span className="truncate">{formatEventDate(startDateStr)} · {formatEventTime(startDateStr)}</span>
                        </p>
                        {venue && (
                            <p className={cn(
                                "text-white/50 flex items-center gap-1.5",
                                isFixedSize ? "text-[11px]" : "text-[13px]"
                            )}>
                                <MapPin className={cn("flex-shrink-0", isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                                <span className="truncate">{venue}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Short desc */}
                {!compact && shortDesc && (
                    <p className={cn(
                        "text-white/40 line-clamp-2 leading-relaxed",
                        isFixedSize ? "text-[11px] mt-1" : "text-[13px] mt-1.5"
                    )}>
                        {shortDesc}
                    </p>
                )}

                {/* Spots + attendees info */}
                {!compact && (currentAttendees > 0 || (available > 0 && available <= 30)) && (
                    <div className={cn("flex items-center gap-2", isFixedSize ? "mt-1.5" : "mt-2")}>
                        {currentAttendees > 0 && (
                            <span className={cn(
                                "text-white/50 flex items-center gap-1",
                                isFixedSize ? "text-[10px]" : "text-[11px]"
                            )}>
                                <Users className={cn(isFixedSize ? "h-2.5 w-2.5" : "h-3 w-3")} />
                                <span className="truncate">{currentAttendees} going</span>
                            </span>
                        )}
                        {available > 0 && available <= 30 && (
                            <span className={cn(
                                "text-amber-400 font-semibold",
                                isFixedSize ? "text-[10px]" : "text-[11px]"
                            )}>
                                {available} spots left
                            </span>
                        )}
                    </div>
                )}

                {/* Action row – matches menu card "Add to Basket" design */}
                <div className={cn("flex items-center", isFixedSize ? "gap-2 mt-2.5" : "gap-2.5 mt-4")}>
                    {/* View Event – main CTA */}
                    <button
                        onClick={handleCTAClick}
                        className={cn(
                            "flex-1 flex items-center justify-between rounded-full bg-white group/cta",
                            isFixedSize ? "pl-3 pr-1 py-1" : "pl-5 pr-1.5 py-1.5"
                        )}
                    >
                        <span className={cn(
                            "font-semibold text-[#1a1a2e] whitespace-nowrap",
                            isFixedSize ? "text-xs" : "text-sm"
                        )}>
                            {isHybridTM ? 'Buy Tickets' : 'View Event'}
                        </span>
                        <span className={cn(
                            "rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0 group-hover/cta:scale-110 transition-transform",
                            isFixedSize ? "w-8 h-8" : "w-10 h-10"
                        )}>
                            {isHybridTM ? (
                                <ExternalLink className={cn("text-white", isFixedSize ? "h-3.5 w-3.5" : "h-[17px] w-[17px]")} />
                            ) : (
                                <ArrowUpRight className={cn("text-white", isFixedSize ? "h-3.5 w-3.5" : "h-[17px] w-[17px]")} />
                            )}
                        </span>
                    </button>
                    {/* Heart – separate white circle */}
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:bg-neutral-100 transition-colors",
                            isFixedSize ? "w-9 h-9" : "w-11 h-11"
                        )}
                    >
                        <Heart className={cn("text-[#1a1a2e]", isFixedSize ? "h-4 w-4" : "h-[18px] w-[18px]")} />
                    </button>
                </div>
            </div>
        </div>
    );
}
