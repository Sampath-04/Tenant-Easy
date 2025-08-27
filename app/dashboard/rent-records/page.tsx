'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { useRentRecords, useRentRecordsForExport } from '@/hooks/useRentRecords';
import { useRooms } from '@/hooks/useRooms';
import { useDebounce } from '@/hooks/useDebounce';
import { useCompleteNotice, useCancelNotice } from '@/hooks/useNotice';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
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
import RentHistoryDetails from '@/components/RentHistoryDetails';
import ElectricityReadingsSection from '@/components/ElectricityReadingsSection';
import { getCurrentDate } from '@/lib/utils/formatters';
import RentInfoCard from '@/components/RentInfoCard';
import PaymentCollectionForm from '@/components/PaymentCollectionForm';
import EvictionForm from '@/components/EvictionForm';
import NoticeForm from '@/components/NoticeForm';
import BreadCrumbs from '@/components/ui/BreadCrumbs';


export default function RentRecordsPage() {
  const { selectedProperty } = useProperty();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    tenant: '',
    month: '',
    paymentStatus: '',
    roomNo: '',
  });
  const [expandedRentId, setExpandedRentId] = useState<string | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<any>(null);
  const [evictionFormOpen, setEvictionFormOpen] = useState(false);
  const [selectedRentForEviction, setSelectedRentForEviction] = useState<any>(null);
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [selectedRentForNotice, setSelectedRentForNotice] = useState<any>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | null>(null);
  const [exportEndDate, setExportEndDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportQueryEnabled, setExportQueryEnabled] = useState(false);
  const [exportStartDateStr, setExportStartDateStr] = useState<string | null>(null);
  const [exportEndDateStr, setExportEndDateStr] = useState<string | null>(null);
  const [cancellingNoticeId, setCancellingNoticeId] = useState<string | null>(null);


  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Get rent records with filters
  const { data: rentRecordsResponse, isLoading: recordsLoading, error: recordsError } = useRentRecords({
    propertyId: selectedProperty?.id || '',
    page,
    limit,
    tenant: filters.tenant || undefined,
    month: filters.month || undefined,
    paymentStatus: filters.paymentStatus === '' ? undefined : filters.paymentStatus as "PARTIALLY_PAID" | "FULLY_PAID" | "NOT_PAID",
    search: debouncedSearch || undefined,
    roomNo: filters.roomNo || undefined,
  });

  // Get rooms for dropdown
  const { data: roomsResponse } = useRooms(selectedProperty?.id || '');
  const rooms = roomsResponse?.data || [];

  const rentRecords = rentRecordsResponse?.data || [];
  const summary = rentRecordsResponse?.summary;

  // Export query
  const { data: exportData, isLoading: exportLoading, error: exportError } = useRentRecordsForExport(
    selectedProperty?.id || '',
    exportStartDateStr,
    exportEndDateStr,
    exportQueryEnabled
  );

  // Complete notice mutation
  const completeNoticeMutation = useCompleteNotice();
  
  // Cancel notice mutation
  const cancelNoticeMutation = useCancelNotice();

  // Handle export data when available
  useEffect(() => {
    if (exportData && exportData.success && exportData.data && isExporting) {
      try {
        // Convert data to Excel format
        const excelData = exportData.data.map((record: any) => {
          // Process payment proofs
          let paymentProofsText = '';
          if (record.payments && record.payments.length > 0) {
            const allProofs = record.payments.flatMap((payment: any) => 
              payment.paymentProofs ? payment.paymentProofs : []
            );
            paymentProofsText = allProofs.join('; ');
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
            'Payment Proof Links': paymentProofsText,
            'Created Date': formatDate(record.createdAt),
            'Updated Date': formatDate(record.updatedAt),
          };
        });

        // Create and download Excel file
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Records');
        
        const fileName = `rent-records-${exportStartDateStr}-to-${exportEndDateStr}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        // Reset states
        setExportDialogOpen(false);
        setExportStartDate(null);
        setExportEndDate(null);
        setExportStartDateStr(null);
        setExportEndDateStr(null);
        setExportQueryEnabled(false);
        setIsExporting(false);
      } catch (error) {
        console.error('Excel generation error:', error);
        alert('Failed to generate Excel file');
        setIsExporting(false);
        setExportQueryEnabled(false);
      }
    }
  }, [exportData, isExporting, exportStartDateStr, exportEndDateStr]);

  // Handle export error
  useEffect(() => {
    if (exportError && isExporting) {
      console.error('Export error:', exportError);
      alert('Failed to export data');
      setIsExporting(false);
      setExportQueryEnabled(false);
    }
  }, [exportError, isExporting]);

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

  const clearFilters = () => {
    setFilters({
      search: '',
      tenant: '',
      month: '',
      paymentStatus: '',
      roomNo: '',
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
    // open whatsapp
    window.open(`https://wa.me/+91${rent.tenant.tenantNumber}`, '_blank');
  };

  const handleCompleteEviction = (rent: any) => {
    setSelectedRentForEviction(rent);
    setEvictionFormOpen(true);
  };

  const handleUpdateNotice = (rent: any) => {
    setSelectedRentForNotice(rent);
    setNoticeFormOpen(true);
  };

  const handleCancelNotice = async (rent: any) => {
    if (!rent.notice?._id) {
      console.error('No notice ID found for cancellation');
      return;
    }

    try {
      // Set the cancelling notice ID to show loading for this specific record
      setCancellingNoticeId(rent.notice._id);
      
      // Call the cancelNotice API
      await cancelNoticeMutation.mutateAsync(rent.notice._id);
    } catch (error) {
      console.error('Failed to cancel notice:', error);
      // Error handling is done in the mutation
    } finally {
      // Clear the cancelling notice ID
      setCancellingNoticeId(null);
    }
  };

  const handleExport = async () => {
    if (!exportStartDate || !exportEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    // Check if date range is more than 2 months
    const startDate = new Date(exportStartDate);
    const endDate = new Date(exportEndDate);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    
    if (monthsDiff > 2) {
      alert('Please select a date range of maximum 2 months');
      return;
    }

    try {
      setIsExporting(true);
      
      // Format dates for API using local date methods to avoid timezone issues
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      // Set the date strings and enable the query
      setExportStartDateStr(startDateStr);
      setExportEndDateStr(endDateStr);
      setExportQueryEnabled(true);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
      setIsExporting(false);
    }
  };

  const handlePaymentSubmit = (data: any) => {
    setSelectedRentForPayment((prev: any) => ({
      ...prev,
      comments: data.comments,
      paymentProofs: data.paymentProofs,
      paymentStatus: "FULLY_PAID",
    }));
  };

  const handleEvictionSubmit = async (data: any) => {
  
    if (!data.rentRecord?.notice?._id) {
      console.error('No notice ID found for eviction');
      return;
    }
 
    const payload = {
      noticeId: data.rentRecord.notice._id,
      electricityUnit: data.currentElectricityReading,
      tenantQrCode: data.tenantQrCode,
      comments: data.comments,
    };

    try {
      // Call the completeNotice API
      await completeNoticeMutation.mutateAsync(payload);
   
      // Close the eviction form
      setEvictionFormOpen(false);
      setSelectedRentForEviction(null);
    } catch (error) {
      console.error('Failed to complete eviction:', error);
      // Error handling is done in the mutation
    }
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
                    placeholder="Search by tenant name, phone number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                    }}
                    size="small"
                    sx={{
                      "& .MuiInputBase-root":{
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FilterIcon className="w-4 h-4" />
                    <span>{filteredRents.length} of {rentRecordsResponse?.count || 0} records</span>
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
                           {record.notice && record.notice.status === 'active' ? (
                             <>
                               {/* Show Update Notice if there's remaining amount, otherwise show Complete Eviction */}
                                {record.notice.remainingAmount > 0 ? (
                                  <Button
                                    variant="contained"
                                    startIcon={<PaymentIcon />}
                                    onClick={() => handleUpdateNotice(record)}
                                    sx={(theme: Theme) => ({
                                      backgroundColor: theme.palette.mode === 'dark' ? '#f59e0b' : '#f59e0b',
                                      borderRadius: '12px',
                                      color: '#fff',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      padding: '8px 16px',
                                      boxShadow: theme.palette.mode === 'dark' 
                                        ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
                                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                      '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark' ? '#d97706' : '#d97706',
                                        boxShadow: theme.palette.mode === 'dark' 
                                          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                      },
                                      transition: 'all 0.2s ease',
                                    })}
                                    size="small"
                                  >
                                    Update Notice (₹{record.notice.remainingAmount})
                                  </Button>
                                ) : (
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
                                  )}
                                <Button
                                  variant="outlined"
                                  startIcon={cancellingNoticeId === record.notice?._id ? <CircularProgress size={16} /> : <CancelIcon />}
                                  onClick={() => handleCancelNotice(record)}
                                  disabled={cancellingNoticeId === record.notice?._id}
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
                                    {cancellingNoticeId === record.notice?._id ? 'Cancelling...' : 'Cancel Notice'}
                                </Button>
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
                                  {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                                </Button>
                            </>
                          ) : record.paymentStatus == "NOT_PAID" || record.paymentStatus == "PARTIALLY_PAID" ? (
                            <>
                              {/* Action buttons for regular tenants */}
                              { getCurrentDate().getTime() > new Date(record.endDate).getTime() && (
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
                              {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                              </Button>
                            </>
                          ) : 
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
                              {expandedRentId === record._id ? 'Hide Details' : 'Show Details'}
                            </Button>
                          }
                        </div>
                       </div>
                      </CardContent>
                      {/* Rent History Details Section with Payment History and Electricity Readings */}
                       <RentHistoryDetails
                         record={record}
                         isExpanded={expandedRentId === record._id}
                         onToggle={() => toggleReadings(record._id)}
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

       {/* Notice Form for updating existing notices */}
       <NoticeForm
         isOpen={noticeFormOpen}
         onClose={() => {
           setNoticeFormOpen(false);
           setSelectedRentForNotice(null);
         }}
         onSubmitCallback={() => {
           setNoticeFormOpen(false);
           setSelectedRentForNotice(null);
         }}
         tenantName={selectedRentForNotice?.tenant?.tenantName || ''}
         roomData={selectedRentForNotice?.room || {}}
         cycleEndDate={selectedRentForNotice?.endDate || ''}
         monthlyRent={selectedRentForNotice?.rent || 0}
         tenantId={selectedRentForNotice?.tenant?._id || ''}
         existingNotice={selectedRentForNotice?.notice || null}
       />

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
                Select a date range to export rent records. Maximum range is 2 months.
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    label="Start Date"
                    value={exportStartDate}
                    onChange={(newValue) => setExportStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={exportEndDate}
                    onChange={(newValue) => setExportEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </div>
              </LocalizationProvider>
              
              {exportStartDate && exportEndDate && (
                <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Typography variant="body2" className="text-blue-800 dark:text-blue-300">
                    Exporting records from {formatDate(exportStartDate.toISOString())} to {formatDate(exportEndDate.toISOString())}
                  </Typography>
                </Box>
              )}
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
              disabled={isExporting || exportLoading || !exportStartDate || !exportEndDate}
              variant="contained"
              startIcon={isExporting || exportLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
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
              {isExporting || exportLoading ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </DialogActions>
        </Dialog>


      </div>
    );
  }
