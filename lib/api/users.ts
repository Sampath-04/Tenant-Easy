// User API service functions

import { apiClient } from './client';
import type { 
  CreateUserRequest, 
  CreateUserResponse, 
  GetUsersResponse, 
  User 
} from './types';

export const userApi = {
  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    return apiClient.post<CreateUserResponse>('/users', userData);
  },

  // Get all users
  getUsers: async (): Promise<GetUsersResponse> => {
    return apiClient.get<GetUsersResponse>('/users');
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Update user
  updateUser: async (id: string, userData: Partial<CreateUserRequest>): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },
};
