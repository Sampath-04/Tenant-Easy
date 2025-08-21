import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '@/lib/api/properties';

/**
 * Hook to fetch property details by ID
 */
export function usePropertyDetails(propertyId: string) {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
