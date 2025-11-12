// Heist API Service
// Wraps all heist-related API calls

import { apiGet, apiPost } from './api';
import type {
  TokenBalance,
  HeistEligibilityResponse,
  HeistExecuteRequest,
  HeistExecuteResponse,
  HeistHistoryResponse,
  HeistStats,
  HeistNotificationsResponse,
  MarkNotificationReadRequest,
  MarkNotificationReadResponse,
  HeistItem,
  HeistInventoryItem,
} from '@/types/heist';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

/**
 * Get user's heist token balance
 */
export async function getHeistTokens(): Promise<TokenBalance> {
  const response = await apiGet<ApiResponse<TokenBalance>>('/heist/tokens');
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch token balance');
  }
  
  return response.data.data;
}

/**
 * Check if user can rob a specific victim
 */
export async function checkHeistEligibility(victimId: number): Promise<HeistEligibilityResponse> {
  const response = await apiGet<ApiResponse<HeistEligibilityResponse>>(`/heist/can-rob/${victimId}`);
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to check eligibility');
  }
  
  return response.data.data;
}

/**
 * Execute a heist against a victim
 */
export async function executeHeist(victimId: number): Promise<HeistExecuteResponse> {
  const payload: HeistExecuteRequest = { victimId };
  const response = await apiPost<ApiResponse<HeistExecuteResponse>, HeistExecuteRequest>(
    '/heist/execute',
    payload
  );
  
  if (!response.success || !response.data?.data) {
    // Handle error response
    const errorMessage = response.data?.message || response.error || 'Failed to execute heist';
    const errorCode = response.data?.code;
    const errorDetails = response.data?.details;
    
    const error = new Error(errorMessage) as Error & {
      code?: string;
      details?: any;
    };
    error.code = errorCode;
    error.details = errorDetails;
    
    throw error;
  }
  
  return response.data.data;
}

/**
 * Get heist history
 */
export async function getHeistHistory(params?: {
  role?: 'attacker' | 'victim' | 'both';
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<HeistHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/heist/history${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiGet<ApiResponse<{ heists: any[]; count: number }>>(endpoint);
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch heist history');
  }
  
  // Transform response to match our interface
  const data = response.data.data;
  const heists = data.heists || [];
  const total = data.count || heists.length;
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  
  return {
    heists,
    total,
    limit,
    offset,
    hasMore: heists.length >= limit,
  };
}

/**
 * Get heist statistics
 */
export async function getHeistStats(): Promise<HeistStats> {
  const response = await apiGet<ApiResponse<HeistStats>>('/heist/stats');
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch heist stats');
  }
  
  return response.data.data;
}

/**
 * Get heist notifications
 */
export async function getHeistNotifications(params?: {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<HeistNotificationsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.unreadOnly !== undefined) queryParams.append('unreadOnly', params.unreadOnly.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/heist/notifications${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiGet<ApiResponse<HeistNotificationsResponse>>(endpoint);
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch notifications');
  }
  
  return response.data.data;
}

/**
 * Mark notifications as read
 */
export async function markHeistNotificationsRead(
  request: MarkNotificationReadRequest
): Promise<MarkNotificationReadResponse> {
  const response = await apiPost<ApiResponse<MarkNotificationReadResponse>, MarkNotificationReadRequest>(
    '/heist/notifications/read',
    request
  );
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to mark notifications as read');
  }
  
  // Backend returns { notificationId } for single, { markedCount } for markAll
  // Ensure we always return a valid response object
  if (!response.data?.data) {
    // Fallback: return based on request type
    if (request.markAll) {
      return { markedCount: 0 };
    }
    return { notificationId: request.notificationId };
  }
  
  return response.data.data;
}

/**
 * Get available heist items for purchase
 */
export async function getHeistItems(): Promise<HeistItem[]> {
  const response = await apiGet<ApiResponse<HeistItem[]>>('/heist/items');
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch items');
  }
  
  return response.data.data;
}

/**
 * Get user's heist item inventory
 */
export async function getHeistInventory(): Promise<HeistInventoryItem[]> {
  const response = await apiGet<ApiResponse<HeistInventoryItem[]>>('/heist/items/inventory');
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.error || 'Failed to fetch inventory');
  }
  
  return response.data.data;
}

/**
 * Purchase a heist item
 */
export async function purchaseHeistItem(itemId: number): Promise<{ inventory: HeistInventoryItem[]; message: string }> {
  const response = await apiPost<ApiResponse<{ inventory: HeistInventoryItem[]; message: string }>, { itemId: number }>(
    '/heist/items/purchase',
    { itemId }
  );
  
  if (!response.success || !response.data?.data) {
    throw new Error(response.data?.message || response.error || 'Failed to purchase item');
  }
  
  return response.data.data;
}

