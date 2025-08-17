import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, CreateUserRequest, ApiError } from '../lib/api';
import { toast } from 'react-toastify';
import { showErrorToast } from '../lib/toast-config';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.getUsers,
  });
}

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Optionally, you can also update the cache directly
      queryClient.setQueryData(userKeys.lists(), (oldData: any) => {
        if (!oldData) return { users: [data.data.user], total: 1 };
        return {
          users: [data.data.user, ...oldData.users],
          total: oldData.total + 1,
        };
      });
    },
    onError: (error: ApiError) => {
      console.error('Failed to create user:', error);
      // Show toast notification with user-friendly message
      const errorToast = showErrorToast(error.getUserMessage());
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<CreateUserRequest> }) =>
      userApi.updateUser(id, userData),
    onSuccess: (data, variables) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Update specific user cache
      queryClient.setQueryData(userKeys.detail(variables.id), data);
    },
    onError: (error: ApiError) => {
      console.error('Failed to update user:', error);
      // Show toast notification with user-friendly message
      const errorToast = showErrorToast(`Failed to update user: ${error.getUserMessage()}`);
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: (_, id) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error: ApiError) => {
      console.error('Failed to delete user:', error);
      // Show toast notification with user-friendly message
      const errorToast = showErrorToast(`Failed to delete user: ${error.getUserMessage()}`);
      toast.error(errorToast.message, errorToast.config);
    },
  });
}
