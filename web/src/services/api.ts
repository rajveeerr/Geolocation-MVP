const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    let errorData = { error: `HTTP error! status: ${response.status}` };
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
    }
    return { success: false, data: null, error: errorData.error || 'An unknown error occurred' };
  }
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return { success: true, data, error: null };
  }
  
  return { success: true, data: null, error: null }; 
}

export async function apiPost<T, U>(endpoint: string, payload: U): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<T>(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'A network error occurred';
    return { success: false, data: null, error: errorMessage };
  }
}