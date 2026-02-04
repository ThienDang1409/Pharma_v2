/**
 * Authentication Utilities
 * Token management, refresh logic, and auth helpers
 */

import { AuthResponseDto } from '../types/api.types';

// Constants - exported for use across app
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const TOKEN_EXPIRY_KEY = 'token_expiry';
export const USER_KEY = 'user_data';

// Token refresh threshold (5 minutes before expiry)
const REFRESH_THRESHOLD = 5 * 60 * 1000;

/**
 * Store authentication data in localStorage
 */
export function storeAuthData(data: AuthResponseDto): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
  
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }
  
  // Calculate expiry from JWT if not provided
  const expiryTime = getTokenExpiryFromJwt(data.accessToken);
  if (expiryTime) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }
  
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): number | null {
  if (typeof window === 'undefined') return null;
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Get stored user data
 */
export function getUserData(): AuthResponseDto['user'] | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpiringSoon(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  
  return Date.now() >= expiry - REFRESH_THRESHOLD;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  
  return Date.now() >= expiry;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  
  // Check if token is expired
  if (isTokenExpired()) {
    return false;
  }
  
  return true;
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Redirect to login page
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return;
  
  clearAuthData();
  
  const url = returnUrl 
    ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/auth/login';
    
  window.location.href = url;
}

/**
 * Get return URL from query params
 */
export function getReturnUrl(): string {
  if (typeof window === 'undefined') return '/';
  
  const params = new URLSearchParams(window.location.search);
  return params.get('returnUrl') || '/';
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const user = getUserData();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Get user's full name
 */
export function getUserFullName(): string {
  const user = getUserData();
  if (!user) return '';
  
  return user.name || user.email || '';
}

/**
 * Parse JWT token (without verification - client-side only)
 * Used for debugging/display purposes only
 */
export function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * Get token expiry from JWT
 */
export function getTokenExpiryFromJwt(token: string): number | null {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;
  
  // JWT exp is in seconds, convert to milliseconds
  return payload.exp * 1000;
}

/**
 * Refresh token handler (to be used with API)
 * Returns new access token or null if refresh failed
 */
export async function refreshAccessToken(
  refreshFn: (refreshToken: string) => Promise<AuthResponseDto>
): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('No refresh token available');
    return null;
  }
  
  try {
    const response = await refreshFn(refreshToken);
    storeAuthData(response);
    return response.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuthData();
    return null;
  }
}

/**
 * Setup token refresh interval
 * Checks every minute if token needs refresh
 */
export function setupTokenRefresh(
  refreshFn: (refreshToken: string) => Promise<AuthResponseDto>
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const interval = setInterval(async () => {
    if (!isAuthenticated()) {
      clearInterval(interval);
      return;
    }
    
    if (isTokenExpiringSoon()) {
      console.log('Token expiring soon, refreshing...');
      const newToken = await refreshAccessToken(refreshFn);
      
      if (!newToken) {
        console.warn('Token refresh failed, redirecting to login');
        redirectToLogin(window.location.pathname);
      }
    }
  }, 60 * 1000); // Check every minute
  
  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Auth state for React components
 */
export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthResponseDto['user'] | null;
  token: string | null;
}

/**
 * Get current auth state
 */
export function getAuthState(): AuthState {
  return {
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    user: getUserData(),
    token: getAccessToken(),
  };
}
