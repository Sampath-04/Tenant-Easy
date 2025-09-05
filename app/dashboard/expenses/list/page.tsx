'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useExpensesByProperty, useDeleteExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { Expense, ExpenseFilters, UpdateExpenseData } from '@/lib/api/expenses';
import { useProperty } from '@/contexts/PropertyContext';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const EXPENSE_CATEGORIES = {
  PROPERTY_FACILITY: [
    "RENT_LEASE",
    "PROPERTY_TAX",
    "MAINTENANCE_REPAIRS",
    "HOUSEKEEPING_SUPPLIES",
    "PEST_CONTROL",
    "FURNITURE_FIXTURES",
    "APPLIANCES"
  ],
  UTILITIES: [
    "ELECTRICITY",
    "WATER",
    "GAS",
    "INTERNET_WIFI",
    "TELEPHONE"
  ],
  FOOD_KITCHEN: [
    "GROCERIES_VEGETABLES",
    "COOKING_GAS",
    "COOK_SALARY",
    "WATER_CANS",
    "KITCHEN_APPLIANCES"
  ],
  STAFF_SALARIES: [
    "CARETAKER_MANAGER",
    "HOUSEKEEPING_STAFF",
    "SECURITY_GUARD",
    "LAUNDRY_STAFF"
  ],
  MISCELLANEOUS: [
    "TRANSPORTATION",
    "EMERGENCY_EXPENSES",
    "RESIDENT_WELFARE"
  ]
};

const PAYMENT_STATUSES = ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'];

