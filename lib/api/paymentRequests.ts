import { apiClient } from './client';

export interface PaymentRequest {
  _id: string;
  rentRecord: {
    _id: string;
    month: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    paymentStatus: string;
    totalPaidAmount: number;
    remainingAmount: number;
    isPending: boolean;
    isOverdue: boolean;
    daysOverdue: number;
    lastPaymentDate: string | null;
    id: string;
  } | null;
  tenant: {
    _id: string;
    tenantName: string;
    tenantNumber: string;
    remainingSecurityDeposit: number | null;
    isSecurityDepositFullyPaid: boolean;
    isSecurityDepositPartiallyPaid: boolean;
    id: string;
  } | null;
  property: {
    _id: string;
    propertyName: string;
    propertyAddress: string;
  };
  room: {
    _id: string;
    roomNo: string;
    roomType: string;
  } | null;
  amount: number;
  paymentMethod: string;
  transactionProofs: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  id: string;
}

export interface PaymentRequestResponse {
  success: boolean;
  data: PaymentRequest;
}

export interface PaymentRequestsListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: PaymentRequest[];
}

/**
 * Get payment requests by property with filters
 */
export async function getPaymentRequestsByProperty(
  propertyId: string, 
  filters?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    room?: string;
  }
): Promise<PaymentRequest[]> {
  const params = new URLSearchParams();
  params.append('property', propertyId);
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.room) {
    params.append('room', filters.room);
  }
  
  const response = await apiClient.get<PaymentRequestsListResponse>(`/payment-requests?${params.toString()}`);
  return response.data;
}

/**
 * Approve a payment request
 */
export async function approvePaymentRequest(requestId: string): Promise<PaymentRequest> {
  const response = await apiClient.patch<PaymentRequestResponse>(`/payment-requests/${requestId}/approve`, {});
  return response.data;
}

/**
 * Reject a payment request
 */
export async function rejectPaymentRequest(requestId: string): Promise<PaymentRequest> {
  const response = await apiClient.patch<PaymentRequestResponse>(`/payment-requests/${requestId}/reject`, {});
  return response.data;
}

/**
 * Submit a payment request
 */
export async function submitPaymentRequest(paymentData: {
  rentRecord: string;
  amount: number;
  paymentProofs: File;
}): Promise<PaymentRequest> {
  // Create FormData for file upload
  const formData = new FormData();
  
  formData.append('rentRecord', paymentData.rentRecord);
  formData.append('amount', paymentData.amount.toString());
  formData.append('paymentProofs', paymentData.paymentProofs);
  
  const response = await apiClient.post<PaymentRequestResponse>('/payment-requests', formData);
  return response.data;
}
