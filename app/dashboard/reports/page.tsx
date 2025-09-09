'use client';

import React, { useState } from 'react';
import {
  Dialog,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  PieChart as PieChartIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import { formatDateForAPI } from '@/lib/utils/formatters';
import { showErrorToast, showSuccessToast } from '@/lib/toast-config';
import { toast } from 'react-toastify';
import { generateRefundsExcel, generateProfitLossExcel } from '@/lib/utils/excelExport';

// Import existing export functions
import { getRentRecordsForExport } from '@/lib/api/rentHistory';
import { getRefundsForExport } from '@/lib/api/refunds';
import { getProfitLossByProperty } from '@/lib/api/profitLoss';
import { generateRentHistoryExcel } from '@/lib/utils/excelExport';

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresDateRange: boolean;
  exportFunction: (propertyId: string, startDate?: string, endDate?: string) => Promise<any>;
}

const reportOptions: ReportOption[] = [
  {
    id: 'rent-history',
    title: 'Rent History Report',
    description: 'Export comprehensive rent records with payment history, tenant details, and financial summaries',
    icon: <ReceiptIcon />,
    color: 'bg-blue-500',
    requiresDateRange: true,
    exportFunction: async (propertyId: string, startDate?: string, endDate?: string) => {
      if (!startDate || !endDate) throw new Error('Date range is required for rent history report');
      return await getRentRecordsForExport(propertyId, startDate, endDate);
    }
  },
  {
    id: 'refunds',
    title: 'Refunds Report',
    description: 'Export refund records with tenant details, deductions, and processing information',
    icon: <AssessmentIcon />,
    color: 'bg-green-500',
    requiresDateRange: true,
    exportFunction: async (propertyId: string, startDate?: string, endDate?: string) => {
      if (!startDate || !endDate) throw new Error('Date range is required for refunds report');
      return await getRefundsForExport(propertyId, {
        processedAtFrom: startDate,
        processedAtTo: endDate,
      });
    }
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss Report',
    description: 'Export profit and loss analysis with income, expenses, and financial summaries',
    icon: <PieChartIcon />,
    color: 'bg-purple-500',
    requiresDateRange: false,
    exportFunction: async (propertyId: string) => {
      return await getProfitLossByProperty(propertyId);
    }
  }
];

export default function ReportsPage() {
  const { selectedProperty } = useProperty();
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleReportSelect = (report: ReportOption) => {
    setSelectedReport(report);
    setDialogOpen(true);
    // Reset dates when opening dialog
    setStartDate(null);
    setEndDate(null);
  };

  const handleExport = async () => {
    if (!selectedReport || !selectedProperty) return;

    // Validate date range for reports that require it
    if (selectedReport.requiresDateRange && (!startDate || !endDate)) {
      const { message, config } = showErrorToast('Please select both start and end dates');
      toast.error(message, config);
      return;
    }

    // Check if date range is more than 2 months for date-based reports
    if (selectedReport.requiresDateRange && startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 60) {
        const { message, config } = showErrorToast('Please select a date range of maximum 2 months (60 days)');
        toast.error(message, config);
        return;
      }
    }

    setIsExporting(true);

    try {
      let response;
      
      if (selectedReport.requiresDateRange && startDate && endDate) {
        response = await selectedReport.exportFunction(
          selectedProperty.id,
          formatDateForAPI(startDate),
          formatDateForAPI(endDate)
        );
      } else {
        response = await selectedReport.exportFunction(selectedProperty.id);
      }

      // Generate Excel file based on report type
      await generateExcelReport(selectedReport.id, response, startDate, endDate);

      const { message, config } = showSuccessToast(`${selectedReport.title} exported successfully!`);
      toast.success(message, config);

      setDialogOpen(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      const { message, config } = showErrorToast(error.message || 'Failed to export report');
      toast.error(message, config);
    } finally {
      setIsExporting(false);
    }
  };

  const generateExcelReport = async (reportType: string, data: any, startDate?: Date | null, endDate?: Date | null) => {
    switch (reportType) {
      case 'rent-history':
        await generateRentHistoryExcel(data.data, data.summary, startDate, endDate);
        return; 

      case 'refunds':
        await generateRefundsExcel(data.data, data.statistics, startDate, endDate);
        return; 

      case 'profit-loss':
        await generateProfitLossExcel(data.data);
        return; 

      default:
        throw new Error('Unknown report type');
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
    setStartDate(null);
    setEndDate(null);
  };

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Reports', url: '/dashboard/reports' },
  ];

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader title="Reports" subtitle="Select a property to generate reports" />
        <div className="px-4 sm:px-6 lg:px-8 pt-3">
          <BreadCrumbs items={breadcrumbs} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <DescriptionIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Please select a property to generate reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader
        title="Reports"
        subtitle={`Generate Excel reports for ${selectedProperty.name}`}
      />
      
      <div className="px-4 sm:px-6 lg:px-8 pt-3">
        <BreadCrumbs items={breadcrumbs} />
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Available Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Select a report type to generate Excel exports with comprehensive data analysis
            </p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportOptions.map((report) => (
            <div
              key={report.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1"
              onClick={() => handleReportSelect(report)}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-xl ${report.color} text-white mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {report.title}
                  </h3>
                  {report.requiresDateRange && (
                    <div className="flex items-center mt-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-2">
                        <CalendarIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        Date Range Required
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                {report.description}
              </p>
              
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReportSelect(report);
                }}
              >
                <DownloadIcon className="h-5 w-5" />
                Generate Report
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            background: 'transparent',
          }
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 px-6 py-5 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <DownloadIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedReport?.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Generate comprehensive Excel report
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isExporting}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 disabled:opacity-50 group"
              >
                <CloseIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 bg-white dark:bg-slate-800">
            {/* <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedReport?.description}
              </p>
            </div> */}

            {selectedReport?.requiresDateRange && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Select Date Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Start Date *
                      </label>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select start date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: 'rgb(248 250 252)',
                                '&:hover': {
                                  backgroundColor: 'rgb(241 245 249)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'white',
                                },
                                '& fieldset': {
                                  borderColor: 'rgb(226 232 240)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgb(148 163 184)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'rgb(59 130 246)',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: 'rgb(15 23 42)',
                                fontSize: '0.875rem',
                              },
                            }
                          },
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        End Date *
                      </label>
                      <DatePicker
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select end date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: 'rgb(248 250 252)',
                                '&:hover': {
                                  backgroundColor: 'rgb(241 245 249)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'white',
                                },
                                '& fieldset': {
                                  borderColor: 'rgb(226 232 240)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgb(148 163 184)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'rgb(59 130 246)',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: 'rgb(15 23 42)',
                                fontSize: '0.875rem',
                              },
                            }
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </LocalizationProvider>
            )}

          
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (selectedReport?.requiresDateRange && (!startDate || !endDate))}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {isExporting ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  Generating...
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4" />
                  Generate Excel Report
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
