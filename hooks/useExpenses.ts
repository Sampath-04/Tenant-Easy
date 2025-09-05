import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExpense, getExpensesByProperty, getExpense, updateExpense, deleteExpense, CreateExpenseData, UpdateExpenseData, Expense, ExpenseFilters, ExpensesResponse } from '@/lib/api/expenses';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: string) => [...expenseKeys.lists(), { filters }] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Create expense mutation
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (newExpense) => {
      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      
      // Add the new expense to the cache
      queryClient.setQueryData(
        expenseKeys.detail(newExpense._id),
        newExpense
      );
    },
  });
};

// Get expenses by property with filters
export const useExpensesByProperty = (propertyId: string, filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: expenseKeys.list(`${propertyId}-${JSON.stringify(filters || {})}`),
    queryFn: () => getExpensesByProperty(propertyId, filters),
    enabled: !!propertyId,
  });
};

// Get single expense
export const useExpense = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
};

// Update expense mutation
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) => 
      updateExpense(id, data),
    onSuccess: (updatedExpense, variables) => {
      // Update the expense in the cache
      queryClient.setQueryData(
        expenseKeys.detail(variables.id),
        updatedExpense
      );
      
      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
};

// Delete expense mutation
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_, deletedExpenseId) => {
      // Remove the expense from the cache
      queryClient.removeQueries({ queryKey: expenseKeys.detail(deletedExpenseId) });
      
      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
};
