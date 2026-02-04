import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { parseApiError, UnauthorizedError } from "./utils/error-handler";
import { DEFAULTS, HTTP_STATUS } from "./constants/api";
import { 
  getAccessToken, 
  getRefreshToken, 
  isTokenExpiringSoon,
  storeAuthData,
  clearAuthData,
  redirectToLogin,
  AUTH_TOKEN_KEY
} from "./utils/auth";
import type { AuthResponseDto } from "./types/api.types";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add subscriber for token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when token is refreshed
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Refresh access token using refresh token
 */
async function refreshToken(): Promise<string | null> {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    return null;
  }

  try {
    // Call refresh endpoint
    const response = await axios.post<AuthResponseDto>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken: refreshTokenValue }
    );

    if (response.data && response.data.accessToken) {
      storeAuthData(response.data);
      return response.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULTS.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token and handle token refresh
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from auth utils
    const token = getAccessToken();
    
    if (token) {
      // Check if token is expiring soon
      if (isTokenExpiringSoon() && !isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshToken();
          
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            onTokenRefreshed(newToken);
          } else {
            // Refresh failed, clear auth and redirect
            redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined);
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Try to refresh token
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return axiosInstance(originalRequest);
        } else {
          // Refresh failed, redirect to login
          redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined);
        }
      } catch (refreshError) {
        redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Parse and reject with proper error
    return Promise.reject(parseApiError(error));
  }
);

// HTTP Methods
class HttpService {
  // GET request
  async get<ApiResponse>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse> {
    const response = await axiosInstance.get<ApiResponse>(url, config);
    return response.data;
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // Upload file with FormData
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const response = await axiosInstance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  }

  // Set auth token
  setAuthToken(data: AuthResponseDto | string) {
    // If data is a string, treat it as direct token
    if (typeof data === 'string') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, data);
      }
      return;
    }
    // If data is an object, extract token
    storeAuthData(data);
  }

  // Remove auth token
  removeAuthToken() {
    clearAuthData();
  }

  // Get auth token
  getAuthToken(): string | null {
    return getAccessToken();
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!getAccessToken();
  }
}

// Export singleton instance
export const http = new HttpService();

// Export axios instance for advanced usage
export { axiosInstance };

// Export types
export type { AxiosRequestConfig, AxiosResponse };
