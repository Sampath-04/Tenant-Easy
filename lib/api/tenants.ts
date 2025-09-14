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
  monthlyRent?: number;
  securityDepositTotal?: number;
  securityDepositPaid?: number;
  currentReading?: number;
  checkinDate: string;
  tenantIdProof?: File;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  rentPaid?: number;
  paymentMethod: string;
  paymentProofs?: File[];
  foodOpted?: boolean;
}): Promise<Tenant> {
  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add all non-file fields
  formData.append('property', tenantData.property);
  formData.append('room', tenantData.room);
  formData.append('tenantName', tenantData.tenantName);
  formData.append('tenantNumber', tenantData.tenantNumber);
  formData.append('monthlyRent', (tenantData.monthlyRent || 0).toString());
  formData.append('securityDepositTotal', (tenantData.securityDepositTotal || 0).toString());
  formData.append('securityDepositPaid', (tenantData.securityDepositPaid || 0).toString());
  formData.append('checkinDate', tenantData.checkinDate);
  formData.append('rentPaid', (tenantData.rentPaid || 0).toString());
  formData.append('paymentMethod', tenantData.paymentMethod);
  formData.append('foodOpted', (tenantData.foodOpted || false).toString());
  
  // Add optional fields
  if (tenantData.tenantEmail) {
    formData.append('tenantEmail', tenantData.tenantEmail);
  }
  
  if (tenantData.currentReading !== undefined) {
    formData.append('currentReading', tenantData.currentReading.toString());
  }
  
  // Add emergency contact as JSON string
  if (tenantData.emergencyContact) {
    formData.append('emergencyContact', JSON.stringify(tenantData.emergencyContact));
  }
  
  // Add tenant ID proof file
  if (tenantData.tenantIdProof) {
    formData.append('tenantIdProof', tenantData.tenantIdProof);
  }
  
  // Add payment proof files
  if (tenantData.paymentProofs && tenantData.paymentProofs.length > 0) {
    tenantData.paymentProofs.forEach((file, index) => {
      formData.append(`paymentProofs`, file);
    });
  }
  
  const response = await apiClient.post<{ success: boolean; data: Tenant }>('/tenants', formData);
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

export interface OnboardedTenant {
  _id: string;
  room: {
    _id: string;
    roomNo: string;
    roomType: string;
    maxCapacity: number;
  };
  property: {
    _id: string;
    propertyName: string;
    propertyAddress: string;
  };
  tenantName: string;
  tenantNumber: string;
  tenantEmail: string;
  monthlyRent: number;
  securityDepositTotal: number;
  securityDepositPaid: number;
  status: string;
  checkInDate: string;
  securityDepositPending: boolean;
  totalOnboardingRentPaid: number;
  onboardingRentPending: boolean;
  pendingSecurityAmount: number;
  pendingOnboardingRentAmount: number;
  totalPendingAmount: number;
  }

export interface OnboardedTenantsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: OnboardedTenant[];
  summary: {
    totalTenants: number;
    totalPendingAmount: number;
    totalSecurityPending: number;
    totalRentPending: number;
    totalSecurityCollected?: number;
    totalRentCollected?: number;
  };
}

export interface UpcomingTenantsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: OnboardedTenant[];
  summary: {
    totalUpcomingTenants: number;
    totalSecurityDepositExpected: number;
    totalSecurityDepositPaid: number;
    totalRentExpected: number;
    totalPendingAmount: number;
    totalSecurityPending: number;
    totalRentPending: number;
  };
}

export interface OnboardedCompletedPaymentsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: OnboardedTenant[];
  summary: {
    totalTenants: number;
    totalSecurityDepositCollected: number;
    totalOnboardingRentCollected: number;
    totalAmountCollected: number;
  };
};

/**
 * Get onboarding pending payments for a property
 */
