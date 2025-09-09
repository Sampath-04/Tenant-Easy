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


interface ExpenseFormData {
  propertyId: string;
  title: string;
  amount: number;
  category: string; // This will be the category object ID
  categoryName: string; // This will be the category name
  subcategory: string;
  paymentMethod: string;
  expenseDate: string;
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
    expenseDate: new Date().toISOString().split('T')[0],
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
      // Create expense using React Query mutation
      await createExpenseMutation.mutateAsync(formData);
  
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

  const handleCancel = () => {
    router.push('/dashboard');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Record New Expense"
        subtitle="Track and manage your property expenses"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Record New Expense
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Track your property expenses with our comprehensive categorization system. 
            Keep your financial records organized and up-to-date.
          </p>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/expenses/list')}
              className="cursor-pointer  inline-flex items-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200  hover:scale-105 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Expenses
            </button>
            
            <button
              onClick={() => setCategoryDialogOpen(true)}
              className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Categories
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Expense Details Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Expense Details
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Expense Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
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
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
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
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 appearance-none border-slate-200 dark:border-slate-600 focus:border-blue-500"
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="py-2">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Category & Classification
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <div className="relative">
                    <select
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
                      className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 appearance-none ${
                        categoriesLoading 
                          ? 'bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500 cursor-not-allowed' 
                          : ''
                      } ${
                        errors.category 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                      </option>
                      {categoriesData?.data?.map((category) => (
                        <option key={category._id} value={category._id} className="py-2">
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Subcategory *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      disabled={!formData.category}
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 appearance-none ${
                        !formData.category 
                          ? 'bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-700'
                      } ${
                        errors.subcategory 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">Select Subcategory</option>
                      {formData.category && categoriesData?.data
                        ?.find(cat => cat._id === formData.category)
                        ?.subcategories?.map((subcategory) => (
                        <option key={subcategory} value={subcategory} className="py-2">
                          {subcategory}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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
            <div className="bg-slate-50 dark:bg-slate-700 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date & Timing
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Expense Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 ${
                      errors.expenseDate 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-slate-200 dark:border-slate-600 focus:border-purple-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto px-8 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium transform hover:scale-105"
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
        onCategoriesUpdated={() => {
          // Categories will be automatically refreshed via React Query
          toast.success('Categories updated successfully!');
        }}
      />
    </div>
  );
}
