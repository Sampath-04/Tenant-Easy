import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveTenant } from '@/lib/api/moveTenant';
import { toast } from 'react-toastify';

export function useMoveTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTenant,
    onSuccess: (response) => {
      toast.success(response.message || 'Tenant moved successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
    onError: (error: any) => {
      console.error('Failed to move tenant:', error);
      toast.error(error?.response?.data?.message || 'Failed to move tenant');
    },
  });
}
