/**
 * Types for the food-truck scheduling system.
 *
 * A scheduled stop is a date+time-window+location entry posted by a merchant
 * for a store row where `isFoodTruck === true`. Customers see "live now" trucks
 * (now ∈ [startsAt, endsAt]) and "starting soon" trucks on the discovery surface.
 */

export type TruckStopStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ScheduledStop {
  id: number;
  storeId: number;
  startsAt: string;
  endsAt: string;
  latitude: number;
  longitude: number;
  address: string;
  city: { id: number; name: string; state: string } | null;
  notes?: string | null;
  /** Optional override radius in meters; defaults to 200 server-side. */
  radiusMeters?: number | null;
  status: TruckStopStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server-resolved snapshot of a truck's schedule relative to "now".
 * Backend computes this against request time so the FE doesn't have to
 * deal with clock skew at boundary moments.
 */
export interface TruckScheduleStatus {
  storeId: number;
  current: ScheduledStop | null;
  next: ScheduledStop | null;
}

export interface CreateTruckStopPayload {
  startsAt: string;
  endsAt: string;
  latitude: number;
  longitude: number;
  address: string;
  notes?: string | null;
  radiusMeters?: number | null;
}

export type UpdateTruckStopPayload = Partial<CreateTruckStopPayload>;

/**
 * Customer-facing summary of a food-truck store + its schedule context.
 * Returned by /food-trucks/nearby; combines store info, merchant info,
 * server-resolved current/next stop, and computed distance.
 */
export interface TruckSummary {
  storeId: number;
  merchant: {
    id: number;
    businessName: string;
    logoUrl: string | null;
  };
  city: { id: number; name: string; state: string } | null;
  registeredAddress: string;
  registeredLatitude: number | null;
  registeredLongitude: number | null;
  currentStop: ScheduledStop | null;
  nextStop: ScheduledStop | null;
  /** Distance from the requesting user to the active location (current stop, else registered address). */
  distanceKm: number | null;
}
