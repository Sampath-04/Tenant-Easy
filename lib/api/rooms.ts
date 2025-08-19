import { apiClient } from './client';
import { RoomsListResponse } from './types';

/**
 * Get list of rooms for a property with pagination
 */
export async function getRooms(propertyId: string, page = 1, limit = 50): Promise<RoomsListResponse> {
  const params = new URLSearchParams();
  params.append('property', propertyId);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return apiClient.get<RoomsListResponse>(`/rooms?${params.toString()}`);
}

/**
 * Get rooms for filter dropdown (by property)
 */
export async function getRoomsForFilter(propertyId?: string): Promise<{ _id: string; roomNumber: string; floor?: number }[]> {
  const url = propertyId ? `/rooms?property=${propertyId}` : '/rooms';
  return apiClient.get<{ _id: string; roomNumber: string; floor?: number }[]>(url);
}
