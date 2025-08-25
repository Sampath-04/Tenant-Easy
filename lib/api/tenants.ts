import { apiClient } from './client';
import { Tenant, TenantsListResponse, GetTenantsRequest } from './types';

/**
 * Get list of tenants with pagination and filters
 */
export async function getTenants({
  page = 1,
  limit = 10,
  filters = {},
  propertyId = ''
}: GetTenantsRequest = {}): Promise<TenantsListResponse> {
  const params = new URLSearchParams();
  
  // Add pagination
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  // Add filters
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  if (filters.property) {
    params.append('property', filters.property);
  }
  
  if (filters.room) {
    params.append('room', filters.room);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.isActive !== undefined && filters.isActive !== '') {
    params.append('isActive', filters.isActive.toString());
  }
  
  if (filters.rentRange?.min !== undefined) {
    params.append('minRent', filters.rentRange.min.toString());
  }
  
  if (filters.rentRange?.max !== undefined) {
    params.append('maxRent', filters.rentRange.max.toString());
  }
  
  if (filters.checkInDateRange?.from) {
    params.append('checkInFrom', filters.checkInDateRange.from);
  }
  
  if (filters.checkInDateRange?.to) {
    params.append('checkInTo', filters.checkInDateRange.to);
  }
  
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  
  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }
  
  const queryString = params.toString();
  const url = queryString ? `/tenants/property/${propertyId}?${queryString}` : `/tenants/property/${propertyId}`;
  
  return apiClient.get<TenantsListResponse>(url);
}

/**
 * Get a single tenant by ID
 */
export async function getTenantById(id: string): Promise<Tenant> {
  const response = await apiClient.get<{ success: boolean; data: Tenant }>(`/tenants/${id}`);
  return response.data;
}

/**
 * Create a new tenant
 */
export async function createTenant(tenantData: {
  property: string;
  room: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  monthlyRent: number;
  securityDepositPaid?: number;
  currentReading?: number;
  checkInDate: string;
}): Promise<Tenant> {
  const response = await apiClient.post<{ success: boolean; data: Tenant }>('/tenants', tenantData);
  return response.data;
}

/**
 * Update an existing tenant
 */
export async function updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
  const response = await apiClient.put<{ success: boolean; data: Tenant }>(`/tenants/${id}`, tenantData);
  return response.data;
}

/**
 * Delete a tenant (soft delete by setting isActive to false)
 */
export async function deleteTenant(id: string): Promise<void> {
  return apiClient.delete(`/tenants/${id}`);
}

/**
 * Mark a tenant as deleted
 */
export async function markTenantAsDeleted(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.patch(`/tenants/${id}/mark-deleted`, {});
}


