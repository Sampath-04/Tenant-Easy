import { apiClient } from './client';

export interface CreateExpenseData {
  propertyId: string;
  title: string;
  amount: number;
  category: string; // This will be the category object ID
  categoryName: string; // This will be the category name
  subcategory: string;
  paymentMethod: string;
  expenseDate: string;
}

export interface UpdateExpenseData {
  title: string;
  description?: string;
  amount: number;
  category: string; // category ID for update
  subcategory: string;
  expenseDate: string;
  taxAmount?: number;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
}

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  category: {
    _id: string;
    name: string;
  } | {}; // Can be empty object for legacy data
  subcategory: string;
  amount: number;
  currency: string;
  taxAmount?: number;
  totalAmount?: number;
  paymentMethod: string;
  paidAmount?: number;
  expenseDate: string;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  status?: string;
  isApproved?: boolean;
  recordedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  affectsProfitLoss?: boolean;
  expenseType?: string;
  receipts?: any[];
  createdAt: string;
  updatedAt: string;
  approvedBy?: any;
  nextDueDate?: string;
  property: {
    _id: string;
    propertyName: string;
    propertyAddress: string;
  };
}

export interface ExpenseFilters {
  category?: string;
  subcategory?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean;
  affectsProfitLoss?: boolean;
  page?: number;
  limit?: number;
}

export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export const createExpense = async (data: CreateExpenseData): Promise<Expense> => {

  return await apiClient.post('/expenses', data);
};

export const getExpensesByProperty = async (propertyId: string, filters?: ExpenseFilters): Promise<ExpensesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const endpoint = `/expenses/property/${propertyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiClient.get(endpoint);
};

export const getExpenses = async (propertyId?: string): Promise<Expense[]> => {
  const endpoint = propertyId ? `/expenses?propertyId=${propertyId}` : '/expenses';
  return await apiClient.get(endpoint);
};

export const getExpense = async (id: string): Promise<Expense> => {
  return await apiClient.get(`/expenses/${id}`);
};

export const updateExpense = async (id: string, data: UpdateExpenseData): Promise<Expense> => {
  return await apiClient.put(`/expenses/${id}`, data);
};

export const deleteExpense = async (id: string): Promise<{ success: boolean; message: string }> => {
  return await apiClient.delete(`/expenses/${id}`);
};
