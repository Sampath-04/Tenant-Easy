import { apiClient } from './client';

export interface AdditionalIncomeData {
  propertyId: string;
  amount: number;
  description: string;
  transactionRef: string;
  paidAt: string;
}

export interface AdditionalIncomeResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    propertyId: string;
    amount: number;
    description: string;
    transactionRef: string;
    paidAt: string;
    createdAt: string;
  };
}

export async function createAdditionalIncome(
  data: AdditionalIncomeData
): Promise<AdditionalIncomeResponse> {
  return apiClient.post<AdditionalIncomeResponse>('/payment-transactions/additional-income', data);
}
