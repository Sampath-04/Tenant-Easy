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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useRefunds, useProcessRefund } from '@/hooks/useRefunds';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import ProcessRefundForm from '@/components/ProcessRefundForm';
import RefundsExportDialog from '@/components/RefundsExportDialog';
import { Refund } from '@/lib/api/refunds';
import BreadCrumbs from '@/components/ui/BreadCrumbs';

export default function RefundsPage() {
  const { selectedProperty } = useProperty();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [processFormOpen, setProcessFormOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get refunds with filters
  const { data: refundsResponse, isLoading: refundsLoading, error: refundsError } = useRefunds(
    selectedProperty?.id || ''
  );

  // Process refund mutation
  const processRefundMutation = useProcessRefund();

  // Filter refunds based on search and status
  const filteredRefunds = (refundsResponse?.data || []).filter((refund) => {
    const matchesSearch = !debouncedSearch || 
      refund.tenant.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      refund.tenant.tenantNumber.includes(debouncedSearch) ||
      refund.room.roomNo.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = !filters.status || refund.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const handleProcessRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setProcessFormOpen(true);
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

  if (refundsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }
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

      <BreadCrumbs items={breadcrumbs} /> 
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">
              {/* Summary Cards */}
             {refundsResponse && refundsResponse.data && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                   borderRadius: '12px',
                   boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                 }}>
                   <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                       <div>
                         <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                           {refundsResponse.total || 0}
                         </Typography>
                         <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                           Total Refunds
                         </Typography>
                       </div>
                       <ReceiptIcon className="text-3xl text-blue-600 dark:text-blue-400" />
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                   borderRadius: '12px',
                   boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                 }}>
                   <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                       <div>
                         <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                           {(refundsResponse.data || []).filter(r => r.status === 'not_processed').length}
                         </Typography>
                         <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                           Pending
                         </Typography>
                       </div>
                       <ScheduleIcon className="text-3xl text-amber-600 dark:text-amber-400" />
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                   borderRadius: '12px',
                   boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                 }}>
                   <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                       <div>
                         <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                           {formatCurrency((refundsResponse.data || []).reduce((sum, r) => sum + r.refundAmount, 0))}
                         </Typography>
                         <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                           Total Amount
                         </Typography>
                       </div>
                       <CurrencyIcon className="text-3xl text-green-600 dark:text-green-400" />
                     </div>
                   </CardContent>
                 </Card>
               </div>
             )}

            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-6" sx={{
              borderRadius: '12px',
              boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
            }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <FilterIcon className="text-gray-400" />
                  <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    Filters
                  </Typography>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Search"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search by tenant name, phone, or room number..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                    }}
                  />
                  
                  <TextField
                    select
                    label="Status"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="not_processed">Not Processed</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                  </TextField>

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setExportDialogOpen(true)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      height: '40px',
                    }}
                  >
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Refunds List */}
            <div className="space-y-4">
              {filteredRefunds.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
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
                  <Card key={refund._id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow" sx={{
                    borderRadius: '12px',
                    boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                  }}>
                    <CardContent sx={{
                      padding: '16px !important',
                    }}>
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="grid grid-cols-1 gap-4 w-full">
                          <div className=' flex items-center justify-between'>
                             {/* Tenant and Room Info */}
                          <div className="flex items-center gap-6">
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
                            {getStatusChip(refund.status)}
                          </div>
                               {/* Action Button */}
                              <div className="flex items-end justify-start">
                                {refund.status === 'not_processed' && (
                                  <Button
                                    variant="contained"
                                    startIcon={<PaymentIcon />}
                                    onClick={() => handleProcessRefund(refund)}
                                    sx={{
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      textWrap: 'nowrap', 
                                    }}
                                  >
                                    Process Refund
                                  </Button>
                                )}
                              </div>
                          </div>
                         
                      <div className='bg-gray-50 dark:bg-gray-700 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-4'>
                          {/* Refund Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Security Deposit
                              </Typography>
                              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(refund.securityDepositPaid)}
                              </Typography>
                            </div>
                            
                            <div className="space-y-2">
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Refund Amount
                              </Typography>
                              <Typography variant="body1" className="font-bold text-amber-600 dark:text-amber-400">
                                {formatCurrency(refund.refundAmount)}
                              </Typography>
                            </div>
                            
                            <div className="space-y-2">
                              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                Notice Ends
                              </Typography>
                              <Typography variant="body1" className="font-medium text-gray-900 dark:text-white">
                                {formatDate(refund.noticeEndsOn)}
                              </Typography>
                            </div>
                          </div>

                          {/* Deductions */}
                          {refund.deductions && (
                            <div className="mt-4 ">
                              <Typography variant="subtitle2" className="font-medium mb-2 text-gray-900 dark:text-white">
                                Deductions Applied:
                              </Typography>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                    Electricity Bill
                                  </Typography>
                                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(refund.deductions.electricityBill)}
                                  </Typography>
                                </div>
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                    Electricity Units
                                  </Typography>
                                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                                    {refund.deductions.electricityUnits}
                                  </Typography>
                                </div>
                                <div>
                                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                                    Other Deductions
                                  </Typography>
                                  <Typography variant="body2" className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(refund.deductions.otherDeductions)}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
         propertyId={selectedProperty?.id || ''}
       />
     </div>
   );
 }

