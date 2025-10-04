const API_BASE_URL = import.meta.env.VITE_API_URL||"https://api.yohop.com/api";
// const API_BASE_URL = "https://api.yohop.com/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken = () => localStorage.getItem('authToken');

  private async request<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        let errorData: { error?: string } = {};
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        }
        return {
          success: false,
          data: null,
          error: errorData.error || `HTTP error! status: ${response.status}`,
        };
      }

      if (
        response.status === 204 ||
        !contentType?.includes('application/json')
      ) {
        return { success: true, data: null, error: null };
      }

      const data = await response.json();
      return { success: true, data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'A network error occurred';
      return { success: false, data: null, error: errorMessage };
    }
  }

  public get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T, U>(endpoint: string, payload: U): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public put<T, U>(endpoint: string, payload: U): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE_URL);

export const apiGet = api.get.bind(api);
export const apiPost = api.post.bind(api);
export const apiPut = api.put.bind(api);
export const apiDelete = api.delete.bind(api);
