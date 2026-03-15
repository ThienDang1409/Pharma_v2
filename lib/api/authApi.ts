import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types";

export const authApi = {
  login: (credentials: LoginCredentials) => {
    return http.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH_LOGIN,
      credentials
    );
  },

  logout: () => {
    http.removeAuthToken();
    return Promise.resolve();
  },

  register: (userData: RegisterData) => {
    return http.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH_REGISTER,
      userData
    );
  },

  getCurrentUser: () => {
    return http.get<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH_ME
    );
  },

  refreshToken: (refreshToken: string) => {
    return http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      API_ENDPOINTS.AUTH_REFRESH_TOKEN,
      { refreshToken }
    );
  },

  forgotPassword: (email: string) => {
    return http.post<ApiResponse>(
      API_ENDPOINTS.AUTH_FORGOT_PASSWORD,
      { email }
    );
  },

  resetPassword: (token: string, password: string) => {
    return http.post<ApiResponse>(
      API_ENDPOINTS.AUTH_RESET_PASSWORD,
      { token, password }
    );
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    return http.post<ApiResponse>(
      API_ENDPOINTS.AUTH_CHANGE_PASSWORD,
      { oldPassword, newPassword }
    );
  },

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => {
    return http.put<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH_PROFILE,
      data
    );
  },
};
