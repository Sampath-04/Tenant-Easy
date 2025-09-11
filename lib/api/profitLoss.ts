import { apiClient } from './client';

export interface IncomeData {
  totalAmount: number;
  categoryBreakdown: {
    rent: number;
    other: number;
  };
  methodBreakdown: {
    cash: number;
    bankTransfer: number;
    online: number;
  };
  dailyBreakdown: Array<{
    date: string;
    amount: number;
    paymentType: string;
    method: string;
  }>;
}

export interface ExpenseData {
  totalAmount: number;
  categoryBreakdown: Record<string, number>;
}

export interface FinancialSummary {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  expenseRatio: number;
}

export interface ProfitLossRecord {
  _id: string;
  month: string;
  year: number;
  income: IncomeData;
  expense: ExpenseData;
  financialSummary: FinancialSummary;
  status: string;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
  calculatedBy: any;
}

export interface ProfitLossResponse {
  success: boolean;
  message: string;
  data: ProfitLossRecord[];
}

export const getProfitLossByProperty = async (
  propertyId: string,
  month?: number,
  year?: number,
  status?: string,
  monthFrom?: string,
  monthTo?: string,
  yearFrom?: number,
  yearTo?: number
): Promise<ProfitLossResponse> => {
  const params = new URLSearchParams();
  
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  if (status) params.append('status', status);
  if (monthFrom) params.append('monthFrom', monthFrom);
  if (monthTo) params.append('monthTo', monthTo);
  if (yearFrom) params.append('yearFrom', yearFrom.toString());
  if (yearTo) params.append('yearTo', yearTo.toString());
  
  const queryString = params.toString();
  const url = `/expenses/property/${propertyId}/profit-loss${queryString ? `?${queryString}` : ''}`;
  
  return await apiClient.get(url);
};
