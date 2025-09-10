import { apiClient } from './client';

export interface Refund {
  _id: string;
  tenant: {
    _id: string;
    tenantName: string;
    tenantNumber: string;
    tenantEmail: string;
    securityDepositTotal: number;
    securityDepositPaid: number;
    remainingSecurityDeposit: number | null;
    isSecurityDepositFullyPaid: boolean;
    isSecurityDepositPartiallyPaid: boolean;
    id: string;
  };
  room: {
    _id: string;
    roomNo: string;
    roomType: string;
  };
  property: {
    _id: string;
    propertyName: string;
    propertyAddress: string;
  };
  notice: string;
  tenantQrCodeUrl: string;
  comments: string;
  refundAmount: number;
  securityDepositPaid: number;
  status: 'not_processed' | 'processed';
  month: string;
  noticeEndsOn: string;
  deductions: {
    electricityBill: number;
    electricityUnits: number;
    otherDeductions: number;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentTransaction?: {
    _id: string;
    amount: number;
    status: string;
    method: string;
    transactionRef: string;
    paidAt: string;
    paymentProofs: string[];
    isSuccessful: boolean;
    isPending: boolean;
    id: string;
  };
  processedAt?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  updatedBy: string;
}

export interface RefundsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: Refund[];
  statistics: {
    _id: string | null;
    totalRefunds: number;
    totalAmount: number;
    processedCount: number;
    pendingCount: number;
    processedAmount: number;
    pendingAmount: number;
  };
}

export interface ProcessRefundData {
  transactionId: string;
  receiptUrl?: File;
  paymentMethod: string;
  notes?: string;
}

export const getRefundsForProperty = async (propertyId: string, filters: {
  search?: string;
  status?: string;
  processedAtFrom?: string;
  processedAtTo?: string;
} = {}): Promise<RefundsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('includeStatistics', 'true');
  
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  if (filters.status) {
    queryParams.append('status', filters.status);
  }
  if (filters.processedAtFrom) {
    queryParams.append('processedAtFrom', filters.processedAtFrom);
  }
  if (filters.processedAtTo) {
    queryParams.append('processedAtTo', filters.processedAtTo);
  }

  const response = await apiClient.get(`/refunds/property/${propertyId}?${queryParams.toString()}`);
  return response as RefundsResponse;
};

export const processRefund = async (refundId: string, data: ProcessRefundData): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('transactionId', data.transactionId);
  formData.append('paymentMethod', data.paymentMethod);
  
  if (data.receiptUrl) {
    formData.append('receipt', data.receiptUrl);
  }
  
  if (data.notes) {
    formData.append('notes', data.notes);
  }

  const response = await apiClient.patch(`/refunds/${refundId}/mark-processed`, formData);
  return response as { success: boolean; message: string };
};

export const getRefundsForExport = async (propertyId: string, params: {
  processedAtFrom?: string;
  processedAtTo?: string;
}): Promise<RefundsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.processedAtFrom) {
    queryParams.append('processedAtFrom', params.processedAtFrom);
  }
  if (params.processedAtTo) {
    queryParams.append('processedAtTo', params.processedAtTo);
  }

  const response = await apiClient.get(`/refunds/property/${propertyId}?includeStatistics=true&${queryParams.toString()}`);
  return response as RefundsResponse;
};

