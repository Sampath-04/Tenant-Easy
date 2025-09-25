'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { useProfitLossByProperty } from '@/hooks/useProfitLoss';
import { useCreateAdditionalIncome } from '@/hooks/useAdditionalIncome';
import { useProperty } from '@/contexts/PropertyContext';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Select, MenuItem, FormControl, InputLabel, Button, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import AdditionalIncomeForm from '@/components/AdditionalIncomeForm';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

const COLORS = {
  income: '#10b981', expenses: '#ef4444', profit: '#3b82f6',
  loss: '#f59e0b', propertyFacility: '#8b5cf6', utilities: '#06b6d4',
  foodKitchen: '#f97316', staffSalaries: '#ec4899', miscellaneous: '#6b7280'
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

export default function ProfitLossPage() {
  const router = useRouter();
  const { selectedProperty } = useProperty();
  const { data: profitLossResponse, isLoading, error } = useProfitLossByProperty(
    selectedProperty?.id || ''
  );

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [additionalIncomeFormOpen, setAdditionalIncomeFormOpen] = useState(false);

  const createAdditionalIncomeMutation = useCreateAdditionalIncome();

  const navigateToBreakdown = (year: number, month: string) => {
    router.push(`/dashboard/profit-loss/breakdown?year=${year}&month=${month}`);
  };

  const handleAdditionalIncomeSubmit = async (data: any) => {
    try {
      await createAdditionalIncomeMutation.mutateAsync(data);
      setAdditionalIncomeFormOpen(false);
    } catch (error) {
      console.error('Failed to create additional income:', error);
    }
  };

  const filteredData = useMemo(() => {
    if (!profitLossResponse?.data) return [];
    if (selectedYear === 'all') return profitLossResponse.data;
    return profitLossResponse.data.filter(record => record.year === selectedYear);
  }, [profitLossResponse?.data, selectedYear]);

  const availableYears = useMemo(() => {
    if (!profitLossResponse?.data) return [];
    const years = [...new Set(profitLossResponse.data.map(record => record.year))];
    return years.sort((a, b) => b - a);
  }, [profitLossResponse?.data]);

  const chartData = useMemo(() => {
    return filteredData.map(record => ({
      month: formatMonth(record.month),
      monthKey: record.month,
      income: record.income.totalAmount,
      expenses: record.expense.totalAmount,
      netProfit: record.financialSummary.netProfit,
      profitMargin: record.financialSummary.profitMargin,
    }));
  }, [filteredData]);

  const summaryStats = useMemo(() => {
    if (!filteredData.length) return null;
    
    const totalIncome = filteredData.reduce((sum, record) => sum + record.income.totalAmount, 0);
    const totalExpenses = filteredData.reduce((sum, record) => sum + record.expense.totalAmount, 0);
    const totalNetProfit = filteredData.reduce((sum, record) => sum + record.financialSummary.netProfit, 0);
    
    return { totalIncome, totalExpenses, totalNetProfit, recordCount: filteredData.length };
  }, [filteredData]);

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader title="Profit & Loss" subtitle="Select a property to view profit & loss data" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Please select a property to view profit & loss data.</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Profit & Loss', url: '/dashboard/profit-loss' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader 
        title="Profit & Loss Analysis"
        subtitle={`Financial performance analysis for ${selectedProperty.name}`}
      />
      <div className="px-4 sm:px-6 lg:px-8 pt-3">
        <BreadCrumbs items={breadcrumbs} />
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pt-3">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-xl font-bold">
              Track financial performance and analyze profitability trends
            </p>
          </div>
          
          {/* Year Filter and Add Income Button */}
          <div className="flex gap-2 items-center space-x-3 mt-4 sm:mt-0">
                   
          <Button
              onClick={() => setAdditionalIncomeFormOpen(true)}
              variant="contained"
              startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>}
              sx={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#059669',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: {xs:"6px 12px", md:"8px 16px"},
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              Add Income
            </Button>

            <FormControl size="small" sx={{ minWidth: 150, }}>
              <InputLabel>Filter by Year</InputLabel>
              <Select
                value={selectedYear === 'all' ? 'all' : selectedYear.toString()}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                label="Filter by Year"
              >
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profit & loss data...</p>
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
            <p className="text-red-600 dark:text-red-400">Error loading profit & loss data. Please try again.</p>
          </div>
        )}

        {/* Data Display */}
        {profitLossResponse?.data && !isLoading && (
          <div>

            <div className='grid grid-cols-1 md:grid-cols-[1fr_500px] gap-4'>
                {/* Detailed Records Table */}
                <div>
                    {/* Summary Cards */}
                    {summaryStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 md:gap-6 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 md:p-4 p-2">
                        <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex gap-2 md:grid flex-col">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Income</p>
                            <p className="md:text-2xl text-lg font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(summaryStats.totalIncome)}
                            </p>
                            </div>
                            <div className="hidden md:block p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            </div>
                        </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 md:p-4 p-2">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 md:grid flex-col">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</p>
                            <p className="md:text-2xl text-lg font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(summaryStats.totalExpenses)}
                            </p>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full hidden md:block">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            </div>
                        </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 md:p-4 p-2">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 md:grid flex-col">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Net Profit/Loss</p>
                            <p className={`md:text-2xl text-lg font-bold ${summaryStats.totalNetProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formatCurrency(summaryStats.totalNetProfit)}
                            </p>
                            </div>
                            <div className={`p-3 rounded-full hidden md:block ${summaryStats.totalNetProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
                            <svg className={`w-6 h-6 ${summaryStats.totalNetProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-[calc(100vh-330px)] overflow-y-scroll">
                        <div className="bg-slate-50 dark:bg-slate-700 md:px-6 px-2 md:py-4 py-2 border-b border-slate-200 dark:border-slate-600">
                            <h3 className="md:text-lg text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                                               Monthly Profit & Loss Records
                   <span className="hidden md:block ml-2 text-sm text-slate-500 dark:text-slate-400 font-normal">
                     (Click any row to view detailed breakdown)
                   </span>
                 </h3>
               </div>

                        {filteredData.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-slate-600 dark:text-slate-400">No profit & loss records found for the selected filters.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expenses</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Profit/Loss</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profit Margin</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                            {filteredData.map((record) => (
                                            <tr 
                                            key={record._id} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150 cursor-pointer group"
                                            onClick={() => navigateToBreakdown(record.year, record.month)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {formatMonth(record.month)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(record.income.totalAmount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(record.expense.totalAmount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    record.financialSummary.netProfit >= 0 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    }`}>
                                                    {formatCurrency(record.financialSummary.netProfit)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${
                                                    record.financialSummary.profitMargin >= 0 
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {record.financialSummary.profitMargin.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        record.status === 'CALCULATED' 
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    </div>
                                                </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile Accordion View */}
                                <div className="md:hidden">
                                    {filteredData.map((record) => (
                                        <Accordion key={record._id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg shadow-lg border border-white/20 dark:border-slate-700/50" sx={{
                                            "&.Mui-expanded": {
                                                margin: 0,
                                            }
                                        }}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMore />}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between w-full pr-4">
                                                    <div className="flex items-center space-x-3 w-full justify-between">
                                                        <div className='flex flex-row items-center gap-3 justify-between w-full'>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                                                    {formatMonth(record.month)}
                                                                </p>
                                                            </div>
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    record.financialSummary.netProfit >= 0 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                }`}>
                                                                    {formatCurrency(record.financialSummary.netProfit)}
                                                                </span>
                                                                <span className={`w-2 h-2 rounded-full ${record.status === 'CALCULATED' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="bg-slate-50/30 dark:bg-slate-700/30" sx={{
                                                padding: '8px 16px',
                                            }}>
                                                <div className="space-y-4">
                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Typography variant="caption" className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                Income
                                                            </Typography>
                                                            <Typography variant="body2" className="text-slate-900 dark:text-slate-100 font-semibold">
                                                                {formatCurrency(record.income.totalAmount)}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                Expenses
                                                            </Typography>
                                                            <Typography variant="body2" className="text-slate-900 dark:text-slate-100 font-semibold">
                                                                {formatCurrency(record.expense.totalAmount)}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                Profit Margin
                                                            </Typography>
                                                            <Typography variant="body2" className={`font-semibold ${
                                                                record.financialSummary.profitMargin >= 0 
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {record.financialSummary.profitMargin.toFixed(1)}%
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="caption" className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                Status
                                                            </Typography>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                record.status === 'CALCULATED' 
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                            }`}>
                                                                {record.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Button */}
                                                    <div className="flex justify-center pt-3 border-t border-slate-200 dark:border-slate-600">
                                                        <button
                                                            onClick={() => navigateToBreakdown(record.year, record.month)}
                                                            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 rounded-md transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                                                        >
                                                            View Detailed Breakdown
                                                        </button>
                                                    </div>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* Charts Section */}
                <div className="grid gap-4 mb-4 w-auto">
                    {/* Income vs Expenses Line Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 md:p-4 p-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        Income vs Expenses Trend
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke={COLORS.income} strokeWidth={3} name="Income" />
                            <Line type="monotone" dataKey="expenses" stroke={COLORS.expenses} strokeWidth={3} name="Expenses" />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Net Profit/Loss Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 md:p-4 p-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        Net Profit/Loss by Month
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                            <Bar dataKey="netProfit" fill={COLORS.profit} name="Net Profit/Loss" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Income Form */}
      <AdditionalIncomeForm
        isOpen={additionalIncomeFormOpen}
        onClose={() => setAdditionalIncomeFormOpen(false)}
        onSubmitCallback={handleAdditionalIncomeSubmit}
      />
    </div>
  );
}
