import type {
  AdjustPointsPayload,
  AdjustPointsResponse,
  CancelRedemptionPayload,
  CancelRedemptionResponse,
  CalculatePointsResponse,
  CalculateRedemptionResponse,
  LoyaltyAnalyticsResponse,
  LoyaltyBalanceResponse,
  LoyaltyBalancesResponse,
  LoyaltyCustomersResponse,
  LoyaltyProgramResponse,
  LoyaltyTransactionsResponse,
  RedemptionOptionsResponse,
} from '../types/loyalty';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.yohop.com/api';

interface APIError extends Error {
  status?: number;
  data?: {
    message?: string;
    errorCode?: string;
    error?: string;
  };
}

class LoyaltyService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('authToken');
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      const customError = new Error(error.message || 'API request failed') as APIError;
      customError.status = response.status;
      customError.data = error;
      throw customError;
    }

    return response.json();
  }

  // User endpoints
  getAllBalances() {
    return this.request<LoyaltyBalancesResponse>(`/loyalty/balances`);
  }

  getBalance(merchantId: number) {
    return this.request<LoyaltyBalanceResponse>(`/loyalty/balance/${merchantId}`);
  }

  getProgram(merchantId: number) {
    return this.request<LoyaltyProgramResponse>(`/loyalty/program/${merchantId}`);
  }

  getRedemptionOptions(merchantId: number) {
    return this.request<RedemptionOptionsResponse>(`/loyalty/redemption-options/${merchantId}`);
  }

  calculatePoints(merchantId: number, amount: number) {
    return this.request<CalculatePointsResponse>(`/loyalty/calculate-points`, {
      method: 'POST',
      body: JSON.stringify({ merchantId, amount }),
    });
  }

  calculateRedemption(merchantId: number, points: number) {
    return this.request<CalculateRedemptionResponse>(`/loyalty/calculate-redemption`, {
      method: 'POST',
      body: JSON.stringify({ merchantId, points }),
    });
  }

  validateRedemption(merchantId: number, points: number, orderAmount: number) {
    return this.request(`/loyalty/validate-redemption`, {
      method: 'POST',
      body: JSON.stringify({ merchantId, points, orderAmount }),
    }) as Promise<import('../types/loyalty').ValidateRedemptionResponse>;
  }

  getTransactions(merchantId: number, limit = 50, offset = 0) {
    return this.request<LoyaltyTransactionsResponse>(
      `/loyalty/transactions/${merchantId}?limit=${limit}&offset=${offset}`
    );
  }

  // Merchant endpoints
  initializeProgram(payload: Partial<import('../types/loyalty').LoyaltyProgramConfig>) {
    return this.request(`/merchants/loyalty/initialize`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<{ success: boolean; program: any; message: string }>;
  }

  getMerchantProgram() {
    return this.request(`/merchants/loyalty/program`) as Promise<import('../types/loyalty').LoyaltyProgramResponse>;
  }

  updateMerchantProgram(payload: Partial<import('../types/loyalty').LoyaltyProgramConfig>) {
    return this.request(`/merchants/loyalty/program`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<import('../types/loyalty').LoyaltyProgramResponse>;
  }

  setProgramStatus(isActive: boolean) {
    return this.request(`/merchants/loyalty/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }) as Promise<{ success: boolean }>;
  }

  getAnalytics() {
    return this.request<LoyaltyAnalyticsResponse>(`/merchants/loyalty/analytics`);
  }

  getCustomers(params: { limit?: number; offset?: number; sortBy?: string; order?: 'asc' | 'desc' } = {}) {
    const { limit = 50, offset = 0, sortBy = 'currentBalance', order = 'desc' } = params;
    return this.request<LoyaltyCustomersResponse>(
      `/merchants/loyalty/customers?limit=${limit}&offset=${offset}&sortBy=${sortBy}&order=${order}`
    );
  }

  adjustPoints(payload: AdjustPointsPayload) {
    return this.request<AdjustPointsResponse>(`/merchants/loyalty/adjust-points`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  cancelRedemption(payload: CancelRedemptionPayload) {
    return this.request<CancelRedemptionResponse>(`/merchants/loyalty/cancel-redemption`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMerchantTransactions(limit = 50, offset = 0, type?: string) {
    const typeQuery = type ? `&type=${encodeURIComponent(type)}` : '';
    return this.request<LoyaltyTransactionsResponse>(
      `/merchants/loyalty/transactions?limit=${limit}&offset=${offset}${typeQuery}`
    );
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;


