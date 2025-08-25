import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTenants, 
  getTenantById, 
  createTenant, 
  updateTenant, 
  deleteTenant,
  markTenantAsDeleted
} from '../lib/api/tenants';
import { getRoomsForFilter } from '../lib/api/rooms';
import { 
  Tenant, 
  GetTenantsRequest,
  ApiError 
} from '../lib/api';
import { showErrorToast } from '../lib/toast-config';

// Query keys
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params: GetTenantsRequest) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
  properties: ['properties', 'filter'] as const,
  rooms: (propertyId?: string) => ['rooms', 'filter', propertyId] as const,
};

/**
 * Hook to fetch tenants with pagination and filters
 */
export function useTenants(params: GetTenantsRequest = {}) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => getTenants(params),
    enabled: !!params.propertyId && params.propertyId !== '', // Only run when propertyId is valid
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Hook to fetch a single tenant by ID
 */
export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => getTenantById(id),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Hook to create a new tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenant,
    onSuccess: (data) => {
      // Invalidate and refetch tenant lists
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      
      // Invalidate room queries to update room data (occupancy, tenant count, etc.)
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Add the new tenant to existing cache if possible
      queryClient.setQueryData(tenantKeys.detail(data._id), data);
    },
    onError: (error: ApiError) => {
      console.error('Failed to create tenant:', error);
      showErrorToast(error.getUserMessage());
    },
  });
}

/**
 * Hook to update an existing tenant
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) => updateTenant(id, data),
    onSuccess: (data, variables) => {
      // Update the specific tenant in cache
      queryClient.setQueryData(tenantKeys.detail(variables.id), data);
      
      // Invalidate tenant lists to refetch
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
    onError: (error: ApiError) => {
      console.error('Failed to update tenant:', error);
      showErrorToast(error.getUserMessage());
    },
  });
}

/**
 * Hook to delete a tenant
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTenant,
    onSuccess: (_, tenantId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tenantKeys.detail(tenantId) });
      
      // Invalidate tenant lists
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
    },
    onError: (error: ApiError) => {
      console.error('Failed to delete tenant:', error);
      showErrorToast(error.getUserMessage());
    },
  });
}

/**
 * Hook to mark a tenant as deleted
 */
export function useMarkTenantAsDeleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTenantAsDeleted,
    onSuccess: (data, tenantId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tenantKeys.detail(tenantId) });
      
      // Invalidate tenant lists
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      
      // Invalidate room queries since tenant count will change
      queryClient.invalidateQueries({ queryKey: ['rooms'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['room-list'], exact: false });
    },
    onError: (error: ApiError) => {
      console.error('Failed to mark tenant as deleted:', error);
      showErrorToast(error.getUserMessage());
    },
  });
}


