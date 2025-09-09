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

export const getProfitLossByProperty = async (propertyId: string): Promise<ProfitLossResponse> => {
  return await apiClient.get(`/expenses/property/${propertyId}/profit-loss`);
};
