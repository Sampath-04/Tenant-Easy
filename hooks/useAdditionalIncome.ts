import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdditionalIncome, AdditionalIncomeData } from '@/lib/api/additionalIncome';
import { toast } from 'react-toastify';
import { profitLossKeys } from './useProfitLoss';

export function useCreateAdditionalIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdditionalIncomeData) => createAdditionalIncome(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Additional income recorded successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: profitLossKeys.all });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['additional-income'] });
    },
    onError: (error: any) => {
      console.error('Failed to create additional income:', error);
      toast.error(error?.response?.data?.message || 'Failed to record additional income');
    },
  });
}
