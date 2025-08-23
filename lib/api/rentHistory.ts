import { apiClient } from './client';

// Electricity Reading interface for rent history
export interface ElectricityReadingDetail {
  _id: string;
  meterReading: number;
  previousReading: number;
  consumption: number;
  readingDate: string;
  recordedBy: {
    name: string;
    role: string;
  };
  notes?: string;
  totalTenantsPresent?: number;
  consumptionCostPerTenant?: number;
}

// Notice interface for rent history
export interface Notice {
  _id: string;
  noticeDate: string;
  noticeEndsOn: string;
  rent: number;
  electricityBill: number;
  electricityUnits: number;
  totalAmount: number;
  status: string;
  electricityReadings: ElectricityReadingDetail[];
}

// Tenant interface for rent history
export interface TenantInfo {
  _id: string;
  tenantName: string;
  tenantNumber: string;
  tenantEmail: string;
  status: string;
  isActive: boolean;
}

// Room interface for rent history
export interface RoomInfo {
  _id: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  isOccupied: boolean;
}

// Rent History item interface
export interface RentHistoryItem {
  _id: string;
  tenant: TenantInfo;
  room: RoomInfo;
  startDate: string;
  endDate: string;
  month: string;
  rent: number;
  electricityBill: number;
  electricityUnits: number;
  totalAmount: number;
  isPaid: boolean;
  dueDate: string;
  isPreviousCyclePaid: boolean;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  daysOverdue: number;
  electricityReadings: ElectricityReadingDetail[];
  notice: Notice | null;
  paymentProofs?: File[];
  comments?: string;
}
interface pendingRentsSummary {
    totalAmount: number;
    totalRent: number;
    totalElectricity: number;
    overdueCount: number;
    readyToCollectCount: number;
    overdueAmount: number;
    readyToCollectAmount: number;
}

interface rentRecordsSummary {
  totalAmount: number;
  totalRent: number;
  totalElectricity: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface PendingRentsHistoryResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: RentHistoryItem[];
  summary: pendingRentsSummary;
}

export interface RentHistoryResponse{
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: RentHistoryItem[];
  summary: rentRecordsSummary;
}

/**
 * Get rent history for a tenant
 */
export async function getRentHistoryByTenant(tenantId: string, page = 1, limit = 50): Promise<RentHistoryResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return apiClient.get<RentHistoryResponse>(`/rent-history/tenant/${tenantId}/history?${params.toString()}`);
}

/**
 * Get pending rents for a property
 */
export async function getPendingRents(propertyId: string): Promise<PendingRentsHistoryResponse> {
  return apiClient.get<PendingRentsHistoryResponse>(`/rent-history/property/${propertyId}/pending`);
}

/**
 * Get all rent records for a property
 */
export async function getAllRentRecordsForProperty(
  propertyId: string, 
  params: {
    page?: number;
    limit?: number;
    tenant?: string;
    month?: string;
    isPaid?: boolean;
    search?: string;
  } = {}
): Promise<RentHistoryResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.tenant) queryParams.append('tenant', params.tenant);
  if (params.month) queryParams.append('month', params.month);
  if (params.isPaid !== undefined) queryParams.append('isPaid', params.isPaid.toString());
  if (params.search) queryParams.append('search', params.search);
  
  return apiClient.get<RentHistoryResponse>(`/rent-history/property/${propertyId}?${queryParams.toString()}`);
}

/**
 * Mark rent as paid
 */
export async function markRentAsPaid(
  rentId: string, 
  data: {
    comments?: string;
    paymentProofs?: File[];
  }
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  if (data.comments) {
    formData.append('comments', data.comments);
  }
  
  if (data.paymentProofs && data.paymentProofs.length > 0) {
    
    data.paymentProofs.forEach((paymentProof) => {
      formData.append('paymentProofs', paymentProof);
    });
  }
  
  return apiClient.patch<{ success: boolean; message: string }>(`/rent-history/${rentId}/mark-paid`, formData);
}

export async function createNotice(data: {
  tenantId: string;
  noticeDate: string;
  noticeEndsOn: string;
  rent: number;
}): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>('/notices', data);
}