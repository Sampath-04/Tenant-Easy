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
  Tooltip,
  IconButton,
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
} from '@mui/icons-material';
import { useOnboardedPendingPayments, useCollectPendingPayments } from '@/hooks/useTenants';
import { useRooms } from '@/hooks/useRooms';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency, formatDateForAPI } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import TenantOnboardSummaryCards from '@/components/TenantOnboardSummaryCards';
import CollectOnboardPendingPaymentsForm from '@/components/CollectPendingPaymentsForm';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
// import * as XLSX from 'xlsx';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

export default function TenantOnboardPaymentsPage() {
  const { selectedProperty } = useProperty();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    roomId: '',
    startCheckInDate: null as Date | null,
    endCheckInDate: null as Date | null,
  });
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [collectPaymentsDialogOpen, setCollectPaymentsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get onboarding pending payments
  const { data: onboardedResponse, isLoading, error } = useOnboardedPendingPayments(selectedProperty?.id || '', {
    page,
    limit,
    room: filters.roomId || undefined,
    search: debouncedSearch || undefined,
    startCheckInDate: filters.startCheckInDate ? formatDateForAPI(filters.startCheckInDate) : undefined,
    endCheckInDate: filters.endCheckInDate ? formatDateForAPI(filters.endCheckInDate) : undefined,
  });

  // Collect pending payments mutation
  const collectPaymentsMutation = useCollectPendingPayments();

  // Get rooms for dropdown
  const { data: roomsResponse } = useRooms(selectedProperty?.id || '');
  const rooms = roomsResponse?.data || [];

  const onboardedTenants = onboardedResponse?.data || [];
    const summary = onboardedResponse?.summary;

  // Handle export functionality
  const handleExport = async () => {
    if (!onboardedTenants || onboardedTenants.length === 0) {
      alert('No records to export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Convert onboarding tenants data to Excel format
      const excelData = onboardedTenants.map((tenant: any) => {
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
          'Security Deposit Pending': formatCurrency(tenant.pendingSecurityAmount),
          'Onboarding Rent Paid': formatCurrency(tenant.totalOnboardingRentPaid),
          'Onboarding Rent Pending': formatCurrency(tenant.pendingOnboardingRentAmount),
          'Total Pending Amount': formatCurrency(tenant.totalPendingAmount),
          'Status': tenant.status,
        };
      });

      // Create and download Excel file
      // const worksheet = XLSX.utils.json_to_sheet(excelData);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, 'Onboarding Tenants');
      
      // Add summary section
      // if (summary) {
      //   const summaryData = [
      //     { 'Metric': 'SUMMARY', 'Value': '' },
      //     { 'Metric': 'Total Tenants', 'Value': summary.totalTenants },
      //     { 'Metric': 'Total Pending Amount', 'Value': formatCurrency(summary.totalPendingAmount) },
      //     { 'Metric': 'Total Security Pending', 'Value': formatCurrency(summary.totalSecurityPending) },
      //     { 'Metric': 'Total Rent Pending', 'Value': formatCurrency(summary.totalRentPending) },
      //   ];
        
      //   const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      //   XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      // }
      
      // const fileName = `onboarding-tenants-${new Date().toISOString().split('T')[0]}.xlsx`;
      // XLSX.writeFile(workbook, fileName);
      
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
  const filteredTenants = onboardedTenants;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      roomId: '',
      startCheckInDate: null,
      endCheckInDate: null,
    });
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCollectPayments = (tenant: any) => {
    setSelectedTenant(tenant);
    setCollectPaymentsDialogOpen(true);
  };

  const handleCollectPaymentsSubmit = async (data: any) => {
    try {
      await collectPaymentsMutation.mutateAsync({
        tenantId: selectedTenant._id,
        data
      });
      
      // Close dialog and reset
      setCollectPaymentsDialogOpen(false);
      setSelectedTenant(null);
      
    } catch (error) {
      console.error('Error collecting payments:', error);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error">
          Failed to load onboarding tenants. Please try again.
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Pending Tenant Onboard Payments', url: '/dashboard/tenant-onboard-payments/pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
     <div className='px-6 pt-6 flex flex-row justify-between items-center'>
     <BreadCrumbs items={breadcrumbs} />
     </div>
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">

            {/* Summary Cards */}
            <TenantOnboardSummaryCards 
              summary={summary || { totalTenants: 0 }} 
              variant="pending" 
              loading={isLoading} 
            />

            {/* Filter Toggle and Export Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={toggleFilters}
                    className={`${showFilters ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'} hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 ease-in-out`}
                  >
                    <FilterIcon className={`${showFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} transition-colors duration-200`} />
                  </IconButton>
                </Tooltip>

                {showFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 transition-all duration-200 ease-in-out"
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>

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
            <div className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-[380px]">
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
                  <div className='w-full md:w-48'>
                    <TextField
                      select
                      fullWidth
                      label="Room"
                      value={filters.roomId}
                      onChange={(e) => handleFilterChange('roomId', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Rooms</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room._id} value={room._id}>
                          Room {room.roomNo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                  
                  {/* Start Date Filter */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className='w-full md:w-48'>
                    <DatePicker
                      label="Check-in From"
                      value={filters.startCheckInDate}
                      onChange={(newValue) => handleFilterChange('startCheckInDate', newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          sx: {
                            "& .MuiInputBase-root": {
                              borderRadius: '12px',
                              padding: '4px 10px',
                            }
                          },
                        },
                      }}
                    />
                    </div>
                    
                  </LocalizationProvider>

                  {/* End Date Filter */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                   <div>
                   <DatePicker
                      label="Check-in To"
                      value={filters.endCheckInDate}
                      onChange={(newValue) => handleFilterChange('endCheckInDate', newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          sx: {
                            "& .MuiInputBase-root": {
                              borderRadius: '12px',
                              padding: '4px 10px',
                            }
                          },
                        },
                      }}
                    />
                   </div>
                  </LocalizationProvider>
                </div>
              </div>
            </div>

            {/* Onboarding Tenants List */}
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
                        No onboarding tenants found
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTenants.map((tenant) => (
                    <Card key={tenant._id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col justify-between items-start gap-3">
                            <div className="flex w-full items-center gap-8 mb-2">
                              <div className="flex items-center gap-3">
                                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                                  {tenant.tenantName}
                                </Typography>
                                <Chip 
                                  label="Pending" 
                                  size="small" 
                                  sx={{
                                    color: '#fff',
                                    backgroundColor: '#ffa726',
                                  }}
                                  icon={<ScheduleIcon color="inherit" />}
                                />
                              </div>
                              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  Phone: {tenant.tenantNumber}
                                </Typography>
                                {tenant.tenantEmail && (
                                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                    Email: {tenant.tenantEmail}
                                  </Typography>
                                )}
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  Room: {tenant.room.roomNo} ({tenant.room.roomType})
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                  Check-in: {formatDate(tenant.checkInDate)}
                                </Typography>
                            </div>
                            
                            <div className="flex w-full gap-8 items-center">
                               <div className="grid gap-2">
                                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                    Monthly Rent: {formatCurrency(tenant.monthlyRent)}
                                  </Typography>
                                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                    Security Deposit: {formatCurrency(tenant.securityDepositTotal)}
                                  </Typography>
                               </div>
                               <div className="grid gap-2">
                                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                    Rent Paid: {formatCurrency(tenant.totalOnboardingRentPaid)}
                                  </Typography>   
                                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                    Security Paid: {formatCurrency(tenant.securityDepositPaid)}
                                  </Typography>
                               </div>
                                <div className="grid gap-2">
                                  <div className="flex gap-2">
                                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                      Rent Pending:
                                    </Typography>
                                    {tenant.onboardingRentPending ? (
                                      <Chip 
                                        label={`Rent: ${formatCurrency(tenant.pendingOnboardingRentAmount)}`}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                      />
                                    ) : <span className="text-gray-600 dark:text-gray-400">0</span>}
                                  </div>
                                  <div className="flex gap-2">
                                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                      Security Pending:
                                    </Typography>
                                    {tenant.securityDepositPending && (
                                      <Chip 
                                        label={`Security: ${formatCurrency(tenant.pendingSecurityAmount)}`}
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col ml-auto items-end justify-end gap-2">
                                  <div className="flex items-end gap-2">
                                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                      Total Pending: <span className="font-bold text-lg text-red-600 dark:text-red-400">{formatCurrency(tenant.totalPendingAmount)}</span>
                                    </Typography>
                                  </div> 
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleCollectPayments(tenant)}
                                    sx={{
                                      backgroundColor: '#008000',
                                      '&:hover': {
                                        backgroundColor: '#008000',
                                      },
                                      textTransform: 'none',
                                      color: '#fff',
                                      mt: 1,
                                    }}
                                  >
                                    Collect Payments
                                  </Button>
                                </div>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && onboardedResponse && onboardedResponse.pagination.totalPages > 1 && (
              <Box className="flex justify-center mt-6">
                <Pagination
                    count={onboardedResponse.pagination.totalPages}
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
        sx={(theme) => ({
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 40px rgba(0, 0, 0, 0.3)'
              : '0 10px 40px rgba(0, 0, 0, 0.1)',
          }
        })}
      >
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            pb: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          })}
        >
          <Typography
            sx={(theme) => ({
              fontWeight: 600,
              fontSize: '1.25rem',
              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
            })}
          >
            Export Pending Tenants
          </Typography>
          <IconButton
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
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
            paddingTop: "24px !important",
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          })}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={(theme) => ({
                mb: 2,
                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
              })}
            >
              Export the currently filtered pending tenants to Excel. The export will include all tenants matching your current filters.
            </Typography>

            <Box
              sx={(theme) => ({
                backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f9fafb',
                borderRadius: '8px',
                p: 2.5,
                border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
              })}
            >
              <Typography
                variant="body2"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                  fontWeight: 600,
                  mb: 2,
                })}
              >
                Export Summary:
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                        mb: 1,
                        fontWeight: 500,
                      })}
                    >
                      Search
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        mb: 2,
                      })}
                    >
                      {filters.search || 'None'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                        mb: 1,
                        fontWeight: 500,
                      })}
                    >
                      Room
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        mb: 2,
                      })}
                    >
                      {filters.roomId ? (rooms.find(r => r._id === filters.roomId)?.roomNo || filters.roomId) : 'All rooms'}
                    </Typography>
                  </Box>
                </Box>

                {/* vertical divider */}
                <div className="h-full w-px bg-gray-200 dark:bg-gray-700"></div>
                
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                        mb: 1,
                        fontWeight: 500,
                      })}
                    >
                      Status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        mb: 2,
                      })}
                    >
                      Pending
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280',
                        mb: 1,
                        fontWeight: 500,
                      })}
                    >
                      Records Count
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: theme.palette.mode === 'dark' ? '#3b82f6' : '#3b82f6',
                        fontWeight: 600,
                      })}
                    >
                      {filteredTenants.length} records
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: 3,
            py: 2,
            gap: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          })}
        >
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#4b5563' : '#6b7280',
              color: '#ffffff',
              px: 3,
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
            onClick={handleExport}
            disabled={isExporting || !filteredTenants || filteredTenants.length === 0}
            sx={(theme) => ({
              backgroundColor: theme.palette.mode === 'dark' ? '#3b82f6' : '#3b82f6',
              color: '#ffffff',
              px: 3,
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#2563eb',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            })}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon fontSize="small" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collect Pending Payments Form */}
      <CollectOnboardPendingPaymentsForm
        open={collectPaymentsDialogOpen}
        onClose={() => {
          setCollectPaymentsDialogOpen(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
        onSubmit={handleCollectPaymentsSubmit}
        isSubmitting={collectPaymentsMutation.isPending}
      />
    </div>
  );
}
