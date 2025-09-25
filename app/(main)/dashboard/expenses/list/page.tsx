'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useExpensesByProperty, useDeleteExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { Expense, ExpenseFilters, UpdateExpenseData } from '@/lib/api/expenses';
import { useProperty } from '@/contexts/PropertyContext';
import { useCategories } from '@/hooks/useCategories';
import { Select, MenuItem, FormControl, InputLabel, Dialog, TablePagination, TextField, Button, IconButton, Tooltip, Box, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

export default function ExpensesListPage() {
  const router = useRouter();
  const { selectedProperty } = useProperty();
  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();

  // Fetch categories from backend
  const { data: categoriesData } = useCategories(selectedProperty?.profile || '');
  
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
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [amountRange, setAmountRange] = useState({ minAmount: '', maxAmount: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync pagination state with filters
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: currentPage,
      limit: pageSize,
    }));
  }, [currentPage, pageSize]);

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    handleFilterChange('category', categoryId);
    handleFilterChange('subcategory', undefined);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    handleFilterChange('subcategory', subcategory);
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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    const dateString = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
    setDateRange(prev => ({ ...prev, startDate: dateString }));
    handleFilterChange('startDate', dateString);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    const dateString = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
    setDateRange(prev => ({ ...prev, endDate: dateString }));
    handleFilterChange('endDate', dateString);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSelectedCategory('');
    setSelectedSubcategory('');
    setDateRange({ startDate: '', endDate: '' });
    setAmountRange({ minAmount: '', maxAmount: '' });
    setStartDate(null);
    setEndDate(null);
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

    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, expenseId: '', expenseTitle: '' });
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense({
      id: expense._id,
      data: {
        title: expense.title || '',
        amount: expense.amount || 0,
        category: (expense.category && '_id' in expense.category) ? expense.category._id : '',
        subcategory: expense.subcategory || '',
        expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
      }
    });
    setEditFormData({
      title: expense.title || '',
      amount: expense.amount || 0,
      category: (expense.category && '_id' in expense.category) ? expense.category._id : '',
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
      
      handleEditCancel();
    } catch (error) {
      console.error('Error updating expense:', error);
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

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Expenses', url: '/dashboard/expenses' },
    { label: 'List', url: '/dashboard/expenses/list' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Property Expenses"
        subtitle={`Managing expenses for ${selectedProperty.name}`}
      />
      
          <div>
        <div className='px-4 md:px-6 pt-4 grid gap-2  md:pt-6 md:flex md:flex-row justify-between items-center'>
          <BreadCrumbs items={breadcrumbs} />
          <div className="flex items-center gap-2 py-2">
            {expensesResponse?.data?.expenses && expensesResponse.data.expenses.length > 0 && (
              <Tooltip title="Toggle Filters">
                <IconButton
                  onClick={toggleFilters}
                  className={`${showFilters ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <FilterListIcon className={showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                </IconButton>
              </Tooltip>
            )}
            <button
              onClick={() => router.push('/dashboard/expenses')}
              className="text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-[30px] cursor-pointer font-medium transition-colors flex items-center space-x-1 w-fit"
            >
              <span className="hidden md:block">Add Expense</span>
              <span className="md:hidden">Add Expense</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto px-4 md:px-6 md:pt-4 pt-2">
        {/* Filters Section */}
          <div className={`overflow-hidden transition-all duration-300 ${
            showFilters ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/20 dark:border-gray-700/50 mb-4">
              <div className="flex flex-row justify-between md:flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
                <div>
                  <h2 className="md:text-xl text-base font-bold text-gray-900 dark:text-white mb-2">
                    Filter Expenses
                  </h2>
                </div>
                <button
                  onClick={clearFilters}
                  className="md:mt-4 lg:mt-0 text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-[30px] cursor-pointer font-medium transition-colors flex items-center space-x-1 w-fit"
                >
                  <span className="hidden md:block">Clear All Filters</span>
                  <span className="md:hidden">Clear Filters</span>
                </button>
          </div>
          
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-2 mt-4">
              {/* Category Filter */}
                <div className="space-y-2">
                  <TextField
                    select
                    fullWidth
                    label="Category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All Categories</em>
                    </MenuItem>
                    {categoriesData?.data?.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
              </div>

              {/* Subcategory Filter */}
                <div className="space-y-2">
                  <TextField
                    select
                    fullWidth
                    label="Subcategory"
                  value={selectedSubcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!selectedCategory}
                    size="small"
                  >
                    <MenuItem value="">
                      <em>All Subcategories</em>
                    </MenuItem>
                    {selectedCategory && categoriesData?.data?.find(cat => cat._id === selectedCategory)?.subcategories?.map((subcategory) => (
                      <MenuItem key={subcategory} value={subcategory}>
                      {subcategory.replace(/_/g, ' ')}
                      </MenuItem>
                  ))}
                  </TextField>
              </div>

                {/* Amount Range */}
                <Box display="flex" sx={{ gap: {xs: 1, md: 2} }}>
                  <TextField
                  type="number"
                    placeholder="Min Amount"
                  value={amountRange.minAmount}
                  onChange={(e) => handleAmountRangeChange('minAmount', e.target.value)}
                    size="small"
                    sx={{ minWidth: '120px' }}
                />
                  <TextField
                  type="number"
                    placeholder="Max Amount"
                  value={amountRange.maxAmount}
                  onChange={(e) => handleAmountRangeChange('maxAmount', e.target.value)}
                    size="small"
                    sx={{ minWidth: '120px' }}
                  />
                </Box>

                {/* Date Range */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box display="flex" sx={{ gap: {xs: 1, md: 2} }}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { minWidth: '140px' }
                          },
                        }}
                      />
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { minWidth: '140px' }
                          },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 overflow-hidden mb-5">

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
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto min-h-[500px]">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>No.</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Expense Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Subcategory
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Recorded By
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {expensesResponse?.data?.expenses?.map((expense, index) => (
                        <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150">
                          <td className="px-6 py-4">
                            {index + 1}
                          </td>
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
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getCategoryColor((expense.category && 'name' in expense.category) ? expense.category.name : 'UNKNOWN')}`}>
                              {(expense.category && 'name' in expense.category) ? expense.category.name.replace(/_/g, ' ') : 'Unknown Category'}
                              </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {expense.subcategory.replace(/_/g, ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {formatCurrency(expense.totalAmount || expense.amount || 0)}
                            </div>
                            {expense.taxAmount && expense.taxAmount > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                +{formatCurrency(expense.taxAmount)} tax
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {formatDate(expense.expenseDate)}
                              </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {expense.recordedBy.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                               <button
                                 onClick={() => handleEditClick(expense)}
                                className="text-green-600 dark:text-green-400 p-2 cursor-pointer hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                                 title="Edit Expense"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                 </svg>
                               </button>
                               <button
                                 onClick={() => handleDeleteClick(expense._id, expense.title)}
                                className="text-red-600 p-2 cursor-pointer dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
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
              </div>

              {/* Mobile Accordion View */}
              <div className="md:hidden min-h-[560px]">
                {expensesResponse?.data?.expenses?.map((expense, index) => (
                  <Accordion key={expense._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/50 mb-3" sx={{
                    "&.Mui-expanded": {
                      margin: 0,
                    }
                  }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center space-x-3 w-full justify-between">
                          <div className='flex flex-row items-center gap-3 justify-between w-full'>
                            <div className="flex items-center space-x-3">
                            
                              <div className="flex gap-2 items-center">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base max-w-[180px] md:max-w-none truncate">
                                  {expense.title}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">
                                  {formatCurrency(expense.totalAmount || expense.amount || 0)}
                                </p>
                              </div>
                            </div>
                            <div className='flex flex-row items-center gap-2'>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor((expense.category && 'name' in expense.category) ? expense.category.name : 'UNKNOWN')}`}>
                                {(expense.category && 'name' in expense.category) ? expense.category.name.replace(/_/g, ' ') : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className="bg-gray-50/30 dark:bg-gray-700/30" sx={{
                      padding: '8px 16px',
                    }}>
                      <div className="space-y-4">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Amount
                            </Typography>
                            <Typography variant="body2" className="text-green-700 dark:text-green-400 font-semibold">
                              {formatCurrency(expense.totalAmount || expense.amount || 0)}
                            </Typography>
                            {expense.taxAmount && expense.taxAmount > 0 && (
                              <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                                +{formatCurrency(expense.taxAmount)} tax
                              </Typography>
                            )}
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {formatDate(expense.expenseDate)}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Category
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {(expense.category && 'name' in expense.category) ? expense.category.name.replace(/_/g, ' ') : 'Unknown Category'}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Subcategory
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {expense.subcategory.replace(/_/g, ' ')}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Recorded By
                            </Typography>
                            <Typography variant="body2" className="text-gray-900 dark:text-white">
                              {expense.recordedBy.name}
                            </Typography>
                          </div>
                        </div>
                        
                        {/* Description (if available) */}
                        {expense.description && (
                          <div>
                            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Description
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              {expense.description}
                            </Typography>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(expense._id, expense.title)}
                            className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium border border-red-200 dark:border-red-600 hover:border-red-300 dark:hover:border-red-500 rounded-md transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-700/30"
                          >
                            Delete
                          </button>
                        </div>
                        
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>

              {/* MUI Pagination */}
              {expensesResponse?.data?.pagination && expensesResponse.data.pagination.totalPages > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
                  <TablePagination
                    component="div"
                    count={expensesResponse.data.pagination.totalItems || 0}
                    page={currentPage - 1} // MUI uses 0-based indexing
                    onPageChange={(_, newPage) => setCurrentPage(newPage + 1)} // Convert back to 1-based
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                      const newPageSize = parseInt(e.target.value, 10);
                      setPageSize(newPageSize);
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Rows per page:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                    }
                    sx={{
                      backgroundColor: 'transparent',
                      '& .MuiTablePagination-toolbar': {
                        padding: '8px',
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        color: 'inherit',
                      },
                      "& .MuiInputBase-root":{
                        marginRight:{xs: "4px", md: "16px"}
                      },
                      "& .MuiTablePaginationActions-root":{
                        marginLeft:{xs: "0px", md: "16px"}
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.show}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        sx={{
          // for mobile view
          "@media (max-width: 768px)": {
            "& .MuiPaper-elevation": {
              margin: "16px",
              borderRadius: "16px",
            }
          }
        }}
      >
        <DialogTitle 
          sx={(theme) => ({
            px: {xs: 2, md: 3},
            py: {xs: 1, md: 2},
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            color: theme.palette.mode === 'dark' ? '#f87171' : '#ef4444',
            fontWeight: 600,
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          })}
        >
                Delete Expense
          <IconButton 
            onClick={handleDeleteCancel} 
            disabled={deleteExpenseMutation.isPending}
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
              }
            })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent 
          sx={(theme) => ({
            px: {xs: 2, md: 3},
            paddingBottom: '0px !important',
            backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
            height: '130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <p className='text-md'>
            Are you sure you want to delete <span className='font-medium'>"{deleteConfirm.expenseTitle}"</span>
          </p>
        </DialogContent>
        
        <DialogActions 
          sx={(theme) => ({
            px: {xs: 2, md: 3},
            py: {xs: 1, md: 2}, 
            gap: {xs: 1, md: 2},
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          })}
        >
          <Button
            onClick={handleDeleteCancel}
            disabled={deleteExpenseMutation.isPending}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
              color: '#ffffff',
              px: {xs: 2, md: 3},
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#4b5563',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            })}
                >
                  Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleteExpenseMutation.isPending}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
              color: '#ffffff',
              px: {xs: 2, md: 3},
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            })}
          >
            {deleteExpenseMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <DeleteIcon fontSize="small" sx={{display: {xs: 'none', md: 'block'}}} />
                Delete Expense
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog
        open={!!editingExpense}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
        sx={{
          // for mobile view
          "@media (max-width: 768px)": {
            "& .MuiPaper-elevation": {
              margin: "0px",
              width: "90%",
            }
          }
        }}
      >
        <div className="bg-white dark:bg-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-700 md:px-6 px-4 md:py-4 py-2 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="md:text-xl text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Expense
                </h3>
                <button
                  onClick={handleEditCancel}
                className="text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="md:p-6 p-3 md:space-y-6 space-y-4">
              {/* Basic Information */}
              <div className="md:space-y-4 space-y-2">
                <h4 className="md:text-lg text-base font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 pb-2">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.title
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
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.amount
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
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={editFormData.expenseDate ? new Date(editFormData.expenseDate) : null}
                      onChange={(newValue) => {
                        const dateString = newValue ? newValue.toISOString().split('T')[0] : '';
                        handleEditInputChange('expenseDate', dateString);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!editErrors.expenseDate,
                          helperText: editErrors.expenseDate,
                          size: "small",
                          sx: (theme) => ({
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                              '& fieldset': {
                                borderColor: editErrors.expenseDate 
                                  ? '#ef4444' 
                                  : (theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0'),
                                borderWidth: '1px',
                              },
                              '&:hover fieldset': {
                                borderColor: editErrors.expenseDate 
                                  ? '#dc2626' 
                                  : (theme.palette.mode === 'dark' ? '#64748b' : '#cbd5e1'),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: editErrors.expenseDate ? '#dc2626' : '#3b82f6',
                                boxShadow: editErrors.expenseDate 
                                  ? '0 0 0 2px rgba(239, 68, 68, 0.2)' 
                                  : '0 0 0 2px rgba(59, 130, 246, 0.2)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              padding: '8px 12px',
                            },
                          }),
                        },
                      }}
                    />
                  </LocalizationProvider>
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
                      {categoriesData?.data?.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name.replace(/_/g, ' ')}
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
                      {editFormData.category && categoriesData?.data?.find(cat => cat._id === editFormData.category)?.subcategories?.map((subcategory) => (
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
              <div className="flex justify-end md:space-x-3 space-x-2 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={handleEditCancel}
                className="md:px-6 px-4 md:py-2 py-1 cursor-pointer border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateExpenseMutation.isPending}
                className="md:px-6 px-4 md:py-2 py-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
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
      </Dialog>
    </div>
  );
}