export async function getOnboardedPendingPayments(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
    startCheckInDate?: string;
    endCheckInDate?: string;
  } = {}
): Promise<OnboardedTenantsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.room) queryParams.append('room', params.room);
  if (params.search) queryParams.append('search', params.search);
  if (params.startCheckInDate) queryParams.append('startCheckInDate', params.startCheckInDate);
  if (params.endCheckInDate) queryParams.append('endCheckInDate', params.endCheckInDate);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/tenants/onboarded-pending-payments?property=${propertyId}&${queryString}` : `/tenants/onboarded-pending-payments?property=${propertyId}`;
  
  return apiClient.get<OnboardedTenantsResponse>(url);
}

/**
 * Get onboarding completed payments for a property
 */
export async function getOnboardedCompletedPayments(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
    startCheckInDate?: string;
    endCheckInDate?: string;
  } = {}
): Promise<OnboardedCompletedPaymentsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.room) queryParams.append('room', params.room);
  if (params.search) queryParams.append('search', params.search);
  if (params.startCheckInDate) queryParams.append('startCheckInDate', params.startCheckInDate);
  if (params.endCheckInDate) queryParams.append('endCheckInDate', params.endCheckInDate);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/tenants/onboarded-completed-payments?property=${propertyId}&${queryString}` : `/tenants/onboarded-completed-payments?property=${propertyId}`;
  
  return apiClient.get<OnboardedCompletedPaymentsResponse>(url);
}

/**
 * Get upcoming tenants for a property
 */
export async function getUpcomingTenants(
  propertyId: string,
  params: {
    page?: number;
    limit?: number;
    room?: string;
    search?: string;
  } = {}
): Promise<UpcomingTenantsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.room) queryParams.append('room', params.room);
  if (params.search) queryParams.append('search', params.search);
  
  return apiClient.get<UpcomingTenantsResponse>(`/tenants/upcoming?property=${propertyId}&${queryParams.toString()}`);
}

/**
 * Process an upcoming tenant
 */
export async function processTenant(
  tenantId: string,
  data: {
    currentReading: number;
    remainingSecurity?: number;
    remainingRent?: number;
    paymentMethod?: string;
    paymentProof: File[];
  }
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  formData.append('tenantId', tenantId);
  formData.append('currentReading', data.currentReading.toString());
  
  // Calculate rent paid and security deposit paid based on remaining amounts
  const rentPaid = data.remainingRent || 0;
  const securityDepositPaid = data.remainingSecurity || 0;
  
  formData.append('rentPaid', rentPaid.toString());
  formData.append('securityDepositPaid', securityDepositPaid.toString());
  
  // Set default payment method if not provided
  const paymentMethod = data.paymentMethod || 'CASH';
  formData.append('paymentMethod', paymentMethod);
  
  // Append payment proof files if provided
  if (data.paymentProof && data.paymentProof.length > 0) {
    data.paymentProof.forEach((file) => {
      formData.append('paymentProofs', file);
    });
  }
  
  return apiClient.post<{ success: boolean; message: string }>(`/tenants/process-upcoming`, formData);
}

/**
 * Collect pending payments from an onboarded tenant
 */
export async function collectPendingPayments(
  tenantId: string,
  data: {
    securityDepositAmount?: number;
    rentAmount?: number;
    paymentMethod?: string;
    paymentProofs: File[];
  }
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  formData.append('tenantId', tenantId);
  
  if (data.securityDepositAmount !== undefined) {
    formData.append('securityDepositAmount', data.securityDepositAmount.toString());
  }
  
  if (data.rentAmount !== undefined) {
    formData.append('rentAmount', data.rentAmount.toString());
  }
  
  // Set default payment method if not provided
  const paymentMethod = data.paymentMethod || 'CASH';
  formData.append('paymentMethod', paymentMethod);
  
  // Append payment proof files if provided
  if (data.paymentProofs && data.paymentProofs.length > 0) {
    data.paymentProofs.forEach((file) => {
      formData.append('paymentProofs', file);
    });
  }
  
  return apiClient.post<{ success: boolean; message: string }>(`/tenants/${tenantId}/collect-onboarded-pending-payments`, formData);
}

/**
 * Update onboarding payment amount
 */
