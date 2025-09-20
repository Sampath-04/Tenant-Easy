import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface Property {
  id: string;
  propertyName: string;
  propertyAddress: string;
  isActive: boolean;
}

interface PropertiesResponse {
  success: boolean;
  data: Property[];
}

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await apiClient.get<PropertiesResponse>('/properties');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
