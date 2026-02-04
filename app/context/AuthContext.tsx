"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { http } from "@/lib/http";
import { authApi } from "@/lib/api";
import type { User as ApiUser } from "@/lib/types";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/lib/utils/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper to convert API User to local User type
const convertApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name,
  role: apiUser.role,
  avatar: apiUser.avatar,
  phone: apiUser.phone,
  lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin).toISOString() : undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const storedAccessToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedAccessToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          // Sync http service with token
          http.setAuthToken(storedAccessToken);

          // Verify token is still valid
          await verifyToken(storedAccessToken);
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  // Verify token is still valid
  const verifyToken = async (token: string) => {
    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data?.user;

      if (userData) {
        const localUser = convertApiUser(userData);
        setUser(localUser);
        localStorage.setItem(USER_KEY, JSON.stringify(localUser));
      } else {
        clearAuthData();
      }
    } catch (error: any) {
      if (error.status === 401) {
        // Token expired, try refresh
        await tryRefreshToken();
      } else {
        console.error("Error verifying token:", error);
        clearAuthData();
      }
    }
  };

  // Try to refresh token
  const tryRefreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        clearAuthData();
        return;
      }

      const response = await authApi.refreshToken(storedRefreshToken);
      const newAccessToken = response.data?.token;
      const newRefreshToken = response.data?.refreshToken;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        localStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        // Sync http service with new token
        http.setAuthToken(newAccessToken);

        // Verify new token by fetching profile
        await verifyToken(newAccessToken);
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearAuthData();
    }
  };

  // Clear auth data
  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear http auth token as well
    try {
      http.removeAuthToken();
    } catch (e) {
      // ignore
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      // Extract token and user from response
      const accessToken = response.data?.accessToken || response.data?.token;
      const refreshToken = response.data?.refreshToken;
      const user = response.data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid response from server");
      }

      // Save to state and localStorage
      const localUser = convertApiUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken || null);
      setUser(localUser);

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(localUser));

      // IMPORTANT: Sync http service with token BEFORE redirect
      http.setAuthToken(accessToken);

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  // Register
  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const response = await authApi.register({ email, password, name, phone });

      // Extract token and user from response
      const accessToken = response.data?.accessToken || response.data?.token;
      const refreshToken = response.data?.refreshToken;
      const user = response.data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid response from server");
      }

      // Save to state and localStorage
      const localUser = convertApiUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken || null);
      setUser(localUser);

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(localUser));

      // IMPORTANT: Sync http service token BEFORE redirect
      http.setAuthToken(accessToken);

      router.push("/");
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (accessToken) {
        await authApi.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      router.push("/");
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!accessToken) throw new Error("Not authenticated");

      const response = await authApi.updateProfile(data);
      const updatedUser = response.data?.user;

      if (updatedUser) {
        const localUser = convertApiUser(updatedUser);
        setUser(localUser);
        localStorage.setItem(USER_KEY, JSON.stringify(localUser));
      }
    } catch (error: any) {
      throw new Error(error.message || "Update failed");
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!accessToken) throw new Error("Not authenticated");

      await authApi.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw new Error(error.message || "Password change failed");
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
