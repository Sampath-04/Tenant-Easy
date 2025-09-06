import { apiClient } from './client';
import { Property } from './types';
import { PaymentRequest } from './paymentRequests';

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
  isAutoRecorded?: boolean;
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
  extraDays: number;
  paymentStatus: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  payments: Payment[];
  totalPaidAmount: number;
  remainingAmount: number;
  lastPaymentDate: string;
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
  securityDepositPaid: number;
}

// Room interface for rent history
export interface RoomInfo {
  _id: string;
  roomNo: string;
  roomType: string;
  maxCapacity: number;
  isOccupied: boolean;
  currentMeterReading: number;
  tenants: string[];
}

export interface Payment {
  _id: string;
  tenant: TenantInfo;
  property: Property;
  room: RoomInfo;
  amount: number;
  currency: string;
  paymentType: string;
  status: string;
  method: string;
  paidAt: string;
  paymentProofs: string[];
  recordedBy: {
    _id: string;
    name: string;
    role: string;
  };
  rentHistory: string;
  metadata: {
    rentMonth: string;
    comments?: string;
    paidTo: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  paymentStatus: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  paymentTransactions: Payment[];
  dueDate: string;
  previousCyclePaymentStatus: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID";
  previousCycleMonth: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  daysOverdue: number;
  electricityReadings: ElectricityReadingDetail[];
  notice: Notice | null;
}

export interface rentRecordsSummary {
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
export const getAllRentRecordsForProperty = async (
  propertyId: string,
  page: number = 1,
  limit: number = 10,
  tenant?: string,
  paymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
  search?: string,
  roomNo?: string,
  rentStatus?: "pending" | "due" | "upcoming",
  endDateFrom?: string,
  endDateTo?: string,
) => {
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (tenant) queryParams.append('tenant', tenant);
  if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
  if (search) queryParams.append('search', search);
  if (roomNo) queryParams.append('roomNo', roomNo);
  if (rentStatus) queryParams.append('rentStatus', rentStatus);
  if (endDateFrom) queryParams.append('endDateFrom', endDateFrom);
  if (endDateTo) queryParams.append('endDateTo', endDateTo);
  
  return apiClient.get<RentHistoryResponse>(`/rent-history/property/${propertyId}?${queryParams.toString()}`);
}

/**
 * Get property rent summary with date range filters
 */
export const getPropertyRentSummary = async (
  propertyId: string,
  endDateFrom?: string,
  endDateTo?: string,
  paymentStatus?: "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
  search?: string,
  roomNo?: string,
  rentStatus?: "pending" | "due" | "upcoming",
) => {
  const queryParams = new URLSearchParams();
  
  if (endDateFrom) queryParams.append('endDateFrom', endDateFrom);
  if (endDateTo) queryParams.append('endDateTo', endDateTo);
  if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
  if (search) queryParams.append('search', search);
  if (roomNo) queryParams.append('roomNo', roomNo);
  if (rentStatus) queryParams.append('rentStatus', rentStatus);
  return apiClient.get<{ success: boolean; data: any }>(`/rent-history/property/${propertyId}/summary?${queryParams.toString()}`);
}

/**
 * Mark rent as paid
 */
export async function markRentAsPaid(
  rentId: string, 
  data: {
    amount: number;
    paidDate: string;
    paymentProofs?: File[];
    paidTo: string;
    comments?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  formData.append('amount', data.amount.toString());
  formData.append('paidDate', data.paidDate);
  formData.append('paidTo', data.paidTo);
  
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
  extraDays: number;
  extraDaysCost: number;
  amount?: number;
  paidTo?: string;
  comments?: string;
  paymentProof?: File;
}): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  
  formData.append('tenantId', data.tenantId);
  formData.append('noticeDate', data.noticeDate);
  formData.append('noticeEndsOn', data.noticeEndsOn);
  formData.append('extraDays', data.extraDays.toString());
  formData.append('extraDaysCost', data.extraDaysCost.toString());
  
