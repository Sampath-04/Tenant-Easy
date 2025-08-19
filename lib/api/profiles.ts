import { apiClient } from './client';
import { ProfilesResponse } from './types';

/**
 * Get profiles by owner ID
 */
export async function getProfilesByOwner(): Promise<ProfilesResponse> {
  return apiClient.get<ProfilesResponse>(`/profiles/owner`);
}
