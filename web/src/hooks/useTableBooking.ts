import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

// Types
export interface TimeSlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings: number;
  isAvailable: boolean;
  availableBookings: number;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  features: string[];
  isActive: boolean;
  timeSlots: TimeSlot[];
}

export interface AvailabilityResponse {
  date: string;
  partySize: number;
  availableTimeSlots: {
    id: number;
    startTime: string;
    endTime: string;
    duration: number;
    maxBookings: number;
    currentBookings: number;
    availableSpots: number;
  }[];
  availableTables: {
    id: number;
    name: string;
    capacity: number;
    features: string[];
  }[];
}

export interface CreateBookingRequest {
  tableId: number;
  timeSlotId: number;
  bookingDate: string;
  partySize: number;
  specialRequests?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
  features?: string[];
}

export interface UpdateTableRequest {
  name?: string;
  capacity?: number;
  features?: string[];
  isActive?: boolean;
}

export interface CreateTimeSlotRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings?: number;
}

export interface UpdateTimeSlotRequest {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  maxBookings?: number;
}

export interface BookingSettings {
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number;
  bookingDuration: number;
  requiresConfirmation: boolean;
  allowsModifications: boolean;
  allowsCancellations: boolean;
  cancellationHours: number;
  autoConfirm: boolean;
  sendReminders: boolean;
  reminderHours: number;
}

export interface UpdateBookingSettingsRequest {
  advanceBookingDays?: number;
  minPartySize?: number;
  maxPartySize?: number;
  bookingDuration?: number;
  requiresConfirmation?: boolean;
  allowsModifications?: boolean;
  allowsCancellations?: boolean;
  cancellationHours?: number;
  autoConfirm?: boolean;
  sendReminders?: boolean;
  reminderHours?: number;
}

export interface Booking {
  id: number;
  confirmationCode: string;
  tableId: number;
  timeSlotId: number;
  bookingDate: string;
  partySize: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
  table: {
    id: number;
    name: string;
    capacity: number;
  };
  timeSlot: {
    id: number;
    startTime: string;
    endTime: string;
  };
}

export interface CreateBookingResponse {
  success: boolean;
  booking: Booking;
  message: string;
}

// Hooks

// Get merchant availability for a specific date and party size
export const useMerchantAvailability = (merchantId: number, date: string, partySize: number = 1) => {
  return useQuery<AvailabilityResponse, Error>({
    queryKey: ['merchant-availability', merchantId, date, partySize],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('date', date);
      searchParams.append('partySize', partySize.toString());

      const response = await apiGet<AvailabilityResponse>(
        `/table-booking/merchants/${merchantId}/availability?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant availability');
      }

      return response.data;
    },
    enabled: !!merchantId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: async (bookingData) => {
      const response = await apiPost<CreateBookingResponse, CreateBookingRequest>(
        '/table-booking/bookings',
        bookingData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create booking');
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate availability queries for the merchant and date
      queryClient.invalidateQueries({
        queryKey: ['merchant-availability', variables.tableId, variables.bookingDate]
      });
      
      // Invalidate any merchant booking queries
      queryClient.invalidateQueries({
        queryKey: ['merchant-bookings']
      });
    },
  });
};

// Get merchant tables (for merchant dashboard)
export const useMerchantTables = (merchantId: number | undefined) => {
  return useQuery<{ tables: Table[] }, Error>({
    queryKey: ['merchant-tables', merchantId],
    queryFn: async () => {
      const response = await apiGet<{ tables: Table[] }>(
        `/table-booking/merchant/tables`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant tables');
      }

      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get merchant tables (public - for customers)
export const usePublicMerchantTables = (merchantId: number | undefined) => {
  return useQuery<{ tables: Table[] }, Error>({
    queryKey: ['public-merchant-tables', merchantId],
    queryFn: async () => {
      const response = await apiGet<{ tables: Table[] }>(
        `/table-booking/merchants/${merchantId}/tables`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant tables');
      }

      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get merchant bookings (for merchant dashboard)
export const useMerchantBookings = (merchantId: number | undefined, date?: string) => {
  return useQuery<{ bookings: Booking[] }, Error>({
    queryKey: ['merchant-bookings', merchantId, date],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (date) searchParams.append('date', date);

      const response = await apiGet<{ bookings: Booking[] }>(
        `/table-booking/merchant/bookings?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant bookings');
      }

      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Get user bookings (for user dashboard)
export const useUserBookings = () => {
  return useQuery<{ bookings: Booking[] }, Error>({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      const response = await apiGet<{ bookings: Booking[] }>(
        '/table-booking/user/bookings'
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user bookings');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Update booking status (for merchant)
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { bookingId: number; status: string }>({
    mutationFn: async ({ bookingId, status }) => {
      const response = await apiPost<{ success: boolean; message: string }, { status: string }>(
        `/table-booking/merchant/bookings/${bookingId}/status`,
        { status }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update booking status');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate booking queries
      queryClient.invalidateQueries({
        queryKey: ['merchant-bookings']
      });
      queryClient.invalidateQueries({
        queryKey: ['user-bookings']
      });
    },
  });
};

// Cancel booking (for users)
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (bookingId) => {
      const response = await apiPost<{ success: boolean; message: string }, {}>(
        `/table-booking/bookings/${bookingId}/cancel`,
        {}
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to cancel booking');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate booking queries
      queryClient.invalidateQueries({
        queryKey: ['user-bookings']
      });
      queryClient.invalidateQueries({
        queryKey: ['merchant-bookings']
      });
    },
  });
};

// Table Management Hooks

// Create table (for merchant)
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; table: Table; message: string }, Error, CreateTableRequest>({
    mutationFn: async (tableData) => {
      const response = await apiPost<{ success: boolean; table: Table; message: string }, CreateTableRequest>(
        '/table-booking/merchant/tables',
        tableData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create table');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-tables']
      });
    },
  });
};

// Update table (for merchant)
export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; table: Table; message: string }, Error, { tableId: number; data: UpdateTableRequest }>({
    mutationFn: async ({ tableId, data }) => {
      const response = await apiPut<{ success: boolean; table: Table; message: string }, UpdateTableRequest>(
        `/table-booking/merchant/tables/${tableId}`,
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update table');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-tables']
      });
    },
  });
};

