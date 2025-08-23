import { useQuery } from '@tanstack/react-query';
import { getProfilesByOwner } from '../lib/api/profiles';

/**
 * Hook to fetch profiles for the current owner
 * This hook doesn't stale the data and always runs the request
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: getProfilesByOwner,
    staleTime: 0,
    gcTime: 0,
  });
}
