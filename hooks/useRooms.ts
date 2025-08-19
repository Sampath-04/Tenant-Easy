import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../lib/api/rooms';

/**
 * Hook to fetch rooms for a property
 */
export function useRooms(propertyId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['rooms', propertyId, page, limit],
    queryFn: () => getRooms(propertyId, page, limit),
    enabled: !!propertyId && propertyId !== '', // Only run when propertyId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch active rooms for a property (filtered)
 */
export function useActiveRooms(propertyId: string) {
  return useQuery({
    queryKey: ['active-rooms', propertyId],
    queryFn: async () => {
      const response = await getRooms(propertyId, 1, 1000); // Get all rooms
      // Filter for active rooms only
      return {
        ...response,
        data: response.data.filter((room: any) => room.isActive)
      };
    },
    enabled: !!propertyId && propertyId !== '', // Only run when propertyId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
