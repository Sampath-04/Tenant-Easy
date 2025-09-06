import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '@/lib/api/properties';
import { getPropertyBasic } from '@/lib/api/properties';
import { PropertyBasicResponse } from '@/lib/api/properties';

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

// Query keys
export const propertyBasicKeys = {
  all: ['propertyBasic'] as const,
  byId: (propertyId: string) => [...propertyBasicKeys.all, propertyId] as const,
};

// Get basic property data by ID
export const usePropertyBasic = (propertyId: string, enabled: boolean = true) => {
  return useQuery<PropertyBasicResponse>({
    queryKey: propertyBasicKeys.byId(propertyId),
    queryFn: () => getPropertyBasic(propertyId),
    enabled: enabled && !!propertyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};