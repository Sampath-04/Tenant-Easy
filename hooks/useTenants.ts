import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTenants, 
  getTenantById, 
  createTenant, 
  updateTenant, 
  deleteTenant,
  markTenantAsDeleted,
  getOnboardedPendingPayments,
  getOnboardedCompletedPayments,
  getUpcomingTenants,
  processTenant,
  collectPendingPayments,
  updateOnboardingPaymentAmount,
  type OnboardedTenantsResponse 
} from '../lib/api/tenants';
import { 
  Tenant, 
  GetTenantsRequest,
  ApiError 
} from '../lib/api';
import { showErrorToast, showSuccessToast } from '../lib/toast-config';
import { toast } from 'react-toastify';
import { TenantHistoryResponse } from '@/lib/api/rentHistory';
import { evictTenant } from '@/lib/api/tenants';

// Query keys
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params: GetTenantsRequest) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string, propertyId?: string) => [...tenantKeys.details(), id, propertyId] as const,
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
export function useTenant( id: string, propertyId: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id, propertyId),
    queryFn: () => getTenantById(id, propertyId),
    enabled: !!id && !!propertyId,
    staleTime: 0, 
    gcTime: 0, 
    retry: false, 
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
      
      // Invalidate tenant details to ensure fresh data
      queryClient.invalidateQueries({ queryKey: tenantKeys.details() });
    },
    onError: (error: ApiError) => {
      console.error('Failed to create tenant:', error);
      const errorToast = showErrorToast(`Failed to create tenant: ${error.getUserMessage()}`);
      toast.error(errorToast.message, errorToast.config);
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
      // Remove from cache - invalidate all tenant detail queries for this tenant
      queryClient.removeQueries({ queryKey: tenantKeys.details() });
      
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
      // Remove from cache - invalidate all tenant detail queries for this tenant
      queryClient.removeQueries({ queryKey: tenantKeys.details() });
      
      // Invalidate tenant lists
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      
      // Invalidate room queries since tenant count will change
      queryClient.invalidateQueries({ queryKey: ['rooms'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['room-list'], exact: false });

      const successToast = showSuccessToast('Tenant marked as deleted successfully');
      toast.success(successToast.message, successToast.config);
    },
    onError: (error: ApiError) => {
      console.error('Failed to mark tenant as deleted:', error);
      const errorToast = showErrorToast(error.getUserMessage());
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

/**
 * Hook to fetch onboarding pending payments for a property
 */
export function useOnboardedPendingPayments(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
    startCheckInDate?: string;
    endCheckInDate?: string;
  } = {}
) {
  return useQuery({
    queryKey: ['onboarded-pending-payments', propertyId, params],
    queryFn: () => getOnboardedPendingPayments(propertyId, params),
    enabled: !!propertyId && propertyId !== '',
    staleTime: 0, 
    gcTime: 0,
  });
}

/**
 * Hook to fetch onboarding completed payments for a property
 */
export function useOnboardedCompletedPayments(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
    startCheckInDate?: string;
    endCheckInDate?: string;
  } = {}
) {
  return useQuery({
    queryKey: ['onboarded-completed-payments', propertyId, params],
    queryFn: () => getOnboardedCompletedPayments(propertyId, params),
    enabled: !!propertyId && propertyId !== '',
    staleTime: 0, 
    gcTime: 0,
  });
}

/**
 * Hook to fetch upcoming tenants for a property
 */
export function useUpcomingTenants(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
  } = {}
) {
  return useQuery({
    queryKey: ['upcoming-tenants', propertyId, params],
    queryFn: () => getUpcomingTenants(propertyId, params),
    enabled: !!propertyId && propertyId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to process an upcoming tenant
 */
export function useProcessTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) => processTenant(tenantId, data),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['upcoming-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['onboarded-pending-payments'] });
    },
  });
}

/**
 * Hook to collect pending payments from an onboarded tenant
 */
export function useCollectPendingPayments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) => collectPendingPayments(tenantId, data),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['onboarded-pending-payments'] });

      const successToast = showSuccessToast('Onboarded Pending payments collected successfully');
      toast.success(successToast.message, successToast.config);
    },
    onError: (error: ApiError) => {
      console.error('Failed to collect pending payments:', error);
      const errorToast = showErrorToast(error.getUserMessage());
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

/**
 * Hook to update onboarding payment amount
 */
export function useUpdateOnboardingPaymentAmount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: { amount: string } }) => 
      updateOnboardingPaymentAmount(paymentId, data),
    onSuccess: (data, variables) => {
      // Invalidate tenant details to refresh the payment data
      queryClient.invalidateQueries({ queryKey: tenantKeys.details() });
      
      const successToast = showSuccessToast('Payment amount updated successfully');
      toast.success(successToast.message, successToast.config);
    },
    onError: (error: ApiError) => {
      console.error('Failed to update payment amount:', error);
      const errorToast = showErrorToast(error.getUserMessage());
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

interface EvictTenantData {
  electricityUnit: number;
  amount: number;
  comments?: string;
  tenantQrCode?: File;
}

export function useEvictTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: EvictTenantData }) =>
      evictTenant(tenantId, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Tenant evicted successfully');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-details', variables.tenantId] });
    },
    onError: (error: any) => {
      console.error('Failed to evict tenant:', error);
      toast.error(error?.response?.data?.message || 'Failed to evict tenant');
    },
  });
}