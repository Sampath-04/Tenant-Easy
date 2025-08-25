import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRooms, createRoom, updateRoom, getRoomList } from '../lib/api/rooms';
import { toast } from 'react-toastify';
import { showSuccessToast } from '@/lib/toast-config';

/**
 * Hook to fetch rooms for a property
 */
export function useRooms(
  propertyId: string, 
  page = 1, 
  limit = 50, 
  filters?: {
    roomId?: string;
    roomType?: string;
    availability?: string;
  }
) {
  return useQuery({
    queryKey: ['rooms', propertyId, page, limit, filters],
    queryFn: () => getRooms(propertyId, page, limit, filters),
    enabled: !!propertyId && propertyId !== '', // Only run when propertyId is valid
    staleTime: 0, 
    gcTime: 0, 
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

/**
 * Hook to fetch all rooms list for a property (for dropdowns)
 */
export function useRoomList(propertyId: string) {
  return useQuery({
    queryKey: ['room-list', propertyId],
    queryFn: () => getRoomList(propertyId),
    enabled: !!propertyId && propertyId !== '', // Only run when propertyId is valid
    staleTime: 0, // Always refetch when invalidated
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

interface CreateRoomData {
  property: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  amenities: string[];
  currentMeterReading: number;
  previousMeterReading: number;
  isActive: boolean;
}

/**
 * Hook to create a new room
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomData: CreateRoomData) => createRoom(roomData),
    onSuccess: (data) => {
      const successToast = showSuccessToast('Room created successfully!');
      toast.success(successToast.message, successToast.config);
      
      // Invalidate all rooms queries for this property
      queryClient.invalidateQueries({ 
        queryKey: ['rooms', data?.property || ''],
        exact: false 
      });
      
      // Also invalidate all rooms queries (for any property)
      queryClient.invalidateQueries({ 
        queryKey: ['rooms'],
        exact: false 
      });
      
      // Invalidate active rooms queries
      queryClient.invalidateQueries({ 
        queryKey: ['active-rooms'],
        exact: false 
      });
      
      // Invalidate room list queries
      queryClient.invalidateQueries({ 
        queryKey: ['room-list'],
        exact: false 
      });
      
      // Invalidate property details if we have the property ID
      if (data?.property) {
        queryClient.invalidateQueries({ queryKey: ['property', data.property] });
      }
    },
    onError: (error: any) => {
      console.error('Error creating room:', error);
      toast.error(error?.message || 'Failed to create room');
    },
  });
}

interface UpdateRoomData {
  roomNo?: string;
  roomType?: string;
  maxCapacity?: number;
  amenities?: string[];
  currentMeterReading?: number;
  previousMeterReading?: number;
  isActive?: boolean;
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, roomData }: { roomId: string; roomData: UpdateRoomData }) => 
      updateRoom(roomId, roomData),
    onSuccess: (data, variables) => {
      // Invalidate all rooms queries for this property
      queryClient.invalidateQueries({ 
        queryKey: ['rooms', data?.property || ''],
        exact: false 
      });
      
      // Also invalidate all rooms queries (for any property)
      queryClient.invalidateQueries({ 
        queryKey: ['rooms'],
        exact: false 
      });
      
      // Invalidate active rooms queries
      queryClient.invalidateQueries({ 
        queryKey: ['active-rooms'],
        exact: false 
      });
      
      // Invalidate room list queries
      queryClient.invalidateQueries({ 
        queryKey: ['room-list'],
        exact: false 
      });
      
      // Invalidate specific room data
      queryClient.invalidateQueries({ queryKey: ['room', variables.roomId] });
      
      // Invalidate property details if we have the property ID
      if (data?.property) {
        queryClient.invalidateQueries({ queryKey: ['property', data.property] });
      }
    },
    onError: (error: any) => {
      console.error('Error updating room:', error);
      toast.error(error?.message || 'Failed to update room');
    },
  });
}
