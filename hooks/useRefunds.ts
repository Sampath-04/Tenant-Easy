import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRefundsForProperty, getRefundsForExport, processRefund, ProcessRefundData } from '@/lib/api/refunds';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '@/lib/toast-config';

export function useRefunds(propertyId: string) {
  return useQuery({
    queryKey: ['refunds', propertyId],
    queryFn: () => getRefundsForProperty(propertyId),
    enabled: !!propertyId && propertyId !== '',
    staleTime: 0,
    gcTime: 0,
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refundId, data }: { refundId: string; data: ProcessRefundData }) =>
      processRefund(refundId, data),
    
    onSuccess: (data, variables) => {
      console.log('✅ Refund processed successfully, updating cache...');
      
      // Update the specific refund in cache
      queryClient.setQueryData(['refunds', variables.refundId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((refund: any) =>
            refund._id === variables.refundId
              ? { ...refund, status: 'processed' }
              : refund
          ),
        };
      });

      // Invalidate all refunds queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      
      console.log('✅ Refund cache updated successfully');
      
      // Show success toast
      const successToast = showSuccessToast('Refund processed successfully!');
      toast.success(successToast.message, successToast.config);
    },
    
    onError: (error: any) => {
      console.error('❌ Failed to process refund:', error);
      
      let errorMessage = 'Failed to process refund. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      const errorToast = showErrorToast(errorMessage);
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

export function useRefundsExport() {
  return useMutation({
    mutationFn: ({ propertyId, params }: { propertyId: string; params: { processedAtFrom?: string; processedAtTo?: string } }) =>
      getRefundsForExport(propertyId, params),
    onError: (error: any) => {
      console.error('❌ Failed to export refunds:', error);
      const errorToast = showErrorToast(error?.message || 'Failed to export refunds');
      toast.error(errorToast.message, errorToast.config);
    },
  });
}