export async function updateOnboardingPaymentAmount(
  paymentId: string,
  data: {
    amount: string;
  }
): Promise<{ success: boolean; message: string }> {
  return apiClient.put<{ success: boolean; message: string }>(`/payment-transactions/${paymentId}/onboarding`, data);
}

// Tenant Analysis Types
export interface TenantAnalysisData {
  _id: string;
  tenantName: string;
  tenantNumber: string;
  monthlyRent: number;
  foodOpted: boolean;
  baseRent: number;
  foodAmount: number;
  checkInDate: string;
  securityDepositTotal: number;
  securityDepositPaid: number;
  securityDepositBalance: number;
  room: {
    _id: string;
    roomNo: string;
    roomType: string;
  };
  property: {
    _id: string;
    propertyName: string;
  };
  cycleStart: string;
  cycleEnd: string;
  currentCycleMonth: string;
  totalPendingAmount: number;
  monthsWithDuePayments: string[];
  currentMonthPaymentStatus: string;
  currentMonthTotalAmount: number;
  currentMonthPaidAmount: number;
  tenureInMonths: number;
  exactCycle: {
    cycleStart: string;
    cycleEnd: string;
    rentMonth: string;
  };
}

export interface TenantAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    tenants: TenantAnalysisData[];
    total: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
    };
  };
}

export interface TenantAnalysisSummary {
  success: boolean;
  message: string;
  data: {
    totalActiveTenants: number;
    totalSecurityCollected: number;
    totalSecurityBalance: number;
    totalMonthlyRentExpected: number;
    totalBaseRent: number;
    totalFoodAmount: number;
    totalPendingAmount: number;
    averageTenureMonths: number;
    currentMonthPaymentSummary: {
      fullyPaid: number;
      partiallyPaid: number;
      unpaid: number;
    };
    tenantsWithPendingPayments: number;
    collectionEfficiency: number;
  };
}

/**
 * Get tenant analysis data for a property
 */
export async function getTenantAnalysis(propertyId: string): Promise<TenantAnalysisResponse> {
  return apiClient.get<TenantAnalysisResponse>(`/tenants/property/${propertyId}/analysis`);
}

/**
 * Get tenant analysis summary for a property
 */
export async function getTenantAnalysisSummary(propertyId: string): Promise<TenantAnalysisSummary> {
  return apiClient.get<TenantAnalysisSummary>(`/tenants/property/${propertyId}/analysis/summary`);
}

// Temporary Tenant Types
export interface CreateTemporaryTenantRequest {
  tenantName: string;
  tenantNumber: string;
  tenantEmail?: string;
  property: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  dailyRent: number;
  foodRate?: number;
  foodOpted?: boolean;
  securityDepositTotal?: number;
  securityDepositPaid?: number;
  amountPaid?: number;
  paymentMethod?: string;
  paymentProofs?: File[];
}

export interface CreateTemporaryTenantResponse {
  success: boolean;
  message: string;
  data: Tenant;
}

/**
 * Create a temporary tenant
 */
export async function createTemporaryTenant(data: CreateTemporaryTenantRequest): Promise<CreateTemporaryTenantResponse> {
  return apiClient.post<CreateTemporaryTenantResponse>('/temporary-tenants', data);
}

export interface TemporaryTenantsResponse {
  success: boolean;
  data: {
    tenants: Tenant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get temporary tenants for a property
 */
export async function getTemporaryTenants(propertyId: string): Promise<TemporaryTenantsResponse> {
  return apiClient.get<TemporaryTenantsResponse>(`/temporary-tenants/property/${propertyId}`);
}

/**
 * Update a temporary tenant
 */
export async function updateTemporaryTenant(id: string, data: Partial<CreateTemporaryTenantRequest>): Promise<CreateTemporaryTenantResponse> {
  return apiClient.put<CreateTemporaryTenantResponse>(`/temporary-tenants/${id}`, data);
}

/**
 * Delete a temporary tenant
 */
export async function deleteTemporaryTenant(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete<{ success: boolean; message: string }>(`/temporary-tenants/${id}`);
}