  if (data.amount) {
    formData.append('amount', data.amount.toString());
  }
  
  if (data.paidTo) {
    formData.append('paidTo', data.paidTo);
  }
  
  if (data.comments) {
    formData.append('comments', data.comments);
  }
  
  if (data.paymentProof) {
    formData.append('paymentProof', data.paymentProof);
  }
  
  return apiClient.post<{ success: boolean; message: string }>('/notices', formData);
}

export async function updateNotice(
  noticeId: string,
  data: {
    tenantId: string;
    noticeDate: string;
    noticeEndsOn: string;
    extraDays: number;
    extraDaysCost: number;
    amount?: number;
    paidTo?: string;
    comments?: string;
    paymentProof?: File;
  }
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();

  formData.append('tenantId', data.tenantId);
  formData.append('noticeDate', data.noticeDate);
  formData.append('noticeEndsOn', data.noticeEndsOn);
  formData.append('extraDays', data.extraDays.toString());
  formData.append('extraDaysCost', data.extraDaysCost.toString());
  
  if (data.amount) {
    formData.append('amount', data.amount.toString());
  }
  
  if (data.paidTo) {
    formData.append('paidTo', data.paidTo);
  }
  
  if (data.comments) {
    formData.append('comments', data.comments);
  }
  
  if (data.paymentProof) {
    formData.append('paymentProof', data.paymentProof);
  }
  
  return apiClient.put<{ success: boolean; message: string }>(`/notices/${noticeId}`, formData);
}

/**
 * Get rent records for export by date range
 */
export async function getRentRecordsForExport(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<RentHistoryResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('endDateFrom', startDate);
  queryParams.append('endDateTo', endDate);
  
  return apiClient.get<RentHistoryResponse>(`/rent-history/property/${propertyId}?${queryParams.toString()}`);
}

export interface TenantHistoryRecord {
  _id: string;
  tenant: {
    _id: string;
    tenantName: string;
    tenantNumber: string;
    tenantEmail: string;
    checkInDate?: string;
    remainingSecurityDeposit?: number | null;
    isSecurityDepositFullyPaid: boolean;
    isSecurityDepositPartiallyPaid: boolean;
    id: string;
  };
  property: {
    _id: string;
    propertyName: string;
    propertyAddress: string;
    paymentInfo: {
      qrCodeLink: string;
    };
  };
  room: {
    _id: string;
    roomNo: string;
    roomType: string;
    maxCapacity?: number;
  };
  startDate: string;
  endDate: string;
  month: string;
  rent: number;
  electricityReadings: any[];
  electricityBill: number;
  electricityUnits: number;
  totalAmount: number;
  paymentStatus: string;
  isValid: boolean;
  paymentTransactions: Array<{
    _id: string;
    amount: number;
    paymentType: string;
    status: string;
    method: string;
    paidAt: string;
    paymentProofs?: string[];
    metadata?: {
      rentMonth: string;
      paidTo: string;
    };
    isSuccessful: boolean;
    isPending: boolean;
    id: string;
  }>;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalPaidAmount: number;
  remainingAmount: number;
  isPending: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  lastPaymentDate: string | null;
  id: string;
  paymentRequests: PaymentRequest[];
}

export interface TenantHistoryResponse {
  success: boolean;
  count: number;
  data: TenantHistoryRecord[];
  summary: {
    totalRecords: number;
    totalPaid: number;
    totalPending: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    statusBreakdown: {
      NOT_PAID: number;
      PARTIALLY_PAID: number;
      FULLY_PAID: number;
    };
  };
  searchCriteria: {
    phoneNumber: string;
    propertyId: string;
  };
}

export interface SingleRentRecordResponse {
  success: boolean;
  data: TenantHistoryRecord;
}

export const getRentRecordById = async (rentRecordId: string): Promise<SingleRentRecordResponse> => {
  return await apiClient.get(`/rent-history/${rentRecordId}`);
};
