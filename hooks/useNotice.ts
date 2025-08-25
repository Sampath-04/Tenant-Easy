import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeNotice, CompleteNoticeData } from '@/lib/api/notice';
import { showSuccessToast, showErrorToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';
import { tenantKeys } from '@/hooks/useTenants';

export const useCompleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteNoticeData) => completeNotice(data),
    onSuccess: (data) => {
      console.log('✅ Notice completed successfully, invalidating queries...');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rent-records'] });
      queryClient.invalidateQueries({ queryKey: ['pending-rents'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-list'] });
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      
      console.log('✅ Queries invalidated successfully');
      
      // Show success toast
      const successToast = showSuccessToast('Notice completed successfully');
      toast.success(successToast.message, successToast.config);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to complete notice. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
    },
  });
};
