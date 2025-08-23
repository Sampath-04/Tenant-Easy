import { apiClient } from './client';
import { RoomsListResponse } from './types';

/**
 * Get list of rooms for a property with pagination and optional room filtering
 */
export async function getRooms(propertyId: string, page = 1, limit = 50, roomId?: string): Promise<RoomsListResponse> {
  const params = new URLSearchParams();
  params.append('property', propertyId);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (roomId && roomId !== 'all') {
    params.append('roomId', roomId);
  }
  
  const response = await apiClient.get<RoomsListResponse>(`/rooms?${params.toString()}`);
  return response;
}

/**
 * Get rooms for filter dropdown (by property)
 */
export async function getRoomsForFilter(propertyId?: string): Promise<{ _id: string; roomNumber: string; floor?: number }[]> {
  const url = propertyId ? `/rooms?property=${propertyId}` : '/rooms';
  return apiClient.get<{ _id: string; roomNumber: string; floor?: number }[]>(url);
}

/**
 * Create a new room
 */
export async function createRoom(roomData: {
  property: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  amenities: string[];
  currentMeterReading: number;
  previousMeterReading: number;
  isActive: boolean;
}): Promise<any> {
  return apiClient.post('/rooms', roomData);
}

/**
 * Update an existing room
 */
export async function updateRoom(roomId: string, roomData: {
  roomNo?: string;
  roomType?: string;
  maxCapacity?: number;
  amenities?: string[];
  currentMeterReading?: number;
  previousMeterReading?: number;
  isActive?: boolean;
}): Promise<any> {
  return apiClient.put(`/rooms/${roomId}`, roomData);
}
