import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  recordElectricityReading, 
  updateElectricityReading,
  ElectricityReadingRequest,
  UpdateElectricityReadingRequest,
  ElectricityReadingResponse
} from '../lib/api/electricityReadings';

export function useRecordElectricityReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ElectricityReadingRequest) => recordElectricityReading(data),
    onSuccess: (response: ElectricityReadingResponse) => {
      // Invalidate rooms query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // You can also invalidate other related queries if needed
      queryClient.invalidateQueries({ queryKey: ['pending-rents'] });
    },
  });
}

export function useUpdateElectricityReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ readingId, data }: { readingId: string; data: UpdateElectricityReadingRequest }) => 
      updateElectricityReading(readingId, data),
    onSuccess: (response: ElectricityReadingResponse) => {
      // Invalidate rooms query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // You can also invalidate other related queries if needed
      queryClient.invalidateQueries({ queryKey: ['pending-rents'] });
    },
  });
}