// Delete table (for merchant)
export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (tableId) => {
      const response = await apiDelete<{ success: boolean; message: string }>(
        `/table-booking/merchant/tables/${tableId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to delete table');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-tables']
      });
    },
  });
};

// Time Slot Management Hooks

// Get merchant time slots
export const useMerchantTimeSlots = () => {
  return useQuery<{ timeSlots: TimeSlot[] }, Error>({
    queryKey: ['merchant-time-slots'],
    queryFn: async () => {
      const response = await apiGet<{ timeSlots: TimeSlot[] }>(
        '/table-booking/merchant/time-slots'
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch time slots');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Create time slot (for merchant)
export const useCreateTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; timeSlot: TimeSlot; message: string }, Error, CreateTimeSlotRequest>({
    mutationFn: async (timeSlotData) => {
      const response = await apiPost<{ success: boolean; timeSlot: TimeSlot; message: string }, CreateTimeSlotRequest>(
        '/table-booking/merchant/time-slots',
        timeSlotData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create time slot');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-time-slots']
      });
    },
  });
};

// Update time slot (for merchant)
export const useUpdateTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; timeSlot: TimeSlot; message: string }, Error, { timeSlotId: number; data: UpdateTimeSlotRequest }>({
    mutationFn: async ({ timeSlotId, data }) => {
      const response = await apiPut<{ success: boolean; timeSlot: TimeSlot; message: string }, UpdateTimeSlotRequest>(
        `/table-booking/merchant/time-slots/${timeSlotId}`,
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update time slot');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-time-slots']
      });
    },
  });
};

// Delete time slot (for merchant)
export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (timeSlotId) => {
      const response = await apiDelete<{ success: boolean; message: string }>(
        `/table-booking/merchant/time-slots/${timeSlotId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to delete time slot');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-time-slots']
      });
    },
  });
};

// Booking Settings Hooks

// Get merchant booking settings
export const useMerchantBookingSettings = () => {
  return useQuery<{ settings: BookingSettings }, Error>({
    queryKey: ['merchant-booking-settings'],
    queryFn: async () => {
      const response = await apiGet<{ settings: BookingSettings }>(
        '/table-booking/merchant/settings'
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch booking settings');
      }

      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Update merchant booking settings
export const useUpdateMerchantBookingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; settings: BookingSettings; message: string }, Error, UpdateBookingSettingsRequest>({
    mutationFn: async (settingsData) => {
      const response = await apiPut<{ success: boolean; settings: BookingSettings; message: string }, UpdateBookingSettingsRequest>(
        '/table-booking/merchant/settings',
        settingsData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update booking settings');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['merchant-booking-settings']
      });
    },
  });
};