const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => localStorage.getItem('authToken');

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

async function makeRequest<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData = { error: `HTTP error! status: ${response.status}` };
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      }
      return { success: false, data: null, error: errorData.error || 'An unknown error occurred' };
    }

    if (response.status === 204 || !contentType?.includes('application/json')) {
        return { success: true, data: null, error: null };
    }

    const data = await response.json();
    return { success: true, data, error: null };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'A network error occurred';
    return { success: false, data: null, error: errorMessage };
  }
}


export const apiGet = <T>(endpoint: string) => makeRequest<T>(endpoint, { method: 'GET' });
export const apiPost = <T, U>(endpoint: string, payload: U) => makeRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(payload) });