import { apiClient } from './client';
import { ProfilesResponse, GetAllProfilesResponse } from './types';

/**
 * Get all profiles with their properties
 */
export async function getAllProfiles(): Promise<GetAllProfilesResponse> {
  const response = await apiClient.get<{ success: boolean; data: GetAllProfilesResponse }>('/profiles');
  return response.data;
}

/**
 * Get profiles by owner ID
 */
export async function getProfilesByOwner(): Promise<ProfilesResponse> {
  return apiClient.get<ProfilesResponse>('/profiles/owner');
}
