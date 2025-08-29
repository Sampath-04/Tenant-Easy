'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Box,
  Pagination,
  MenuItem,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CurrencyRupee as CurrencyIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRentRecords, usePropertyRentSummary } from '@/hooks/useRentRecords';
import { useRooms } from '@/hooks/useRooms';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency, formatDateForAPI } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as XLSX from 'xlsx';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import RentRecordsList from '@/app/components/RentRecordsList';


export default function RentRecordsPage() {
  const { selectedProperty } = useProperty();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    tenant: '',
    paymentStatus: '',
    roomNo: '',
  });

  // Date range filter - default to current month
  const getCurrentMonthRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: startOfMonth, endDate: endOfMonth };
  };

  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get rent records with filters
  const { data: rentRecordsResponse, isLoading: recordsLoading, error: recordsError } = useRentRecords({
    propertyId: selectedProperty?.id || '',
    page,
    limit,
    tenant: filters.tenant || undefined,
    paymentStatus: filters.paymentStatus === '' ? undefined : filters.paymentStatus as "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
    search: debouncedSearch || undefined,
    roomNo: filters.roomNo || undefined,
    endDateFrom: formatDateForAPI(dateRange.startDate),
    endDateTo: formatDateForAPI(dateRange.endDate),
  });

  // Get property rent summary with same date range filters
  const { data: summaryResponse, isLoading: summaryLoading } = usePropertyRentSummary(
    selectedProperty?.id || '',
    formatDateForAPI(dateRange.startDate),
    formatDateForAPI(dateRange.endDate),
    filters.paymentStatus === '' ? undefined : filters.paymentStatus as "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
    debouncedSearch || undefined,
    filters.roomNo || undefined,
  );

  // Get rooms for dropdown
  const { data: roomsResponse } = useRooms(selectedProperty?.id || '');
  const rooms = roomsResponse?.data || [];

  const rentRecords = rentRecordsResponse?.data || [];
  const summary = summaryResponse?.data;

  // Handle export functionality
  const handleExport = async () => {
    if (!rentRecords || rentRecords.length === 0) {
      alert('No records to export');
      return;
    }

    try {
      setIsExporting(true);

      // Convert current rent records data to Excel format
      const excelData = rentRecords.map((record: any) => {
        // Process payment history
        let paymentHistoryText = '';
        let paidToText = '';
        let amountText = '';

        if (record.payments && record.payments.length > 0) {
          const paymentDetails = record.payments.map((payment: any) => {
            const proof = payment.paymentProofs ? payment.paymentProofs.join(', ') : '';
            return `${payment.paidTo || 'N/A'} - ${payment.amount || 0} - ${proof}`;
          });
          paymentHistoryText = paymentDetails.join('; ');

          // Separate paidTo and amount for individual columns
          const paidToValues = record.payments.map((payment: any) => payment.paidTo || 'N/A');
          const amountValues = record.payments.map((payment: any) => payment.amount || 0);
          paidToText = paidToValues.join('; ');
          amountText = amountValues.join('; ');
        }

        return {
          'Tenant Name': record.tenant.tenantName,
          'Phone Number': record.tenant.tenantNumber,
          // 'Email': record.tenant.tenantEmail || '',
          'Room Number': record.room.roomNo,
          'Room Type': record.room.roomType,
          'Start Date': formatDate(record.startDate),
          'End Date': formatDate(record.endDate),
          'Month': record.month,
          'Rent Amount': record.rent,
          'Electricity Bill': record.electricityBill,
          'Electricity Units': record.electricityUnits,
          'Total Amount': record.totalAmount,
          'Payment Status': record.paymentStatus,
          'Due Date': formatDate(record.dueDate),
          'Total Paid Amount': record.totalPaidAmount || 0,
          'Remaining Amount': record.remainingAmount || 0,
          'Is Overdue': record.isOverdue ? 'Yes' : 'No',
          'Days Overdue': record.daysOverdue,
          'Last Payment Date': record.lastPaymentDate ? formatDate(record.lastPaymentDate) : '',
          'Previous Cycle Payment Status': record.previousCyclePaymentStatus,
          'Previous Cycle Month': record.previousCycleMonth || '',
          'Has Notice': record.notice ? 'Yes' : 'No',
          'Notice Status': record.notice ? record.notice.status : '',
          'Notice End Date': record.notice ? formatDate(record.notice.noticeEndsOn) : '',
          'Paid To': paidToText,
          'Payment Amount': amountText,
          'Payment History (PaidTo - Amount - Proof)': paymentHistoryText,
        };
      });

      // Create and download Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Records');

      // Add summary section at the end
      if (summary) {
        const summaryData = [
          { 'Metric': 'SUMMARY', 'Value': '' },
          { 'Metric': 'Total Amount', 'Value': formatCurrency(summary.totalAmount || 0) },
          { 'Metric': 'Paid Count', 'Value': summary.paidCount || 0 },
          { 'Metric': 'Pending Count', 'Value': summary.pendingCount || 0 },
          { 'Metric': 'Overdue Count', 'Value': summary.overdueCount || 0 },
          { 'Metric': 'Paid Amount', 'Value': formatCurrency(summary.paidAmount || 0) },
          { 'Metric': 'Pending Amount', 'Value': formatCurrency(summary.pendingAmount || 0) },
          { 'Metric': 'Overdue Amount', 'Value': formatCurrency(summary.overdueAmount || 0) },
        ];

        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      }

      // Generate filename with current date range
      const startDateStr = formatDateForAPI(dateRange.startDate);
      const endDateStr = formatDateForAPI(dateRange.endDate);
      const fileName = `rent-records-${startDateStr}-to-${endDateStr}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // Reset states
      setExportDialogOpen(false);
      setIsExporting(false);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Failed to generate Excel file');
      setIsExporting(false);
    }
  };

  // Filter rents based on search term
  const filteredRents = useMemo(() => {
    if (!rentRecords) return [];

    return rentRecords.filter(rent =>
      rent.tenant.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      rent.tenant.tenantNumber.includes(debouncedSearch)
    );
  }, [rentRecords, debouncedSearch]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
      setDateRange({ startDate, endDate });
      setPage(1); // Reset to first page when date range changes
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (recordsError) {
    return (
      <div className="p-6">
        <Alert severity="error">
          Failed to load rent records. Please try again.
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Rent Records', url: '/dashboard/rent-records' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="All Rent Records"
        subtitle={`${selectedProperty?.name || 'Property'} - Complete Rent History`}
      />
      <BreadCrumbs items={breadcrumbs} />

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">

            {/* Summary Cards */}
            {
              summaryLoading ? (
                <div className="flex justify-center items-center py-12">
                  <CircularProgress />
                </div>
              ) : (
                (summary || !summaryLoading) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                              {summaryLoading ? <CircularProgress size={24} /> : formatCurrency(summary?.totalAmount || 0)}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Total Amount
                            </Typography>
                          </div>
                          <CurrencyIcon className="text-3xl text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent className="p-6">
                        <div>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                                  {summaryLoading ? <CircularProgress size={24} /> : (summary?.overdueCount || 0)}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Overdue Count
                                </Typography>
                              </div>
                              <WarningIcon className="text-3xl text-red-500 dark:text-red-400 self-start" />
                            </div>
                            <Typography variant="h6" className="font-semibold text-red-600 dark:text-red-400">
                              {summaryLoading ? <CircularProgress size={16} /> : formatCurrency(summary?.overdueAmount || 0)}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Overdue Amount
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                      borderRadius: '12px',
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                    }}>
                      <CardContent className="p-6">
                        <div>
                          <div>
                            <div className='flex justify-between gap-2 items-center'>
                              <div>
                                <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                                  {summaryLoading ? <CircularProgress size={24} /> : (summary?.pendingCount || 0)}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                                  Pending Count
                                </Typography>
                              </div>
                              <ScheduleIcon className="text-3xl text-green-600 dark:text-green-400 self-start" />
                            </div>
                            <Typography variant="h6" className="font-semibold text-green-600 dark:text-green-400">
                              {summaryLoading ? <CircularProgress size={16} /> : formatCurrency(summary?.pendingAmount || 0)}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              Pending Amount
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {rentRecordsResponse?.count || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Total Records
                        </Typography>
                      </div>
                      <PersonIcon className="text-3xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card> */}

                  </div>
                ))}

            {/* Filter Toggle and Export Button */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={toggleFilters}
                size="small"
                sx={{
                  borderColor: showFilters ? '#3b82f6' : '#9ca3af',
                  color: showFilters ? '#3b82f6' : '#9ca3af',
                  '&:hover': {
                    borderColor: showFilters ? '#2563eb' : '#6b7280',
                    backgroundColor: showFilters ? 'rgba(59, 130, 246, 0.04)' : 'rgba(156, 163, 175, 0.04)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
                size="small"
                sx={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                Export
              </Button>
            </div>

            {/* Search and Filter */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <TextField
                      fullWidth
                      placeholder="Search by tenant name, phone number..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                      }}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: '12px',
                          padding: '4px 10px',
                        }
                      }}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <TextField
                      select
                      fullWidth
                      label="Room"
                      value={filters.roomNo}
                      onChange={(e) => handleFilterChange('roomNo', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Rooms</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room._id} value={room.roomNo}>
                          Room {room.roomNo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  <div className="w-full md:w-48">
                    <TextField
                      select
                      fullWidth
                      label="Payment Status"
                      value={filters.paymentStatus}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Status</em>
                      </MenuItem>
                      <MenuItem value="FULLY_PAID">Fully Paid</MenuItem>
                      <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                      <MenuItem value="NOT_PAID">Not Paid</MenuItem>
                    </TextField>
                  </div>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="w-full md:w-48">
                      <DatePicker
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={(newValue) => handleDateRangeChange(newValue, dateRange.endDate)}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <DatePicker
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={(newValue) => handleDateRangeChange(dateRange.startDate, newValue)}
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                </div>
              </div>
            )}

            {/* Rent Records List */}
            {recordsLoading ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress />
              </div>
            ) : (
              <RentRecordsList
                filteredRents={filteredRents}
              />
            )}

            {/* Pagination */}
            {!recordsLoading && rentRecordsResponse && rentRecordsResponse.pagination.totalPages > 1 && (
              <Box className="flex justify-center mt-6">
                <Pagination
                  count={rentRecordsResponse.pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

          </div>
        </div>
      </main>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme: Theme) => ({
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8fafc',
          }
        })}
      >
        <DialogTitle className="flex items-center justify-between">
          <Typography variant="h6" className="font-semibold">Export Rent Records</Typography>
          <IconButton onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box className="space-y-4">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Export the currently filtered rent records to Excel. The export will include all records matching your current filters.
            </Typography>

            <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Typography variant="body2" className="text-blue-800 dark:text-blue-300">
                <strong>Current Filters:</strong><br />
                Date Range: {formatDate(dateRange.startDate.toISOString())} to {formatDate(dateRange.endDate.toISOString())}<br />
                {filters.search && `Search: ${filters.search}<br />`}
                {filters.roomNo && `Room: ${filters.roomNo}<br />`}
                {filters.paymentStatus && `Payment Status: ${filters.paymentStatus.replace('_', ' ')}<br />`}
                Records to export: {rentRecords.length}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: '20px', gap: '10px' }}>
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !rentRecords || rentRecords.length === 0}
            variant="contained"
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
              },
            }}
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
