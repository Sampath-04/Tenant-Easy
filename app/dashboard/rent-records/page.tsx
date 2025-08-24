'use client';

import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CurrencyRupee as CurrencyIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ElectricBolt as ElectricBoltIcon,
  Payment as PaymentIcon,
  WhatsApp as WhatsAppIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useRentRecords } from '@/hooks/useRentRecords';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { useProperty } from '@/contexts/PropertyContext';
import { AppHeader } from '@/components/AppHeader';
import { LAYOUT_CLASSES } from '@/lib/constants/styles';
import ElectricityReadingsSection from '@/components/ElectricityReadingsSection';
import { getCurrentDate } from '@/lib/utils/formatters';
import RentInfoCard from '@/components/RentInfoCard';
import PaymentCollectionForm from '@/components/PaymentCollectionForm';
import EvictionForm from '@/components/EvictionForm';

export default function RentRecordsPage() {
  const { selectedProperty } = useProperty();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    tenant: '',
    month: '',
    isPaid: '',
  });
  const [expandedRentId, setExpandedRentId] = useState<string | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<any>(null);
  const [evictionFormOpen, setEvictionFormOpen] = useState(false);
  const [selectedRentForEviction, setSelectedRentForEviction] = useState<any>(null);

  // Get rent records with filters
  const { data: rentRecordsResponse, isLoading: recordsLoading, error: recordsError } = useRentRecords({
    propertyId: selectedProperty?.id || '',
    page,
    limit,
    tenant: filters.tenant || undefined,
    month: filters.month || undefined,
    isPaid: filters.isPaid === '' ? undefined : filters.isPaid === 'true',
    search: filters.search || undefined,
  });

  const rentRecords = rentRecordsResponse?.data || [];
  const summary = rentRecordsResponse?.summary;

  // Filter rents based on search term
  const filteredRents = useMemo(() => {
    if (!rentRecords) return [];
    
    return rentRecords.filter(rent => 
      rent.tenant.tenantName.toLowerCase().includes(filters.search.toLowerCase()) ||
      rent.tenant.tenantNumber.includes(filters.search) ||
      rent.room.roomNo.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [rentRecords, filters.search]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tenant: '',
      month: '',
      isPaid: '',
    });
    setPage(1);
  };

  const toggleReadings = (recordId: string) => {
    setExpandedRentId(expandedRentId === recordId ? null : recordId);
  };

  const handleCollectPayment = (rent: any) => {
    setSelectedRentForPayment(rent);
    setPaymentFormOpen(true);
  };

  const handleWhatsAppReminder = (rent: any) => {
    // TODO: Implement WhatsApp reminder functionality
    console.log('WhatsApp reminder for:', rent);
    // open whatsapp
    window.open(`https://wa.me/${rent.tenant.tenantNumber}`, '_blank');
  };

  const handleCompleteEviction = (rent: any) => {
    setSelectedRentForEviction(rent);
    setEvictionFormOpen(true);
  };

  const handleCancelNotice = (rent: any) => {
    // TODO: Implement cancel notice functionality
    console.log('Cancel notice for:', rent);
  };

  const handlePaymentSubmit = (data: any) => {
    setSelectedRentForPayment((prev: any) => ({
      ...prev,
      comments: data.comments,
      paymentProofs: data.paymentProofs,
      isPaid: true,
    }));
  };

  const handleEvictionSubmit = (data: any) => {
    console.log('Eviction submitted:', data);
    // TODO: Implement eviction API call
    // This should update tenant status to 'evicted' and process the refund
  };

  if (recordsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (recordsError) {
    return (
      <div className="p-6">
        <Alert severity="error">
          Failed to load rent records. Please try again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader
        title="All Rent Records"
        subtitle={`${selectedProperty?.name || 'Property'} - Complete Rent History`}
      />
      
      <main className={LAYOUT_CLASSES.MAIN_CONTAINER}>
        <div className={LAYOUT_CLASSES.CARD_CONTAINER}>
          <div className="p-6">

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" sx={{
                  borderRadius: '12px',
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(summary.totalAmount)}
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
                  boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                          {summary.overdueCount}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Overdue
                        </Typography>
                      </div>
                      <WarningIcon className="text-3xl text-red-500 dark:text-red-400" />
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
                          {summary.pendingCount}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Pending
                        </Typography>
                      </div>
                      <ScheduleIcon className="text-3xl text-green-600 dark:text-green-400" />
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
                          {rentRecordsResponse?.count || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          Total Records
                        </Typography>
                      </div>
                      <PersonIcon className="text-3xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <TextField
                    fullWidth
                    placeholder="Search by tenant name, phone number, or room number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                    }}
                    size="small"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FilterIcon className="w-4 h-4" />
                  <span>{filteredRents.length} of {rentRecordsResponse?.count || 0} records</span>
                </div>
              </div>
            </div>

            {/* Rent Records List */}
            <div className="space-y-6">
              {filteredRents.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                      No Rent Records Found
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-500">
                      {filters.search ? 'No records match your search criteria.' : 'No rent records available.'}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                filteredRents.map((record) => (
                  <Card 
                    key={record._id} 
                    sx={{
                      borderRadius: '16px',
                      boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;', 
                    }}
                    className="bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Rent Info Section */}
                        <RentInfoCard record={record} getCurrentDate={getCurrentDate} />

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-fit">
                          {/* Action buttons for tenants in notice period */}
                          {record.notice ? (
                            <>
                              <Button
                                variant="contained"
                                startIcon={<PersonOffIcon />}
                                onClick={() => handleCompleteEviction(record)}
                                sx={(theme: Theme) => ({
                                  backgroundColor: theme.palette.mode === 'dark' ? '#dc2626' : '#ef4444',
                                  borderRadius: '12px',
                                  color: '#fff',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  padding: '8px 16px',
                                  boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
                                    : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                  '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' ? '#b91c1c' : '#dc2626',
                                    boxShadow: theme.palette.mode === 'dark' 
                                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                })}
                                size="small"
                              >
                                Complete Eviction
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelNotice(record)}
                                sx={(theme: Theme) => ({
                                  borderColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
                                  color: theme.palette.mode === 'dark' ? '#fbbf24' : '#f59e0b',
                                  borderRadius: '12px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  padding: '8px 16px',
                                  '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                      ? 'rgba(245, 158, 11, 0.1)' 
                                      : '#fef3c7',
                                    borderColor: theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706',
                                    color: theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706',
                                  },
                                  transition: 'all 0.2s ease',
                                })}
                                size="small"
                              >
                                Cancel Notice
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Action buttons for regular tenants */}
                              {!record.isPaid && getCurrentDate().getTime() > new Date(record.endDate).getTime() && (
                                <Button
                                  variant="contained"
                                  startIcon={<PaymentIcon />}
                                  onClick={() => handleCollectPayment(record)}
                                  sx={(theme: Theme) => ({
                                    backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#10b981',
                                    borderRadius: '12px',
                                    color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
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
                                  Collect
                                </Button>
                              )}
                              {!record.isPaid && (
                                <Button
                                  variant="outlined"
                                  startIcon={<WhatsAppIcon />}
                                  onClick={() => handleWhatsAppReminder(record)}
                                  sx={(theme: Theme) => ({
                                    borderColor: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                                    color: theme.palette.mode === 'dark' ? '#34d399' : '#10b981',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    padding: '8px 16px',
                                    '&:hover': {
                                      backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(52, 211, 153, 0.1)' 
                                        : '#d1fae5',
                                      borderColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                                      color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                                    },
                                    transition: 'all 0.2s ease',
                                  })}
                                  size="small"
                                >
                                  WhatsApp Reminder
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={<ElectricBoltIcon />}
                            endIcon={expandedRentId === record._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => toggleReadings(record._id)}
                            sx={(theme: Theme) => ({
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
                            {expandedRentId === record._id ? 'Hide Readings' : 'Show Readings'}
                          </Button>
                        </div>
                       </div>
                      </CardContent>
                      
                      {/* Expandable Electricity Readings Section */}
                      <ElectricityReadingsSection
                        electricityReadings={record.electricityReadings || []}
                        noticeReadings={record.notice?.electricityReadings || []}
                        totalElectricityBill={record.electricityBill}
                        isExpanded={expandedRentId === record._id}
                      />
                    </Card>
                  ))
                )}
              </div>

            {/* Pagination */}
            {rentRecordsResponse && rentRecordsResponse.count > limit && (
              <Box className="flex justify-center mt-6">
                <Pagination
                  count={Math.ceil(rentRecordsResponse.count / limit)}
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

      {/* Payment Collection Form */}
      <PaymentCollectionForm
        isOpen={paymentFormOpen}
        onClose={() => {
          setPaymentFormOpen(false);
          setSelectedRentForPayment(null);
        }}
        onSubmitCallback={handlePaymentSubmit}
        rentRecord={selectedRentForPayment}
        setPaymentFormOpen={setPaymentFormOpen}
      />

      {/* Eviction Form */}
      <EvictionForm
        isOpen={evictionFormOpen}
        onClose={() => setEvictionFormOpen(false)}
        onSubmitCallback={handleEvictionSubmit}
        rentRecord={selectedRentForEviction}
      />
    </div>
  );
}
