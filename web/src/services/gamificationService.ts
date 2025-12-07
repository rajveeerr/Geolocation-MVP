import type { 
  GamificationProfile, 
  CoinTransaction, 
  PaymentTransaction, 
  Achievement, 
  CoinPackage, 
  LoyaltyTierConfig 
} from '../types/gamification';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface APIError extends Error {
  status?: number;
  data?: {
    message?: string;
    errorCode?: string;
    error?: string;
  };
}

class GamificationService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('authToken');
    const url = `${API_URL}/gamification${endpoint}`;
    
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

  // Get user's gamification profile
  async getProfile(): Promise<{ success: boolean; data: GamificationProfile }> {
    return this.request<{ success: boolean; data: GamificationProfile }>('/profile');
  }

  // Get coin transaction history
  async getTransactions(page = 1, limit = 20): Promise<{
    success: boolean;
    data: {
      transactions: CoinTransaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    return this.request(`/transactions?page=${page}&limit=${limit}`);
  }

  // Get available coin packages
  async getCoinPackages(): Promise<{ success: boolean; data: CoinPackage[] }> {
    return this.request<{ success: boolean; data: CoinPackage[] }>('/coin-packages');
  }

  // Create PayPal order for coin purchase
  async createPaymentOrder(packageIndex: number): Promise<{
    success: boolean;
    data?: {
      orderId: string;
      approvalUrl: string;
      transactionId: number;
      package: CoinPackage;
    };
    message?: string;
  }> {
    return this.request('/purchase/create-order', {
      method: 'POST',
      body: JSON.stringify({ packageIndex }),
    });
  }

  // Capture PayPal payment
  async capturePayment(orderId: string): Promise<{
    success: boolean;
    data?: {
      coinsAwarded: number;
      profile: GamificationProfile;
    };
    message?: string;
  }> {
    return this.request('/purchase/capture', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  // Get user achievements
  async getAchievements(): Promise<{ success: boolean; data: Achievement[] }> {
    return this.request<{ success: boolean; data: Achievement[] }>('/achievements');
  }

  // Get loyalty tier information
  async getLoyaltyTiers(): Promise<{ success: boolean; data: LoyaltyTierConfig[] }> {
    return this.request<{ success: boolean; data: LoyaltyTierConfig[] }>('/loyalty-tiers');
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      payments: PaymentTransaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    return this.request(`/payments?page=${page}&limit=${limit}`);
  }

  // Development only: Award coins for testing
  async awardCoins(amount: number, type = 'EARNED', description = 'Test award'): Promise<{
    success: boolean;
    data?: {
      transaction?: CoinTransaction;
      balanceAfter?: number;
    };
    message?: string;
  }> {
    if (import.meta.env.MODE !== 'development') {
      throw new Error('This endpoint is only available in development mode');
    }
    
    return this.request('/dev/award-coins', {
      method: 'POST',
      body: JSON.stringify({ amount, type, description }),
    });
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;