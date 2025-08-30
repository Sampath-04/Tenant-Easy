'use client';

import React, { useState, useMemo } from 'react';
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
  Chip,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Theme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  CurrencyRupee as CurrencyIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useOnboardedCompletedPayments } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import TenantOnboardSummaryCards from '@/components/TenantOnboardSummaryCards';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

export default function TenantOnboardCompletedPage() {
  const { selectedProperty } = useProperty();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    roomNo: '',
    startCheckInDate: null as Date | null,
    endCheckInDate: null as Date | null,
  });
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get onboarding completed payments
  const { data: completedResponse, isLoading, error } = useOnboardedCompletedPayments(selectedProperty?.id || '', {
    page,
    limit,
    room: filters.roomNo || undefined,
    search: debouncedSearch || undefined,
    startCheckInDate: filters.startCheckInDate?.toISOString().split('T')[0] || undefined,
    endCheckInDate: filters.endCheckInDate?.toISOString().split('T')[0] || undefined,
  });

  // Get rooms for dropdown
  const { data: roomsResponse } = useRooms(selectedProperty?.id || '');
  const rooms = roomsResponse?.data || [];

  const completedTenants = completedResponse?.data || [];
  const summary = completedResponse?.summary;

  // Handle export functionality
  const handleExport = async () => {
    if (!completedTenants || completedTenants.length === 0) {
      alert('No records to export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Convert completed tenants data to Excel format
      const excelData = completedTenants.map((tenant: any) => {
        return {
          'Tenant Name': tenant.tenantName,
          'Phone Number': tenant.tenantNumber,
          'Email': tenant.tenantEmail || '',
          'Room Number': tenant.room.roomNo,
          'Room Type': tenant.room.roomType,
          'Check-in Date': formatDate(tenant.checkInDate),
          'Monthly Rent': formatCurrency(tenant.monthlyRent),
          'Security Deposit Total': formatCurrency(tenant.securityDepositTotal),
          'Security Deposit Paid': formatCurrency(tenant.securityDepositPaid),
          'Onboarding Rent Paid': formatCurrency(tenant.totalOnboardingRentPaid),
          'Total Amount Collected': formatCurrency(tenant.totalAmountCollected || 0),
          'Status': tenant.status,
        };
      });

      // Create and download Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Tenants');
      
      // Add summary section
      if (summary) {
        const summaryData = [
          { 'Metric': 'SUMMARY', 'Value': '' },
          { 'Metric': 'Total Tenants', 'Value': summary.totalTenants },
          { 'Metric': 'Total Security Collected', 'Value': formatCurrency(summary.totalSecurityDepositCollected || 0) },
          { 'Metric': 'Total Rent Collected', 'Value': formatCurrency(summary.totalOnboardingRentCollected || 0) },
          { 'Metric': 'Total Amount Collected', 'Value': formatCurrency(summary.totalAmountCollected || 0) },
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      }
      
      const fileName = `completed-onboard-tenants-${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // Use the data directly from the API since filtering is now handled by the backend
  const filteredTenants = completedTenants;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          title="Completed Onboard Payments"
          subtitle={`${selectedProperty?.name || 'Property'} - Completed Onboard Payments`}
        />
        <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
          <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
            <Alert severity="error" className="mb-4">
              Failed to load completed onboard payments. Please try again.
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Completed Tenant Onboard Payments', url: '/dashboard/tenant-onboard-payments/completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Completed Onboard Payments"
        subtitle={`${selectedProperty?.name || 'Property'} - Completed Onboard Payments`}
      />
      <BreadCrumbs items={breadcrumbs} />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">

            {/* Summary Cards */}
            {summary && <TenantOnboardSummaryCards summary={summary} variant="completed" />}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                  <div className="w-full">
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
                  
                  {/* Start Date Filter */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Check-in From"
                      value={filters.startCheckInDate}
                      onChange={(newValue) => handleFilterChange('startCheckInDate', newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            "& .MuiInputBase-root": {
                              borderRadius: '12px',
                              padding: '4px 10px',
                            }
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  {/* End Date Filter */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Check-in To"
                      value={filters.endCheckInDate}
                      onChange={(newValue) => handleFilterChange('endCheckInDate', newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            "& .MuiInputBase-root": {
                              borderRadius: '12px',
                              padding: '4px 10px',
                            }
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Clear Filters Button */}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFilters({
                        search: '',
                        roomNo: '',
                        startCheckInDate: null,
                        endCheckInDate: null,
                      });
                    }}
                    size="small"
                    sx={{
                      height: '40px',
                      textTransform: 'none',
                      borderRadius: '12px',
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Completed Tenants List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTenants.length === 0 ? (
                  <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6 text-center">
                      <Typography variant="h6" className="text-gray-500 dark:text-gray-400">
                        No completed onboard tenants found
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTenants.map((tenant) => (
                    <Card key={tenant._id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Left Section - Tenant Info */}
                          <div className="flex-1">
                            {/* Top Row - Tenant Name, Status, and Date */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                                  {tenant.tenantName}
                                </Typography>
                                <Chip 
                                  label="Completed" 
                                  size="small" 
                                  color="success"
                                  icon={<CheckCircleIcon />}
                                  sx={{
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    backgroundColor: '#10b981',
                                    color: '#fff',
                                  }}
                                />
                              </div>
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Check-in: {formatDate(tenant.checkInDate)}
                              </Typography>
                            </div>

                            {/* Contact and Room Info */}
                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2">
                                <PersonIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  {tenant.tenantNumber}
                                </Typography>
                              </div>
                              <div className="flex items-center gap-2">
                                <CurrencyIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  Room {tenant.room.roomNo}
                                </Typography>
                              </div>
                            </div>

                            {/* Payment Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-3">
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                                    Monthly Rent
                                  </Typography>
                                  <Typography variant="body1" className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(tenant.monthlyRent)}
                                  </Typography>
                                </div>
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                                    Security Deposit
                                  </Typography>
                                  <Typography variant="body1" className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(tenant.securityDepositTotal)}
                                  </Typography>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-3">
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                                    Rent Paid
                                  </Typography>
                                  <div className="flex items-center gap-2">
                                    <Typography variant="body1" className="font-semibold text-green-600 dark:text-green-400">
                                      {formatCurrency(tenant.totalOnboardingRentPaid)}
                                    </Typography>
                                    <Chip 
                                      label="Paid" 
                                      size="small" 
                                      color="success"
                                      sx={{
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        backgroundColor: '#10b981',
                                        color: '#fff',
                                      }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-1">
                                    Security Paid
                                  </Typography>
                                  <div className="flex items-center gap-2">
                                    <Typography variant="body1" className="font-semibold text-green-600 dark:text-green-400">
                                      {formatCurrency(tenant.securityDepositPaid)}
                                    </Typography>
                                    <Chip 
                                      label="Paid" 
                                      size="small" 
                                      color="success"
                                      sx={{
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        backgroundColor: '#10b981',
                                        color: '#fff',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Total Collected */}
                          <div className="flex flex-col items-end gap-4 min-w-fit">
                            {/* Total Collected */}
                            <div className="text-right">
                              <Typography variant="h5" className="font-bold text-green-600 dark:text-green-400 mb-1">
                                {formatCurrency(tenant.monthlyRent + tenant.securityDepositTotal || 0)}
                              </Typography>
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Total Collected
                              </Typography>
                            </div>

                            {/* Success Message */}
                            <Chip 
                              label="All Payments Completed" 
                              size="small" 
                              color="success"
                              icon={<CheckCircleIcon />}
                              sx={{
                                borderRadius: '12px',
                                fontWeight: 600,
                                backgroundColor: '#10b981',
                                color: '#fff',
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {completedResponse?.pagination && completedResponse.pagination.totalPages > 1 && (
              <Box className="flex justify-center mt-6">
                <Pagination
                  count={completedResponse.pagination.totalPages}
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
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <Typography variant="h6">Export Completed Onboard Tenants</Typography>
          <IconButton onClick={() => setExportDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
            Export {filteredTenants.length} completed onboard tenant records to Excel format.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
            variant="contained"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
