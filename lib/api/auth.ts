// Authentication API service functions

import { apiClient } from './client';
import { User } from './types';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthUser extends User {
  // Additional auth-specific fields if needed
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout', {});
  },

  // Get current user (verify token)
  me: async (): Promise<{ success: boolean; user: AuthUser }> => {
    return apiClient.get<{ success: boolean; user: AuthUser }>('/auth/me');
  },

  // Refresh token
  refresh: async (): Promise<{ success: boolean; token: string; user: AuthUser }> => {
    return apiClient.post<{ success: boolean; token: string; user: AuthUser }>('/auth/refresh', {});
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', { token, password });
  },
};
