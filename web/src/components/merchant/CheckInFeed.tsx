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
            className="animate-pulse rounded-[1rem] border border-neutral-200/80 bg-white/95 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-[0.95rem] bg-neutral-200" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-3.5 w-1/3 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
                <div className="h-3 w-1/4 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load check-ins. Please try again later.</p>
      </div>
    );
  }

  if (!data || !data.checkIns || data.checkIns.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-neutral-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-neutral-100">
          <MapPin className="h-6 w-6 text-neutral-400" />
        </div>
        <p className="text-[15px] font-semibold text-neutral-800">No check-ins yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Check-ins will appear here when customers tap in at your location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-neutral-900">Recent Check-ins</h3>
          {isFetching ? (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
              Updating...
            </span>
          ) : null}
        </div>
        {data.pagination.totalCount > 0 ? (
          <span className="text-[13px] text-neutral-500">{data.pagination.totalCount} total</span>
        ) : null}
      </div>

      <div className="space-y-3">
        {data.checkIns.map((checkIn) => {
          const isCheckInExpanded = expandedCheckInIds.has(checkIn.id);

          return (
            <div
              key={checkIn.id}
              className="rounded-[0.95rem] border border-neutral-200/80 bg-white/95 px-3 py-2.5 shadow-sm transition-shadow hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
            >
              <button
                type="button"
                onClick={() => toggleCheckInExpanded(checkIn.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="shrink-0">
                  {checkIn.user.avatarUrl || checkIn.user.profilePicture ? (
                    <img
                      src={checkIn.user.avatarUrl || checkIn.user.profilePicture || ''}
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
                      <p className="truncate text-[13px] font-semibold text-neutral-900">
                        {checkIn.user.name || 'Anonymous User'}
                      </p>
                      <p className="truncate text-[13px] text-neutral-600">{checkIn.deal.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(checkIn.checkedInAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500">
                    <MapPin className="h-3 w-3" />
                    <span>{Math.round(checkIn.location.distanceMeters)}m away</span>
                    {checkIn.user.points > 0 ? (
                      <>
                        <span>&bull;</span>
                        <span>{checkIn.user.points} points</span>
                      </>
                    ) : null}
                    <span>&bull;</span>
                    <span className="inline-flex items-center font-medium text-neutral-700">
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
                <div className="mt-3 grid gap-2 rounded-[0.8rem] border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 sm:grid-cols-2">
                  <p><span className="font-semibold text-neutral-800">Check-in ID:</span> {checkIn.id}</p>
                  <p><span className="font-semibold text-neutral-800">User ID:</span> {checkIn.userId}</p>
                  <p><span className="font-semibold text-neutral-800">Deal ID:</span> {checkIn.deal.id}</p>
                  <p><span className="font-semibold text-neutral-800">Category:</span> {checkIn.deal.category}</p>
                  <p><span className="font-semibold text-neutral-800">User Email:</span> {checkIn.user.email || '-'}</p>
                  <p><span className="font-semibold text-neutral-800">Points:</span> {checkIn.user.points}</p>
                  <p><span className="font-semibold text-neutral-800">Distance:</span> {Math.round(checkIn.location.distanceMeters)} meters</p>
                  <p><span className="font-semibold text-neutral-800">Checked In At:</span> {formatExactTime(checkIn.checkedInAt)}</p>
                  <p><span className="font-semibold text-neutral-800">Latitude:</span> {checkIn.location.latitude}</p>
                  <p><span className="font-semibold text-neutral-800">Longitude:</span> {checkIn.location.longitude}</p>
                  {checkIn.deal.description ? (
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-neutral-800">Deal Description:</span> {checkIn.deal.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {canViewMore && data.pagination.totalCount > baseLimit ? (
        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <p className="text-[13px] text-neutral-500">
            Showing {Math.min(data.checkIns.length, data.pagination.totalCount)} of {data.pagination.totalCount}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsExpanded((prev) => !prev);
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50"
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
        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrevPage}
            className="rounded-[0.9rem] border border-neutral-300 bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-[13px] text-neutral-600">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={!data.pagination.hasNextPage}
            className="rounded-[0.9rem] border border-neutral-300 bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};
