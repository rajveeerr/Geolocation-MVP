import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { Loader2, MapPin, Clock, User } from 'lucide-react';
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
  dealId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const CheckInFeed: React.FC<CheckInFeedProps> = ({
  limit = 10,
  dealId,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery<CheckInFeedResponse>({
    queryKey: ['merchant-check-ins', currentPage, limit, dealId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
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
  });

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
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
        <h3 className="text-[15px] font-semibold text-neutral-900">Recent Check-ins</h3>
        {data.pagination.totalCount > 0 ? (
          <span className="text-[13px] text-neutral-500">{data.pagination.totalCount} total</span>
        ) : null}
      </div>

      <div className="space-y-3">
        {data.checkIns.map((checkIn) => (
          <div
            key={checkIn.id}
            className="rounded-[1rem] border border-neutral-200/80 bg-white/95 p-4 shadow-sm transition-shadow hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {checkIn.user.avatarUrl || checkIn.user.profilePicture ? (
                  <img
                    src={checkIn.user.avatarUrl || checkIn.user.profilePicture || ''}
                    alt={checkIn.user.name}
                    className="h-12 w-12 rounded-[0.95rem] object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-[0.95rem] bg-brand-primary-100">
                    <User className="h-6 w-6 text-brand-primary-600" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
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

                {checkIn.deal.imageUrl ? (
                  <div className="mt-2">
                    <img
                      src={checkIn.deal.imageUrl}
                      alt={checkIn.deal.title}
                      className="h-16 w-16 rounded-[0.9rem] object-cover"
                    />
                  </div>
                ) : null}

                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <MapPin className="h-3 w-3" />
                  <span>{Math.round(checkIn.location.distanceMeters)}m away</span>
                  {checkIn.user.points > 0 ? (
                    <>
                      <span>&bull;</span>
                      <span>{checkIn.user.points} points</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.pagination.totalPages > 1 ? (
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
