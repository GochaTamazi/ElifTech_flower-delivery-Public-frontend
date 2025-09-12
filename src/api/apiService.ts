import { apiConfig } from '../config';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    return {
      error: data.message || 'Something went wrong',
      status: response.status,
    };
  }

  return { data, status: response.status };
};

export const apiService = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${apiConfig.baseURL}${url}`, {
        headers: apiConfig.headers,
        credentials: 'include',
      });
      return handleResponse<T>(response);
    } catch (error) {
      return { error: 'Network error', status: 500 };
    }
  },

  post: async <T>(url: string, body: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${apiConfig.baseURL}${url}`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify(body),
      });
      return handleResponse<T>(response);
    } catch (error) {
      return { error: 'Network error', status: 500 };
    }
  },

  // Add other HTTP methods as needed (put, delete, etc.)
};

export default apiService;
