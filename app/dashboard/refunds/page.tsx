'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Box,
  Pagination,
  MenuItem,
  IconButton,
  Tooltip,
  Link,
  Skeleton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Theme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  CurrencyRupee as CurrencyIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ElectricBolt as ElectricBoltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useRefunds, useProcessRefund } from '@/hooks/useRefunds';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency, formatDateForAPI } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import ProcessRefundForm from '@/components/ProcessRefundForm';
import RefundsExportDialog from '@/components/RefundsExportDialog';
import RefundDetails from '@/components/RefundDetails';
import { Refund } from '@/lib/api/refunds';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

export default function RefundsPage() {
  const { selectedProperty } = useProperty();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [processFormOpen, setProcessFormOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [expandedRefundId, setExpandedRefundId] = useState<string | null>(null);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get refunds with filters
  const { data: refundsResponse, isLoading: refundsLoading, error: refundsError } = useRefunds(
    selectedProperty?.id || '',
    {
      search: debouncedSearch,
      status: filters.status,
      processedAtFrom: startDate ? formatDateForAPI(startDate) : undefined,
      processedAtTo: endDate ? formatDateForAPI(endDate) : undefined,
    }
  );

  // Process refund mutation
  const processRefundMutation = useProcessRefund();

  // Use refunds data directly from API (already filtered)
  const filteredRefunds = refundsResponse?.data || [];

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
    });
    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleProcessRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setProcessFormOpen(true);
  };

  const toggleRefundDetails = (refundId: string) => {
    setExpandedRefundId(expandedRefundId === refundId ? null : refundId);
  };

  const handleProcessRefundSubmit = async (data: {
    transactionId: string;
    receiptUrl?: File;
    paymentMethod: string;
    notes?: string;
  }) => {
    if (!selectedRefund) return;

    try {
      await processRefundMutation.mutateAsync({
        refundId: selectedRefund._id,
        data,
      });

      // Close the form
      setProcessFormOpen(false);
      setSelectedRefund(null);
    } catch (error) {
      console.error('Failed to process refund:', error);
      // Error handling is done in the mutation
    }
  };

  const getStatusChip = (status: string) => {
    if (status === 'processed') {
      return (
        <Chip
          label="Processed"
          color="success"
          size="small"
          sx={(theme: Theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
            color: '#fff',
            fontSize: '0.75rem',
            height: '20px',
          })}
          icon={<CheckCircleIcon />}
        />
      );
    }

    return (
      <Chip
        label="Not Processed"
        color="warning"
        size="small"
        sx={(theme: Theme) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#fbbf24',
          color: '#fff',
          fontSize: '0.75rem',
          height: '20px',
        })}
        icon={<ScheduleIcon />}
      />
    );
  };

  if (refundsError) {
    return (
      <div className="p-6">
        <Alert severity="error">
          Failed to load refunds. Please try again.
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Refunds', url: '/dashboard/refunds' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="Refunds"
        subtitle={`${selectedProperty?.name || 'Property'} - Security Deposit Refunds`}
      />
      <div className='px-6 pt-6'>
        <BreadCrumbs items={breadcrumbs} />
      </div>

      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-4">
            {/* Summary Cards */}
            {
              refundsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                  <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
                  <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
                  <Skeleton variant="rectangular" width={290} height={142} sx={{ borderRadius: '12px' }} />
                </div>
              ) : (
                (refundsResponse?.statistics || !refundsLoading) && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent sx={{
                    padding: '16px!important',
                  }}>
                    <div>
                      <div className='flex justify-between gap-2 items-center'>
                        <div>
                          <p className="text-blue-600 dark:text-blue-400 text-3xl">
                            {formatCurrency(refundsResponse?.statistics?.totalAmount || 0)}
                          </p>
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                            Total Amount
                          </Typography>
                        </div>
                        <CurrencyIcon className="text-3xl text-blue-600 dark:text-blue-400 self-start" />
                      </div>
                      <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                        {refundsResponse?.statistics?.totalRefunds || 0}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Total Count
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent sx={{
                    padding: '16px!important',
                  }}>
                    <div>
                      <div className='flex justify-between gap-2 items-center'>
                        <div>
                          <p className="text-green-600 dark:text-green-400 text-3xl">
                            {formatCurrency(refundsResponse?.statistics?.processedAmount || 0)}
                          </p>
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                            Processed Amount
                          </Typography>
                        </div>
                        <CurrencyIcon className="text-3xl text-green-600 dark:text-green-400 self-start" />
                      </div>
                      <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                        {refundsResponse?.statistics?.processedCount || 0}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Processed Count
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent sx={{
                    padding: '16px!important',
                  }}>
                    <div>
                      <div className='flex justify-between gap-2 items-center'>
                        <div>
                          <p className="text-amber-600 dark:text-amber-400 text-3xl">
                            {formatCurrency(refundsResponse?.statistics?.pendingAmount || 0)}
                          </p>
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-1">
                            Pending Amount
                          </Typography>
                        </div>
                        <ScheduleIcon className="text-3xl text-amber-600 dark:text-amber-400 self-start" />
                      </div>
                      <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                        {refundsResponse?.statistics?.pendingCount || 0}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                        Pending Count
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
                  </div>
                )
              )
            }

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
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <TextField
                      fullWidth
                      placeholder="Search by tenant name, phone, or room number..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                      label="Status"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Status</em>
                      </MenuItem>
                      <MenuItem value="not_processed">Not Processed</MenuItem>
                      <MenuItem value="processed">Processed</MenuItem>
                    </TextField>
                  </div>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="w-full md:w-48">
                      <DatePicker
                        label="Start Date"
                        value={startDate || null}
                        onChange={handleStartDateChange}
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
                        value={endDate || null}
                        onChange={handleEndDateChange}
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
            </div>

            {/* Refunds List */}
            {refundsLoading ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRefunds.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-12 text-center">
                    <ReceiptIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <Typography variant="h6" className="text-gray-900 dark:text-white mb-2">
                      No refunds found
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      {filters.search || filters.status
                        ? 'Try adjusting your filters to see more results.'
                        : 'No refunds have been created yet.'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                filteredRefunds.map((refund) => (
                  <Card
                    key={refund._id}
                    sx={{
                      borderRadius: '16px',
                      boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;',
                    }}
                    className="bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Refund Info Section */}
                        <div className="flex-1">
                          {/* Tenant and Room Info */}
                          <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                              <PersonIcon className="text-gray-400 dark:text-gray-500" />
                              <Typography variant="body1" className="font-semibold text-gray-600 dark:text-gray-400">
                                {refund.tenant.tenantName}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="text-gray-400 dark:text-gray-500" />
                              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                {refund.tenant.tenantNumber}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <HomeIcon className="text-gray-400 dark:text-gray-500" />
                              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                Room {refund.room.roomNo}
                              </Typography>
                            </div>
                            {/* Status Chip */}
                            {getStatusChip(refund.status)}
                          </div>

                          {/* Refund Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            {/* Left Column - Refund Information */}
                            <div className="space-y-4">
                              <div className='grid gap-1'>
                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                  Security Deposit
                                </Typography>
                                <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(refund.securityDepositPaid)}
                                </Typography>
                              </div>

                              <div className='grid gap-1'>
                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                  Refund Amount
                                </Typography>
                                <Typography variant="body1" className="font-bold text-amber-600 dark:text-amber-400">
                                  {formatCurrency(refund.refundAmount)}
                                </Typography>
                              </div>
                            </div>

                            {/* Right Column - Deductions */}
                            <div className="space-y-4">
                              {refund.deductions && (
                                <>
                                  <div className='grid gap-1'>
                                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                      Electricity Bill
                                    </Typography>
                                    <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(refund.deductions.electricityBill)}
                                    </Typography>
                                  </div>

                                  <div className='grid gap-1'>
                                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                      Other Deductions
                                    </Typography>
                                    <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(refund.deductions.otherDeductions)}
                                    </Typography>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>


                          {/* Bottom Section - Additional Info */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Created:
                              </Typography>
                              <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                                {formatDate(refund.createdAt)}
                              </Typography>
                            </div>

                            {refund.processedAt && (
                              <div className="flex items-center gap-2">
                                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                  Processed:
                                </Typography>
                                <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(refund.processedAt)}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-fit">
                          {refund.status === 'not_processed' && (
                            <Button
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => handleProcessRefund(refund)}
                              sx={(theme) => ({
                                backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
                                borderRadius: '12px',
                                color: '#fff',
                                textTransform: 'none',
                                fontWeight: 600,
                                padding: '8px 16px',
                                boxShadow: theme.palette.mode === 'dark'
                                  ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                  : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark' ? '#047857' : '#059669',
                                  boxShadow: theme.palette.mode === 'dark'
                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                },
                                transition: 'all 0.2s ease',
                              })}
                              size="small"
                            >
                              Process Refund
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={<ElectricBoltIcon />}
                            endIcon={expandedRefundId === refund._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => toggleRefundDetails(refund._id)}
                            sx={(theme) => ({
                              borderColor: theme.palette.mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                              color: theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(139, 92, 246, 0.1)'
                                  : '#f3f4f6',
                                borderColor: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                                color: theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
                              },
                              transition: 'all 0.2s ease',
                            })}
                            size="small"
                          >
                            {expandedRefundId === refund._id ? 'Hide Details' : 'Show Details'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    {/* Refund Details Section with Transaction Details */}
                    <RefundDetails
                      refund={refund}
                      isExpanded={expandedRefundId === refund._id}
                      onToggle={() => toggleRefundDetails(refund._id)}
                    />
                  </Card>
                ))
              )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Process Refund Form */}
      {selectedRefund && (
        <ProcessRefundForm
          isOpen={processFormOpen}
          onClose={() => {
            setProcessFormOpen(false);
            setSelectedRefund(null);
          }}
          onSubmitCallback={handleProcessRefundSubmit}
          refund={selectedRefund}
          isSubmitting={processRefundMutation.isPending}
        />
      )}

      {/* Export Dialog */}
      <RefundsExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        startDate={startDate}
        endDate={endDate}
        filters={filters}
        recordCount={filteredRefunds.length}
        refundsData={filteredRefunds}
        statistics={refundsResponse?.statistics}
      />
    </div>
  );
}