export default function ExpensesListPage() {
  const router = useRouter();
  const { selectedProperty } = useProperty();
  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();
  
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; expenseId: string; expenseTitle: string }>({
    show: false,
    expenseId: '',
    expenseTitle: ''
  });

  const [editingExpense, setEditingExpense] = useState<{ id: string; data: UpdateExpenseData } | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateExpenseData>({
    title: '',
    amount: 0,
    category: '',
    subcategory: '',
    expenseDate: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const { data: expensesResponse, isLoading, error } = useExpensesByProperty(
    selectedProperty?.id || '',
    filters
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [amountRange, setAmountRange] = useState({ minAmount: '', maxAmount: '' });

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    handleFilterChange('category', category);
    handleFilterChange('subcategory', undefined);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    handleFilterChange('subcategory', subcategory);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    if (newDateRange.startDate && newDateRange.endDate) {
      handleFilterChange('startDate', newDateRange.startDate);
      handleFilterChange('endDate', newDateRange.endDate);
    } else {
      handleFilterChange('startDate', undefined);
      handleFilterChange('endDate', undefined);
    }
  };

  const handleAmountRangeChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const newAmountRange = { ...amountRange, [field]: value };
    setAmountRange(newAmountRange);
    
    if (newAmountRange.minAmount) {
      handleFilterChange('minAmount', parseFloat(newAmountRange.minAmount));
    } else {
      handleFilterChange('minAmount', undefined);
    }
    
    if (newAmountRange.maxAmount) {
      handleFilterChange('maxAmount', parseFloat(newAmountRange.maxAmount));
    } else {
      handleFilterChange('maxAmount', undefined);
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedPaymentStatus('');
    setDateRange({ startDate: '', endDate: '' });
    setAmountRange({ minAmount: '', maxAmount: '' });
  };

  const handleDeleteClick = (expenseId: string, expenseTitle: string) => {
    setDeleteConfirm({
      show: true,
      expenseId,
      expenseTitle
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteExpenseMutation.mutateAsync(deleteConfirm.expenseId);
      setDeleteConfirm({ show: false, expenseId: '', expenseTitle: '' });
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, expenseId: '', expenseTitle: '' });
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense({ id: expense._id, data: expense });
    setEditFormData({
      title: expense.title || '',
      amount: expense.amount || 0,
      category: expense.category || '',
      subcategory: expense.subcategory || '',
      expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
    });
    setEditErrors({});
  };

  const handleEditCancel = () => {
    setEditingExpense(null);
    setEditFormData({
      title: '',
      amount: 0,
      category: '',
      subcategory: '',
      expenseDate: '',
    });
    setEditErrors({});
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset subcategory when category changes
    if (field === 'category') {
      setEditFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!editFormData.category) {
      newErrors.category = 'Category is required';
    }
    if (!editFormData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }
    if (editFormData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!editFormData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !editingExpense) {
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({
        id: editingExpense.id,
        data: editFormData
      });
      
      alert('Expense updated successfully!');
      handleEditCancel();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROPERTY_FACILITY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'UTILITIES':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'FOOD_KITCHEN':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'STAFF_SALARIES':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'MISCELLANEOUS':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader 
          title="Expenses"
          subtitle="Select a property to view expenses"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Please select a property to view expenses.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Property Expenses"
        subtitle={`Managing expenses for ${selectedProperty.name}`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Property Expenses
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track and manage all expenses for {selectedProperty.name}
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/dashboard/expenses')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 font-medium"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expense
              </span>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {Object.keys(EXPENSE_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!selectedCategory}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !selectedCategory 
                      ? 'bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <option value="">All Subcategories</option>
                  {selectedCategory && EXPENSE_CATEGORIES[selectedCategory as keyof typeof EXPENSE_CATEGORIES]?.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => {
                    setSelectedPaymentStatus(e.target.value);
                    handleFilterChange('paymentStatus', e.target.value || undefined);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Amount Range and Clear Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={amountRange.minAmount}
                    onChange={(e) => handleAmountRangeChange('minAmount', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={amountRange.maxAmount}
                    onChange={(e) => handleAmountRangeChange('maxAmount', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Expenses List
            </h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading expenses...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">Error loading expenses. Please try again.</p>
            </div>
          ) : !expensesResponse?.data?.expenses?.length ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No expenses found for the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Expense Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {expensesResponse?.data?.expenses?.map((expense) => (
                      <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {expense.title}
                            </div>
                            {expense.description && (
                              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {expense.description}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Recorded by {expense.recordedBy.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                              {expense.category.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {expense.subcategory.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatCurrency(expense.totalAmount)}
                          </div>
                          {expense.taxAmount > 0 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              +{formatCurrency(expense.taxAmount)} tax
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.paymentStatus)}`}>
                            {expense.paymentStatus}
                          </span>
                          {expense.isRecurring && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Recurring ({expense.recurrenceFrequency})
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            {formatDate(expense.expenseDate)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(expense.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex space-x-2">
                             <button
                               onClick={() => router.push(`/dashboard/expenses/${expense._id}`)}
                               className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                               title="View Expense"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                               </svg>
                             </button>
                             <button
                               onClick={() => handleEditClick(expense)}
                               className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                               title="Edit Expense"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                               </svg>
                             </button>
                             <button
                               onClick={() => handleDeleteClick(expense._id, expense.title)}
                               className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                               title="Delete Expense"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             </button>
                           </div>
                           </td>
                       </tr>
                        ))}
                   </tbody>
                 </table>
              </div>

              {/* Pagination */}
              {expensesResponse?.data?.pagination && expensesResponse.data.pagination.totalPages > 1 && (
                <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      Showing {((expensesResponse.data.pagination.currentPage - 1) * expensesResponse.data.pagination.itemsPerPage) + 1} to{' '}
                      {Math.min(expensesResponse.data.pagination.currentPage * expensesResponse.data.pagination.itemsPerPage, expensesResponse.data.pagination.totalItems)} of{' '}
                      {expensesResponse.data.pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', filters.page! - 1)}
                        disabled={filters.page === 1}
                        className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                        Page {expensesResponse.data.pagination.currentPage} of {expensesResponse.data.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', filters.page! + 1)}
                        disabled={filters.page === expensesResponse.data.pagination.totalPages}
                        className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Delete Expense
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete "{deleteConfirm.expenseTitle}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteExpenseMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

                    {/* Edit Expense Modal */}
       {editingExpense && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto drop-shadow-2xl">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Expense
                </h3>
                <button
                  onClick={handleEditCancel}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 pb-2">
                  Basic Information
                </h4>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expense Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => handleEditInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.title 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                    placeholder="Enter expense title"
                  />
                  {editErrors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.title}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 dark:text-slate-400">₹</span>
                    <input
                      type="number"
                      value={editFormData.amount}
                      onChange={(e) => handleEditInputChange('amount', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        editErrors.amount 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {editErrors.amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.amount}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expense Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editFormData.expenseDate}
                    onChange={(e) => handleEditInputChange('expenseDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.expenseDate 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                  />
                  {editErrors.expenseDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.expenseDate}</p>
                  )}
                </div>
              </div>

              {/* Category and Subcategory */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 pb-2">
                  Classification
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <FormControl fullWidth error={!!editErrors.category}>
                       <InputLabel id="category-label">Category *</InputLabel>
                       <Select
                         labelId="category-label"
                         value={editFormData.category}
                         onChange={(e) => handleEditInputChange('category', e.target.value)}
                         label="Category *"
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             '& fieldset': {
                               borderColor: editErrors.category ? '#ef4444' : '#cbd5e1',
                             },
                             '&:hover fieldset': {
                               borderColor: editErrors.category ? '#ef4444' : '#94a3b8',
                             },
                             '&.Mui-focused fieldset': {
                               borderColor: '#3b82f6',
                             },
                           },
                         }}
                       >
                         <MenuItem value="">Select Category</MenuItem>
                         {Object.keys(EXPENSE_CATEGORIES).map((category) => (
                           <MenuItem key={category} value={category}>
                             {category.replace(/_/g, ' ')}
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                     {editErrors.category && (
                       <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.category}</p>
                     )}
                   </div>

                                     <div>
                     <FormControl fullWidth error={!!editErrors.subcategory} disabled={!editFormData.category}>
                       <InputLabel id="subcategory-label">Subcategory *</InputLabel>
                       <Select
                         labelId="subcategory-label"
                         value={editFormData.subcategory}
                         onChange={(e) => handleEditInputChange('subcategory', e.target.value)}
                         label="Subcategory *"
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             '& fieldset': {
                               borderColor: editErrors.subcategory ? '#ef4444' : '#cbd5e1',
                             },
                             '&:hover fieldset': {
                               borderColor: editErrors.subcategory ? '#ef4444' : '#94a3b8',
                             },
                             '&.Mui-focused fieldset': {
                               borderColor: '#3b82f6',
                             },
                           },
                         }}
                       >
                         <MenuItem value="">Select Subcategory</MenuItem>
                         {editFormData.category && EXPENSE_CATEGORIES[editFormData.category as keyof typeof EXPENSE_CATEGORIES]?.map((subcategory) => (
                           <MenuItem key={subcategory} value={subcategory}>
                             {subcategory.replace(/_/g, ' ')}
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                     {editErrors.subcategory && (
                       <p className="mt-1 text-sm text-red-600 dark:text-red-400">{editErrors.subcategory}</p>
                     )}
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateExpenseMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                >
                  {updateExpenseMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
