import { apiClient } from './client';

export interface Refund {
  _id: string;
  tenant: {
    _id: string;
    tenantName: string;
    tenantNumber: string;
    tenantEmail: string;
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
    id: string;
  };
  createdAt: string;
  updatedAt: string;
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
}

export interface ProcessRefundData {
  transactionId: string;
  receiptUrl?: File;
  paymentMethod: string;
  notes?: string;
}

export const getRefundsForProperty = async (propertyId: string): Promise<RefundsResponse> => {
  const response = await apiClient.get(`/refunds/property/${propertyId}`);
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

  const response = await apiClient.get(`/refunds/property/${propertyId}?${queryParams.toString()}`);
  return response as RefundsResponse;
};

