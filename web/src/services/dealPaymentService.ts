const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface APIError extends Error {
  status?: number;
  data?: {
    message?: string;
    errorCode?: string;
    error?: string;
  };
}

interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  description?: string;
  dealId?: number;
  orderId?: number;
}

interface CreatePaymentIntentResponse {
  success: boolean;
  data?: {
    paymentId: number;
    orderId: string;
    approvalUrl: string;
    currency: string;
    amount: number;
  };
  message?: string;
  error?: string;
}

interface CapturePaymentRequest {
  orderId: string;
}

interface CapturePaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
}

class DealPaymentService {
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
      const customError = new Error(error.message || error.error || 'API request failed') as APIError;
      customError.status = response.status;
      customError.data = error;
      throw customError;
    }

    return response.json();
  }

  // Create PayPal payment intent for a deal
  async createPaymentIntent(params: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    return this.request<CreatePaymentIntentResponse>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Capture PayPal payment
  async capturePayment(params: CapturePaymentRequest): Promise<CapturePaymentResponse> {
    return this.request<CapturePaymentResponse>('/payments/capture', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const dealPaymentService = new DealPaymentService();
export default dealPaymentService;


