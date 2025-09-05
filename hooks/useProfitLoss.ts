import { useQuery } from '@tanstack/react-query';
import { getProfitLossByProperty, ProfitLossResponse } from '@/lib/api/profitLoss';

// Query keys
export const profitLossKeys = {
  all: ['profitLoss'] as const,
  lists: () => [...profitLossKeys.all, 'list'] as const,
  list: (propertyId: string) => [...profitLossKeys.lists(), propertyId] as const,
};

// Get profit-loss by property
export const useProfitLossByProperty = (propertyId: string) => {
  return useQuery<ProfitLossResponse>({
    queryKey: profitLossKeys.list(propertyId),
    queryFn: () => getProfitLossByProperty(propertyId),
    enabled: !!propertyId,
    staleTime: 0, // 5 minutes
    gcTime: 0, // 10 minutes
  });
};
