import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { MapPin, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CheckInUser {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  profilePicture: string | null;
  points: number;
}

interface CheckInDeal {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
}

interface CheckInLocation {
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

interface CheckIn {
  id: number;
  userId: number;
  user: CheckInUser;
  deal: CheckInDeal;
  location: CheckInLocation;
  checkedInAt: string;
}

interface CheckInFeedResponse {
  success: boolean;
  checkIns: CheckIn[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    dealId: number | null;
    startDate: string | null;
    endDate: string | null;
    sortBy: string;
    sortOrder: string;
  };
}

interface CheckInFeedProps {
  limit?: number;
  expandedLimit?: number;
  dealId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  canViewMore?: boolean;
}

export const CheckInFeed: React.FC<CheckInFeedProps> = ({
  limit = 10,
  expandedLimit = 25,
  dealId,
  autoRefresh = true,
  refreshInterval = 30000,
  canViewMore = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCheckInIds, setExpandedCheckInIds] = useState<Set<number>>(new Set());
  const baseLimit = Math.max(limit, 1);
  const effectiveLimit =
    canViewMore && isExpanded ? Math.max(expandedLimit, baseLimit) : baseLimit;

  const { data, isLoading, isFetching, error } = useQuery<CheckInFeedResponse>({
    queryKey: ['merchant-check-ins', currentPage, effectiveLimit, dealId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: effectiveLimit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (dealId) {
        params.append('dealId', dealId.toString());
      }

      const res = await apiGet<CheckInFeedResponse>(`/merchants/check-ins?${params.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch check-ins');
      }
      return res.data;
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatExactTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const toggleCheckInExpanded = (checkInId: number) => {
    setExpandedCheckInIds((prev) => {
      const next = new Set(prev);
      if (next.has(checkInId)) {
        next.delete(checkInId);
      } else {
        next.add(checkInId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: baseLimit }).map((_, idx) => (
          <div
            key={`checkin-skeleton-${idx}`}
            className="animate-pulse rounded-[1rem] border border-border/80 bg-card/95 dark:bg-card p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-[0.95rem] bg-accent" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-3.5 w-1/3 rounded bg-accent" />
                <div className="h-3 w-1/2 rounded bg-accent" />
                <div className="h-3 w-1/4 rounded bg-accent" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
        <p className="text-sm text-red-800 dark:text-red-300">Failed to load check-ins. Please try again later.</p>
      </div>
    );
  }

  if (!data || !data.checkIns || data.checkIns.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-muted">
          <MapPin className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-[15px] font-semibold text-foreground">No check-ins yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check-ins will appear here when customers tap in at your location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-foreground">Recent Check-ins</h3>
          {isFetching ? (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Updating...
            </span>
          ) : null}
        </div>
        {data.pagination.totalCount > 0 ? (
          <span className="text-[13px] text-muted-foreground">{data.pagination.totalCount} total</span>
        ) : null}
      </div>

      <div className="space-y-3">
        {data.checkIns.map((checkIn) => {
          const isCheckInExpanded = expandedCheckInIds.has(checkIn.id);
          const avatarSrc = checkIn.user.avatarUrl || checkIn.user.profilePicture || '';

          return (
            <div
              key={checkIn.id}
              className="rounded-[0.95rem] border border-border/80 bg-card/95 dark:bg-card px-3 py-2.5 shadow-sm transition-shadow hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
            >
              <button
                type="button"
                onClick={() => toggleCheckInExpanded(checkIn.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="shrink-0">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={checkIn.user.name}
                      className="h-10 w-10 rounded-[0.8rem] object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-brand-primary-100">
                      <User className="h-5 w-5 text-brand-primary-600" />
                    </div>
                  )}
                </div>

                {checkIn.deal.imageUrl ? (
                  <img
                    src={checkIn.deal.imageUrl}
                    alt={checkIn.deal.title}
                    className="h-10 w-10 shrink-0 rounded-[0.8rem] object-cover"
                  />
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {checkIn.user.name || 'Anonymous User'}
                      </p>
                      <p className="truncate text-[13px] text-muted-foreground">{checkIn.deal.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(checkIn.checkedInAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{Math.round(checkIn.location.distanceMeters)}m away</span>
                    {checkIn.user.points > 0 ? (
                      <>
                        <span>&bull;</span>
                        <span>{checkIn.user.points} points</span>
                      </>
                    ) : null}
                    <span>&bull;</span>
                    <span className="inline-flex items-center font-medium text-foreground">
                      {isCheckInExpanded ? 'Show less' : 'Show details'}
                      {isCheckInExpanded ? (
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>
                </div>

              </button>

              {isCheckInExpanded ? (
                <div className="mt-3 rounded-[0.9rem] border border-border bg-muted p-3">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[0.8rem] border border-border bg-card p-3">
                      <div className="mb-3 flex items-center gap-3">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={checkIn.user.name}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-100 text-xs font-bold text-brand-primary-700">
                            {getInitials(checkIn.user.name || 'Guest')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {checkIn.user.name || 'Anonymous User'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {checkIn.user.email || 'No email available'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-foreground">Customer ID:</span>{' '}
                          {checkIn.userId}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Points:</span>{' '}
                          {checkIn.user.points.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Distance:</span>{' '}
                          {Math.round(checkIn.location.distanceMeters)} meters
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Checked in:</span>{' '}
                          {formatExactTime(checkIn.checkedInAt)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[0.8rem] border border-border bg-card p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Check-in Context
                      </p>
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <p>
                          <span className="font-semibold text-foreground">Deal:</span>{' '}
                          {checkIn.deal.title}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Category:</span>{' '}
                          {checkIn.deal.category}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Deal ID:</span>{' '}
                          {checkIn.deal.id}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Check-in ID:</span>{' '}
                          {checkIn.id}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Coordinates:</span>{' '}
                          {checkIn.location.latitude}, {checkIn.location.longitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  {checkIn.deal.description ? (
                    <div className="mt-3 rounded-[0.8rem] border border-border bg-card p-3 text-xs text-muted-foreground">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Deal Description
                      </p>
                      <p className="mt-2 leading-5">{checkIn.deal.description}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {canViewMore && data.pagination.totalCount > baseLimit ? (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-[13px] text-muted-foreground">
            Showing {Math.min(data.checkIns.length, data.pagination.totalCount)} of {data.pagination.totalCount}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsExpanded((prev) => !prev);
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-muted"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                See more
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      ) : null}

      {canViewMore && isExpanded && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrevPage}
            className="rounded-[0.9rem] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-[13px] text-muted-foreground">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={!data.pagination.hasNextPage}
            className="rounded-[0.9rem] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};
