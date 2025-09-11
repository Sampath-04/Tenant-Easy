'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  PieChart as PieChartIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
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
import { generateRefundsExcel, generateProfitLossExcel, generateTenantAnalysisExcel } from '@/lib/utils/excelExport';

// Import existing export functions
import { getRentRecordsForExport } from '@/lib/api/rentHistory';
import { getRefundsForExport } from '@/lib/api/refunds';
import { getProfitLossByProperty } from '@/lib/api/profitLoss';
import { getTenantAnalysis, getTenantAnalysisSummary } from '@/lib/api/tenants';
import { generateRentHistoryExcel } from '@/lib/utils/excelExport';

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresDateRange: boolean;
  exportFunction: (propertyId: string, ...args: any[]) => Promise<any>;
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
  },
  {
    id: 'tenant-analysis',
    title: 'Tenant Analysis Report',
    description: 'Export comprehensive tenant analysis with payment status, tenure, and financial summaries',
    icon: <PeopleIcon />,
    color: 'bg-orange-500',
    requiresDateRange: false,
    exportFunction: async (propertyId: string) => {
      const [analysisData, summaryData] = await Promise.all([
        getTenantAnalysis(propertyId),
        getTenantAnalysisSummary(propertyId)
      ]);
      return { analysisData: analysisData.data.tenants, summaryData: summaryData.data };
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
  
  // Month/Year filter states for profit & loss
  const [monthFrom, setMonthFrom] = useState<string>('');
  const [monthTo, setMonthTo] = useState<string>('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [profitLossDialogOpen, setProfitLossDialogOpen] = useState(false);

  // Update month values when year changes
  useEffect(() => {
    if (year && monthFrom) {
      const month = monthFrom.split('-')[1];
      setMonthFrom(`${year}-${month}`);
    }
    if (year && monthTo) {
      const month = monthTo.split('-')[1];
      setMonthTo(`${year}-${month}`);
    }
  }, [year]);

  const handleReportSelect = async (report: ReportOption) => {
    if (report.id === 'tenant-analysis') {
      // Directly export tenant analysis without dialog
      if (!selectedProperty) return;
      
      setIsExporting(true);
      try {
        const response = await report.exportFunction(selectedProperty.id);
        await generateTenantAnalysisExcel(response.analysisData, response.summaryData);
        
        const { message, config } = showSuccessToast('Tenant Analysis Report exported successfully!');
        toast.success(message, config);
      } catch (error: any) {
        console.error('Export failed:', error);
        const { message, config } = showErrorToast(error.message || 'Failed to export tenant analysis report');
        toast.error(message, config);
      } finally {
        setIsExporting(false);
      }
    } else if (report.id === 'profit-loss') {
      setSelectedReport(report);
      setProfitLossDialogOpen(true);
      // Reset profit & loss filters
      setMonthFrom('');
      setMonthTo('');
      setYear(new Date().getFullYear());
    } else {
      setSelectedReport(report);
      setDialogOpen(true);
      // Reset dates when opening dialog
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleExport = async () => {
    if (!selectedReport || !selectedProperty) return;

    // Validate date range for reports that require it
    if (selectedReport.requiresDateRange && (!startDate || !endDate)) {
      const { message, config } = showErrorToast('Please select both start and end dates');
      toast.error(message, config);
      return;
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

  const handleProfitLossExport = async () => {
    if (!selectedProperty) return;

    // Validate required fields
    if (!monthFrom || !monthTo || !year) {
      const { message, config } = showErrorToast('Please select month range and year');
      toast.error(message, config);
      return;
    }

    setIsExporting(true);

    try {
      const response = await getProfitLossByProperty(
        selectedProperty.id,
        undefined, // month
        year || undefined,
        undefined, // status
        monthFrom || undefined,
        monthTo || undefined,
        undefined, // yearFrom
        undefined  // yearTo
      );

      // Generate Excel file based on report type
      await generateExcelReport('profit-loss', response, null, null);

      const { message, config } = showSuccessToast('Profit & Loss Report exported successfully!');
      toast.success(message, config);

      setProfitLossDialogOpen(false);
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

      case 'tenant-analysis':
        await generateTenantAnalysisExcel(data.analysisData, data.summaryData);
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

  const handleProfitLossClose = () => {
    setProfitLossDialogOpen(false);
    setSelectedReport(null);
    // Reset profit & loss filters
    setMonthFrom('');
    setMonthTo('');
    setYear(new Date().getFullYear());
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

      <div className='px-6 pt-6'>
        <BreadCrumbs items={breadcrumbs} />
      </div>
      
      <div className="px-4 sm:px-6 pt-3">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {reportOptions.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:scale-105 transition-transform duration-200 grid grid-rows-[auto_1fr_auto] gap-2"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-xl ${report.color} text-white mr-4 shadow-lg`}>
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
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
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 px-6 py-3 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <DownloadIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedReport?.title}
                  </h2>
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

      {/* Profit & Loss Dialog */}
      <Dialog
        open={profitLossDialogOpen}
        onClose={handleProfitLossClose}
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
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 px-6 py-3 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <PieChartIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Profit & Loss Report
                  </h2>
                </div>
              </div>
              <button
                onClick={handleProfitLossClose}
                disabled={isExporting}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 disabled:opacity-50 group"
              >
                <CloseIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 bg-white dark:bg-slate-800">
            <div className="space-y-4">
              

              <div className='flex justify-between items-center gap-4'>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Select Month Range & Year
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-48">
                  <FormControl fullWidth size="small">
                    <InputLabel 
                      sx={{
                        color: 'rgb(71 85 105)',
                        '&.Mui-focused': {
                          color: 'rgb(147 51 234)',
                        },
                        '.dark &': {
                          color: 'rgb(203 213 225)',
                          '&.Mui-focused': {
                            color: 'rgb(196 181 253)',
                          },
                        },
                      }}
                    >
                      Year *
                    </InputLabel>
                    <Select
                      value={year}
                      onChange={(e) => setYear(e.target.value as number | '')}
                      label="Year *"
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: 'rgb(248 250 252)',
                        color: 'rgb(15 23 42)',
                        '&:hover': {
                          backgroundColor: 'rgb(241 245 249)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(226 232 240)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(148 163 184)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(147 51 234)',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgb(71 85 105)',
                        },
                        '.dark &': {
                          backgroundColor: 'rgb(51 65 85)',
                          color: 'rgb(241 245 249)',
                          '&:hover': {
                            backgroundColor: 'rgb(71 85 105)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgb(30 41 59)',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgb(71 85 105)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgb(148 163 184)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgb(196 181 253)',
                          },
                          '& .MuiSelect-icon': {
                            color: 'rgb(203 213 225)',
                          },
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: 'white',
                            color: 'rgb(15 23 42)',
                            '& .MuiMenuItem-root': {
                              color: 'rgb(15 23 42)',
                              '&:hover': {
                                backgroundColor: 'rgb(248 250 252)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgb(147 51 234)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgb(126 34 206)',
                                },
                              },
                            },
                            '.dark &': {
                              backgroundColor: 'rgb(30 41 59)',
                              color: 'rgb(241 245 249)',
                              '& .MuiMenuItem-root': {
                                color: 'rgb(241 245 249)',
                                '&:hover': {
                                  backgroundColor: 'rgb(51 65 85)',
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgb(147 51 234)',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'rgb(126 34 206)',
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormControl fullWidth size="small">
                  <InputLabel 
                    sx={{
                      color: 'rgb(71 85 105)',
                      '&.Mui-focused': {
                        color: 'rgb(147 51 234)',
                      },
                      '.dark &': {
                        color: 'rgb(203 213 225)',
                        '&.Mui-focused': {
                          color: 'rgb(196 181 253)',
                        },
                      },
                    }}
                  >
                    From Month *
                  </InputLabel>
                     <Select
                       value={monthFrom ? parseInt(monthFrom.split('-')[1]) : ''}
                       onChange={(e) => {
                         const month = e.target.value as number | '';
                         if (month && year) {
                           setMonthFrom(`${year}-${String(month).padStart(2, '0')}`);
                         } else {
                           setMonthFrom('');
                         }
                       }}
                       label="From Month *"
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: 'rgb(248 250 252)',
                      color: 'rgb(15 23 42)',
                      '&:hover': {
                        backgroundColor: 'rgb(241 245 249)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(226 232 240)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(148 163 184)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(147 51 234)',
                      },
                      '& .MuiSelect-icon': {
                        color: 'rgb(71 85 105)',
                      },
                      '.dark &': {
                        backgroundColor: 'rgb(51 65 85)',
                        color: 'rgb(241 245 249)',
                        '&:hover': {
                          backgroundColor: 'rgb(71 85 105)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgb(30 41 59)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(71 85 105)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(148 163 184)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(196 181 253)',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgb(203 213 225)',
                        },
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          color: 'rgb(15 23 42)',
                          '& .MuiMenuItem-root': {
                            color: 'rgb(15 23 42)',
                            '&:hover': {
                              backgroundColor: 'rgb(248 250 252)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgb(147 51 234)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgb(126 34 206)',
                              },
                            },
                          },
                          '.dark &': {
                            backgroundColor: 'rgb(30 41 59)',
                            color: 'rgb(241 245 249)',
                            '& .MuiMenuItem-root': {
                              color: 'rgb(241 245 249)',
                              '&:hover': {
                                backgroundColor: 'rgb(51 65 85)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgb(147 51 234)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgb(126 34 206)',
                                },
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel 
                    sx={{
                      color: 'rgb(71 85 105)',
                      '&.Mui-focused': {
                        color: 'rgb(147 51 234)',
                      },
                      '.dark &': {
                        color: 'rgb(203 213 225)',
                        '&.Mui-focused': {
                          color: 'rgb(196 181 253)',
                        },
                      },
                    }}
                  >
                    To Month *
                  </InputLabel>
                     <Select
                       value={monthTo ? parseInt(monthTo.split('-')[1]) : ''}
                       onChange={(e) => {
                         const month = e.target.value as number | '';
                         if (month && year) {
                           setMonthTo(`${year}-${String(month).padStart(2, '0')}`);
                         } else {
                           setMonthTo('');
                         }
                       }}
                       label="To Month *"
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: 'rgb(248 250 252)',
                      color: 'rgb(15 23 42)',
                      '&:hover': {
                        backgroundColor: 'rgb(241 245 249)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(226 232 240)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(148 163 184)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(147 51 234)',
                      },
                      '& .MuiSelect-icon': {
                        color: 'rgb(71 85 105)',
                      },
                      '.dark &': {
                        backgroundColor: 'rgb(51 65 85)',
                        color: 'rgb(241 245 249)',
                        '&:hover': {
                          backgroundColor: 'rgb(71 85 105)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgb(30 41 59)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(71 85 105)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(148 163 184)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgb(196 181 253)',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgb(203 213 225)',
                        },
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: 'white',
                          color: 'rgb(15 23 42)',
                          '& .MuiMenuItem-root': {
                            color: 'rgb(15 23 42)',
                            '&:hover': {
                              backgroundColor: 'rgb(248 250 252)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgb(147 51 234)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgb(126 34 206)',
                              },
                            },
                          },
                          '.dark &': {
                            backgroundColor: 'rgb(30 41 59)',
                            color: 'rgb(241 245 249)',
                            '& .MuiMenuItem-root': {
                              color: 'rgb(241 245 249)',
                              '&:hover': {
                                backgroundColor: 'rgb(51 65 85)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgb(147 51 234)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgb(126 34 206)',
                                },
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 flex justify-end gap-3">
            <button
              onClick={handleProfitLossClose}
              disabled={isExporting}
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProfitLossExport}
              disabled={isExporting || !monthFrom || !monthTo || !year}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
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
