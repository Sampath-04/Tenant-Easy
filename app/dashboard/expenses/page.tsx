'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useCreateExpense } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { showSuccessToast, showErrorToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';
import { useProperty } from '@/contexts/PropertyContext';
import CategoryManagementDialog from '@/components/CategoryManagementDialog';
import { PAYMENT_METHOD_OPTIONS, DEFAULT_PAYMENT_METHOD } from '@/lib/constants/paymentConstants';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import { FormControl, InputLabel, Select, MenuItem, Theme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


interface ExpenseFormData {
  propertyId: string;
  title: string;
  amount: number;
  category: string; // This will be the category object ID
  categoryName: string; // This will be the category name
  subcategory: string;
  paymentMethod: string;
  expenseDate: Date | null;
}

export default function ExpensesPage() {
  const router = useRouter();
  const createExpenseMutation = useCreateExpense();
  const { selectedProperty } = useProperty();

  // Fetch categories from backend
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories(selectedProperty?.profile || '');

  const [formData, setFormData] = useState<ExpenseFormData>({
    propertyId: selectedProperty?.id || '',
    title: '',
    amount: 0,
    category: '', // category object ID
    categoryName: '', // category name
    subcategory: '',
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    expenseDate: new Date(),
  });

  // Update propertyId when selectedProperty changes
  useEffect(() => {
    if (selectedProperty?.id) {
      setFormData(prev => ({
        ...prev,
        propertyId: selectedProperty.id
      }));
    }
  }, [selectedProperty?.id]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const isSubmitting = createExpenseMutation.isPending;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert Date object to string format for API
      const expenseData = {
        ...formData,
        expenseDate: formData.expenseDate?.toISOString().split('T')[0] || ''
      };
      
      // Create expense using React Query mutation
      await createExpenseMutation.mutateAsync(expenseData);
  
      // Show success message and redirect
      const successToast = showSuccessToast('Expense recorded successfully!');
      toast.success(successToast.message, successToast.config);
      // router.push('/dashboard');
    } catch (error) {
      console.error ('Error recording expense:', error);
      const errorToast = showErrorToast('Failed to record expense. Please try again.');
      toast.error(errorToast.message, errorToast.config);
    }
  };

    
  // Show loading state if no property is selected
  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Please select a property to continue</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Expenses', url: '/dashboard/expenses' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Record New Expense"
        subtitle="Track and manage your property expenses"
      />

      <div className='px-6 md:pt-6 pt-4'>
        <BreadCrumbs items={breadcrumbs} />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
        {/* Header Section */}
        <div className="text-center md:mb-6 mb-4">
          <p className="text-slate-600 text-start md:text-center dark:text-slate-400 md:text-lg text-base max-w-2xl mx-auto">
            Track your property expenses with our comprehensive categorization system. 
            Keep your financial records organized and up-to-date.
          </p>
          
          {/* Action Buttons */}
          <div className=" md:mt-6 mt-4 grid grid-cols-2 md:flex flex-col sm:flex-row md:gap-4 gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/expenses/list')}
              className="cursor-pointer  inline-flex items-center md:px-6 px-4 md:py-3 py-2 md:text-base text-sm text-center justify-center border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200  hover:scale-105 font-medium"
            >
              <svg className="hidden md:block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Expenses
            </button>
            
            <button
              onClick={() => setCategoryDialogOpen(true)}
              className="cursor-pointer inline-flex items-center md:px-6 px-4 md:py-3 py-2 md:text-base text-sm text-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium transform hover:scale-105"
            >
              <svg className="hidden md:block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Categories
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="md:space-y-6 space-y-4">
          {/* Expense Details Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 md:px-8 px-4 md:py-3 py-2 border-b border-slate-200 dark:border-slate-600">
              <h3 className="md:text-lg text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Expense Details
              </h3>
            </div>
            <div className="md:p-4 p-2 md:space-y-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Expense Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full md:px-4 px-3 md:py-3 py-2 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.title 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="e.g., AC Repair Service"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-2xl text-slate-500 dark:text-slate-400">₹</span>
                    </div>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-12 pr-4 md:py-3 py-2 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                        errors.amount 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.amount}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Payment Method Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Payment Method *
                </label>
                <div className="relative">
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      label="Payment Method"
                      sx={(theme: Theme) => ({
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0',
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.mode === 'dark' ? '#64748b' : '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
                          },
                        },
                        '& .MuiSelect-select': {
                          padding: '12px 14px',
                        },
                      })}
                    >
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 md:px-8 px-4 md:py-3 py-2 border-b border-slate-200 dark:border-slate-600">
              <h3 className="md:text-lg text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Category & Classification
              </h3>
            </div>
            <div className="md:p-4 p-2 md:space-y-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div className="space-y-2">
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => {
                        const selectedCategory = categoriesData?.data.find(cat => cat._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          category: e.target.value, // category object ID
                          categoryName: selectedCategory?.name || '', // category name
                          subcategory: '' // Reset subcategory when category changes
                        }));
                        
                        // Clear category error if it exists
                        if (errors.category) {
                          setErrors(prev => ({ ...prev, category: '' }));
                        }
                      }}
                      disabled={categoriesLoading}
                      label="Category *"
                      sx={(theme: Theme) => ({
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: categoriesLoading 
                            ? (theme.palette.mode === 'dark' ? '#475569' : '#f1f5f9')
                            : (theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                          '& fieldset': {
                            borderColor: errors.category 
                              ? '#ef4444' 
                              : (theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0'),
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: errors.category 
                              ? '#dc2626' 
                              : (theme.palette.mode === 'dark' ? '#64748b' : '#cbd5e1'),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: errors.category ? '#dc2626' : '#10b981',
                            boxShadow: errors.category 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                              : '0 0 0 4px rgba(16, 185, 129, 0.2)',
                          },
                        },
                      })}
                    >
                      <MenuItem value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                      </MenuItem>
                      {categoriesData?.data?.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.category}
                    </p>
                  )}
                  {categoriesError && (
                    <p className="text-sm text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Failed to load categories. Please try again.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <FormControl fullWidth error={!!errors.subcategory}>
                    <InputLabel>Subcategory *</InputLabel>
                    <Select
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      disabled={!formData.category}
                      label="Subcategory *"
                      sx={(theme: Theme) => ({
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: !formData.category 
                            ? (theme.palette.mode === 'dark' ? '#475569' : '#f1f5f9')
                            : (theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                          '& fieldset': {
                            borderColor: errors.subcategory 
                              ? '#ef4444' 
                              : (theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0'),
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: errors.subcategory 
                              ? '#dc2626' 
                              : (theme.palette.mode === 'dark' ? '#64748b' : '#cbd5e1'),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: errors.subcategory ? '#dc2626' : '#10b981',
                            boxShadow: errors.subcategory 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                              : '0 0 0 4px rgba(16, 185, 129, 0.2)',
                          },
                        },
                      })}
                    >
                      <MenuItem value="">Select Subcategory</MenuItem>
                      {formData.category && categoriesData?.data
                        ?.find(cat => cat._id === formData.category)
                        ?.subcategories?.map((subcategory) => (
                        <MenuItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {errors.subcategory && (
                    <p className="text-sm text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.subcategory}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 md:px-8 px-4 md:py-3 py-2 border-b border-slate-200 dark:border-slate-600">
              <h3 className="md:text-lg text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date & Timing
              </h3>
            </div>
            <div className="md:p-4 p-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Expense Date *
                </label>
                <DatePicker
                  value={formData.expenseDate}
                  onChange={(newValue) => handleInputChange('expenseDate', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.expenseDate,
                      helperText: errors.expenseDate,
                      sx: (theme: Theme) => ({
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                          '& fieldset': {
                            borderColor: errors.expenseDate 
                              ? '#ef4444' 
                              : (theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0'),
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: errors.expenseDate 
                              ? '#dc2626' 
                              : (theme.palette.mode === 'dark' ? '#64748b' : '#cbd5e1'),
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: errors.expenseDate ? '#dc2626' : '#8b5cf6',
                            boxShadow: errors.expenseDate 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.2)' 
                              : '0 0 0 4px rgba(139, 92, 246, 0.2)',
                          },
                        },
                        '& .MuiInputBase-input': {
                          padding: '12px 14px',
                        },
                      }),
                    },
                  }}
                />
                {errors.expenseDate && (
                  <p className="text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.expenseDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center md:space-y-4 space-y-2 md:space-x-4 space-x-2">
    
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-fit md:w-full sm:w-auto md:px-8 px-4 md:py-3 py-2 text-sm md:text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium transform hover:scale-105"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording Expense...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Record Expense
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        profileId={selectedProperty?.profile || ''}
      />
      </div>
    </LocalizationProvider>
  );
}
