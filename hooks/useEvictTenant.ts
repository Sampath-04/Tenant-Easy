import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evictTenant } from '@/lib/api/tenants';
import { toast } from "react-toastify";

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
