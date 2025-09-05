import { apiClient } from './client';

export interface IncomeData {
  totalRent?: number;
  totalElectricity?: number;
  totalAmount: number;
  collectedAmount?: number;
  pendingAmount?: number;
  categoryBreakdown?: {
    rent: number;
    securityDeposits: number;
    other: number;
  };
  methodBreakdown?: {
    cash: number;
    bankTransfer: number;
    online: number;
  };
  dailyBreakdown?: Array<{
    date: string;
    amount: number;
    paymentType: string;
    method: string;
  }>;
}

export interface ExpenseCategoryBreakdown {
  propertyFacility: number;
  utilities: number;
  foodKitchen: number;
  staffSalaries: number;
  miscellaneous: number;
}

export interface ExpensesData {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  categoryBreakdown: ExpenseCategoryBreakdown;
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
  expenses: ExpensesData;
  financialSummary: FinancialSummary;
  status: string;
  isLocked: boolean;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
  calculatedBy: any;
  lockedBy: any;
}

export interface ProfitLossResponse {
  success: boolean;
  message: string;
  data: ProfitLossRecord[];
}

export const getProfitLossByProperty = async (propertyId: string): Promise<ProfitLossResponse> => {
  return await apiClient.get(`/expenses/property/${propertyId}/profit-loss`);
};
