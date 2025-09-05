'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useProfitLossByProperty } from '@/hooks/useProfitLoss';
import { useProperty } from '@/contexts/PropertyContext';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = {
  // Expense categories
  propertyFacility: '#8b5cf6',
  utilities: '#06b6d4',
  foodKitchen: '#f97316',
  staffSalaries: '#ec4899',
  miscellaneous: '#6b7280',
  
  // Income categories
  rent: '#10b981',
  securityDeposits: '#3b82f6',
  other: '#f59e0b',
  
  // Payment methods
  cash: '#84cc16',
  bankTransfer: '#06b6d4',
  online: '#8b5cf6',
  upi: '#ec4899'
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);
};

const formatMonth = (monthString: string) => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function ProfitLossBreakdownPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedProperty } = useProperty();
  const { data: profitLossResponse, isLoading, error } = useProfitLossByProperty(
    selectedProperty?.id || ''
  );

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | 'all'>('all');

  // Set initial filters from URL parameters
  useEffect(() => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (yearParam && monthParam) {
      setSelectedYear(parseInt(yearParam));
      setSelectedMonth(monthParam);
    }
  }, [searchParams]);

  const filteredData = useMemo(() => {
    if (!profitLossResponse?.data) return [];
    let filtered = profitLossResponse.data;
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(record => record.year === selectedYear);
    }
    
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(record => record.month === selectedMonth);
    }
    
    return filtered;
  }, [profitLossResponse?.data, selectedYear, selectedMonth]);

  const availableYears = useMemo(() => {
    if (!profitLossResponse?.data) return [];
    const years = [...new Set(profitLossResponse.data.map(record => record.year))];
    return years.sort((a, b) => b - a);
  }, [profitLossResponse?.data]);

  const availableMonths = useMemo(() => {
    if (!profitLossResponse?.data) return [];
    const months = [...new Set(profitLossResponse.data.map(record => record.month))];
    return months.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [profitLossResponse?.data]);

  // Prepare expense category data for charts
  const expenseCategoryData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const categoryTotals = {
      propertyFacility: 0,
      utilities: 0,
      foodKitchen: 0,
      staffSalaries: 0,
      miscellaneous: 0
    };

    filteredData.forEach(record => {
      if (record.expenses?.categoryBreakdown) {
        Object.keys(categoryTotals).forEach(category => {
          categoryTotals[category as keyof typeof categoryTotals] += 
            record.expenses.categoryBreakdown[category as keyof typeof categoryTotals] || 0;
        });
      }
    });

    return Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        name: category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value,
        category
      }));
  }, [filteredData]);

  // Prepare income category data for charts
  const incomeCategoryData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const categoryTotals = {
      rent: 0,
      securityDeposits: 0,
      other: 0
    };

         filteredData.forEach(record => {
       if (record.income?.categoryBreakdown) {
         Object.keys(categoryTotals).forEach(category => {
           categoryTotals[category as keyof typeof categoryTotals] += 
             record.income.categoryBreakdown![category as keyof typeof categoryTotals] || 0;
         });
       }
     });

    return Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        name: category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value,
        category
      }));
  }, [filteredData]);

  // Prepare payment method data
  const paymentMethodData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const methodTotals = {
      cash: 0,
      bankTransfer: 0,
      online: 0
    };

         filteredData.forEach(record => {
       if (record.income?.methodBreakdown) {
         Object.keys(methodTotals).forEach(method => {
           methodTotals[method as keyof typeof methodTotals] += 
             record.income.methodBreakdown![method as keyof typeof methodTotals] || 0;
         });
       }
     });

    return Object.entries(methodTotals)
      .filter(([_, value]) => value > 0)
      .map(([method, value]) => ({
        name: method.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value,
        method
      }));
  }, [filteredData]);

  // Prepare daily breakdown data
  const dailyBreakdownData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const dailyData: { [key: string]: { income: number; expenses: number; date: string } } = {};
    
    filteredData.forEach(record => {
      if (record.income?.dailyBreakdown) {
        record.income.dailyBreakdown.forEach(daily => {
          const date = daily.date;
          if (!dailyData[date]) {
            dailyData[date] = { income: 0, expenses: 0, date };
          }
          dailyData[date].income += daily.amount;
        });
      }
      
      // For expenses, we'll use the total amount for the month
      if (record.expenses?.totalAmount) {
        const date = record.month + '-01'; // Use first day of month for expenses
        if (!dailyData[date]) {
          dailyData[date] = { income: 0, expenses: 0, date };
        }
        dailyData[date].expenses += record.expenses.totalAmount;
      }
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader title="Profit & Loss Breakdown" subtitle="Select a property to view detailed breakdown" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Please select a property to view profit & loss breakdown.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Category Breakdown Analysis "
        subtitle={`Detailed category analysis for ${selectedProperty.name}`}
      />
      
      <div className="px-4 sm:px-6 lg:px-8 pt-3">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
             <p className="text-slate-600 dark:text-slate-400 text-xl font-bold">
               Detailed view of income and expense categories, payment methods, and daily flows 
               {selectedMonth !== 'all' && (
                 <span className="ml-3 text-md text-blue-600 dark:text-blue-400 font-normal">
                   ({formatMonth(selectedMonth)})
                 </span>
               )}
             </p>
          </div>
          
            {/* Filters and Navigation */}
           <div className="flex items-center space-x-3 mt-4 sm:mt-0">
             <button
               onClick={() => router.push('/dashboard/profit-loss')}
               className="px-4 py-2 bg-slate-100 cursor-pointer dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-150 flex items-center space-x-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
               <span>Back to Overview</span>
             </button>
             
             <select
               value={selectedYear}
               onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
               className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="all">All Years</option>
               {availableYears.map(year => (
                 <option key={year} value={year}>{year}</option>
               ))}
             </select>
             
             <select
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="all">All Months</option>
               {availableMonths.map(month => (
                 <option key={month} value={month}>{formatMonth(month)}</option>
               ))}
             </select>
           </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading breakdown data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400">Error loading breakdown data. Please try again.</p>
          </div>
        )}

        {/* Data Display */}
        {profitLossResponse?.data && !isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Income</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(filteredData.reduce((sum, record) => sum + (record.income?.totalAmount || 0), 0))}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(filteredData.reduce((sum, record) => sum + (record.expenses?.totalAmount || 0), 0))}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Net Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(filteredData.reduce((sum, record) => sum + (record.financialSummary?.netProfit || 0), 0))}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Records</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {filteredData.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
              {/* Expense Category Breakdown */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Expense Category Breakdown
                </h3>
                {expenseCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                     <Pie
                         data={expenseCategoryData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-slate-600 dark:text-slate-400">No expense data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Income Category Breakdown */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Income Category Breakdown
                </h3>
                {incomeCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                     <Pie
                         data={incomeCategoryData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                        {incomeCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💰</div>
                      <p className="text-slate-600 dark:text-slate-400">No income data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods and Daily Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
              {/* Payment Methods */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Payment Methods
                </h3>
                {paymentMethodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💳</div>
                      <p className="text-slate-600 dark:text-slate-400">No payment method data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Income vs Expenses Flow */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Daily Income vs Expenses Flow
                </h3>
                {dailyBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailyBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="income" stackId="1" stroke={COLORS.rent} fill={COLORS.rent} fillOpacity={0.6} name="Income" />
                      <Area type="monotone" dataKey="expenses" stackId="1" stroke={COLORS.staffSalaries} fill={COLORS.staffSalaries} fillOpacity={0.6} name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📈</div>
                      <p className="text-slate-600 dark:text-slate-400">No daily breakdown data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
